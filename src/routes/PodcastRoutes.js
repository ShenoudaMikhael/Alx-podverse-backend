const podcastRouter = require('express').Router();
const PodcastController = require('../controllers/PodcastController');
const AuthController = require('../controllers/AuthController');

podcastRouter.post('/create', AuthController.authMiddleWare, PodcastController.createPodcast);
podcastRouter.put('/:id', AuthController.authMiddleWare, PodcastController.updatePodcast);

module.exports = podcastRouter;
