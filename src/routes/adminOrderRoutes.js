const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
const adminOrderController = require('../controllers/adminOrderController');
const router = express.Router();

// Admin Order Management Routes
router.get('/api/admin/orders', adminAuth, adminOrderController.getAllOrders);
router.get('/api/admin/orders/:id', adminAuth, adminOrderController.getOrderById);
router.put('/api/admin/orders/:id', adminAuth, adminOrderController.updateOrder);
router.delete('/api/admin/orders/:id', adminAuth, adminOrderController.deleteOrder);

module.exports = router;
