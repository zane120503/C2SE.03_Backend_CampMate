const express = require('express');
const adminAuth = require('../Middleware/adminAuth');
const { uploadCampsite } = require('../Middleware/uploadMiddleware');
const adminCampsiteController = require('../controllers/adminCampsiteController');
const router = express.Router();

// Admin Campsite Management Routes
router.get('/api/admin/campsites', adminAuth, adminCampsiteController.getAllCampsites);
router.get('/api/admin/campsites/:id', adminAuth, adminCampsiteController.getCampsite);
router.post('/api/admin/campsites', 
  adminAuth, 
  uploadCampsite.array('images', 10),
  adminCampsiteController.createCampsite
);
router.put('/api/admin/campsites/:id', 
  adminAuth, 
  uploadCampsite.array('images', 10),
  adminCampsiteController.updateCampsite
);
router.delete('/api/admin/campsites/:id', adminAuth, adminCampsiteController.deleteCampsite);
router.patch('/api/admin/campsites/:id/status', adminAuth, adminCampsiteController.toggleCampsiteStatus);

module.exports = router;
