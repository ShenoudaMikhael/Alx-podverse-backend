const podcastRouter = require('express').Router();
const PodcastController = require('../controllers/PodcastController');
const AuthController = require('../controllers/AuthController');

podcastRouter.post('/create', AuthController.authMiddleWare, PodcastController.createPodcast);
podcastRouter.get('/userPodcast', AuthController.authMiddleWare, PodcastController.getUserPodcasts);
podcastRouter.get('/followingPodcast', AuthController.authMiddleWare, PodcastController.getFollowingPodcasts);
podcastRouter.put('/:id', AuthController.authMiddleWare, PodcastController.updatePodcast);

module.exports = podcastRouter;
