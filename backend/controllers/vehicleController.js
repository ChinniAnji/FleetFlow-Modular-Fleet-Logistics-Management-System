const db = require('../config/database');

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const { status, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT v.*, u.name as driver_name FROM vehicles v LEFT JOIN users u ON v.assigned_driver_id = u.id WHERE 1=1';
    const params = [];

    if (status) {
      query += ` AND v.status = ?`;
      params.push(status);
    }

    if (type) {
      query += ` AND v.vehicle_type = ?`;
      params.push(type);
    }

    query += ' ORDER BY v.created_at DESC';
    
    const countResult = await db.query(query.replace('SELECT v.*, u.name as driver_name', 'SELECT COUNT(*) as count'), params);
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
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT v.*, u.name as driver_name FROM vehicles v 
       LEFT JOIN users u ON v.assigned_driver_id = u.id 
       WHERE v.id = ?`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create vehicle
exports.createVehicle = async (req, res) => {
  try {
    const {
      vehicle_number, vehicle_type, make, model, year, capacity, fuel_type,
      status, last_service_date, next_service_date, insurance_expiry,
      registration_expiry, purchase_date, purchase_cost, notes
    } = req.body;

    const result = await db.query(
      `INSERT INTO vehicles (
        vehicle_number, vehicle_type, make, model, year, capacity, fuel_type,
        status, last_service_date, next_service_date, insurance_expiry,
        registration_expiry, purchase_date, purchase_cost, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicle_number, vehicle_type, make, model, year, capacity, fuel_type,
       status || 'available', last_service_date, next_service_date, insurance_expiry,
       registration_expiry, purchase_date, purchase_cost, notes]
    );

    const vehicleId = result.insertId;
    const vehicleResult = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
    res.status(201).json({ success: true, data: vehicleResult.rows[0] });
  } catch (error) {
    console.error('Create vehicle error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Vehicle number already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
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
      `UPDATE vehicles SET ${fields}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicleResult = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.json({ success: true, data: vehicleResult.rows[0] });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM vehicles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get vehicle statistics
exports.getVehicleStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'on_trip' THEN 1 END) as on_trip,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance,
        AVG(mileage) as avg_mileage
      FROM vehicles
    `);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
