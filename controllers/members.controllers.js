const { Snowflake } = require('@theinternetfolks/snowflake');
const Community = require('../models/Community');
const User = require('../models/User');
const Role = require('../models/Role');
const Member = require('../models/Member');
const secret_key = 'theInternetFolks';
const jwt = require('jsonwebtoken');

exports.addMember = async (req, res) => {
    try {
        const auth_header = req.headers.authorization;

        if (!auth_header) {
            res.status(401).send({ message: 'Authorization Bearer token missing.' });
        }

        const jwt_token = auth_header.split(' ')[1];
        const decoded_token = jwt.verify(jwt_token, secret_key);
        const admin = decoded_token.user;
        const { community, user, role } = req.body;
        const existing_member = await Member.findOne({ where: { community, user, role } });

        if (existing_member) {
            return res.status(409).json({ message: `Member already added to the community` });
        }

        const existing_community = await Community.findOne({ where: { id: community } });
        if (!existing_community) {
            return res.status(401).json({ message: `Community not found with id ${community}` });
        } else if (existing_community.owner !== admin.id) {
            return res.status(401).json({ message: `NOT_ALLOWED_ACCESS` });
        }

        const existing_user = await User.findOne({ where: { id: user } });
        if (!existing_user) {
            return res.status(400).json({ message: `User with not found id ${user}` });
        }

        const existing_role = await Role.findOne({ where: { id: role } });
        if (!existing_role) {
            return res.status(400).json({ message: `Role with not found id ${role}` });
        }

        const id = Snowflake.generate({ timestamp: Snowflake.Now, shard_id: 4 });
        const member = await Member.create({
            id,
            community,
            user,
            role
        });

        res.json({
            status: true,
            content: {
                data: {
                    id: member.id,
                    community: member.community,
                    user: member.user,
                    role: member.role,
                    created_at: member.created_at
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const auth_header = req.headers.authorization;
        const id = req.params.id;

        if (!auth_header) {
            res.status(401).send({ message: 'Authorization Bearer token missing.' });
        }

        const jwt_token = auth_header.split(' ')[1];
        const decoded_token = jwt.verify(jwt_token, secret_key);
        const { user } = decoded_token;
        const user_communities = await Community.findAll({ where: { owner: user.id } });

        const existing_user = await User.findOne({ where: { id: id } });

        if (!existing_user) {
            return res.status(401).send({ message: `Member not found with id: ${id}` });
        }

        user_communities.forEach(async (community) => {
            const member = await Member.findOne({ where: { community: community.id, user: id } });
            if (member) {
                await member.destroy();
                return res.json({
                    status: true
                });
            }
        });

        res.json({
            status: false,
            message: 'Member not found'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
