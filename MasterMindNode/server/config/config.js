'use strict';

var env = process.env.NODE_ENV || 'development';

var devenv = {
	development: {
		sessionSecret: 'thepointe',
		sessionMaxAge: 60 * 10000,

		db: 'mm_db_demo',
		app: {
			name: 'PS MasterMind'
		},
		google: {
			clientID: '141952851027-natg34uiqel1uh66im6k7r1idec5u8dh.apps.googleusercontent.com',
			clientSecret: 'xx9Om8aLgwzlmeBmSGoOqwdh',
			callbackURL: '/oauth2callback',
			callbackHost: 'http://localhost:3000',
			scope: [ 'https://www.googleapis.com/auth/plus.login' ]
		},
		/*
		cloudant: {
			user: 'tathendersheaderefortati',
            password: 'e7wRT4nm0IgHGeWu07benG36',
            url: 'https://tathendersheaderefortati:e7wRT4nm0IgHGeWu07benG36@psdev1.cloudant.com/'
		}*/
		cloudant: {
		    user: 'tathendersheaderefortati',
            password: 'e7wRT4nm0IgHGeWu07benG36',
            url: 'https://tathendersheaderefortati:e7wRT4nm0IgHGeWu07benG36@psdev1.cloudant.com/'
		}
	}
};

module.exports = devenv[ env ]; 