'use strict';

var upgrade = require('../controllers/upgrade');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

var security = require('../util/security');
var securityResources = require('../util/securityResources');

router.get('/', util.isAuthenticated, function(req, res){
    security.isAllowed(req.user, res, securityResources.upgrade.resourceName, securityResources.upgrade.permissions.executeUpgrade, function(allowed){
      if (allowed) {
        upgrade.executeUpgrade(function(err, result){
          if(err){
            res.json(500, err);
          } else {
            res.json('You are now up to date!');
          }            
        });
      }            
    });
}); 


module.exports = router;
