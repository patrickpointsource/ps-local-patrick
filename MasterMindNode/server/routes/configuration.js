'use strict';

var configuration = require('../controllers/configuration');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
    
    // Call to projects service
    configuration.listConfiguration(query, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
}); 


router.post('/', function(req, res) {
    configuration.insertConfiguration(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.delete('/', function(req, res) {
    configuration.deleteConfiguration(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id', function(req, res) {
	var id = req.params.id;
    configuration.getConfiguration(id, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

module.exports = router;
