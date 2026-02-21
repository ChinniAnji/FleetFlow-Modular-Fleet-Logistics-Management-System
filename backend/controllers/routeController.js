const db = require('../config/database');

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, v.vehicle_number, d.license_number, u.name as driver_name
      FROM routes r
      LEFT JOIN vehicles v ON r.assigned_vehicle_id = v.id
      LEFT JOIN drivers d ON r.assigned_driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC';

    const countQuery = query.replace('SELECT r.*, v.vehicle_number, d.license_number, u.name as driver_name', 'SELECT COUNT(*) as count');
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
    console.error('Get routes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get route by ID
exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT r.*, v.vehicle_number, v.vehicle_type, d.license_number, u.name as driver_name
       FROM routes r
       LEFT JOIN vehicles v ON r.assigned_vehicle_id = v.id
       LEFT JOIN drivers d ON r.assigned_driver_id = d.id
       LEFT JOIN users u ON d.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create route
exports.createRoute = async (req, res) => {
  try {
    console.log('=== CREATE ROUTE DEBUG ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    
    // Extract ALL fields from body
    const route_name = req.body.route_name;
    const origin = req.body.origin;
    const destination = req.body.destination;
    const distance = req.body.distance;
    const estimated_duration = req.body.estimated_duration;
    const status = req.body.status;
    const fuel_cost = req.body.fuel_cost;
    const toll_cost = req.body.toll_cost;

    console.log('Extracted values:', {
      route_name, origin, destination, distance, 
      estimated_duration, status, fuel_cost, toll_cost
    });

    // Helper to convert empty strings/undefined to null and parse numbers
    const toNullIfEmpty = (val) => {
      if (val === '' || val === undefined || val === null) return null;
      if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
        return parseFloat(val);
      }
      return val;
    };

    // Build params array - ensure NO undefined values
    const params = [
      route_name || null,
      origin || null,
      destination || null,
      toNullIfEmpty(distance),
      toNullIfEmpty(estimated_duration),
      status || 'planned',
      toNullIfEmpty(fuel_cost),
      toNullIfEmpty(toll_cost)
    ];

    console.log('Final params array:', params);
    console.log('Params types:', params.map(p => typeof p));
    
    // Check for any undefined values
    const hasUndefined = params.some(p => p === undefined);
    if (hasUndefined) {
      console.error('ERROR: Found undefined in params!', params);
      return res.status(400).json({ error: 'Invalid data: some fields are undefined' });
    }

    const result = await db.query(
      `INSERT INTO routes (
        route_name, origin, destination, distance, estimated_duration,
        status, fuel_cost, toll_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    console.log('Insert successful, ID:', result.insertId);

    const routeId = result.insertId;
    const routeResult = await db.query('SELECT * FROM routes WHERE id = ?', [routeId]);
    res.status(201).json({ success: true, data: routeResult.rows[0] });
  } catch (error) {
    console.error('Create route error:', error);
    console.error('Error message:', error.message);
    console.error('SQL Message:', error.sqlMessage);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Update route
exports.updateRoute = async (req, res) => {
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
      `UPDATE routes SET ${fields}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const routeResult = await db.query('SELECT * FROM routes WHERE id = ?', [id]);
    res.json({ success: true, data: routeResult.rows[0] });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete route
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM routes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ success: true, message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
