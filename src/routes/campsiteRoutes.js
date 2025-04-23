const express = require('express');
const router = express.Router();
const campsiteController = require('../controllers/campsiteController');
const userAuth = require('../Middleware/userAuth');


// Public routes
router.get('/api/campsite/locations', campsiteController.getAllLocations);
router.get('/api/campsite/search', campsiteController.searchCampsites);
router.get('/api/campsite/:id', campsiteController.getCampsiteDetails);
router.get('/api/campsite/:id/reviews', campsiteController.getAllReviews);

// Protected routes
router.post('/api/campsite/:id/review', userAuth, campsiteController.addReview);

module.exports = router;