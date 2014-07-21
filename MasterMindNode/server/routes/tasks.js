'use strict';

var tasks = require('../controllers/tasks');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
    // Call to tasks service
    tasks.listTasks(query, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
}); 

router.get('/new', util.isAuthenticated, function(req, res){
    // Call to tasks service
    tasks.listTasks(function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
}); 


router.post('/', function(req, res) {
    tasks.insertTask(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.delete('/', function(req, res) {
    tasks.deleteTask(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id', function(req, res) {
	var id = req.params.id;
    tasks.getTask(id, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

module.exports = router;
