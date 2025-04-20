const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
const { uploadCategory } = require('../Middleware/uploadMiddleware');
const adminCategoryController = require('../controllers/adminCategoryController');
const router = express.Router();

// Admin Category Management Routes
router.get('/api/admin/categories', adminAuth, adminCategoryController.getAllCategories);
router.get('/api/admin/categories/:id', adminAuth, adminCategoryController.getCategoryById);
router.post('/api/admin/categories', 
  adminAuth, 
  uploadCategory.single('image'),
  adminCategoryController.createCategory
);
router.put('/api/admin/categories/:id', 
  adminAuth, 
  uploadCategory.single('image'),
  adminCategoryController.updateCategory
);
router.delete('/api/admin/categories/:id', adminAuth, adminCategoryController.deleteCategory);
router.patch('/api/admin/categories/:id/status', adminAuth, adminCategoryController.toggleCategoryStatus);

module.exports = router;
