const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db.config');

class Role extends Model { }

Role.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2]
        }
    }
},
    {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = Role;