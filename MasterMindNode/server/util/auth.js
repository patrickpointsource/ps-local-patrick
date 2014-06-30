'use strict';
// This will verify you are authenticated but will not redirect
// It is meant to protect the server API resources and not the UI components
// When redirect is required use ensureLoggedIn
var isAuthenticated = function(req, res, next){
    if(req.isAuthenticated && req.isAuthenticated()){
        next();
    } else {
        req.session.error = 'Access denied!';
        res.json(403, 'Unauthorized');
    }
};

module.exports.isAuthenticated = isAuthenticated;
