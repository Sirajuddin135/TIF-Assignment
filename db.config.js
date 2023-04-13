const { Sequelize } = require('sequelize');
require('dotenv').config();

const { host, user, password, database } = process.env;

const sequelize = new Sequelize(database, user, password, {
    host: host,
    dialect: 'mysql',
    logging: false, // Disable logging of queries for this model
});

module.exports = sequelize;