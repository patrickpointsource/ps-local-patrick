'use strict';

var jazzHub = require('../controllers/jazzHub');
var express = require('express');
var auth = require('../util/auth');

var router = express.Router();

var security = require('../util/security');
var securityResources = require('../util/securityResources');

router.get('/', auth.isAuthenticated, function(req, res){
    security.isAllowed(req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjectLinks, function(allowed){
      if (allowed) {
    	jazzHub.getJazzHubProjects(function(err, result){
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
