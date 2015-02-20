var dataAccess = require('../data/dataAccess.js');

var acl = require('acl');
var q = require('q');

var _ = require('underscore');

acl = new acl(new acl.memoryBackend());

var DEFAULT_ROLES = {
  EXECUTIVES: "Execs",
  MANAGEMENT: "Managers",
  PM: "PM",
  MINION: "Employee",
  SALES: "Sales",
  ADMIN: "Admin",
  SSA: "SSA"
};

module.exports.DEFAULT_ROLES = DEFAULT_ROLES;

module.exports.isAllowed = function(userId, response, resource, permissions, callback, notAllowedCallback, preventNotAllowedInResponce) {

    acl.allowedPermissions(userId, resource, function(err, permissions){
      console.log(permissions);
    });

    acl.isAllowed(userId, resource, permissions, function(err, allowed){

        if (err) {
          	response.json(500, err);
        }
        else if (!allowed) {
            if(notAllowedCallback) {
              notAllowedCallback();
            } else {
            	callback(false);

            	if (!preventNotAllowedInResponce)
          	  		response.json(401, 'Content ' + resource + ' is not allowed');
          	}
        }
        else {
        	callback(true);
        }
    });
};


module.exports.allowedPermissions = function(userId, resources, callback) {
    acl.allowedPermissions(userId, resources, function(err, obj){
        if (err) {
            console.log(err);
        }
        callback(err, obj);
    });
};

// false - start up call, true - reinitialization
module.exports.initialize = function(isReinitialization) {
    console.log("initialize:Initializing security. Reinitialization: " + isReinitialization);
    var errStr = [];
    
    // to prevent from applying "corrupted" security roles from memory cache - clean memory cache
    dataAccess.clearCacheForSecurityRoles();
    
    dataAccess.listSecurityRoles( function (err, roles) {
        var securityRoles = roles.members;

        initializeSecurityRoles(securityRoles, isReinitialization, function() {
          /*acl.allowedPermissions("110740462676845328422", "projects", function(err, permissions){
            console.log("Daniil allows on project after initSecurityRoles: " + permissions["projects"]);
          });*/
          dataAccess.listUserRoles( null, function (err, roles) {
        	if ( err ) {
          		console.log("Initializing security: Error in giving user roles " + err);
          		return err;
          	}
            var userRoles = roles["members"];
            var roleNames;
            var targetRoleIds;
            var targetUserIds = {};
            
            // build {group}-{userIds} map
            for (var i=0; i < userRoles.length; i++) {
              var userId = userRoles[i].userId;

              roleNames = getRoleNames(userRoles[i].roles);
              targetRoleIds = _.map(userRoles[i].roles, function(r) { return r.resource;});
              
              //console.log('\r\nlistUserRoles:' + i + ':' + JSON.stringify(userRoles[i]));
              
              //persist all users
              // give permissions to one member
              if (userId) {
            	  //targetUserIds.push(userId);
            	  
            	  for (var k = 0; k < roleNames.length; k ++) {
            		  if (roleNames[k].toLowerCase() == 'minion')
            			  roleNames[k] = 'Employee';
            	  }
            	  
            	  for (var k = 0; k < roleNames.length; k ++) {
            		  if (!targetUserIds[ roleNames[k] ])
            			  targetUserIds[ roleNames[k] ] = [];
            		  
            		  targetUserIds[ roleNames[k] ].push(userId);
            	  }
            		  
            	  
            	  //addRole(userId, roleNames, isReinitialization);
              }

             
            }
            
            var processedGroupsMap = {};
            var userToRolesMap = {};
            
            var addUserRoleToMap = function(uId, rNameAr) {
            	if (!userToRolesMap[uId])
            		userToRolesMap[uId] = [];
            	
            	userToRolesMap[uId] = userToRolesMap[uId].concat(rNameAr);
            };
            
            // find and process nested groups
            for (var i=0; i < userRoles.length; i++) {
                var userId = userRoles[i].userId;

                roleNames = getRoleNames(userRoles[i].roles);
                //targetRoleIds = _.map(userRoles[i].roles, function(r) { return r.resource;});
                
                //console.log('\r\nlistUserRoles:' + i + ':' + JSON.stringify(userRoles[i]));
                
                
                // give permissions to each member of group
                var groupId = userRoles[i].groupId;
                var group = _.find(securityRoles, function(r) { return r.resource == groupId; });
                
               
          	  	if (groupId){
				  var roles = userRoles[i].roles;
				  
				  roles = _.filter(roles, function(r) {
					  return r.resource;
				  });
				 
				  roles = _.uniq(roles, function(r) {
					  return r.name;
				  });
				  
				  // build sequence of all nested roles
				  var extractedRoles = [];
				  
				  // add as first element "root" parents of hierarchy - hierarchy works like in roles 
				  // collection are all "mother and fathers" of current userRoles[i] entry
				  extractedRoles.push(_.map(roles, function(r) {
					  return r.name;
				  }));
				  
				  for (var k = 0; roles && k < roles.length; k ++) {
					extractNestedPermissionGroups(roles[k].resource,  [group.name], userRoles, securityRoles, extractedRoles);
					
				  }
				  
				  // filter duplicates from nested roles - start from the end
				  
				  for (var k =  extractedRoles.length - 1; k >= 0; k --) {
					  for (var j = 0; j < extractedRoles[k].length; j ++){
						  if (extractedRoles[k][j].toLowerCase() == 'minion')
							  extractedRoles[k][j] = 'Employee';
					  }
				  }
				  for (var k =  extractedRoles.length - 1; k >= 0; k --) {

					  for (var j = (k - 1); j >= 0; j --) {
						  
						  var found = false;
						  // compare each entry which can be array
						  
							  
						  for (var t = extractedRoles[j].length - 1; t >= 0; t --) {
							  for (var l = extractedRoles[k].length - 1; l >= 0; l --) {
								  if (extractedRoles[k][l] == extractedRoles[j][t]) {
									  extractedRoles[k].splice(l, 1);
								  }
							  }
						  }
					  }
				  }
				  
				  extractedRoles = _.filter(extractedRoles, function(entry) {
					  return entry.length > 0;
				  });
				  
				  var targetUsers;
				  
				  // in case when "root" elements has childs
				  if (extractedRoles.length > 1) {
					  for (var k = 0; k < extractedRoles[0].length; k ++) {
						  targetUsers =  targetUserIds[ extractedRoles[0][k] ];
						  
						  // starts iterating from end of hierarchy from most simple roles and assign to users apropriate access roles
						  for (var j = extractedRoles.length - 1; j >= 0; j --) {
							  for (var t = 0; t < targetUsers.length; t ++)
								  addUserRoleToMap(targetUsers[t], extractedRoles[j], isReinitialization);
								  
						  }
						  
						  processedGroupsMap[ extractedRoles[0][k] ] = true;
					  }	 
				  }
	  
          	  	}
               
                
              }
            
            
              // assign all other roles-users access roles
			  for (var role in targetUserIds) {
				  if (!processedGroupsMap[role]) {
					  targetUsers = targetUserIds[role];
					  
					  for (var t = 0; t < targetUsers.length; t ++)
						  //addRole(targetUsers[t], [role], isReinitialization);
						  addUserRoleToMap(targetUsers[t], [role], isReinitialization);
					  
					  processedGroupsMap[role] = true;
				  }
			  }
			  
			  for (var uId in userToRolesMap) {
				  addRole(uId, _.uniq(userToRolesMap[uId]), isReinitialization);
			  }
			  
			  console.log('initialize:' + (_.map(targetUserIds, function(val, key){return (key + ':' + val.length)})).join(','));
          });

        });


    });
};

var initializeSecurityRoles = function(securityRoles, isReinitialization, callback) {
			 
  if(isReinitialization) {
    var removedRolesCount = 0;
    for(var i = 0; i < securityRoles.length; i++) {
      //console.log("Removing " + securityRoles[i].name);
      acl.removeRole(securityRoles[i].name, function(err) {
        if(err) {
          console.log("Cannot delete '" + role + "' role.");
        }

        removedRolesCount++;
        if(removedRolesCount == securityRoles.length - 1) {
          //console.log("All groups removed");
          initializeAllows(securityRoles, callback);
        }
      });
    }
  } else {
    initializeAllows(securityRoles, callback);
  }

};

var initializeAllows = function(securityRoles, callback) {
	//console.log('\r\ninitializeAllows:start')

	//console.log('initializeAllows:'
			
	var allAllowsCount = 0; //* fullResourcesMap.length;

  for(var s = 0; s < securityRoles.length; s++) {
    allAllowsCount += securityRoles[s].resources.length;
  }
  //console.log("all allows" + allAllowsCount);

  for (var i=0; i < securityRoles.length; i++) {
    var allowsCount = 0;
    var resources = securityRoles[i].resources;
      for (var k=0; k < resources.length; k++) {
          console.log("initializeAllows:name=" + securityRoles[i].name + ':' + securityRoles[i]._id + ":resource=" + resources[k].name + ":permissions=" + resources[k].permissions.join(','));

          allow(securityRoles[i].name, resources[k].name, resources[k].permissions, function(err) {
            if(err) {
              console.log("initializeAllows:Error while allowing permissions for groups: " + err);
            }
            allowsCount++;
            if(allowsCount == allAllowsCount) {
              /*acl.allowedPermissions("110740462676845328422", "projects", function(err, permissions){
                console.log("Daniil allows on project before new allowing: " + permissions["projects"]);
              });*/
              console.log("(Re-)Allowing security roles completed.");
              callback();
            }
          });
        }
  }
};

module.exports.getUserRoles = function(user, callback) {
	
  dataAccess.listUserRolesByGoogleId(user.googleId, function(err, body) {
	var userRoles;
    if (err) {
      console.log(err);
      callback('error loading getUserRoles', null);
    } else {
      userRoles = body.members.length == 1 ? body.members[0]: {};
    }

    callback(err, userRoles);
  });
};

var getRoleNames = function(roles) {
  var roleNames = [];
  if(roles) {
    for(var j = 0; j < roles.length; j++) {
      roleNames.push(roles[j].name);
    }
  }

  return roleNames;
};

var extractNestedPermissionGroups = function(groupId, roleNames, userRoles, securityRoles, extractedRoles) {
	  if (!extractedRoles)
			extractedRoles = [];
		
	  if(groupId) {
		  // persist extratced roles
		  extractedRoles.push(roleNames);
		  
	    var usersFromGroupMember = [];
	    var groupsFromGroupMember = [];
	    
	    //console.log('\r\nextractNestedPermissionGroups:groupId:' + groupId + ':userRoles:' + JSON.stringify(userRoles) + ':roleNames:' + JSON.stringify(roleNames))
	    
	    var getRolesInfoFromGroups = function(groups, isId) {
	    	var res = [];
	    	var tmp;
	    	
	    	for (var l = 0; l < groups.length; l ++) {
	    		tmp = _.find(securityRoles, function(s) {
	    			return s.resource == groups[l].resource || s.resource == groups[l].groupId;
	    		});
	    		
	    		if (tmp && !isId)
	    			res.push(tmp.name);
	    		else if (tmp && isId)
	    			res.push(tmp.resource);
	    	}
	    			
	    			
	    	return res;
	    			
  	};
	    	
	    for(var i = 0; i < userRoles.length; i++) {
	      var userRole = userRoles[i];
	      
	      
	      if(_.find(userRole.roles, function(r) { 
	    	  return _.indexOf(roleNames, r.name) > -1;
	      })) {
	          if(userRole.userId) {
	            usersFromGroupMember.push(userRole);
	          }
	          if(userRole.groupId) {
	            groupsFromGroupMember.push(userRole);
	          }
	        }
	    };
	    
	    if(groupsFromGroupMember && groupsFromGroupMember.length > 0) {
	      for(var u = 0; u < groupsFromGroupMember.length; u++) {
	    	  extractNestedPermissionGroups(groupsFromGroupMember[u].groupId,  getRolesInfoFromGroups(groupsFromGroupMember), 
	    			  userRoles, securityRoles, extractedRoles);
	      }
	      
	    }
	  };
};

var createDefaultRoles = function(callback) {
  console.log("Creating default roles.");
  dataAccess.listSecurityRoles( function(err, body) {
    var securityGroups = body.members;

    // check for 5 default roles (Management, Executives, PM, Sales, Minion)
    var executivesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.EXECUTIVES });
    var managementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MANAGEMENT });
    var projectManagementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.PM });
    var salesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.SALES });
    var employee = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MINION });
    var adminGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.ADMIN });
    var ssaGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.SSA });

    if(!executivesGroup) {
      createGroup(DEFAULT_ROLES.EXECUTIVES);
    }
    if(!managementGroup) {
      createGroup(DEFAULT_ROLES.MANAGEMENT);
    }
    if(!projectManagementGroup) {
      createGroup(DEFAULT_ROLES.PM);
    }
    if(!salesGroup) {
      createGroup(DEFAULT_ROLES.SALES);
    }
    if(!adminGroup) {
      createGroup(DEFAULT_ROLES.ADMIN);
    }
    if(!ssaGroup) {
      createGroup(DEFAULT_ROLES.SSA);
    }
    // create userRoles for those who dont have it yet.
    if(!employee) {
      console.log("Creating Employee group.");
      createGroup(DEFAULT_ROLES.MINION, function(body) {
        console.log("Employee group just created.");
        var minionGroup = { name: DEFAULT_ROLES.MINION, resource: "securityroles/" + body.id };
        console.log("Employee group object to insert into userRoles: { name: " + minionGroup.name + ", resource: '" + minionGroup.resource + "' }");
        createMinionUserRoles(callback, minionGroup);
      });
    } else {
      var minionGroup = { name: DEFAULT_ROLES.MINION, resource: employee.resource };
      console.log("Employee group already created.");
      createMinionUserRoles(callback, minionGroup);
    }
  });
};

module.exports.createDefaultRoles = createDefaultRoles;

var createGroup = function(name, actionAfter) {
  var group = {
    name: name,
    resources: fullResourcesMap
  };

  if(group.name == DEFAULT_ROLES.MINION) {
    group.resources = minionResouresMap;
  }

  dataAccess.insertItem(null, group, dataAccess.SECURITY_ROLES_KEY, function(err, body){
    if (err) {
      console.log('Error in creating default security group: ' + group.name + ". Error: " + err);
    } else {
      if(actionAfter) {
        actionAfter(body);
      }
      console.log("Added default security group: " + group.name);
    }
  });
};

var createMinionUserRoles = function(callback, minionRole) {
  console.log("Creating Employee default roles.");
  dataAccess.listPeople(function(err, peopleBody) {
    if(!err) {
      var people = peopleBody.members;

      dataAccess.listUserRoles( null, function(err, userRolesBody) {
        var userRoles = userRolesBody.members;

        var countChecked = 0;
        console.log("People length: " + people.length);

        for(var i = 0; i < people.length; i++) {
          var person = people[i];

          var userRole = _.findWhere(userRoles, { userId: person.googleId });

          if(!userRole) {
            var uRole = { userId: person.googleId, roles: [minionRole]};
            dataAccess.insertItem(null, uRole, dataAccess.USER_ROLES_KEY, function(err, body){
              if (err) {
                console.log('Error in creating default userRole: ' + err);
              } else {
                console.log("Added default userRole: " + body.id);
              }

              countChecked++;
              if(callback && countChecked == people.length) {
                console.log("CALLBACK REACHED!");
                callback(null, true);
              }
            });
          } else {
            if(!userRole.roles || userRole.roles.length == 0) {
              userRole.roles = [minionRole];

              dataAccess.insertItem(userRole.id, userRole, dataAccess.USER_ROLES_KEY, function(err, body){
                if (err) {
                  console.log("Error in updating userRole: " + err);
                } else {
                  console.log("Updated default userRole: " + body.id);
                }

                countChecked++;
                if(callback && countChecked == people.length) {
                  console.log("Every person has at least 'Employee' permissions now.");
                  callback(null, true);
                }
              });
            } else {
              countChecked++;
              if(callback && countChecked == people.length) {
                console.log("Every person now has at least 'Employee' permissions now.");
                callback(null, true);
              }
            }
          }
        }
      });
    }
  });
};

module.exports.createMinionUserRoles = createMinionUserRoles;

var allow = function(role, resource, permission, callback) {
  acl.allow(role, resource, permission, function(err){
    if (err) {
      console.log(err);
    }

    callback(err);
  });
};

var removeRoles = function(securityRoles) {
  for(var i = 0; i < securityRoles.length; i++) {
    acl.removeRole(securityRoles[i].name, function(err) {
      if(err) {
        console.log("Cannot delete '" + securityRoles[i].name + "' role.");
      }
    });
  }
};

module.exports.removeRole = function(role, callback) {
  acl.removeRole(role, function(err) {
    console.log("Cannot delete '" + role + "' role.");
  });
};

/**
 * Loads from acl permissions map by passed list of roles
 * @param roles
 * @param resource
 * @returns
 */
module.exports.getPermissions = function(roles) {
	var deferred = q.defer();
	
	var resourcePermissionsMap = {};
	
	acl._rolesResources(roles).then(function(resources) {
		
		resources = _.uniq(resources);
		
		var errrorOccured = false;
		
		var ind = 0;
		
		var promise = q.fcall(_.bind(function(){
			return acl._resourcePermissions(roles, resources[this.ind]);
		}, {ind: ind}));
		
		for (var k = 1; k < resources.length; k ++)
			promise = promise.then(_.bind(function(result){
				resourcePermissionsMap[resources[this.ind - 1]] = [].concat(result);
				
				return acl._resourcePermissions(roles, resources[this.ind]);
			}, {ind: k}));
		
		promise.catch(function(err) {
			deferred.reject(err);
			errrorOccured = true;
			
		}).done(function(result){
			if (!errrorOccured) {
				resourcePermissionsMap[resources[resources.length - 1]] = [].concat(result);
			
				deferred.resolve(resourcePermissionsMap);
			}
		});
		
	});
	return deferred.promise;
};

var addRole = function(userId, roles, isReinitialization, callback) {
    //console.log('\r\naddRole:userId:' + userId + ':roles:' + JSON.stringify(roles) + ':isReinitialization=' + isReinitialization);
    
    if(isReinitialization) {
      acl.userRoles( userId, function(err, actualRoles) {
        /*if(userId == "110740462676845328422") {
          console.log("Daniil role: " + actualRoles);
        }*/
        if(!err) {
          acl.removeUserRoles( userId, actualRoles, function(err) {
            if(!err) {
              acl.addUserRoles(userId, roles, function(err){
                if (err) {
                  console.log(err);
                  callback(err);
                }
              });
            }
          });
        }
      });
    } else {
      acl.addUserRoles(userId, roles, function(err){
        if (err) {
            console.log(err);
            callback(err);
        }
      });
    }
};

var minionResouresMap = [
    {
      "name": "tasks",
      "permissions": [
        "viewTasks"
      ]
    },
    {
      "name": "assignments",
      "permissions": [
        "viewAssignments"
      ]
    },
    {
      "name": "configuration",
      "permissions": [
      ]
    },
    {
      "name": "hours",
      "permissions": [
        "viewHours",
        "deleteMyHours",
        "editMyHours"
      ]
    },
    {
      "name": "people",
      "permissions": [
        "viewPeople",
        "viewProfile",
        "viewMyProfile",
        "editMyProfile",
        "viewPersonnelData"
      ]
    },
    {
      "name": "projects",
      "permissions": [
        "viewProjects",
        "editProjects",
        "viewProjectLinks"
      ]
    },
    {
      "name": "vacations",
      "permissions": [
        "viewVacations",
        "viewMyVacations",
        "editMyVacations"
      ]
    },
    {
      "name": "notifications",
      "permissions": [
        "viewNotifications",
        "editNotifications",
        "deleteNotifications"
      ]
    },
    {
      "name": "upgrade",
      "permissions": [
      ]
    },
    {
      "name": "securityRoles",
      "permissions": [
      ]
    },
    {
      "name": "reports",
      "permissions": [
      ]
    }
];

var fullResourcesMap = [
    {
      "name": "tasks",
      "permissions": [
        "viewTasks",
        "editTasks"
      ]
    },
    {
      "name": "assignments",
      "permissions": [
        "viewAssignments",
        "editAssignments"
      ]
    },
    {
      "name": "configuration",
      "permissions": [
        "viewConfiguration",
        "editConfiguration"
      ]
    },
    {
      "name": "hours",
      "permissions": [
        "viewHours",
        "editHours",
        "deleteMyHours",
        "editMyHours",
        "viewHoursReportsAndCSV"
      ]
    },
    {
      "name": "people",
      "permissions": [
        "viewPeople",
        "viewProfile",
        "editProfile",
        "viewMyProfile",
        "editMyProfile",
        "viewPersonnelData",
        "editPersonnelData",
        "viewGroups",
        "editGroups"
      ]
    },
    {
      "name": "projects",
      "permissions": [
        "viewProjects",
        "addProjects",
        "editProjects",
        "deleteProjects",
        "viewProjectLinks",
        "editProjectLinks",
        "viewRoles",
        "editRoles"
      ]
    },
    {
      "name": "vacations",
      "permissions": [
        "viewVacations",
        "viewMyVacations",
        "editVacations",
        "editMyVacations"
      ]
    },
    {
      "name": "notifications",
      "permissions": [
        "viewNotifications",
        "editNotifications",
        "deleteNotifications"
      ]
    },
    {
      "name": "upgrade",
      "permissions": [
        "executeUpgrade"
      ]
    },
    {
      "name": "securityRoles",
      "permissions": [
        "viewSecurityRoles",
        "editSecurityRoles"
      ]
    },
    {
        "name": "reports",
        "permissions": [
          "viewReports"
        ]
    }
];
