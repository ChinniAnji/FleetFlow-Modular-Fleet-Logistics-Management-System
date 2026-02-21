const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { auth, authorize } = require('../middleware/auth');

// Routes
router.get('/', auth, routeController.getAllRoutes);
router.get('/:id', auth, routeController.getRouteById);
router.post('/', auth, authorize('admin', 'manager'), routeController.createRoute);
router.put('/:id', auth, authorize('admin', 'manager'), routeController.updateRoute);
router.delete('/:id', auth, authorize('admin'), routeController.deleteRoute);

module.exports = router;
