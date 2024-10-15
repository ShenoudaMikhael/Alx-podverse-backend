const dbClient = require('../utils/db');
const User = dbClient.models.users;
const Category = dbClient.models.categories;
const Podcast = dbClient.models.podcasts;
const Follower = dbClient.models.followers;
const uploadPodcast = require('../utils/uploadPodcast');
const fs = require('fs');
const path = require('path');


class PodcastController {
    static async createPodcast(req, res) {

        try {
            // console.log("here",req.body.data);
            const { title, description, start_date, cat_id, is_live } = JSON.parse(req.body.data);

            // Handle uploading podcast photo while creating
            let podcastPhoto = null;
            if (req.file) {
                podcastPhoto = req.file.path; // Save the uploaded file path
            }

            // Handle podcastStartDate when podcast is live
            let podcastStartDate = null;
            if (is_live === true || is_live === "true" || is_live === 1) {
                podcastStartDate = new Date();
            } else {
                if (!start_date) {
                    return res.status(400).json({
                        message: 'Start date is required for non-live podcasts',
                    });
                }
                podcastStartDate = new Date(start_date);
            }

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
                start_date: podcastStartDate,
                is_live: is_live === true || is_live === "true" || is_live === 1,
                // it makes is_live false even if it's true (datatypes)!
                // is_live: (is_live === true ? is_live : false),
                podcastPic: podcastPhoto,
                cat_id,
                //user id from request
                user_id: req.user.id,
            });

            if (req.file) {
                const oldPath = req.file.path;
                const extension = path.extname(req.file.originalname);
                const newFileName = `podcast_${newPodcast.id}${extension}`;
                const newPath = path.join('uploads_podcast', newFileName);

                // Rename the file on the filesystem
                fs.renameSync(oldPath, newPath);

                // Save the new file path in the database
                podcastPhoto = newPath;
                await newPodcast.update({ podcastPic: podcastPhoto });
            }

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
            const fieldsToUpdate = {};
            if (req.body.data) {
                const { title, description, start_date, is_live, cat_id, socket_current_id } = JSON.parse(req.body.data);

                if (title) fieldsToUpdate.title = title;
                if (description) fieldsToUpdate.description = description;
                if (start_date) fieldsToUpdate.start_date = start_date;
                if (is_live) fieldsToUpdate.is_live = is_live;
                if (cat_id) fieldsToUpdate.cat_id = cat_id;
                if (socket_current_id) fieldsToUpdate.current_socket_id = socket_current_id;
            }

            let podcastPhoto = null;
            if (req.file) {
                const oldPath = req.file.path;
                const extension = path.extname(req.file.originalname);
                const newFileName = `podcast_${podcastId}${extension}`;
                const newPath = path.join('uploads_podcast', newFileName);
            
                try {
                    // Rename the file on the filesystem
                    fs.renameSync(oldPath, newPath);
                    console.log('File renamed successfully to:', newPath);
            
                    // Save the new file path in the fields to update
                    podcastPhoto = newPath;
                    fieldsToUpdate.podcastPic = podcastPhoto;
            
                    // Optionally, delete the old podcast photo only if it's different from the new one
                    if (podcast.podcastPic && podcast.podcastPic !== newPath) {
                        try {
                            fs.unlinkSync(podcast.podcastPic);
                            console.log('Old podcast photo deleted:', podcast.podcastPic);
                        } catch (err) {
                            console.error('Error deleting old podcast photo:', err);
                        }
                    }
                } catch (err) {
                    console.error('Error renaming file:', err);
                }
            }

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
            if (!podcast) {
                return res.status(404).send({ 'msg': 'podcast not found' })
            }
            console.log("here")
            if (podcast.user_id === req.user.id) { podcast.current_socket_id = socket_current_id; podcast.save() }
            console.log("here")

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

    static async deletePodcast(req, res) {
        try {
            const podcastId = req.params.id;
            const userId = req.user.id;
    
            const podcast = await Podcast.findOne({
                where: { id: podcastId, user_id: userId } // Ensure the user owns the podcast
            });
    
            if (!podcast) {
                return res.status(404).json({ message: 'Podcast not found or unauthorized' });
            }
    
            // If podcast has an associated image, delete it from the file system
            if (podcast.podcastPic) {
                const podcastPicPath = path.join(__dirname, '..', podcast.podcastPic);
                try {
                    if (fs.existsSync(podcastPicPath)) {
                        fs.unlinkSync(podcastPicPath);
                        console.log('Podcast photo deleted:', podcastPicPath);
                    }
                } catch (err) {
                    console.error('Error deleting podcast photo:', err);
                }
            }
    
            await podcast.destroy();
    
            return res.status(200).json({
                message: 'Podcast deleted successfully!'
            });
        } catch (err) {
            console.error('Error deleting podcast:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    static async getAllPodcasts(req, res) {
        try {
            const podcasts = await Podcast.findAll();
            const userId = podcasts.map(f => f.user_id);

            const userData = await Podcast.findAll({
                where: {user_id: userId},
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'profilePic'],
                    }
                ]
            });

            
            // const userData = await User.findAll({
            //     where: { id: userId }, attributes: ['id', 'name', 'profilePic']
            // });
    
            return res.status(200).json({
                message: 'Podcasts retrieved successfully!',
                userData
            });
        } catch (err) {
            console.error('Error retrieving podcasts:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    static async getLivePodcasts(req, res) {
        try {
            const podcasts = await Podcast.findAll({
                where: {is_live: true},
                limit: 20,
                order: [['start_date', 'DESC']]
            });
    
            return res.status(200).json({
                message: 'The 20 most recent live podcasts retrieved successfully!',
                podcasts
            });
        } catch (err) {
            console.error('Error retrieving podcasts:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

};

module.exports = PodcastController;
