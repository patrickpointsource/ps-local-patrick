'use strict';

var projects = require('../controllers/projects');
var express = require('express');
var util = require('../util/auth');

var router = express.Router();

router.get('/', util.isAuthenticated, function(req, res){
    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
    
    // Call to projects service
    projects.listProjects(query, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
}); 

router.get('/:id', function(req, res) {
	var id = req.params.id;
    projects.getProject(id, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.post('/:id/links', function(req, res) {
	var id = req.params.id;
    projects.addProjectLink(id, req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id/links', function(req, res) {
	var id = req.params.id;
    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
    projects.listLinks(id, query, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id/assignments', function(req, res) {
	var id = req.params.id;
    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
    projects.listAssignments(id, query, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id/roles', function(req, res) {
	var id = req.params.id;
    projects.listRoles(id, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id/roles', function(req, res) {
	var id = req.params.id;
    projects.listRoles(id, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.get('/:id/roles/:roleId', function(req, res) {
	var id = req.params.id;
	var roleId = req.params.roleId;
    projects.getRole(id, roleId, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.put('/:id/assigments', function(req, res) {
	var id = req.params.id;
    projects.insertAssignment(id, req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.delete('/', function(req, res) {
    projects.deleteProject(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.delete('/:id/links/:linkId', function(req, res) {
	var id = req.params.id;
	var linkId = req.params.linkId;
    projects.deleteProjectLink(id, linkId, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.post('/', function(req, res) {
    projects.insertProject(req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.put('/:id/links/:linkId', function(req, res) {
	var id = req.params.id;
	var linkId = req.params.linkId;
    projects.insertProjectLink(id, linkId, req.body, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

router.put('/:id', function(req, res) {
	var id = req.params.id;
	var project = req.body;
	project._id = id;
    projects.insertProject(project, function(err, result){
        if(err){
            res.json(500, err);
        } else {
            res.json(result);
        }            
    });
});

module.exports = router;
