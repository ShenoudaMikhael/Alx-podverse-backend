const dbClient = require('../utils/db');
const jwt = require('jsonwebtoken');
const getenv = require('getenv');
const User = dbClient.models.users;

class UserController {

    static async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findOne({ where: { id: userId } });

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    static async getUserProfile(req, res) {
        const userId = req.user.id;
            let user = await User.findOne({ where: { id: userId } });
            res.json(user);
    }
}

module.exports = UserController;