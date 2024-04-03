const jwt = require('express-jwt');
const { secret } = require('cponfig.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []){
    //roles param can be single role string (e.g Role.User or 'User')
    //or an array of roles (e.g [Role.Admin, Role.User] or ['Admin',' User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return[
        //authenticate JWt token and attach user to request objext {req.user}
        jwt({ secret, algorithms: ['HS256']}),

        // authorize based on user role
        async (req, res, next) => {
            const account = await db.Account.findByPk(req.user.id);

            if (!account ||(roles.length && !roles.includes(account.role))){
                //account no longer exist or role not authorized
                return res.status(401).json({ messages: 'Unauthorized'});
            }

            //authentication and authorization successful
            req.user.role = account.role;
            const refreshTokens = await account.getRefreshToken();
            req.user.ownsToken = token => !!refreshTokens.find(x => x,token === token);
            next();
        }
    ];
}