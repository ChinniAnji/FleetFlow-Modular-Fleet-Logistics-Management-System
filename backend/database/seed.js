const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.query('START TRANSACTION');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Seed users
    await connection.query(`
      INSERT INTO users (id, name, email, password, role, phone, is_active) VALUES
      (1, 'Admin User', 'admin@fleetflow.com', ?, 'admin', '+1234567890', 1),
      (2, 'Fleet Manager', 'manager@fleetflow.com', ?, 'manager', '+1234567891', 1),
      (3, 'John Driver', 'john@fleetflow.com', ?, 'driver', '+1234567892', 1),
      (4, 'Sarah Driver', 'sarah@fleetflow.com', ?, 'driver', '+1234567893', 1),
      (5, 'Mike Driver', 'mike@fleetflow.com', ?, 'driver', '+1234567894', 1)
      ON DUPLICATE KEY UPDATE 
        password = VALUES(password),
        is_active = 1
    `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword]);

    console.log('✅ Users seeded');

    // Seed drivers
    await connection.query(`
      INSERT IGNORE INTO drivers (id, user_id, license_number, license_type, license_expiry, hire_date, experience_years, rating, status) VALUES
      (1, 3, 'DL12345678', 'Commercial', '2026-12-31', '2020-01-15', 5, 4.8, 'available'),
      (2, 4, 'DL87654321', 'Commercial', '2027-06-30', '2019-03-20', 6, 4.9, 'on_trip'),
      (3, 5, 'DL11223344', 'Commercial', '2026-09-15', '2021-05-10', 3, 4.7, 'available')
    `);
    console.log('✅ Drivers seeded');

    // Seed vehicles
    await connection.query(`
      INSERT IGNORE INTO vehicles (id, vehicle_number, vehicle_type, make, model, year, capacity, fuel_type, status, mileage, last_service_date, next_service_date) VALUES
      (1, 'FL-001', 'Truck', 'Volvo', 'FH16', 2022, 25000, 'Diesel', 'available', 45000, '2026-01-15', '2026-04-15'),
      (2, 'FL-002', 'Van', 'Mercedes', 'Sprinter', 2023, 3500, 'Diesel', 'on_trip', 12000, '2026-02-01', '2026-05-01'),
      (3, 'FL-003', 'Truck', 'Scania', 'R450', 2021, 28000, 'Diesel', 'available', 68000, '2026-01-20', '2026-04-20'),
      (4, 'FL-004', 'Van', 'Ford', 'Transit', 2023, 3000, 'Diesel', 'maintenance', 8500, '2026-02-10', '2026-05-10'),
      (5, 'FL-005', 'Truck', 'MAN', 'TGX', 2022, 26000, 'Diesel', 'available', 52000, '2026-01-25', '2026-04-25')
    `);
    console.log('✅ Vehicles seeded');

    // Seed customers
    await connection.query(`
      INSERT IGNORE INTO customers (id, name, email, phone, company, address, city, state, postal_code) VALUES
      (1, 'ABC Corp', 'contact@abccorp.com', '+1234567800', 'ABC Corporation', '123 Business St', 'New York', 'NY', '10001'),
      (2, 'XYZ Logistics', 'info@xyz.com', '+1234567801', 'XYZ Logistics Ltd', '456 Commerce Ave', 'Los Angeles', 'CA', '90001'),
      (3, 'Global Supplies', 'hello@global.com', '+1234567802', 'Global Supplies Inc', '789 Trade Blvd', 'Chicago', 'IL', '60601'),
      (4, 'Tech Solutions', 'support@tech.com', '+1234567803', 'Tech Solutions LLC', '321 Innovation Dr', 'Austin', 'TX', '73301'),
      (5, 'Retail Mart', 'orders@retail.com', '+1234567804', 'Retail Mart', '654 Store Way', 'Seattle', 'WA', '98101')
    `);
    console.log('✅ Customers seeded');

    // Seed routes
    await connection.query(`
      INSERT IGNORE INTO routes (id, route_name, origin, destination, distance, estimated_duration, status, fuel_cost, toll_cost) VALUES
      (1, 'Route NY-LA', 'New York, NY', 'Los Angeles, CA', 4500, 2880, 'completed', 1200, 150),
      (2, 'Route LA-CHI', 'Los Angeles, CA', 'Chicago, IL', 3200, 1920, 'in_progress', 850, 100),
      (3, 'Route CHI-NYC', 'Chicago, IL', 'New York, NY', 1270, 780, 'planned', 350, 75),
      (4, 'Route SEA-SF', 'Seattle, WA', 'San Francisco, CA', 1300, 840, 'completed', 380, 50),
      (5, 'Route AUS-HOU', 'Austin, TX', 'Houston, TX', 260, 180, 'completed', 85, 15)
    `);
    console.log('✅ Routes seeded');

    // Seed deliveries
    await connection.query(`
      INSERT IGNORE INTO deliveries (id, delivery_number, customer_id, pickup_address, delivery_address, status, priority, package_type, weight, delivery_cost, payment_status) VALUES
      (1, 'DEL-2026-001', 1, '123 Business St, New York, NY', '456 Commerce Ave, Los Angeles, CA', 'delivered', 'high', 'Electronics', 250.5, 1500, 'paid'),
      (2, 'DEL-2026-002', 2, '456 Commerce Ave, Los Angeles, CA', '789 Trade Blvd, Chicago, IL', 'in_transit', 'normal', 'General Cargo', 500.0, 2000, 'pending'),
      (3, 'DEL-2026-003', 3, '789 Trade Blvd, Chicago, IL', '123 Business St, New York, NY', 'pending', 'urgent', 'Fragile', 150.0, 1200, 'pending'),
      (4, 'DEL-2026-004', 4, '321 Innovation Dr, Austin, TX', '654 Store Way, Seattle, WA', 'delivered', 'normal', 'Documents', 5.0, 300, 'paid'),
      (5, 'DEL-2026-005', 5, '654 Store Way, Seattle, WA', '321 Innovation Dr, Austin, TX', 'picked_up', 'high', 'Retail Goods', 800.0, 2500, 'pending')
    `);
    console.log('✅ Deliveries seeded');

    // Seed maintenance records
    await connection.query(`
      INSERT IGNORE INTO maintenance (id, vehicle_id, maintenance_type, description, scheduled_date, status, cost, service_provider) VALUES
      (1, 1, 'Oil Change', 'Regular oil and filter change', '2026-04-15', 'scheduled', 250, 'AutoCare Services'),
      (2, 2, 'Tire Replacement', 'Replace all four tires', '2026-03-01', 'scheduled', 800, 'TirePro'),
      (3, 3, 'Brake Service', 'Brake pad replacement', '2026-03-15', 'scheduled', 450, 'AutoCare Services'),
      (4, 4, 'Engine Check', 'Complete engine diagnostic', '2026-02-25', 'in_progress', 600, 'MechMasters'),
      (5, 5, 'General Service', '50000 km service', '2026-04-20', 'scheduled', 500, 'AutoCare Services')
    `);
    console.log('✅ Maintenance records seeded');

    // Seed fuel records
    await connection.query(`
      INSERT IGNORE INTO fuel_records (id, vehicle_id, fuel_date, fuel_type, quantity, cost_per_unit, total_cost, mileage, fuel_station) VALUES
      (1, 1, '2026-02-15 08:30:00', 'Diesel', 120, 1.85, 222, 44800, 'Shell Station'),
      (2, 2, '2026-02-16 10:15:00', 'Diesel', 65, 1.88, 122.2, 11950, 'BP Station'),
      (3, 3, '2026-02-17 14:20:00', 'Diesel', 130, 1.82, 236.6, 67850, 'Chevron'),
      (4, 1, '2026-02-18 09:00:00', 'Diesel', 125, 1.87, 233.75, 45000, 'Exxon'),
      (5, 5, '2026-02-19 11:45:00', 'Diesel', 115, 1.85, 212.75, 51900, 'Shell Station')
    `);
    console.log('✅ Fuel records seeded');

    await connection.query('COMMIT');
    console.log('✅ All seed data inserted successfully');
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    connection.release();
  }
};

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedData;
