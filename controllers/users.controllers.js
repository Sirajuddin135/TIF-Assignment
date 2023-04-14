const { Snowflake } = require('@theinternetfolks/snowflake');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const secret_key = 'theInternetFolks';
const jwt = require('jsonwebtoken');

exports.signUp = async (req, res) => {
    const { name, email, password } = req.body;
    const existing_user = await User.findOne({ where: { email } });

    if (existing_user) {
        return res.status(400).json({ message: `User already exists with email: ${email}` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const id = Snowflake.generate({ timestamp: Snowflake.Now, shard_id: 4 });
        const user = await User.create({
            id,
            name,
            email,
            password: hashedPassword,
        });
        const jwt_token = jwt.sign({ user }, secret_key, { expiresIn: '1h' });
        res.json({
            status: 'true', content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at
                }
            },
            meta: {
                access_token: jwt_token
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        const jwt_token = jwt.sign({ user }, secret_key, { expiresIn: '1h' });

        res.json({
            status: 'true', content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at
                }
            },
            meta: {
                access_token: jwt_token
            }
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

exports.getMe = async (req, res) => {
    try {
        const auth_header = req.headers.authorization;

        if (!auth_header) {
            res.status(401).send({ message: 'Authorization Bearer token missing.' });
        }

        const jwt_token = auth_header.split(' ')[1];
        const decoded_token = jwt.verify(jwt_token, secret_key);
        const { user } = decoded_token;
        const existing_user = await User.findOne({ where: { email: user.email } });

        if (!existing_user) {
            return res.status(500).json({ status: false, message: 'User not found' });
        }

        res.json({
            status: 'true', content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at
                }
            }
        })

    } catch (error) {
        res.status(500).json({ status: false, message: 'Invalid token' });
    }
};