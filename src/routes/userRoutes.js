const express = require('express');
const userAuth = require('../Middleware/userAuth');
const userRouter = express.Router();
const userController = require('../controllers/userController');

userRouter.get('/api/data-users',userAuth, userController.getUserData);

module.exports = userRouter;
