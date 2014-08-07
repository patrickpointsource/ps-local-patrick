'use strict';

var people = require('../controllers/people');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var router = express.Router();


router.get('/:id', function(req, res) {

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editProfile, function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
			if (id == 'me') {
				
				people.getPersonByGoogleId(req.user, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            var me = result.members.length == 1 ? result.members[0]: {};
			            
			            me.about = "people/" + me._id;
			            
			            res.json(me);
			        }            
		   	 	});
			}
			else {
			    people.getPerson(id, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
		}
	});

});


/*
router.options('/me', util.isAuthenticated, function(req, res){
    var headers = {};
      // IE8 does not allow domains to be specified, just the *
      // headers["Access-Control-Allow-Origin"] = req.headers.origin;
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
      res.writeHead(200, headers);
      res.end();
});*/
module.exports = router;
