const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
// const fakeAdminAuth = require('../Middleware/fakeAdminAuth');
const adminUserController = require('../controllers/adminUserController');
const fakeAdminAuth = require('../Middleware/fakeAdminAuth');
const router = require('express').Router();

// Admin User Management Routes
// router.get('/api/admin/users', adminAuth, adminUserController.getAllUsers);
// router.get('/api/admin/users/:id', adminAuth, adminUserController.getUserById);
// router.post('/api/admin/users', adminAuth, adminUserController.createUser);
// router.put('/api/admin/users/:id', adminAuth, adminUserController.updateUser);
// router.delete('/api/admin/users/:id', adminAuth, adminUserController.deleteUser);

router.get('/api/admin/users', fakeAdminAuth, adminUserController.getAllUsers);
router.get('/api/admin/users/:id', fakeAdminAuth, adminUserController.getUserById);
router.post('/api/admin/users', fakeAdminAuth, adminUserController.createUser);
router.put('/api/admin/users/:id', fakeAdminAuth, adminUserController.updateUser);
router.delete('/api/admin/users/:id', fakeAdminAuth, adminUserController.deleteUser);

module.exports = router;
