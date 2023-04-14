const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db.config');

class Community extends Model { }

Community.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [2,]
        }
    },
    slug: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
    },
    owner: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
    {
        sequelize,
        modelName: 'Community',
        tableName: 'communities',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = Community;