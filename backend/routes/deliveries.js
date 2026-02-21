const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { auth, authorize } = require('../middleware/auth');

// Routes
router.get('/', auth, deliveryController.getAllDeliveries);
router.get('/stats', auth, deliveryController.getDeliveryStats);
router.get('/:id', auth, deliveryController.getDeliveryById);
router.post('/', auth, authorize('admin', 'manager'), deliveryController.createDelivery);
router.put('/:id', auth, deliveryController.updateDelivery);
router.delete('/:id', auth, authorize('admin', 'manager'), deliveryController.deleteDelivery);

module.exports = router;
