'use strict';

var projects = require('../controllers/roles');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
    
    res.json({count: 0, about: "hours", data: []});
     
}); 

module.exports = router;
