const db = require('../config/database');

// Get dashboard analytics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get overall statistics
    const [vehicles, drivers, deliveries, routes, maintenance, fuel] = await Promise.all([
      db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
          COUNT(CASE WHEN status = 'on_trip' THEN 1 END) as on_trip,
          COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance
        FROM vehicles
      `),
      db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
          COUNT(CASE WHEN status = 'on_trip' THEN 1 END) as on_trip,
          AVG(rating) as avg_rating
        FROM drivers
      `),
      db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as in_transit,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          SUM(delivery_cost) as total_revenue
        FROM deliveries
      `),
      db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          SUM(distance) as total_distance
        FROM routes
      `),
      db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          SUM(cost) as total_cost
        FROM maintenance
      `),
      db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(total_cost) as total_cost,
          SUM(quantity) as total_quantity,
          AVG(cost_per_unit) as avg_price
        FROM fuel_records
        WHERE fuel_date >= CURRENT_DATE - INTERVAL 30 DAY
      `)
    ]);

    // Get recent deliveries trend (last 7 days)
    const deliveryTrend = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(delivery_cost) as revenue
      FROM deliveries
      WHERE created_at >= CURRENT_DATE - INTERVAL 7 DAY
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Get fuel consumption trend (last 30 days)
    const fuelTrend = await db.query(`
      SELECT 
        DATE(fuel_date) as date,
        SUM(quantity) as quantity,
        SUM(total_cost) as cost
      FROM fuel_records
      WHERE fuel_date >= CURRENT_DATE - INTERVAL 30 DAY
      GROUP BY DATE(fuel_date)
      ORDER BY date
    `);

    // Get vehicle utilization
    const vehicleUtilization = await db.query(`
      SELECT 
        vehicle_type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'on_trip' THEN 1 END) as active
      FROM vehicles
      GROUP BY vehicle_type
    `);

    // Get top performing drivers
    const topDrivers = await db.query(`
      SELECT 
        d.id,
        u.name,
        d.rating,
        d.total_deliveries,
        d.status
      FROM drivers d
      INNER JOIN users u ON d.user_id = u.id
      ORDER BY d.rating DESC, d.total_deliveries DESC
      LIMIT 5
    `);

    // Get upcoming maintenance
    const upcomingMaintenance = await db.query(`
      SELECT 
        m.*,
        v.vehicle_number,
        v.vehicle_type
      FROM maintenance m
      INNER JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.status = 'scheduled' AND m.scheduled_date >= CURRENT_DATE
      ORDER BY m.scheduled_date
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        overview: {
          vehicles: vehicles.rows[0],
          drivers: drivers.rows[0],
          deliveries: deliveries.rows[0],
          routes: routes.rows[0],
          maintenance: maintenance.rows[0],
          fuel: fuel.rows[0]
        },
        trends: {
          deliveries: deliveryTrend.rows,
          fuel: fuelTrend.rows
        },
        vehicleUtilization: vehicleUtilization.rows,
        topDrivers: topDrivers.rows,
        upcomingMaintenance: upcomingMaintenance.rows
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;

    const result = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as deliveries,
        SUM(delivery_cost) as revenue,
        AVG(delivery_cost) as avg_revenue
      FROM deliveries
      WHERE created_at >= CURRENT_DATE - INTERVAL ${period} DAY
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    const total = await db.query(`
      SELECT 
        SUM(delivery_cost) as total_revenue,
        COUNT(*) as total_deliveries,
        AVG(delivery_cost) as avg_delivery_cost
      FROM deliveries
      WHERE created_at >= CURRENT_DATE - INTERVAL ${period} DAY
    `);

    res.json({
      success: true,
      data: {
        timeline: result.rows,
        summary: total.rows[0]
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get fleet performance
exports.getFleetPerformance = async (req, res) => {
  try {
    const performanceData = await db.query(`
      SELECT 
        v.id,
        v.vehicle_number,
        v.vehicle_type,
        v.mileage,
        v.status,
        COUNT(DISTINCT t.id) as total_trips,
        COALESCE(SUM(t.distance_covered), 0) as total_distance,
        COALESCE(SUM(f.total_cost), 0) as fuel_cost,
        COALESCE(SUM(m.cost), 0) as maintenance_cost
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id
      LEFT JOIN fuel_records f ON v.id = f.vehicle_id
      LEFT JOIN maintenance m ON v.id = m.vehicle_id
      GROUP BY v.id, v.vehicle_number, v.vehicle_type, v.mileage, v.status
      ORDER BY total_distance DESC
    `);

    res.json({
      success: true,
      data: performanceData.rows
    });
  } catch (error) {
    console.error('Get fleet performance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
