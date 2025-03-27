const express = require('express');
const userAuth = require('../Middleware/userAuth');
const upload = require('../Middleware/uploadMiddleware');
const userRouter = express.Router();
const userController = require('../controllers/userController');

userRouter.get('/api/data-users',  userAuth, userController.getUserData);
userRouter.get('/api/products/:productId/reviews', userController.getProductReviews);
userRouter.post('/api/products/reviews', userAuth, userController.createReview);
userRouter.put('/api/update-profile', userAuth, upload.single('profileImage'), userController.updateProfile);

// Cart routes
userRouter.post('/api/cart/add', userAuth, userController.addToCart);
userRouter.get('/api/cart', userAuth, userController.getCart);
userRouter.put('/api/cart/update', userAuth, userController.updateCartItem);
userRouter.delete('/api/cart/:productId', userAuth, userController.removeFromCart);
userRouter.delete('/api/cart/clear', userAuth, userController.clearCart);

// Wishlist routes
userRouter.post('/api/wishlist/add', userAuth, userController.addToWishlist);
userRouter.get('/api/wishlist', userAuth, userController.getWishlist);
userRouter.delete('/api/wishlist/:productId', userAuth, userController.removeFromWishlist);

module.exports = userRouter;