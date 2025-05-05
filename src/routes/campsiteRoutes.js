const express = require('express');
const router = express.Router();
const campsiteController = require('../controllers/campsiteController');
const userAuth = require('../Middleware/userAuth');
const { uploadReview } = require('../Middleware/uploadMiddleware');


// Public routes
router.get('/api/campsite/locations', campsiteController.getAllLocations);
router.get('/api/campsite/search', campsiteController.searchCampsites);
router.get('/api/campsite/:id', campsiteController.getCampsiteDetails);
router.get('/api/campsite/:id/reviews', campsiteController.getAllReviews);

// Protected routes
router.post('/api/campsite/:id/review', userAuth, uploadReview.array('images', 5), campsiteController.addReview);

module.exports = router;