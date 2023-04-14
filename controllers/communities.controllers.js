const { Snowflake } = require('@theinternetfolks/snowflake');
const Community = require('../models/Community');
const User = require('../models/User');
const Member = require('../models/Member');
const Role = require('../models/Role');
const secret_key = 'theInternetFolks';
const jwt = require('jsonwebtoken');

exports.create = async (req, res) => {
    const { name } = req.body;
    const existing_community = await Community.findOne({ where: { name } });

    if (existing_community) {
        return res.status(400).json({ message: `Community with name ${name} already created` });
    }

    const slug = name.toLowerCase().replace(' ', '-');
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

    try {
        const id = Snowflake.generate({ timestamp: Snowflake.Now, shard_id: 4 });
        const community = await Community.create({
            id,
            name,
            slug,
            owner: user.id
        });

        res.json({
            status: true,
            content: {
                data: {
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.owner,
                    created_at: community.created_at,
                    updated_at: community.updated_at
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const page = 1, limit = 10, offset = 0;
        const [total, communities] = await Promise.all([
            Community.count(),
            Community.findAll({
                offset,
                limit
            })
        ]);

        const communitiesWithOwners = await Promise.all(communities.map(async (community) => {
            const user = await User.findByPk(community.owner);
            community.owner = {
                id: user.id,
                name: user.name
            }

            return community;
        }))

        const pages = Math.ceil(total / limit);

        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages,
                    page
                },
                data: communitiesWithOwners
            }
        })
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.getAllMembers = async (req, res) => {
    try {
        const slug = req.params.id;
        const page = 1, limit = 10, offset = 0;
        const community = await Community.findOne({ where: { slug: slug } });

        if (!community) {
            return res.status(500).json({ status: false, message: 'Community not found' });
        }

        const [total, members] = await Promise.all([
            Member.count({ where: { community: community.id } }),
            Member.findAll({ where: { community: community.id } }, offset, limit)
        ]);

        const pages = Math.ceil(total / limit);
        const membersWithDetails = await Promise.all(members.map(async (member) => {
            const user = await User.findOne({ where: { id: member.user } });
            const role = await Role.findOne({ where: { id: member.role } });
            const mem = {
                id: member.id,
                community: member.community,
                user: {
                    id: user.id,
                    name: user.name
                },
                role: {
                    id: role.id,
                    name: role.name
                },
                created_at: member.created_at
            };

            return mem;
        }));

        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages,
                    page
                },
                data: membersWithDetails
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
}

exports.getMyOwnedCommunity = async (req, res) => {
    const auth_header = req.headers.authorization;

    if (!auth_header) {
        res.status(401).send({ message: 'Authorization Bearer token missing.' });
    }

    const page = 1, limit = 10, offset = 0;
    const jwt_token = auth_header.split(' ')[1];
    const decoded_token = jwt.verify(jwt_token, secret_key);
    const { user } = decoded_token;
    const existing_user = await User.findOne({ where: { email: user.email } });

    if (!existing_user) {
        return res.status(500).json({ status: false, message: 'User not found' });
    }

    try {
        const [total, myOwnedCommunities] = await Promise.all([
            Community.count({ where: { owner: user.id } }),
            Community.findAll({ where: { owner: user.id } }, offset, limit)
        ]);

        const pages = Math.ceil(total / limit);

        const communities = myOwnedCommunities.map((community) => ({
            id: community.id,
            name: community.name,
            slug: community.slug,
            owner: community.owner,
            created_at: community.created_at,
            updated_at: community.updated_at
        }));

        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages,
                    page
                },
                data: communities
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
}

exports.getMyJoinedCommunity = async (req, res) => {
    const auth_header = req.headers.authorization;

    if (!auth_header) {
        res.status(401).send({ message: 'Authorization Bearer token missing.' });
    }

    const page = 1, limit = 10, offset = 0;
    const jwt_token = auth_header.split(' ')[1];
    const decoded_token = jwt.verify(jwt_token, secret_key);
    const { user } = decoded_token;
    const existing_user = await User.findOne({ where: { email: user.email } });

    if (!existing_user) {
        return res.status(500).json({ status: false, message: 'User not found' });
    }

    try {
        const [total, myJoinedCommunities] = await Promise.all([
            Member.count({ where: { user: user.id } }),
            Member.findAll({ where: { user: user.id } }, offset, limit)
        ]);

        const pages = Math.ceil(total / limit);

        const communities = await Promise.all(myJoinedCommunities.map(async (mem) => {
            const com = await Community.findOne({ where: { id: mem.community } });
            const user = await User.findOne({ where: { id: com.owner } });
            com.owner = {
                id: user.id,
                name: user.name
            }

            return com;
        }));

        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages,
                    page
                },
                data: communities
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
}