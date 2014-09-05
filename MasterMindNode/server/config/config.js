'use strict';

var env = process.env.NODE_ENV || 'development';

var devenv = {
    development :{
        sessionSecret: 'thepointe',
        sessionMaxAge: 60*10000,

        db: 'mm_db_demo',
        app: {
            name: 'PS MasterMind'
        },
        google: {
            clientID: '141952851027.apps.googleusercontent.com',
            clientSecret: 'Jiy0OMx_vOzHK1mXSIGSoog1',
            callbackURL: '/oauth2callback',
            callbackHost: 'http://localhost:3000',
            scope: ['https://www.googleapis.com/auth/plus.login'] 
        },
        cloudant: {
            user: 'mmoroz76',
            password: 'passw0rd',
            url: 'https://mmoroz76:passw0rd@mmoroz76.cloudant.com'
        }
    }
};

module.exports = devenv[env];