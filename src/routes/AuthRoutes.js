const authRouter = require('express').Router();
const AuthController = require('../controllers/AuthController');


authRouter.post('/login', AuthController.postLogin);
authRouter.post('/register', AuthController.postRegister);


module.exports = authRouter;