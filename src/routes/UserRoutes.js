const userRouter = require('express').Router();
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const upload = require('../utils/upload');


userRouter.get('/profile', AuthController.authMiddleWare, UserController.getUserProfile);
userRouter.put('/updateProfile', AuthController.authMiddleWare, UserController.updateUserProfile);
// userRouter.post('/profilePicture', AuthController.authMiddleWare, upload.single('profilePicture'), UserController.updateProfilePicture);
userRouter.put('/profilePicture', AuthController.authMiddleWare, upload.single('profilePicture'), UserController.updateProfilePicture);
userRouter.put('/updatePassword', AuthController.authMiddleWare, UserController.updatePassword);
userRouter.get('/:id', UserController.getUserById);


module.exports = userRouter;