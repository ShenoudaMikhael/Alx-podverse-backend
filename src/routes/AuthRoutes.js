const authRouter = require('express').Router();
const AuthController = require('../controllers/AuthController');


authRouter.post('/login', AuthController.postLogin);
authRouter.post('/register', AuthController.postRegister);
authRouter.post('/isLoggedIn', AuthController.authMiddleWare, AuthController.isLoggedIn);


module.exports = authRouter;