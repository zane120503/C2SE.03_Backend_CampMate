const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
const adminCampsiteController = require('../controllers/adminCampsiteController');
const router = express.Router();

// Admin Campsite Management Routes
router.get('/api/admin/campsites', adminAuth, adminCampsiteController.getAllCampsites);
router.get('/api/admin/campsites/:id', adminAuth, adminCampsiteController.getCampsiteById);
router.post('/api/admin/campsites', adminAuth, adminCampsiteController.createCampsite);
router.put('/api/admin/campsites/:id', adminAuth, adminCampsiteController.updateCampsite);
router.delete('/api/admin/campsites/:id', adminAuth, adminCampsiteController.deleteCampsite);

module.exports = router;
