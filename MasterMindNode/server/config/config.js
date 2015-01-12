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
			// list available client IDs to validate "audience" when validating token
			clientIDList: [ // Client IDs for web application
			               '141952851027-natg34uiqel1uh66im6k7r1idec5u8dh.apps.googleusercontent.com', 
			               '141952851027.apps.googleusercontent.com',
			               // Service account client id
			               '141952851027-1u88oc96rik8l6islr44ha65o984tn3q.apps.googleusercontent.com',
			               // Client ID for iOS application
			               '141952851027-fihv33jl1j6f1kk8gfs767as8h212k8j.apps.googleusercontent.com',
			               // Client ID for Android application
			               '141952851027-h5s4srh7ahag0lfmgii6kffrerbf2oem.apps.googleusercontent.com'],
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
	            db: 'mm_db_stage'
			},
			prod: {
				account: 'psprod1',
			    user: 'beentorestoldiseandeamed',
	            password: 'mXuflwvgb3G003jjKnraqasb',
	            url: 'https://beentorestoldiseandeamed:mXuflwvgb3G003jjKnraqasb@psprod1.cloudant.com/',
	            db: 'mm_db_prod'
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
		},
		dataValidation_BanUnknownProperties : true
	}
};

module.exports = devenv[ env ]; 