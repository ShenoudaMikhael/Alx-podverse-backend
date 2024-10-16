const dbClient = require('../utils/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const User = dbClient.models.users;
const Follower = dbClient.models.followers;
const path = require('path')
const fs = require('fs')
class UserController {

    // static async getUserById(req, res) {
    //     try {
    //         const userId = req.params.id;
    //         const user = await User.findOne({ where: { id: userId } });

    //         if (!user) {
    //             return res.status(404).json({ msg: 'User not found' });
    //         }

    //         res.json(user);
    //     } catch (err) {
    //         console.error(err.message);
    //         res.status(500).send('Server error');
    //     }
    // }

    static async getUserProfile(req, res) {
        const userId = req.user.id;
            let user = await User.findOne({ where: { id: userId } });
            res.json(user);
    }

    static async updateUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, username, gender, dob } = req.body;

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

    static async updateProfilePicture(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findOne({ where: { id: userId } });

            // Ensure a file was uploaded
            if (!req.file) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }

            // Check if the user already has a profile picture and delete the old file
            if (user.profilePic) {
                const oldFilePath = path.join(__dirname, '../','../',user.profilePic);
                const newPath = path.join('uploads', req.file.filename);
                if (user.profilePic && user.profilePic !== newPath) {
                    fs.unlinkSync(oldFilePath);  // Delete the old profile picture
                }
            }

            // Save file path in the user profile
            const profilePictureUrl = `uploads/${req.file.filename}`;
            await User.update(
                { profilePic: profilePictureUrl },
                { where: { id: userId } }
            );

            res.json({ msg: 'Profile picture updated successfully', profilePicture: profilePictureUrl });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    static async updatePassword(req, res) {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        try {
            // Find the user by ID
            const user = await User.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Check if the old password is correct
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Old password is incorrect' });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update the password in the database
            user.password = hashedPassword;
            await user.save();

            res.status(200).json({ msg: 'Password updated successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    static async getFollowers(req, res) {

        try {
            const userId = req.user.id;

            const followers = await Follower.count({ where: { followed_creator_id: userId } });
            const followersList = await Follower.findAll({ 
                where: { followed_creator_id: userId },
                include: [
                    {
                        model: User,
                        as: 'follower',
                        attributes: ['id', 'name', 'profilePic'],
                    }
                ]
            });

            return res.status(200).json({
                message: 'Followers retrieved successfully!',
                count: followers,
                followersList
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    static async getFollowingList(req, res) {

        try {
            const userId = req.user.id;
 
            const following = await Follower.count({ where: { follower_id: userId } });

            const followingList = await Follower.findAll({ 
                where: { follower_id: userId },
                include: [
                    {
                        model: User,
                        as: 'followed_creator',
                        attributes: ['id', 'name', 'profilePic'],
                    }
                ]
            });

            return res.status(200).json({
                message: 'Following list retrieved successfully!',
                count: following,
                followingList
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    static async followUser(req, res) {
        try {
            const followerId = req.user.id;
            const followedCreatorId = req.params.id;
    
            // Add new follow relationship
            const newFollow = await Follower.create({
                follower_id: followerId,
                followed_creator_id: followedCreatorId
            });
    
            return res.status(201).json({ message: 'Followed successfully!', follow: newFollow });
        } catch (err) {
            console.error('Error following user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    static async unfollowUser(req, res) {
        try {
            const followerId = req.user.id;
            const followedCreatorId = req.params.id;
    
            const existingFollow = await Follower.findOne({
                where: { follower_id: followerId, followed_creator_id: followedCreatorId }
            });
    
            // Delete the follow relationship
            await existingFollow.destroy();
    
            return res.status(200).json({ message: 'Unfollowed successfully!' });
        } catch (err) {
            console.error('Error unfollowing user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = UserController;