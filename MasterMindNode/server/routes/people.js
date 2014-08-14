'use strict';

var people = require('../controllers/people');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
	
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewPeople, function(allowed){
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

router.delete('/', function(req, res) {

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.edtProfile, function(allowed){
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

router.get('/:id', util.isAuthenticated, function(req, res) {
	console.log("req.headers=" + req.headers.authorization);
	console.log("req.user=" + req.user);
	console.log("securityResources=" + securityResources);
	console.log("res=" + res);

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewProfile, function(allowed){
		if (allowed) 
		{
			console.log("test");
			var id = req.params.id;
			console.log("id=" + id);
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



module.exports = router;
