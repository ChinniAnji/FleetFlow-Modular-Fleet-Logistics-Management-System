const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { auth, authorize } = require('../middleware/auth');

// Routes
router.get('/', auth, maintenanceController.getAllMaintenance);
router.post('/', auth, authorize('admin', 'manager'), maintenanceController.createMaintenance);
router.put('/:id', auth, authorize('admin', 'manager'), maintenanceController.updateMaintenance);
router.delete('/:id', auth, authorize('admin'), maintenanceController.deleteMaintenance);

module.exports = router;
