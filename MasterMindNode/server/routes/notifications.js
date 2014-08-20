'use strict';

var notifications = require('../controllers/notifications');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
    // Call to notifications service
    notifications.listNotifications(query, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
}); 

router.post('/', function(req, res) {
    notifications.insertNotification(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.delete('/:id', function(req, res) {
    req.body._id = req.params.id;
    notifications.deleteNotification(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id', function(req, res) {
    var id = req.params.id;
    notifications.getNotification(id, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.put('/:id', function(req, res) {
    var id = req.params.id;
    req.body._id = id;
    notifications.insertNotification(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

module.exports = router;
