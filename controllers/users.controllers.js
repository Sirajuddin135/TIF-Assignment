const { Snowflake } = require('@theinternetfolks/snowflake');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret_key = 'theInternetFolks';

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
}

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        const { name, email, password } = req.body;

        if (!user) {
            return res.status(400).send('User not found')
        }

        await user.update({ name, email, password });

        res.json(user);
    } catch (error) {
        res.status(500).send('Error updating user')
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (user) {
            await user.destroy();
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(400).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
};
