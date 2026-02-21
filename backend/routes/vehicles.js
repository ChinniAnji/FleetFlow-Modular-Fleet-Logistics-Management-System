const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { auth, authorize } = require('../middleware/auth');

// Routes
router.get('/', auth, vehicleController.getAllVehicles);
router.get('/stats', auth, vehicleController.getVehicleStats);
router.get('/:id', auth, vehicleController.getVehicleById);
router.post('/', auth, authorize('admin', 'manager'), vehicleController.createVehicle);
router.put('/:id', auth, authorize('admin', 'manager'), vehicleController.updateVehicle);
router.delete('/:id', auth, authorize('admin'), vehicleController.deleteVehicle);

module.exports = router;
