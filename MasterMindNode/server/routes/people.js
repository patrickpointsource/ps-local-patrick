'use strict';

var people = require('../controllers/people');
var securityRoles = require('../controllers/securityRoles');

var _ = require('underscore');
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
		    people.listPeople( function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
		            res.json(result);
		        }            
		    });
		}
	});
}); 


router.get('/filter', util.isAuthenticated, function(req, res){
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewPeople, function(allowed){
		if (allowed) 
		{
			var roleIds = [];
			for(var roleIndex in req.query) {
				var roleId = req.query[roleIndex].replace("roles/", '');
				roleIds.push(roleId);
			}
			
			if (roleIds.length == 0) {
				//Get list of people if filter is empty
				people.listPeople( function(err, result){
					if(err){
						res.json(500, err);
					} else {
						res.json(result);
					}            
				});
			} else {
				//Get active people by roles from filter
				var fields = req.query.fields;
				people.listPeopleByRoles(roleIds, true, fields, function(err, result){
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

router.get('/byroleid/:roleId', util.isAuthenticated, function(req, res){
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewPeople, function(allowed){
		if (allowed) 
		{
			var fields = req.query.fields;
			var roleIds = req.params.roleId ? req.params.roleId.split(',') : null;
			if (roleIds) {
				people.listPeopleByRoles(roleIds, false, fields,  function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else {
	            res.json(500, 'No required roleId attribute');
			}
		}
	});
}); 


router.get('/bytypes/:type', util.isAuthenticated, function(req, res){
	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewPeople, function(allowed){
		if (allowed) 
		{
			var type = req.params.type;
			var fields = req.query.fields;
			if (type && type == "activeAssignments") {
			    people.listActivePeopleByAssignments(fields, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else if (type && type == "active") {
			    people.listPeopleByIsActiveFlag(true, fields, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else if (type && type == "inactive") {
			    people.listPeopleByIsActiveFlag(false, fields, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else if (type && type == "byGroups") {
				var groups = req.query.group;
			    people.listPeopleByGroups(groups, fields, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else if (type && type == "byRoles") {
				var roles = req.query.role;
				var includeInactive = req.query.includeInactive;
			    people.listPeopleByRoles(roles, includeInactive, fields, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else if (type && type == "withPrimaryRole") {
			    people.listPeopleWithPrimaryRole(fields, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else 
				if (type && type == "myPeople") {
					
					people.getPersonByGoogleId(req.user, function(err, result){
				        if(err){
				            res.json(500, err);
				        } else {        
				        	if (result) {
					        	people.listPeopleByPerson("people/" + result._id, function(err, result){
							        if(err){
							            res.json(500, err);
							        } else {
							            res.json(result);
							        }            
							    });
				        	}
							else {
					            res.json(500, "Profile not found");
							}

				        }            
			   	 	});

					
				}
			else {
	            res.json(500, "No required type attribute");
			}
		}
	});
}); 

router.get('/google/:id', util.isAuthenticated, function(req, res){

	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewPeople, function(allowed){
		if (allowed) 
		{
			var id = req.params.id;
			people.getPersonByGoogleId(id, function(err, result){
		        if(err){
		            res.json(500, err);
		        } else {
				    res.json(result);
				}            
			});
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

  security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewProfile, function(allowed){
    if (allowed) 
    {
      var id = req.params.id;
      if (id == 'me') {
    
    	// initialize permissionsMap
	      people.getPersonByGoogleId(req.user, function(err, result){
	    	  
	    	  security.getUserRoles(result, function(userRoleErr, userRole) {
	    		  var resources = [];
	    		  
	    		  for (var k = 0; k < userRole.roles.length; k ++)
	    			  resources.push(userRole.roles[k].resource);
	    		  
	    		  securityRoles.listSecurityRolesByResources( resources, function( securityRolesErr, securityRoles ) {
	    			  var allResource = [];
	    			  
	    			  // merge all permissions
	    			  var existingResource = null;
	    			  
	    			  for (var k = 0; k < securityRoles.members.length; k ++) {
	    				  for (var j = 0; j < securityRoles.members[k].resources.length; j ++){
	    					  existingResource = _.findWhere(allResource, {name: securityRoles.members[k].resources[j].name});
	    					  
	    					  if (existingResource)
	    						  existingResource.permissions = existingResource.permissions.concat(securityRoles.members[k].resources[j].permissions);
	    					  else
	    						  allResource.push(securityRoles.members[k].resources[j]);
	    				  }
	    			  }
	    			  
	    			  var permissionsMap = {};
	    			  
	    			  for (var k = 0; k < allResource.length; k ++) {
	    				  allResource[k].permissions = _.uniq( allResource[k].permissions);
	    				  
	    				  permissionsMap[allResource[k].name] = allResource[k].permissions;
	    			  }

	    			  
	    			  if(err){
	    				  res.json(500, err);
	    			  } else {  
	    				  result.permissionsMap = permissionsMap;
	    				  res.json(result);
	    			  } 
	    			  
	    			  console.log('\r\npeople:me:after:');
	    		  });
	    		  
	    		  
	    	  });
	           
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

router.get('/:id/gplus', util.isAuthenticated, function(req, res) {
    var id = req.params.id;
    security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.viewProfile, function(allowed){
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
    
    if(req.body.googleId == req.user) {
            security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editMyProfile, function(allowed){
              if (allowed) {
                var person = req.body;
                person.about = "people/" + person._id;
                people.insertPerson(person, function(err, result){
                  if(err){
                    res.json(500, "You can edit only your own profile: " + err);
                  } else {
                    result.about = "people/" + result.id;
                    
                    res.json(result);
                  }
                });
              }
            });
          } else {
	            security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editProfile, function(allowed){
	                console.log('\r\npeople:put:security:' + req.user + ':securityResources.people.permissions.editProfile:' + allowed);
	            	
	                if (allowed) {
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
	                } else {
	                	security.isAllowed(req.user, res, securityResources.people.resourceName, securityResources.people.permissions.editPersonnelData, function(personnelDataAllowed){
	                		if (personnelDataAllowed) {
	                			people.getPerson(req.body._id, function(err, originalPerson){
	                				// apply only specific fields
	                				//if (req.body.manager)
	                				originalPerson.manager = req.body.manager;
	                				
	                				//if (req.body.vacationCapacity)
	                				originalPerson.vacationCapacity = req.body.vacationCapacity;
	                				
	                				//if (req.body.primaryRole)
	                				originalPerson.primaryRole = req.body.primaryRole;
	                				
	                				//if (req.body.primaryRole)
	                				originalPerson.partTime = req.body.partTime;
	                				originalPerson.partTimeHours = req.body.partTimeHours;
	                				
	                				originalPerson.isActive = req.body.isActive;
	                				
	                				originalPerson.about = "people/" + originalPerson._id;
	        	                    
	                				people.insertPerson(originalPerson, function(err, result){
	          	                      if(err){
	          	                        res.json(500, err);
	          	                      } else {
	          	                        result.about = "people/" + result.id;	          	                    
	          	                        res.json(result);
	          	                      }            
	          	                    });
	                			});
	                		}
	                	}, null, true);
	                }
	            }, null, true);
          }
});



module.exports = router;
