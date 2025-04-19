const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
const adminProductController = require('../controllers/adminProductController');
const router = express.Router();

// Admin Product Management Routes
router.get('/api/admin/products', adminAuth, adminProductController.getAllProducts);
router.get('/api/admin/products/:id', adminAuth, adminProductController.getProductById);
router.post('/api/admin/products', adminAuth, adminProductController.createProduct);
router.put('/api/admin/products/:id', adminAuth, adminProductController.updateProduct);
router.delete('/api/admin/products/:id', adminAuth, adminProductController.deleteProduct);

module.exports = router;
