'use strict';

var projects = require('../controllers/roles');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
	
	security.isAllowed(req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function(allowed){
		if (allowed) 
		{
   			var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
	    	res.json({count: 0, about: "hours", members: []});
		}
	});

}); 

module.exports = router;
