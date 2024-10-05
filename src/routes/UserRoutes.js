const userRouter = require('express').Router();
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');


userRouter.get('/profile', AuthController.authMiddleWare, UserController.getUserProfile);
userRouter.put('/updateProfile', AuthController.authMiddleWare, UserController.updateUserProfile);
userRouter.get('/:id', UserController.getUserById);


module.exports = userRouter;