const podcastRouter = require('express').Router();
const PodcastController = require('../controllers/PodcastController');

podcastRouter.post('/create', PodcastController.createPodcast);

module.exports = podcastRouter;
