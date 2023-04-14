const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db.config');
const Community = require('./Community');
const User = require('./User');
const Role = require('./Role');

class Member extends Model { }

Member.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    community: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
    {
        sequelize,
        modelName: 'Member',
        tableName: 'members',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

Member.hasMany(Community, {
    foreignKey: 'id',
    as: 'communities',
});

Member.hasMany(User, {
    foreignKey: 'id',
    as: 'users',
});
Member.hasMany(Role, {
    foreignKey: 'id',
    as: 'roles',
});

Community.belongsTo(Member, {
    foreignKey: 'id',
    as: 'member_community',
});

User.belongsTo(Member, {
    foreignKey: 'id',
    as: 'member_user',
});

Role.belongsTo(Member, {
    foreignKey: 'id',
    as: 'member_role',
});

module.exports = Member;