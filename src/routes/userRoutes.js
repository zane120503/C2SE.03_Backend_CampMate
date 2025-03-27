const express = require('express');
const userAuth = require('../Middleware/userAuth');
const userRouter = express.Router();
const userController = require('../controllers/userController');

userRouter.get('/api/data-users', userAuth, userController.getUserData);
userRouter.get('/api/products/:productId/reviews', userController.getProductReviews);
userRouter.post('/api/products/reviews', userAuth, userController.createReview);

module.exports = userRouter;