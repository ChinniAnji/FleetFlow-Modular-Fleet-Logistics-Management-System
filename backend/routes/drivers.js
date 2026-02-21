const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { auth, authorize } = require('../middleware/auth');

// Routes
router.get('/', auth, driverController.getAllDrivers);
router.get('/stats', auth, driverController.getDriverStats);
router.get('/:id', auth, driverController.getDriverById);
router.post('/', auth, authorize('admin', 'manager'), driverController.createDriver);
router.put('/:id', auth, authorize('admin', 'manager'), driverController.updateDriver);
router.delete('/:id', auth, authorize('admin'), driverController.deleteDriver);

module.exports = router;
