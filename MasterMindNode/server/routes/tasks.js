'use strict';

var tasks = require('../controllers/tasks');

var express = require('express');
var util = require('../util/auth');
var security = require('../util/security');
var resources = require('../util/resources');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
	security.isAllowed(req.user, res, resources.tasks.resourceName, resources.tasks.permissions[0], function(allowed){
		if (allowed) 
		{
			var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
			tasks.listTasks(query, function(err, result){
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

	security.isAllowed(req.user, res, resources.tasks.resourceName, resources.tasks.permissions[1], function(allowed){
		if (allowed) 
		{
		    tasks.insertTask(req.body, function(err, result){
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

	security.isAllowed(req.user, res, resources.tasks.resourceName, resources.tasks.permissions[1], function(allowed){
		if (allowed) 
		{
		    tasks.deleteTask(req.body, function(err, result){
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
	security.isAllowed(req.user, res, resources.tasks.resourceName, resources.tasks.permissions[0], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    tasks.getTask(id, function(err, result){
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
