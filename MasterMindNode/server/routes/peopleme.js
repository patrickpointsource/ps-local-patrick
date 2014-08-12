'use strict';

var people = require('../controllers/people');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var context = require('../util/context');

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
			        	result.about = "people/" + result._id;
			            res.json(result);
			        }            
			    });
			}
		}
	});

});


router.get('/:id/gplus', function(req, res) {
	var id = req.params.id;
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editProfile, function(allowed){
		if (allowed) 
		{

			people.getPerson(id, function(err, result){
				if(err){
			    	res.json(500, err);
				} else {
					var https = require('https');
		
					var options = {
					  host: 'www.googleapis.com',
					  port: 443,
					  path: '/plus/v1/people/' + result.googleId,
					  method: 'GET',
					  headers: {
					  	Authorization : 'Bearer ' + context.authorization,
		 			  	accept: 'application/json'
					  }
					};
					
					var data='';
					var request = https.request(options, function(response) {
						response.on('data', function(d) {
							data += d;
					  	});
						response.on('end', function() {
							console.log(data);
							res.json(data);
					  	});
					});
					request.end();
					request.on('error', function(e) {
						console.error(e);
			    		res.json(500, e);
					});
			    }            
			});


		}
	});

});


router.put('/:id', function(req, res) {
	var id = req.params.id;
	req.body._id = id;
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editProfile, function(allowed){
		if (allowed) 
		{
			var person = req.body;
            person.about = "people/" + person._id;
		    people.insertPerson(person, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
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
