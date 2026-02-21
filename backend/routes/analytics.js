const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

// Routes
router.get('/dashboard', auth, analyticsController.getDashboardStats);
router.get('/revenue', auth, analyticsController.getRevenueAnalytics);
router.get('/fleet-performance', auth, analyticsController.getFleetPerformance);

module.exports = router;
