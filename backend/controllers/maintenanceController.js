const db = require('../config/database');

// Get all maintenance records
exports.getAllMaintenance = async (req, res) => {
  try {
    const { status, vehicle_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*, v.vehicle_number, v.vehicle_type
      FROM maintenance m
      INNER JOIN vehicles v ON m.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND m.status = ?`;
      params.push(status);
    }

    if (vehicle_id) {
      query += ` AND m.vehicle_id = ?`;
      params.push(vehicle_id);
    }

    query += ' ORDER BY m.scheduled_date DESC';

    const countQuery = query.replace('SELECT m.*, v.vehicle_number, v.vehicle_type', 'SELECT COUNT(*) as count');
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
    console.error('Get maintenance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create maintenance record
exports.createMaintenance = async (req, res) => {
  try {
    console.log('Create maintenance request body:', req.body);
    
    const {
      vehicle_id, maintenance_type, description, scheduled_date,
      status, cost, service_provider
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
      maintenance_type,
      toNullIfEmpty(description),
      toNullIfEmpty(scheduled_date),
      status || 'scheduled',
      toNullIfEmpty(cost),
      toNullIfEmpty(service_provider)
    ];

    console.log('Insert params:', params);

    const result = await db.query(
      `INSERT INTO maintenance (
        vehicle_id, maintenance_type, description, scheduled_date,
        status, cost, service_provider
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    const maintenanceId = result.insertId;
    const maintenanceResult = await db.query('SELECT * FROM maintenance WHERE id = ?', [maintenanceId]);
    res.status(201).json({ success: true, data: maintenanceResult.rows[0] });
  } catch (error) {
    console.error('Create maintenance error:', error);
    console.error('Error details:', error.message, error.sqlMessage);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Update maintenance record
exports.updateMaintenance = async (req, res) => {
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
      `UPDATE maintenance SET ${fields}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    const maintenanceResult = await db.query('SELECT * FROM maintenance WHERE id = ?', [id]);
    res.json({ success: true, data: maintenanceResult.rows[0] });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete maintenance record
exports.deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM maintenance WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json({ success: true, message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
