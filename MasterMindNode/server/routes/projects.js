'use strict';

var projects = require('../controllers/projects');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var router = express.Router();


router.get('/', util.isAuthenticated, function(req, res){
    
	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[0], function(allowed){
		if (allowed) 
		{
		    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
		    projects.listProjects(query, function(err, result){
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

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[0], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    projects.getProject(id, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.post('/:id/links', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[3], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    projects.addProjectLink(id, req.body, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.get('/:id/links', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[2], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
		    projects.listLinks(id, query, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.get('/:id/assignments', function(req, res) {

	security.isAllowed(req.user, res, securityResources.assignments.resourceName, securityResources.assignments.permissions[0], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
		    projects.listAssignments(id, query, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.get('/:id/roles', function(req, res) {
	
	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[4], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    projects.listRoles(id, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.get('/:id/roles', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[4], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    projects.listRoles(id, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.get('/:id/roles/:roleId', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[4], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
			var roleId = req.params.roleId;
		    projects.getRole(id, roleId, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.put('/:id/assigments', function(req, res) {
	security.isAllowed(req.user, res, securityResources.assignments.resourceName, securityResources.assignments.permissions[1], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    projects.insertAssignment(id, req.body, function(err, result){
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

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[1], function(allowed){
		if (allowed) 
		{
		    projects.deleteProject(req.body, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.delete('/:id/links/:linkId', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[3], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
			var linkId = req.params.linkId;
		    projects.deleteProjectLink(id, linkId, function(err, result){
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

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[1], function(allowed){
		if (allowed) 
		{
		    projects.insertProject(req.body, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.put('/:id/links/:linkId', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[3], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
			var linkId = req.params.linkId;
		    projects.insertProjectLink(id, linkId, req.body, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.put('/:id', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions[1], function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
			var project = req.body;
			project._id = id;
		    projects.insertProject(project, function(err, result){
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
