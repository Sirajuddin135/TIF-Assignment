// const sequelize = require('../db.config');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Snowflake } = require('@theinternetfolks/snowflake');

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
        const jwtToken = jwt.sign({ user }, 'secret', { expiresIn: '1h' });
        res.json({
            status: 'true', content: {
                user
            },
            meta: {
                jwt_token: jwtToken
            }
        });
    } catch (error) {
        if (error.name == 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
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
