const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
const adminCategoryController = require('../controllers/adminCategoryController');
const router = express.Router();

// Admin Category Management Routes
router.get('/api/admin/categories', adminAuth, adminCategoryController.getAllCategories);
router.get('/api/admin/categories/:id', adminAuth, adminCategoryController.getCategoryById);
router.post('/api/admin/categories', adminAuth, adminCategoryController.createCategory);
router.put('/api/admin/categories/:id', adminAuth, adminCategoryController.updateCategory);
router.delete('/api/admin/categories/:id', adminAuth, adminCategoryController.deleteCategory);

module.exports = router;
