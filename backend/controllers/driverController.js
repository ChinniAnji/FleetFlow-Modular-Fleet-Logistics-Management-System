const db = require('../config/database');

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*, u.name, u.email, u.phone, u.avatar 
      FROM drivers d 
      INNER JOIN users u ON d.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    }

    query += ' ORDER BY d.created_at DESC';

    const countQuery = query.replace('SELECT d.*, u.name, u.email, u.phone, u.avatar', 'SELECT COUNT(*) as count');
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
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT d.*, u.name, u.email, u.phone, u.avatar 
       FROM drivers d 
       INNER JOIN users u ON d.user_id = u.id 
       WHERE d.id = ?`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create driver
exports.createDriver = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      name, email, phone, password,
      license_number, license_type, license_expiry, date_of_birth,
      hire_date, experience_years, emergency_contact, emergency_phone, address
    } = req.body;

    // Create user first
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || 'driver123', 10);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role, phone)
       VALUES (?, ?, ?, 'driver', ?)`,
      [name, email, hashedPassword, phone]
    );

    const userId = userResult.insertId;

    // Create driver profile
    const driverResult = await client.query(
      `INSERT INTO drivers (
        user_id, license_number, license_type, license_expiry, date_of_birth,
        hire_date, experience_years, emergency_contact, emergency_phone, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, license_number, license_type, license_expiry, date_of_birth,
       hire_date, experience_years, emergency_contact, emergency_phone, address]
    );

    await client.query('COMMIT');

    const driverId = driverResult.insertId;
    const driverData = await client.query('SELECT * FROM drivers WHERE id = ?', [driverId]);
    res.status(201).json({ success: true, data: driverData.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create driver error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email or license number already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// Update driver
exports.updateDriver = async (req, res) => {
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
      `UPDATE drivers SET ${fields}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const driverResult = await db.query('SELECT * FROM drivers WHERE id = ?', [id]);
    res.json({ success: true, data: driverResult.rows[0] });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete driver
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driverResult = await db.query('SELECT user_id FROM drivers WHERE id = ?', [id]);

    if (driverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const userId = driverResult.rows[0].user_id;
    await db.query('DELETE FROM drivers WHERE id = ?', [id]);

    // Delete associated user
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get driver statistics
exports.getDriverStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'on_trip' THEN 1 END) as on_trip,
        COUNT(CASE WHEN status = 'off_duty' THEN 1 END) as off_duty,
        AVG(rating) as avg_rating,
        SUM(total_deliveries) as total_deliveries
      FROM drivers
    `);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
