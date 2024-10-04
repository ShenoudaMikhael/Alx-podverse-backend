const authRouter = require('express').Router();
const AuthController = require('../controllers/AuthController');


authRouter.post('/login', AuthController.postLogin);


module.exports = authRouter;