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

    static async updateUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, username, email, gender, dob } = req.body;

            const fieldsToUpdate = {};
            if (name) fieldsToUpdate.name = name;
            if (username) fieldsToUpdate.username = username;
            if (gender) fieldsToUpdate.gender = gender;
            if (dob) fieldsToUpdate.dob = dob;

            if (username) {
                let usernameCheck = await User.findOne({ where: { username } });
                if (usernameCheck && usernameCheck.id !== userId) {
                    return res.status(400).json({ msg: 'Username is already taken' });
                }
            }

            if (Object.keys(fieldsToUpdate).length === 0) {
                return res.status(400).json({ msg: 'No fields to update' });
            }

            const updatedUser = await User.update(
                fieldsToUpdate,
                { where: { id: userId }, returning: true, plain: true }
            );

            res.json({ msg: 'User profile updated successfully', user: updatedUser[1] });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
}

module.exports = UserController;