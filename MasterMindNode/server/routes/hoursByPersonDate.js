'use strict';

var hoursByPersonDate = require('../controllers/hoursByPersonDate');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var router = express.Router();
/*
router.get('/', util.isAuthenticated, function(req, res){
    // Call to tasks service
    hoursByPersonDate.listHoursByPersonDate(function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
}); 
*/
router.get('/', util.isAuthenticated, function(req, res){
    
    //var params = ["people/52ab7005e4b0fd2a8d130016", "2014-05-20"];
    //var params = {"keys": ["people/52ab7005e4b0fd2a8d130016", "2014-05-20"] };
    
   security.isAllowed(req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function(allowed){
		if (allowed) 
		{
		    var params = JSON.parse(req.query["params"]);
		    if (params.startKeys && params.endKeys)
		        // Call to hours service
		        hoursByPersonDate.listHoursByPersonDate(params.startKeys, params.endKeys, function(err, result){
		            if(err){
		                res.json(500, err);
		            } else {
		                res.json(result);
		            }            
		        });
		    else
		        res.json(400, {msg: "Incorrect params"});
		}
	});


});

module.exports = router;
