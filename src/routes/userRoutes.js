const express = require('express');
const userAuth = require('../Middleware/userAuth');
const { uploadProfile, uploadReview } = require('../Middleware/uploadMiddleware');
const userRouter = express.Router();
const userController = require('../controllers/userController');

userRouter.get('/api/data-users',  userAuth, userController.getUserData);
userRouter.get('/api/products/:productId/reviews', userController.getProductReviews);
userRouter.post('/api/products/reviews', userAuth, uploadReview.array('images', 5), userController.createReview);
userRouter.put('/api/update-profile', userAuth, uploadProfile.single('profileImage'), userController.updateProfile);
userRouter.get('/api/products/search', userController.searchProducts);

// Address routes
userRouter.post('/api/addresses', userAuth, userController.addAddress);
userRouter.get('/api/AllAddresses', userAuth, userController.getAddresses);
userRouter.put('/api/addresses/:addressId', userAuth, userController.updateAddress);
userRouter.delete('/api/addresses/:addressId', userAuth, userController.deleteAddress);
userRouter.put('/api/addresses/:addressId/set-default', userAuth, userController.setDefaultAddress);

// Cart routes
userRouter.post('/api/cart/add', userAuth, userController.addToCart);
userRouter.get('/api/cart', userAuth, userController.getCart);
userRouter.put('/api/cart/update', userAuth, userController.updateCartItem);
userRouter.delete('/api/cart/clear', userAuth, userController.clearCart);
userRouter.delete('/api/cart/:productId', userAuth, userController.removeFromCart);
userRouter.post('/api/cart/remove-multiple', userAuth, userController.removeMultipleItems);

// Wishlist routes
userRouter.post('/api/wishlist/add', userAuth, userController.addToWishlist);
userRouter.get('/api/wishlist', userAuth, userController.getWishlist);
userRouter.delete('/api/wishlist/:productId', userAuth, userController.removeFromWishlist);

module.exports = userRouter;