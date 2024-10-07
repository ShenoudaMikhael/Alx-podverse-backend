const categoryRouter = require('express').Router();
const CategoryController = require('../controllers/CategoryController');

categoryRouter.post('/create', CategoryController.createCategory);

module.exports = categoryRouter;
