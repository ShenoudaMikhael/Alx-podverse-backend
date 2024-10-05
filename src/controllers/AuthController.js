const dbClient = require('../utils/db')
const User = dbClient.models.users;


class AuthController {
    static async postLogin(req, res) {
        const { email, password } = req.body;

        try {
            // Check if the user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

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
                'your_jwt_secret', // Store this secret safely
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
        const { email } = req.body;
        // Check if the user exists
        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }
            // Create a new user instance
            user = new User({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    gender: user.gender,
                    date_of_birth: user.date_of_birth,
                    profile_pic: user.profile_pic
                }
            });
            // Save the user
            await user.save();
            res.status(201).json({msg: 'User Created Successfuly'});
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
}

module.exports = AuthController;