const dbClient = require('../utils/db');
const User = dbClient.models.users;
const Category = dbClient.models.categories;
const Podcast = dbClient.models.podcasts;

class PodcastController {
    static async createPodcast(req, res) {

    try {
        const { title, description, start_date, cat_id, user_id } = req.body;

        // Check if category exists
        const category = await Category.findByPk(cat_id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if user exists (if applicable)
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: 'Please sign in first' });
        }

        // Create the podcast
        const newPodcast = await Podcast.create({
            title,
            description,
            start_date,
            is_live: false,
            cat_id,
            user_id,
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

    
};

module.exports = PodcastController;
