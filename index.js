const express = require('express');
const app = express();
const cors = require('cors');
const body_parser = require('body-parser');
const sequelize = require('./db.config');
const PORT = process.env.PORT || 4000;
const { Snowflake } = require('@theinternetfolks/snowflake');
const Role = require('./models/Role');
const usersRouter = require('./routes/users.routes');
const rolesRouter = require('./routes/roles.routes');
const communitiesRouter = require('./routes/communities.routes');
const membersRouter = require('./routes/members.routes');

app.use(express.json());
app.use(cors());
app.use(body_parser.json());
app.use(
    express.urlencoded(
        { extended: true }
    )
);

sequelize.sync().then(async () => {
    app.listen(PORT, () => {
        console.log(`App listening at http://localhost:${PORT}`);
    });

    const roles = ['Community Admin', 'Community Member'];

    for (const role of roles) {
        const existing_role = await Role.findOne({ where: { name: role } });

        if (!existing_role) {
            const id = Snowflake.generate({ timestamp: Snowflake.Now, shard_id: 4 });
            Role.create({
                id,
                name: role
            });
        }
    }
})

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

app.use(usersRouter);
app.use(rolesRouter);
app.use(communitiesRouter);
app.use(membersRouter);

app.get('/', (req, res) =>
    res.json({ message: 'The Internet Folks : Internship assignment' })
);
