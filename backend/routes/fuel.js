const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const { auth, authorize } = require('../middleware/auth');

// Routes
router.get('/', auth, fuelController.getAllFuelRecords);
router.get('/stats', auth, fuelController.getFuelStats);
router.post('/', auth, fuelController.createFuelRecord);
router.put('/:id', auth, authorize('admin', 'manager'), fuelController.updateFuelRecord);
router.delete('/:id', auth, authorize('admin'), fuelController.deleteFuelRecord);

module.exports = router;
