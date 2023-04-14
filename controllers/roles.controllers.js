const { Snowflake } = require('@theinternetfolks/snowflake');
const Role = require('../models/Role');

exports.create = async (req, res) => {
    const { name } = req.body;
    const existing_role = await Role.findOne({ where: { name } });

    if (existing_role) {
        return res.status(400).json({ message: `${name} role already created` });
    }

    try {
        const id = Snowflake.generate({ timestamp: Snowflake.Now, shard_id: 4 });
        const role = await Role.create({
            id,
            name
        });

        res.json({
            status: true,
            content: {
                data: {
                    id: role.id,
                    name: role.name,
                    created_at: role.created_at,
                    updated_at: role.updated_at
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
        const [total, roles] = await Promise.all([
            Role.count(),
            Role.findAll({
                offset,
                limit
            })
        ]);

        const rolesWithScopes = roles.map(role => {
            const scopes = role.name.includes('Admin') ? ['member-get', 'member-add', 'member-remove'] : ['member-get'];
            return { ...role.dataValues, scopes };
        })

        const pages = Math.ceil(total / limit);

        res.json({
            status: true,
            content: {
                meta: {
                    total,
                    pages,
                    page
                },
                data: rolesWithScopes
            }
        })
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};