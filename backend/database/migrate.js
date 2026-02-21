const { pool } = require('../config/database');

const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(20),
        avatar VARCHAR(500),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Vehicles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_number VARCHAR(50) UNIQUE NOT NULL,
        vehicle_type VARCHAR(100) NOT NULL,
        make VARCHAR(100),
        model VARCHAR(100),
        year INT,
        capacity DECIMAL(10,2),
        fuel_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'available',
        mileage DECIMAL(10,2) DEFAULT 0,
        last_service_date DATE,
        next_service_date DATE,
        insurance_expiry DATE,
        registration_expiry DATE,
        assigned_driver_id INT,
        purchase_date DATE,
        purchase_cost DECIMAL(12,2),
        current_location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_driver_id) REFERENCES users(id)
      )
    `);

    // Drivers table (extended user info)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        license_number VARCHAR(100) UNIQUE NOT NULL,
        license_type VARCHAR(50),
        license_expiry DATE,
        date_of_birth DATE,
        hire_date DATE,
        experience_years INT,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_deliveries INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'available',
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        company VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Routes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        route_name VARCHAR(255) NOT NULL,
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        distance DECIMAL(10,2),
        estimated_duration INT,
        waypoints TEXT,
        status VARCHAR(50) DEFAULT 'planned',
        assigned_vehicle_id INT,
        assigned_driver_id INT,
        planned_start_time TIMESTAMP NULL,
        actual_start_time TIMESTAMP NULL,
        planned_end_time TIMESTAMP NULL,
        actual_end_time TIMESTAMP NULL,
        fuel_cost DECIMAL(10,2),
        toll_cost DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id),
        FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id)
      )
    `);

    // Deliveries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        delivery_number VARCHAR(100) UNIQUE NOT NULL,
        customer_id INT,
        route_id INT,
        vehicle_id INT,
        driver_id INT,
        pickup_address TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        pickup_date TIMESTAMP NULL,
        delivery_date TIMESTAMP NULL,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'normal',
        package_type VARCHAR(100),
        weight DECIMAL(10,2),
        dimensions VARCHAR(100),
        special_instructions TEXT,
        proof_of_delivery VARCHAR(500),
        customer_signature VARCHAR(500),
        delivery_cost DECIMAL(10,2),
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (route_id) REFERENCES routes(id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
      )
    `);

    // Maintenance table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS maintenance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT,
        maintenance_type VARCHAR(100) NOT NULL,
        description TEXT,
        scheduled_date DATE,
        completed_date DATE,
        status VARCHAR(50) DEFAULT 'scheduled',
        cost DECIMAL(10,2),
        mileage DECIMAL(10,2),
        service_provider VARCHAR(255),
        technician_name VARCHAR(255),
        parts_replaced TEXT,
        next_service_mileage DECIMAL(10,2),
        priority VARCHAR(50) DEFAULT 'normal',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);

    // Fuel records table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fuel_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT,
        driver_id INT,
        fuel_date TIMESTAMP NOT NULL,
        fuel_type VARCHAR(50),
        quantity DECIMAL(10,2) NOT NULL,
        cost_per_unit DECIMAL(10,2),
        total_cost DECIMAL(10,2),
        mileage DECIMAL(10,2),
        fuel_station VARCHAR(255),
        location VARCHAR(255),
        receipt_number VARCHAR(100),
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
      )
    `);

    // Trips table (for tracking individual trips)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT,
        driver_id INT,
        route_id INT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NULL,
        start_mileage DECIMAL(10,2),
        end_mileage DECIMAL(10,2),
        distance_covered DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'in_progress',
        fuel_consumed DECIMAL(10,2),
        average_speed DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
        FOREIGN KEY (driver_id) REFERENCES drivers(id),
        FOREIGN KEY (route_id) REFERENCES routes(id)
      )
    `);

    // Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50),
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Activity logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100),
        entity_id INT,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create indexes for better performance
    await connection.query(`
      CREATE INDEX idx_vehicles_status ON vehicles(status)
    `);
    await connection.query(`
      CREATE INDEX idx_drivers_status ON drivers(status)
    `);
    await connection.query(`
      CREATE INDEX idx_deliveries_status ON deliveries(status)
    `);
    await connection.query(`
      CREATE INDEX idx_routes_status ON routes(status)
    `);
    await connection.query(`
      CREATE INDEX idx_maintenance_vehicle ON maintenance(vehicle_id)
    `);
    await connection.query(`
      CREATE INDEX idx_fuel_vehicle ON fuel_records(vehicle_id)
    `);
    await connection.query(`
      CREATE INDEX idx_notifications_user ON notifications(user_id)
    `);

    await connection.query('COMMIT');
    console.log('✅ All tables created successfully');
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
};

if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = createTables;
