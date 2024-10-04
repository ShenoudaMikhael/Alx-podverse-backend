const dbClient = require('../utils/db')
const User = dbClient.models.user;


class AuthController {
    static async postLogin(res, req) {
        const { username, password } = req.body;

        try {
            // Check if the user exists
            let user = await User.findOne({ username });
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
    static async postRegister(res, req) {

    }
}


module.exports = AuthController;