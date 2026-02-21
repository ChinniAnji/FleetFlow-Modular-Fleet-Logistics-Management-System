const db = require('../config/database');

// Get all fuel records
exports.getAllFuelRecords = async (req, res) => {
  try {
    const { vehicle_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT f.*, v.vehicle_number, v.vehicle_type, d.license_number, u.name as driver_name
      FROM fuel_records f
      INNER JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN drivers d ON f.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (vehicle_id) {
      query += ` AND f.vehicle_id = ?`;
      params.push(vehicle_id);
    }

    query += ' ORDER BY f.fuel_date DESC';

    const countQuery = query.replace('SELECT f.*, v.vehicle_number, v.vehicle_type, d.license_number, u.name as driver_name', 'SELECT COUNT(*) as count');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count || countResult.rows[0]['COUNT(*)'] || 0);

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get fuel records error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create fuel record
exports.createFuelRecord = async (req, res) => {
  try {
    console.log('Create fuel record request body:', req.body);
    
    const {
      vehicle_id, fuel_date, fuel_type, quantity,
      cost_per_unit, total_cost, mileage, fuel_station
    } = req.body;

    // Helper to convert empty strings to null and parse numbers
    const toNullIfEmpty = (val) => {
      if (val === '' || val === undefined || val === null) return null;
      if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
        return parseFloat(val);
      }
      return val;
    };

    const params = [
      toNullIfEmpty(vehicle_id),
      fuel_date,
      toNullIfEmpty(fuel_type),
      toNullIfEmpty(quantity),
      toNullIfEmpty(cost_per_unit),
      toNullIfEmpty(total_cost),
      toNullIfEmpty(mileage),
      toNullIfEmpty(fuel_station)
    ];

    console.log('Insert params:', params);

    const result = await db.query(
      `INSERT INTO fuel_records (
        vehicle_id, fuel_date, fuel_type, quantity,
        cost_per_unit, total_cost, mileage, fuel_station
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    const fuelId = result.insertId;
    const fuelResult = await db.query('SELECT * FROM fuel_records WHERE id = ?', [fuelId]);
    res.status(201).json({ success: true, data: fuelResult.rows[0] });
  } catch (error) {
    console.error('Create fuel record error:', error);
    console.error('Error details:', error.message, error.sqlMessage);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Update fuel record
exports.updateFuelRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map(key => updates[key]);

    const result = await db.query(
      `UPDATE fuel_records SET ${fields} 
       WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fuel record not found' });
    }

    const fuelResult = await db.query('SELECT * FROM fuel_records WHERE id = ?', [id]);
    res.json({ success: true, data: fuelResult.rows[0] });
  } catch (error) {
    console.error('Update fuel record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete fuel record
exports.deleteFuelRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM fuel_records WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fuel record not found' });
    }

    res.json({ success: true, message: 'Fuel record deleted successfully' });
  } catch (error) {
    console.error('Delete fuel record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get fuel statistics
exports.getFuelStats = async (req, res) => {
  try {
    const { vehicle_id, days = 30 } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_records,
        SUM(quantity) as total_quantity,
        SUM(total_cost) as total_cost,
        AVG(cost_per_unit) as avg_price_per_unit,
        AVG(quantity) as avg_quantity_per_fill
      FROM fuel_records
      WHERE fuel_date >= CURRENT_DATE - INTERVAL ${days} DAY
    `;

    if (vehicle_id) {
      query += ` AND vehicle_id = ${vehicle_id}`;
    }

    const result = await db.query(query);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get fuel stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
