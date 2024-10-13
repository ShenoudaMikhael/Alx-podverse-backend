const dbClient = require('../utils/db');
const User = dbClient.models.users;
const Category = dbClient.models.categories;
const Podcast = dbClient.models.podcasts;
const Follower = dbClient.models.followers;
const multer = require('multer');
const upload = multer({ dest: 'uploads2/' });

class PodcastController {
    static async createPodcast(req, res) {

        try {
            // console.log("here",req.body.data);
            const { title, description, start_date, cat_id, is_live } = JSON.parse(req.body.data);
            const uploadedFile = req.body;
            // Check if category exists
            const category = await Category.findOne({ where: { id: cat_id } });
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            // Create the podcast
            console.log(req.user.id);
            const newPodcast = await Podcast.create({
                title,
                description,
                start_date,
                is_live: (is_live === true ? is_live : false),
                cat_id,
                //user id from request
                user_id: req.user.id,
            });

            return res.status(201).json({
                message: 'Podcast created successfully!',
                podcast: newPodcast,
            });
        } catch (error) {
            console.error('Error creating podcast:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    static async updatePodcast(req, res) {
        try {
            const podcastId = req.params.id;
            const podcast = await Podcast.findOne({ where: { id: podcastId } });

            if (!podcast) {
                return res.status(404).json({ msg: 'Podcast not found' });
            }

            const { title, description, start_date, is_live, cat_id, socket_current_id } = req.body;

            const fieldsToUpdate = {};
            if (title) fieldsToUpdate.title = title;
            if (description) fieldsToUpdate.description = description;
            if (start_date) fieldsToUpdate.start_date = start_date;
            if (is_live) fieldsToUpdate.is_live = is_live;
            if (cat_id) fieldsToUpdate.cat_id = cat_id;
            if (socket_current_id) fieldsToUpdate.socket_current_id = socket_current_id;

            if (Object.keys(fieldsToUpdate).length === 0) {
                return res.status(400).json({ msg: 'No fields to update' });
            }

            const updatedPodcast = await Podcast.update(
                fieldsToUpdate,
                { where: { id: podcastId } }
            );

            res.json({ msg: 'Podcast updated successfully', podcast: updatedPodcast });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    static async getUserPodcasts(req, res) {
        try {
            const userId = req.user.id;
            const podcasts = await Podcast.findAll({ where: { user_id: userId } });

            if (!podcasts) {
                return res.status(404).json({ message: 'No podcasts found' });
            }

            return res.status(200).json({
                message: 'Podcasts retrieved successfully!',
                podcasts
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    static async getFollowingPodcasts(req, res) {
        const userId = req.user.id;
        const following = await Follower.findAll({ where: { follower_id: userId }, attributes: ['followed_creator_id'] });

        // Extract the list of followed creator IDs
        const followedCreatorIds = following.map(f => f.followed_creator_id);

        // 2. Fetch podcasts where the creator (user_id) is in the list of followed creators
        const followingPodcasts = await Podcast.findAll({
            where: { user_id: followedCreatorIds } // user_id here refers to the podcast creator
        });

        // 3. Respond with the list of podcasts
        return res.status(200).json({
            message: 'Following podcasts retrieved successfully!',
            podcasts: followingPodcasts
        });
    }

    static async getPodcast(req, res) {
        try {
            const { uuid } = req.params;
            const { socket_current_id } = req.body;
            console.log(uuid);

            const podcast = await Podcast.findOne({
                where: { uuid }, include: [
                    { model: User, as: 'user', attributes: ['username', 'name'] },
                    { model: Category, as: 'cat' },
                ]
            });
            if (podcast.user_id === req.user.id) { podcast.current_socket_id = socket_current_id; podcast.save() }
            const me = await User.findOne({
                where: { id: req.user.id }, attributes: ['name', 'username'],
            });

            if (!podcast) {
                return res.status(404).send({ msg: "Not Found" });
            }
            console.log({
                podcast, "user_id": req.user.id,
                me
            });
            return res.status(200).json({
                podcast, "user_id": req.user.id,
                me
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

};

module.exports = PodcastController;
