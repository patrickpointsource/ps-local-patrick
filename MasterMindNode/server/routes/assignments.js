'use strict';

var assignments = require('../controllers/assignments');

var express = require('express');
var util = require('../util/auth');
var security = require('../util/security');
var resources = require('../util/resources');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){

	security.isAllowed(req.user, res, resources.assignments.resourceName, resources.assignments.permissions[0], function(allowed){
		if (allowed) 
		{
		    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
		    // Call to assignments service
		    assignments.listAssignments(query, function(err, result){
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
	security.isAllowed(req.user, res, resources.assignments.resourceName, resources.assignments.permissions[0], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    assignments.getAssignment(id, function(err, result){
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
