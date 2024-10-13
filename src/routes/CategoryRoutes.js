const categoryRouter = require('express').Router();
const CategoryController = require('../controllers/CategoryController');

categoryRouter.post('/create', CategoryController.createCategory);
categoryRouter.get('/get', CategoryController.getCategory);

module.exports = categoryRouter;
