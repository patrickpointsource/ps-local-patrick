'use strict';

var vacations = require('../controllers/vacations');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

var security = require('../util/security');
var securityResources = require('../util/securityResources');

router.get('/', util.isAuthenticated, function(req, res){
    security.isAllowed(req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewMyVacations, function(allowed){
      if (allowed) {
        var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
        // Call to vacations service
        vacations.listVacations(query, function(err, result){
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
  security.isAllowed(req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editVacations, function(allowed){
    if (allowed) {
      vacations.insertVacation(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
      });
    }            
  });
});

router.delete('/:id', function(req, res) {
    security.isAllowed(req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editMyVacations, function(allowed){
      if (allowed) {
        req.body._id = req.params.id;
        vacations.deleteVacation(req.body, function(err, result){
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
  security.isAllowed(req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewVacations, function(allowed){
    if (allowed) {
	  var id = req.params.id;
      vacations.getVacation(id, function(err, result){
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
    security.isAllowed(req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editMyVacations, function(allowed){
      if (allowed) {
        var id = req.params.id;
        req.body._id = id;
        vacations.insertVacation(req.body, function(err, result){
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
