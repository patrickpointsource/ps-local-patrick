'use strict';
// This will verify you are authenticated but will not redirect
// It is meant to protect the server API resources and not the UI components
// When redirect is required use ensureLoggedIn

var tokenValidator = require('./tokenValidator.js');
var security = require('./security.js');
var passport = require('passport');
var dataAccess = require('../data/dataAccess.js');


var isAuthenticated = function(req, res, next){
	var auth = req.headers.authorization;
    if(req.isAuthenticated && req.isAuthenticated()){
        next();
    } 
	else if (auth) {
		var token = auth.substring(7);
		// TODO should be removed to use local security mechanism between FRONTEND and BACKEND
		tokenValidator.validateGoogleToken(token, function (err, user) {
			if (!err) {
				dataAccess.getProfileByGoogleId(user, function (err, profile) {
					if (!err && profile && profile.isActive) {
						req.user = user;
						req.session.user = user;
						
						next();
					}
					else {
				        req.session.error = err;
				        // Wed, 25 Feb 2015 19:54:39 GMT express deprecated res.json(status, obj): 
				        // Use res.status(status).json(obj) instead at server/util/auth.js:38:15
				        res.status(403).json('Unauthorized');
					}
				});
				
			}
			else {
		        req.session.error = err;
		        // Wed, 25 Feb 2015 19:54:39 GMT express deprecated res.json(status, obj): 
		        // Use res.status(status).json(obj) instead at server/util/auth.js:38:15
        		res.status(403).json('Invalid Token');
			}	
		});
	}
    else {
        req.session.error = 'Access denied!';
        // Wed, 25 Feb 2015 19:54:39 GMT express deprecated res.json(status, obj): 
        // Use res.status(status).json(obj) instead at server/util/auth.js:38:15
        res.status(403).json('Unauthorized');
    }
};

module.exports.isAuthenticated = isAuthenticated;
