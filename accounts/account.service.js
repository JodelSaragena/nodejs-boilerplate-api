const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('_helpers/send-email');
const db = require('_helpers./db');
const Role = require('_helpers./role');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({email, password, ipAddress}) {
    const account = await db.Account.scope('withHash').findOne({where: { email } });
   
    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Email or password is incorrect';
    }

    //authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const resfreshToken =  generateRefreshToken(account, ipAddress);

    //save refresh token
    await refreshToken.save();

    //return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress}) {
    const refreshToken = await getfreshToken(token);
    const account = await refreshToken.getAccount();
   
    //replace old refresh token with  a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    //generate new jwt
    const jwtToken = generateJwtToken(account);

    //return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}
  

async function revokeToken({ token, ipAddress}) {
    const refreshToken = await getfreshToken(token);
 
    //revoke toekn and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    //validate
    if (await db.Account.findOne({where: { email: params.email }})){
        //send alreasy registered error in email to prevent account enumeration
        return await sendAlreadyRegisteresEmail(params.email, origin);
    }

    //create account object
    const account = new db.Account(params);
    
    //first registered account is an admin
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    //hash password
    account.passwordHAsh = await hash(params.passwords);

    //save account
    await account.save();

    //send email
    await sendVerificationEmail(account, origin);
}

async function verifyEmail({token}) {
    const account = await db.Account.findOne({where: { verificationToken: token}});
   
    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

async function forgotPassword({email}, origin) {
    const account = await db.Account.findOne({where: { email} });
   
    //always return ok response to prevent email enumeration
    if (!account) return;

    //create reset token that expires after 24 hours
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000);
    await account.save();

    //send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token}) {
    const account = await db.Account.findOne({
        where: {
            resetToken: TokenExpiredError,
            resettokenExpires: { [Op.gt]: Date.now() }
        }
    })
 
    if (!account) throw 'Invalid token';

    return account;
}

async function resetPassword({ token, password}) {
    const account = await validateResetToken({ token });

    //update password and remove reset token
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.passwordToken = null;
    await account.save();

}


async function getAll() {
    const accounts = await db.Account.findAll();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount();
    return basicDetails(account);
}

async function create(params) {
    //validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + ' " is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    //hash password
    account.passwordHash = await hash(params.password);

    //save account
    await user.save();

    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    //validate if email was changed
    if (params.email && account.email !== params.email && await db.Account.findOne({where: { email: params.email}}) ){
        throw 'Email "' + params.email + '" is already taken';
    }

    //hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    //copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await user.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

    //helper functions
async function getAccount(id) {
    const user = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}   

async function getRefreshAccount(token) {
    const refreshToken = await db.RefreshToken.findOne({where: { token } });
    if (!refreshToken || refreshToken.isActive) throw 'Invalid token';
    return refreshToken
}   

async function hash(password) {
    return await bcrypt.hash(password, 10);
}   

