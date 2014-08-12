'use strict';

var projects = require('../controllers/projects');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var router = express.Router();

router.get('/:id', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function(allowed){
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

router.post('/', function(req, res) {

	security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjects, function(allowed){
		if (allowed) 
		{
			var project = req.body;
			project.form = 'Projects';
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
