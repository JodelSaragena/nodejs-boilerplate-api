const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        email: { type: DataTypes.STRING, allowNull: false },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        acceptTerms: {type: Datatypes.BOOLEAN },
        role: {type: DataTypes.STRING, allowNull: false},
        verificationToken: { type: DataTypes.STRING},
        verified: { type: DataTypes.DATE },
        resetToken: {type: DataTypes.STRING },
        resetTokenExpires: {type: DataTypes.DATE },
        passwordReset: { type: DataTypes.Date },
        created: { type: DataTypes.Date, allowNull: false, defaultValue:DataTypes.NOW},
        updated: { type: DataTypes.DATE},
        isVerified:{
            type: DataTypes.VIRTUAL,
            get(){ return !!(this.verified || this.passwordReset); }
        }
    };

    const options = {
        //disable 
        timestamps: false,
        defaultScope: {
            attributes: { exclude: ['passwordHash'] }
        },
        scopes: {
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('account', attributes, options);
}