const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
const adminUserController = require('../controllers/adminUserController');
const router = express.Router();

// Admin User Management Routes
router.get('/api/admin/users', adminAuth, adminUserController.getAllUsers);
router.get('/api/admin/users/:id', adminAuth, adminUserController.getUserById);
router.post('/api/admin/users', adminAuth, adminUserController.createUser);
router.delete('/api/admin/users/:id', adminAuth, adminUserController.deleteUser);
router.patch('/api/admin/users/:id/block', adminAuth, adminUserController.toggleUserBlock);
router.patch('/api/admin/users/:id/admin', adminAuth, adminUserController.toggleUserAdmin);

module.exports = router;
