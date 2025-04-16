const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const userAuth = require('../Middleware/userAuth');

// Routes cho người dùng
router.post('/api/orders/create', userAuth, orderController.createOrder);
router.get('/api/orders/my-orders', userAuth, orderController.getOrdersByUserId);
router.get('/api/orders/delivered', userAuth, orderController.getDeliveredOrders);
router.get('/api/orders/:orderId', userAuth, orderController.getOrderById);
router.delete('/api/orders/:orderId', userAuth, orderController.deleteOrder);
router.put('/api/orders/:orderId/confirm-delivery', userAuth, orderController.confirmDelivery);
router.put('/api/orders/:orderId/return', userAuth, orderController.returnOrder);

module.exports = router; 