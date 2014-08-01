'use strict';

var people = require('../controllers/people');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/me', util.isAuthenticated, function(req, res){
    people.getPersonByGoogleId(req.user, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            var me = result.members.length == 1 ? result.members[0]: {};
            
            me.about = "people/" + me._id;
            
            res.json(me);
        }            
    });
}); 
/*
router.options('/me', util.isAuthenticated, function(req, res){
    var headers = {};
      // IE8 does not allow domains to be specified, just the *
      // headers["Access-Control-Allow-Origin"] = req.headers.origin;
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
      res.writeHead(200, headers);
      res.end();
});*/
module.exports = router;
