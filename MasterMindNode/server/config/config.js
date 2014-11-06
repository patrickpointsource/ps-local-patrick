'use strict';

var env = process.env.NODE_ENV || 'development';

var devenv = {
	development: {
		sessionSecret: 'thepointe',
		sessionMaxAge: 60 * 10000,

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
			stage: {
				account: 'psprod1',
			    user: 'istraustandivillownedome',
	            password: 'uuVXxmARXdpLYkU7X1T0yS7D',
	            url: 'https://istraustandivillownedome:uuVXxmARXdpLYkU7X1T0yS7D@psprod1.cloudant.com/',
	            db: 'mm_db_demo'
			},
			prod: {
				account: 'psprod1',
			    user: 'beentorestoldiseandeamed',
	            password: 'mXuflwvgb3G003jjKnraqasb',
	            url: 'https://beentorestoldiseandeamed:mXuflwvgb3G003jjKnraqasb@psprod1.cloudant.com/',
	            db: 'mm_db_demo'
			}, 
			demo: {
				account: 'psdev1',
			    user: 'tathendersheaderefortati',
	            password: 'e7wRT4nm0IgHGeWu07benG36',
	            url: 'https://tathendersheaderefortati:e7wRT4nm0IgHGeWu07benG36@psdev1.cloudant.com/',
	            db: 'mm_db_demo'
			},
			dev: {
				account: 'psdev1',
			    user: 'tathendersheaderefortati',
	            password: 'e7wRT4nm0IgHGeWu07benG36',
	            url: 'https://tathendersheaderefortati:e7wRT4nm0IgHGeWu07benG36@psdev1.cloudant.com/',
	            db: 'mm_db_demo'
			}
		}
	}
};

module.exports = devenv[ env ]; 