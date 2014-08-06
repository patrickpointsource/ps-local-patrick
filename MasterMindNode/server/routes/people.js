'use strict';

var people = require('../controllers/people');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
	
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions[0], function(allowed){
		if (allowed) 
		{
		    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
		    console.log("query=" + JSON.stringify(query));
		
		    people.listPeople(query, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

}); 

router.post('/', function(req, res) {

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions[2], function(allowed){
		if (allowed) 
		{
		    people.insertPerson(req.body, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.delete('/', function(req, res) {

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions[2], function(allowed){
		if (allowed) 
		{
		    people.deletePerson(req.body, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.get('/:id', function(req, res) {

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions[1], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    people.getPerson(id, function(err, result){
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
