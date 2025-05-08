const express = require('express');
const router = express.Router();
const campsiteOwnerController = require('../controllers/campsiteOwnerController');
const auth = require('../Middleware/userAuth');
const adminAuth = require('../Middleware/adminAuth');
const ownerAuth = require('../Middleware/ownerAuth');
const { uploadCampsite } = require('../Middleware/uploadMiddleware');

// Routes cho user thông thường
router.post('/api/campsite-owner/request', auth, campsiteOwnerController.requestCampsiteOwner);

// Routes cho owner
router.get('/api/campsite-owner/my-campsites', auth, ownerAuth, campsiteOwnerController.getOwnerCampsites);
router.post('/api/campsite-owner/campsites', auth, ownerAuth, uploadCampsite.array('images', 10), campsiteOwnerController.createCampsite);
router.put('/api/campsite-owner/campsites/:id', auth, ownerAuth, uploadCampsite.array('images', 10), campsiteOwnerController.updateCampsite);
router.delete('/api/campsite-owner/campsites/:id', auth, ownerAuth, campsiteOwnerController.deleteCampsite);
router.patch('/api/campsite-owner/campsites/:id/toggle-status', auth, ownerAuth, campsiteOwnerController.toggleCampsiteStatus);

// Routes cho admin
router.get('/api/admin/requests', adminAuth, campsiteOwnerController.getOwnerRequests);
router.post('/api/admin/handle-request', adminAuth, campsiteOwnerController.handleOwnerRequest);

module.exports = router; 