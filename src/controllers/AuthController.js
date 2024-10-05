const bcrypt = require('bcryptjs')
const dbClient = require('../utils/db');
const jwt = require('jsonwebtoken');
const getenv = require('getenv');
const User = dbClient.models.users;

class AuthController {
    static async postLogin(req, res) {
        const { email, password } = req.body;

        try {
            // Check if the user exists
            let user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials0' });
            }
            console.log(user.password)
            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Sign a token
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                getenv('JWT'), // Store this secret safely
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
    static async postRegister(req, res) {
        const { name, email, password, gender, date_of_birth } = req.body;
        // Check if the user exists
        console.log(email);
        try {
            let user = await User.findOne({ where: { email } });
            if (user) {
                console.log(user)
                return res.status(400).json({ msg: 'User already exists' });
            }
            // Create a new user instance
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = await User.create({
                name, email, password: hashedPassword, gender, date_of_birth
            });
            res.status(201).json({ msg: 'User Created Successfuly' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    static authMiddleWare(req, res, next) {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, getenv('JWT'));
            req.user = decoded.user;
            next();
        } catch (err) {
            res.status(401).json({ msg: 'Token is not valid' });
        }
    }
}

module.exports = AuthController;