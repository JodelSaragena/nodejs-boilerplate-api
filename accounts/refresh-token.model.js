const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        token: {type: DataTypes.STRING },
        expires: {type: DataTypes.DATE},
        created: { type: DataTypes.Date, allowNull: false, defaultValue:DataTypes.NOW},
        createdByIp: {type: DataTypes.STRING },
        revoked: {type: DataTypes.DATE},
        replacedByIp: {type: DataTypes.STRING },
        replacedByToken: {type: DataTypes.STRING },
        isExpired: {
            type: DataTypes.VIRTUAL,
            get() { return Date.now() >= this.expires; } 
        },
        isActive: {
            type: DataTypes.VIRTUAL,
            get() { return !this.revoked && !this.isExpired; } 
        }
    };

    const option = {
        //disable default timestamp fields (createdSAt and updateAt)
        timestamps: false
    };

        return sequelize.define('refreshToken', attributes, options);
}