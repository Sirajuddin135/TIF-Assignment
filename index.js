const express = require('express');
const app = express();
const cors = require('cors');
const body_parser = require('body-parser');
const sequelize = require('./db.config');
const { Snowflake } = require('@theinternetfolks/snowflake');
const PORT = process.env.PORT || 4000;
const usersRouter = require('./routes/users.routes');

app.use(express.json());
app.use(cors());
app.use(body_parser.json());
app.use(
    express.urlencoded(
        { extended: true }
    )
);

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`App listening at http://localhost:${PORT}`);
    });
})

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

app.use(usersRouter);

app.get('/', (req, res) =>
    res.json({ message: 'The Internet Folks : Internship assignment' })
);
