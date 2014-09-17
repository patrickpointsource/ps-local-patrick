'use strict';

var people = require('../controllers/people');
var express = require('express');
var util = require('../util/auth');

var security = require('../util/security');
var securityResources = require('../util/securityResources');

var context = require('../util/context');
var attribute = require('../util/attribute');
var router = express.Router();

var emailSender = require('../util/emailSender');

router.get('/', util.isAuthenticated, function(req, res){
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewPeople, function(allowed){
		if (allowed) 
		{
		    var query = req.query["query"] ? JSON.parse(req.query["query"]): {};
			var roleResources = attribute.getRootAttribute(query, 'primaryRole.resource');
			if (!roleResources) {
				roleResources = attribute.getORAttributes(query, 'primaryRole.resource');
			}
			if (roleResources) {
			    people.listActivePeopleByRoleResources(roleResources, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });

			}
			else {
				var googleId = attribute.getRootAttribute(query, 'googleId');
				if (googleId) {
					people.getPersonByGoogleId(googleId, function(err, result){
			        if(err){
				            res.json(500, err);
				        } else {
				            res.json(result);
				        }            
				    });
				}
				else {
				    people.listActivePeople(function(err, result){
				        if(err){
				            res.json(500, err);
				        } else {
				            res.json(result);
				        }            
				    });
				}
			}
		}
	});
}); 

router.post('/', util.isAuthenticated, function(req, res) {

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editProfile, function(allowed){
		if (allowed) 
		{
			var person = req.body;
            person.about = "people/" + person._id;
		    people.insertPerson(person, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.delete('/', util.isAuthenticated, function(req, res) {

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.edtProfile, function(allowed){
		if (allowed) 
		{
		    people.deletePerson(req.body, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});

});

router.get('/:id', util.isAuthenticated, function(req, res) {
	console.log("req.headers=" + req.headers.authorization);
	console.log("req.user=" + req.user);
	console.log("securityResources=" + securityResources);
	console.log("res=" + res);

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewProfile, function(allowed){
		if (allowed) 
		{
			console.log("test");
			var id = req.params.id;
			console.log("id=" + id);
			if (id == 'me') {
				
				people.getPersonByGoogleId(req.user, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {        
			        	var me = result.members.length == 1 ? result.members[0]: {};
			        	
			            // todo: move this stuff into controller
			        	me.about = "people/" + me._id;
			            
			            res.json(me);
			        }            
		   	 	});
			}
			else {
			    people.getPerson(id, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            // todo: move this stuff into controller
			            result.about = "people/" + result._id;
			            res.json(result);
			        }            
			    });
			}
		}
	});

});

router.get('/:id/accessRights', util.isAuthenticated, function(req, res) {
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewProfile, function(allowed){
		if (allowed) 
		{
			console.log("Load access rights for user: " + req.user);
			var id = req.params.id;
			console.log("id=" + id);
			if (id == 'me') {
				
				people.getAccessRightsByGoogleId(req.user, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {			            
			            res.json(result);
			        }            
		   	 	});
			}
			else {
			    people.getAccessRights(id, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
		}
	});

});

/*
router.get('/:id', function(req, res) {

    security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editProfile, function(allowed){
        if (allowed) 
        {
            var id = req.params.id;
            if (id == 'me') {
                
                people.getPersonByGoogleId(req.user, function(err, result){
                    if(err){
                        res.json(500, err);
                    } else {
                        var me = result.members.length == 1 ? result.members[0]: {};
                        
                        me.about = "people/" + me._id;
                        
                        res.json(me);
                    }            
                });
            }
            else {
                people.getPerson(id, function(err, result){
                    if(err){
                        res.json(500, err);
                    } else {
                        result.about = "people/" + result._id;
                        res.json(result);
                    }            
                });
            }
        }
    });

});

*/
router.get('/:id/gplus', util.isAuthenticated, function(req, res) {
    var id = req.params.id;
    security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editProfile, function(allowed){
        if (allowed) 
        {

            people.getPerson(id, function(err, result){
                if(err){
                    res.json(500, err);
                } else {
                    var https = require('https');
        
                    var options = {
                      host: 'www.googleapis.com',
                      port: 443,
                      path: '/plus/v1/people/' + result.googleId,
                      method: 'GET',
                      headers: {
                        Authorization : 'Bearer ' + context.authorization,
                        accept: 'application/json'
                      }
                    };
                    
                    var data='';
                    var request = https.request(options, function(response) {
                        response.on('data', function(d) {
                            data += d;
                        });
                        response.on('end', function() {
                            console.log(data);
                            res.json(data);
                        });
                    });
                    request.end();
                    request.on('error', function(e) {
                        console.error(e);
                        res.json(500, e);
                    });
                }            
            });


        }
    });

});


router.put('/:id', util.isAuthenticated, function(req, res) {
    var id = req.params.id;
    req.body._id = id;
    security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editProfile, function(allowed){
        if (allowed) 
        {
            var person = req.body;
            person.about = "people/" + person._id;
            people.insertPerson(person, function(err, result){
                if(err){
                    res.json(500, err);
                } else {
                    result.about = "people/" + result.id;
                    
                    res.json(result);
                }            
            });
        }
    });

});



module.exports = router;
