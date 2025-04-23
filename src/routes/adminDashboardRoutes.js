const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const adminAuth = require('../Middleware/adminAuth');

// Dashboard routes
router.get('/api/admin/dashboard/stats', adminAuth, adminDashboardController.getDashboardStats);
router.get('/api/admin/dashboard/monthly-stats', adminAuth, adminDashboardController.getMonthlyStats);

module.exports = router; 