const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db.config');
const Community = require('./Community');

class User extends Model { }

User.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(64),
        defaultValue: null,
        validate: {
            len: [2, 64]
        }
    },
    email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(64),
        allowNull: false,
        validate: {
            len: [6, 64],
        }
    }
},
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

User.hasMany(Community, {
    foreignKey: 'owner',
    as: 'communities',
});

Community.belongsTo(User, {
    foreignKey: 'owner',
    as: 'owner_user',
});


module.exports = User;