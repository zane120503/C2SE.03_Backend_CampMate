const express = require('express');
const authController = require('../controllers/authController');
const authRoutes = express.Router();
const userAuth = require('../Middleware/userAuth');

authRoutes.post('/api/auth/register', authController.register);
authRoutes.post('/api/auth/login', authController.login);
authRoutes.post('/api/auth/logout', authController.logout);

authRoutes.post('/api/auth/send-verify-otp', userAuth, authController.sendVerifyOTP);
authRoutes.post('/api/auth/verify-email', userAuth, authController.verifyEmail);
authRoutes.post('/api/auth/is-auth', userAuth, authController.isAuthenticated);
authRoutes.post('/api/auth/send-Reset-OTP', authController.sendResetOTP);
authRoutes.post('/api/auth/reset-password', authController.resetPassword);


module.exports = authRoutes;