'use strict';

var hoursByPerson = require('../controllers/hoursByPerson');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
	
	security.isAllowed(req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function(allowed){
		if (allowed) 
		{
		    hoursByPerson.listHoursByPerson(function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

}); 

module.exports = router;
