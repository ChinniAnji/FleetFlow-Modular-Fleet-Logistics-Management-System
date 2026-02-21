# FleetFlow - Modular Fleet & Logistics Management System

## 🚀 Industry-Level Fleet Management Solution

A comprehensive, enterprise-grade fleet and logistics management system built with modern technologies for the Odoo Hackathon.

## 💻 Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Chart.js
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Real-time**: Socket.IO
- **Authentication**: JWT

## ✨ Key Features

### 1. **Dashboard & Analytics**
- Real-time fleet overview
- KPI metrics (Total Vehicles, Active Drivers, Deliveries, Revenue)
- Interactive charts (Fuel consumption, Delivery trends, Vehicle status)
- Performance analytics

### 2. **Vehicle Management**
- Complete vehicle inventory
- Real-time status tracking
- Maintenance scheduling
- Fuel consumption monitoring
- Document management
- Vehicle assignment

### 3. **Driver Management**
- Driver profiles with performance ratings
- License and document tracking
- Assignment history
- Performance metrics
- Availability status

### 4. **Route Optimization**
- Smart route planning
- Distance and time calculations
- Multi-stop route management
- Route history and analytics
- Cost optimization

### 5. **Delivery Management**
- Order tracking system
- Real-time delivery status
- Customer management
- Proof of delivery
- Delivery history

### 6. **Maintenance Module**
- Preventive maintenance scheduling
- Service history tracking
- Automated reminders
- Cost tracking
- Vendor management

### 7. **Fuel Management**
- Fuel consumption tracking
- Cost analysis
- Efficiency reports
- Fuel station management

### 8. **Reports & Analytics**
- Customizable reports
- Export functionality (PDF, Excel)
- Fleet performance metrics
- Financial reports
- Compliance reports

### 9. **Real-time Tracking**
- Live GPS tracking (simulation)
- Geofencing
- Route deviation alerts
- ETAs calculation

### 10. **User Management**
- Role-based access control
- Multi-user support
- Activity logs
- Profile management

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
cd "FleetFlow Modular Fleet & Logistics Management System"
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Setup database**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE fleetflow_db;"

# Run migrations
npm run migrate

# Seed sample data (optional)
npm run seed
```

5. **Start the application**
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Backend only
npm run server

# Frontend only
npm run client
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Default Credentials

- **Admin**: admin@fleetflow.com / admin123
- **Manager**: manager@fleetflow.com / manager123
- **Driver**: driver@fleetflow.com / driver123

## 📁 Project Structure

```
fleetflow-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── database/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## 🎯 API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/me` - Get current user

### Vehicles
- GET `/api/vehicles` - Get all vehicles
- POST `/api/vehicles` - Create vehicle
- PUT `/api/vehicles/:id` - Update vehicle
- DELETE `/api/vehicles/:id` - Delete vehicle

### Drivers
- GET `/api/drivers` - Get all drivers
- POST `/api/drivers` - Create driver
- PUT `/api/drivers/:id` - Update driver
- DELETE `/api/drivers/:id` - Delete driver

### Routes
- GET `/api/routes` - Get all routes
- POST `/api/routes` - Create route
- PUT `/api/routes/:id` - Update route
- DELETE `/api/routes/:id` - Delete route

### Deliveries
- GET `/api/deliveries` - Get all deliveries
- POST `/api/deliveries` - Create delivery
- PUT `/api/deliveries/:id` - Update delivery status

### Maintenance
- GET `/api/maintenance` - Get maintenance records
- POST `/api/maintenance` - Create maintenance record
- PUT `/api/maintenance/:id` - Update maintenance

### Fuel
- GET `/api/fuel` - Get fuel records
- POST `/api/fuel` - Create fuel record

### Analytics
- GET `/api/analytics/dashboard` - Dashboard statistics
- GET `/api/analytics/reports` - Generate reports

## 🏆 Hackathon Features

- ✅ Modular architecture
- ✅ RESTful API design
- ✅ Responsive UI/UX
- ✅ Real-time updates
- ✅ Advanced analytics
- ✅ Role-based access
- ✅ Scalable database design
- ✅ Production-ready code
- ✅ Comprehensive documentation

## 📊 Database Schema

The system uses MySQL with the following main tables:
- users
- vehicles
- drivers
- routes
- deliveries
- maintenance
- fuel_records
- customers

## 🛠️ Development

### Code Quality
- ESLint for linting
- Prettier for formatting
- Best practices followed

### Security
- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention
- CORS configuration
- Input validation

## 📈 Performance

- Optimized database queries
- Efficient React rendering
- Lazy loading
- Code splitting
- Compressed responses

## 🤝 Contributing

This is a hackathon project. For improvements:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and create PR

## 👥 Team

FleetFlow Development Team - Odoo Hackathon 2026

---

**Built with ❤️ for Odoo Hackathon**
