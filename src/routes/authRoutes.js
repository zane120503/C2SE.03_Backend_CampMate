const express = require('express');
const authController = require('../controllers/authController');
const authRoutes = express.Router();
const userAuth = require('../Middleware/userAuth');
const resetPasswordAuth = require('../Middleware/resetPasswordAuth');


authRoutes.post('/api/auth/register', authController.register);
authRoutes.post('/api/auth/login', authController.login);
authRoutes.post('/api/auth/logout', authController.logout);

authRoutes.post('/api/auth/send-verify-otp', userAuth, authController.sendVerifyOTP);
authRoutes.post('/api/auth/verify-email', userAuth, authController.verifyEmail);
authRoutes.post('/api/auth/is-auth', userAuth, authController.isAuthenticated);

// Forgot password routes
authRoutes.post('/api/auth/send-Reset-OTP', authController.sendResetOTP);
authRoutes.post('/api/auth/verify-reset-otp', authController.verifyResetOTP);

authRoutes.post('/api/auth/reset-password', resetPasswordAuth, authController.resetPassword);

// Change password route (requires authentication)
authRoutes.put('/api/auth/change-password', userAuth, authController.changePassword);

module.exports = authRoutes;