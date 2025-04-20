const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
const { uploadProduct } = require('../Middleware/uploadMiddleware');
const adminProductController = require('../controllers/adminProductController');
const router = express.Router();

// Admin Product Management Routes
router.get('/api/admin/products', adminAuth, adminProductController.getAllProducts);
router.get('/api/admin/products/:id', adminAuth, adminProductController.getProductById);
router.post('/api/admin/products', 
  adminAuth, 
  uploadProduct.array('images', 5), // Allow up to 5 images
  adminProductController.createProduct
);
router.put('/api/admin/products/:id', 
  adminAuth, 
  uploadProduct.array('images', 5),
  adminProductController.updateProduct
);
router.delete('/api/admin/products/:id', adminAuth, adminProductController.deleteProduct);
router.patch('/api/admin/products/:id/status', adminAuth, adminProductController.toggleProductStatus);

module.exports = router;
