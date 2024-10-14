const userRouter = require('express').Router();
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const upload = require('../utils/upload');


userRouter.get('/profile', AuthController.authMiddleWare, UserController.getUserProfile);
userRouter.put('/updateProfile', AuthController.authMiddleWare, UserController.updateUserProfile);
// userRouter.post('/profilePicture', AuthController.authMiddleWare, upload.single('profilePicture'), UserController.updateProfilePicture);
userRouter.put('/profilePicture', AuthController.authMiddleWare, upload.single('profilePicture'), UserController.updateProfilePicture);
userRouter.put('/updatePassword', AuthController.authMiddleWare, UserController.updatePassword);
// userRouter.get('/:id', UserController.getUserById);

userRouter.get('/followers', AuthController.authMiddleWare, UserController.getFollowers);
userRouter.get('/following', AuthController.authMiddleWare, UserController.getFollowingList);

userRouter.post('/:id', AuthController.authMiddleWare, UserController.followUser);
module.exports = userRouter;