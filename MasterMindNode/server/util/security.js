var dataAccess = require('../data/dataAccess.js');

var acl = require('acl');

var _ = require('underscore');

acl = new acl(new acl.memoryBackend());

var DEFAULT_ROLES = {
  EXECUTIVES: "Execs",
  MANAGEMENT: "Managers",
  PM: "PM",
  MINION: "Minion",
  SALES: "Sales"
};

module.exports.DEFAULT_ROLES = DEFAULT_ROLES;

module.exports.isAllowed = function(userId, response, resource, permissions, callback) {
    
    acl.allowedPermissions(userId, resource, function(err, permissions){
      console.log(permissions);
    });
    
    acl.isAllowed(userId, resource, permissions, function(err, allowed){
        // TODO: remove it after implementing 403 error
        // allowed = true;
        
        if (err) {
          	response.json(500, err);
        }
        else if (!allowed) {
          	response.json(401, 'Content ' + resource + ' is not allowed');
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

module.exports.initialize = function(callback) {
  createDeaultRoles(function(callback) {
    console.log("initializing security");
    var errStr = [];
    dataAccess.listSecurityRoles(null, function (err, roles) {
        var securityRoles = roles["members"];
        for (var i=0; i < securityRoles.length; i++) {
            var resources = securityRoles[i].resources;
            for (var k=0; k < resources.length; k++) {
                allow(securityRoles[i].name, resources[k].name, resources[k].permissions, function(err) {
                    errStr.push(err +"\n");
                });
            }
        }
        if (errStr.length != 0) {
            console.log("Security has not been initialized properly : " + errStr);
        }
        else {
            dataAccess.listUserRoles(null, function (err, roles) {
                var userRoles = roles["members"];
                for (var i=0; i < userRoles.length; i++) {
                    var userId = userRoles[i].userId;
                    
                    var roleNames = getRoleNames(userRoles[i].roles);
                    
                    // give permissions to one member
                    if (userId) {
                        addRole(userId, roleNames);
                    }
                    
                    // give permissions to each member of group
                    var groupId = userRoles[i].groupId;
                    
                    try {
                      givePermissionToGroup(groupId, userRoles, roleNames);
                    } catch(err) {
                      console.log("Error in giving permissions to group: " + err);
                    }
                    
                }
            });
        
        }
    });
  });
};

module.exports.getUserRoles = function(user, callback) {
  var query = { userId: user.googleId };
  dataAccess.listUserRoles(query, function(err, body) {
    if (err) {
      console.log(err);
      callback('error loading getUserRoles', null);
    } else {
      var userRoles = body.members.length == 1 ? body.members[0]: {};
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

var givePermissionToGroup = function(groupId, userRoles, roleNames) {
  if(groupId) {
    var usersFromGroupMember = [];
    var groupsFromGroupMember = [];

    for(var i = 0; i < userRoles.length; i++) {
      var userRole = userRoles[i];
      if(_.findWhere(userRole.roles, { resource: groupId })) {
        if(userRole.userId) {
          usersFromGroupMember.push(userRole);
        }
        if(userRole.groupId) {
          groupsFromGroupMember.push(userRole);
        }
      }
    }
    
    // console.log("Giving permissions to users from group " + groupId);
    if(usersFromGroupMember && usersFromGroupMember.length > 0) {
      for(var u = 0; u < usersFromGroupMember.length; u++) {
        addRole(usersFromGroupMember[u].userId, roleNames);
      }
    }
    
    if(groupsFromGroupMember && groupsFromGroupMember.length > 0) {
      for(var u = 0; u < groupsFromGroupMember.length; u++) {
        // console.log("Giving permissions to nested group " + groupsFromGroupMember[u].groupId);
        givePermissionToGroup(groupsFromGroupMember[u].groupId, userRoles, getRoleNames(groupsFromGroupMember[u].roles));
      }
    }
  }
};

var createDeaultRoles = function(callback) {
  console.log("Creating default roles.");
  dataAccess.listSecurityRoles({}, function(err, body) {
    var securityGroups = body.members;
    
    // check for 5 default roles (Management, Executives, PM, Sales, Minion)
    var executivesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.EXECUTIVES });
    var managementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MANAGEMENT });
    var projectManagementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.PM });
    var salesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.SALES });
    var minion = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MINION });
    
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
    // create userRoles for those who dont have it yet.
    if(!minion) {
      console.log("Creating Minion role.");
      createGroup(DEFAULT_ROLES.MINION, function() {
        console.log("Minion just role created.");
        createMinionUserRoles(callback);
      });
    } else {
      console.log("Minion role already created.");
      createMinionUserRoles(callback);
    }
  });
};

module.exports.createDeaultRoles = createDeaultRoles;

var createGroup = function(name, actionAfter) {
  var group = { 
    name: name,
    resources: fullResourcesMap
  };
  
  dataAccess.insertItem(null, group, dataAccess.SECURITY_ROLES_KEY, function(err, body){
    if (err) {
      console.log('Error in creating default security group: ' + group.name + ". Error: " + err);
    } else {
      if(actionAfter) {
        actionAfter();
      }
      console.log("Added default security group: " + group.name);
    }
  });
};

var createMinionUserRoles = function(callback) {
  console.log("Creating Minion default roles.");
  dataAccess.listPeople({}, function(err, peopleBody) {
    if(!err) {
      var people = peopleBody.members;
      
      dataAccess.listUserRoles({}, function(err, userRolesBody) {
        var userRoles = userRolesBody.members;
        
        var countChecked = 0;
        console.log("People length: " + people.length);
        var createdCount = 0;
        var updatedCount = 0;
        for(var i = 0; i < people.length; i++) {
          var person = people[i];
          
          var userRole = _.findWhere(userRoles, { userId: person.googleId });
          
          if(!userRole) {
            var uRole = { userId: person.googleId, roles: [DEFAULT_ROLES.MINION]};
            dataAccess.insertItem(null, uRole, dataAccess.USER_ROLES_KEY, function(err, body){
              if (err) {
                console.log('Error in creating default userRole: ' + err);
              } else {
                console.log("Added default userRole: " + body.id);
              }
              
              countChecked++;
              createdCount++;
              if(callback && countChecked == people.length) {
                console.log("CALLBACK REACHED!");
                callback();
              }
            });
          } else {
            if(!userRole.roles || userRole.roles.length == 0) {
              userRole.roles = [];
              userRole.roles.push(DEFAULT_ROLES.MINION);
              
              dataAccess.insertItem(userRole.id, userRole, dataAccess.USER_ROLES_KEY, function(err, body){
                if (err) {
                  console.log("Error in updating userRole: " + err);
                } else {
                  console.log("Updated default userRole: " + body.id);
                }
              
                countChecked++;
                updatedCount++;
                if(callback && countChecked == people.length) {
                  console.log("CALLBACK REACHED!");
                  callback();
                }
              });
            } else {
              countChecked++;
              if(callback && countChecked == people.length) {
                console.log("CALLBACK REACHED!");
                if(createdCount > 0) {
                  console.log("Default roles added: " + createdCount);
                }
                if(updatedCount > 0) {
                  console.log("Default roles updated: " + updatedCount);
                }
                
                callback();
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
            callback(err);
        }
    });
};

var addRole = function(userId, roles, callback) {
    acl.addUserRoles(userId, roles, function(err){
        if (err) {
            console.log(err);
            callback(err);
        }
    });
};

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
        "editProjects",
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
    }
];
