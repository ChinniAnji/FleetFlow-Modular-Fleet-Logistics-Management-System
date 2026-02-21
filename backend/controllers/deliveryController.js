const db = require('../config/database');

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*, c.name as customer_name, c.company,
             v.vehicle_number, dr.license_number, u.name as driver_name
      FROM deliveries d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      LEFT JOIN users u ON dr.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    }

    query += ' ORDER BY d.created_at DESC';

    const countQuery = query.replace('SELECT d.*, c.name as customer_name, c.company, v.vehicle_number, dr.license_number, u.name as driver_name', 'SELECT COUNT(*) as count');
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
    console.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT d.*, c.name as customer_name, c.company, c.phone as customer_phone,
              v.vehicle_number, v.vehicle_type, dr.license_number, u.name as driver_name
       FROM deliveries d
       LEFT JOIN customers c ON d.customer_id = c.id
       LEFT JOIN vehicles v ON d.vehicle_id = v.id
       LEFT JOIN drivers dr ON d.driver_id = dr.id
       LEFT JOIN users u ON dr.user_id = u.id
       WHERE d.id = ?`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create delivery
exports.createDelivery = async (req, res) => {
  try {
    console.log('Create delivery request body:', req.body);
    
    const {
      delivery_number, customer_id, pickup_address, delivery_address,
      status, priority, package_type, weight, delivery_cost, payment_status
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
      delivery_number,
      toNullIfEmpty(customer_id),
      pickup_address,
      delivery_address,
      status || 'pending',
      priority || 'normal',
      toNullIfEmpty(package_type),
      toNullIfEmpty(weight),
      toNullIfEmpty(delivery_cost),
      payment_status || 'pending'
    ];

    console.log('Insert params:', params);

    const result = await db.query(
      `INSERT INTO deliveries (
        delivery_number, customer_id, pickup_address, delivery_address,
        status, priority, package_type, weight, delivery_cost, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    const deliveryId = result.insertId;
    const deliveryResult = await db.query('SELECT * FROM deliveries WHERE id = ?', [deliveryId]);
    res.status(201).json({ success: true, data: deliveryResult.rows[0] });
  } catch (error) {
    console.error('Create delivery error:', error);
    console.error('Error details:', error.message, error.sqlMessage);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Delivery number already exists' });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Update delivery
exports.updateDelivery = async (req, res) => {
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
      `UPDATE deliveries SET ${fields}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const deliveryResult = await db.query('SELECT * FROM deliveries WHERE id = ?', [id]);
    res.json({ success: true, data: deliveryResult.rows[0] });
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete delivery
exports.deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM deliveries WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({ success: true, message: 'Delivery deleted successfully' });
  } catch (error) {
    console.error('Delete delivery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get delivery statistics
exports.getDeliveryStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as in_transit,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        SUM(delivery_cost) as total_revenue,
        AVG(delivery_cost) as avg_cost
      FROM deliveries
    `);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
