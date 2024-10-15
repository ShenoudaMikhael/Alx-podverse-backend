const podcastRouter = require('express').Router();
const PodcastController = require('../controllers/PodcastController');
const AuthController = require('../controllers/AuthController');
const uploadPodcast = require('../utils/uploadPodcast');


podcastRouter.post('/create',AuthController.authMiddleWare, uploadPodcast.single('file'),  PodcastController.createPodcast);
podcastRouter.get('/userPodcast', AuthController.authMiddleWare, PodcastController.getUserPodcasts);
podcastRouter.get('/followingPodcast', AuthController.authMiddleWare, PodcastController.getFollowingPodcasts);
podcastRouter.put('/:id', AuthController.authMiddleWare, uploadPodcast.single('file'), PodcastController.updatePodcast);
podcastRouter.delete('/:id', AuthController.authMiddleWare, PodcastController.deletePodcast);
podcastRouter.post('/:uuid', AuthController.authMiddleWare, PodcastController.getPodcast);
podcastRouter.get('/podcasts', PodcastController.getAllPodcasts);
podcastRouter.get('/livePodcasts', PodcastController.getLivePodcasts);

module.exports = podcastRouter;
