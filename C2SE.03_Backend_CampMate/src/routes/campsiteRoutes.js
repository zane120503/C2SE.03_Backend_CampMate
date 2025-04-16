const express = require('express');
const router = express.Router();
const campsiteController = require('../controllers/campsiteController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/locations', campsiteController.getAllLocations);
router.get('/search', campsiteController.searchCampsites);
router.get('/:id', campsiteController.getCampsiteDetails);

// Protected routes
router.post('/:id/reviews', verifyToken, campsiteController.addReview);

module.exports = router; 