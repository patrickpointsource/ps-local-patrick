'use strict';

var configuration = require('../controllers/configuration');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');


var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){

	security.isAllowed(req.user, res, securityResources.configuration.resourceName, securityResources.configuration.permissions.viewConfiguration, function(allowed){
		if (allowed) 
		{
		    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
		   	configuration.listConfiguration(query, function(err, result){
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

	security.isAllowed(req.user, res, securityResources.configuration.resourceName, securityResources.configuration.permissions.editConfiguration, function(allowed){
		if (allowed) 
		{
		    configuration.insertConfiguration(req.body, function(err, result){
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
	
	security.isAllowed(req.user, res, securityResources.configuration.resourceName, securityResources.configuration.permissions.editConfiguration, function(allowed){
		if (allowed) 
		{
			configuration.deleteConfiguration(req.body, function(err, result){
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

	security.isAllowed(req.user, res, securityResources.configuration.resourceName, securityResources.configuration.permissions.viewConfiguration, function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
		    configuration.getConfiguration(id, function(err, result){
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
