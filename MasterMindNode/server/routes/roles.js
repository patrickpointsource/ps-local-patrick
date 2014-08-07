'use strict';

var roles = require('../controllers/roles');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
     var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
    
    // Call to projects service
    roles.listRoles(query, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
}); 

router.post('/', function(req, res) {
    roles.insertRole(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.delete('/', function(req, res) {
    roles.deleteRole(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id', function(req, res) {
	var id = req.params.id;
    roles.getRole(id, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

module.exports = router;
