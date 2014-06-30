'use strict';

var assignments = require('../controllers/assignments');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
    // Call to assignments service
    assignments.listAssignments(function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
}); 

module.exports = router;
