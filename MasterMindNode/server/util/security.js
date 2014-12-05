var dataAccess = require('../data/dataAccess.js');

var acl = require('acl');

var _ = require('underscore');

acl = new acl(new acl.memoryBackend());

var DEFAULT_ROLES = {
  EXECUTIVES: "Execs",
  MANAGEMENT: "Managers",
  PM: "PM",
  MINION: "Minion",
  SALES: "Sales",
  ADMIN: "Admin",
  SSA: "SSA"
};

module.exports.DEFAULT_ROLES = DEFAULT_ROLES;

module.exports.isAllowed = function(userId, response, resource, permissions, callback, notAllowedCallback) {
    
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
    console.log("Initializing security. Reinitialization: " + isReinitialization);
    var errStr = [];
    dataAccess.listSecurityRoles(null, function (err, roles) {
        var securityRoles = roles.members;
        
        initializeSecurityRoles(securityRoles, isReinitialization, function() {
          /*acl.allowedPermissions("110740462676845328422", "projects", function(err, permissions){
            console.log("Daniil allows on project after initSecurityRoles: " + permissions["projects"]);
          });*/
          dataAccess.listUserRoles(null, function (err, roles) {
            var userRoles = roles["members"];
            for (var i=0; i < userRoles.length; i++) {
              var userId = userRoles[i].userId;

              var roleNames = getRoleNames(userRoles[i].roles);

              // give permissions to one member
              if (userId) {
                addRole(userId, roleNames, isReinitialization);
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
        });
        
        
    });
};

var initializeSecurityRoles = function(securityRoles, isReinitialization, callback) {
  /*acl.allowedPermissions("110740462676845328422", "projects", function(err, permissions){
    console.log("Daniil allows on project before initSecurityRoles: " + permissions["projects"]);
  });*/
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
  var allAllowsCount = securityRoles.length * fullResourcesMap.length;
  //console.log("all allows" + allAllowsCount);
  
  for (var i=0; i < securityRoles.length; i++) {
    var allowsCount = 0;
    var resources = securityRoles[i].resources;
      for (var k=0; k < resources.length; k++) {
          //console.log("allowing " + securityRoles[i].name + " " + resources[k].name + " " + resources[k].permissions);
          allow(securityRoles[i].name, resources[k].name, resources[k].permissions, function(err) {
            if(err) {
              console.log("Error while allowing permissions for groups: " + err);
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

var createDefaultRoles = function(callback) {
  console.log("Creating default roles.");
  dataAccess.listSecurityRoles({}, function(err, body) {
    var securityGroups = body.members;
    
    // check for 5 default roles (Management, Executives, PM, Sales, Minion)
    var executivesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.EXECUTIVES });
    var managementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MANAGEMENT });
    var projectManagementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.PM });
    var salesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.SALES });
    var minion = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MINION });
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
    if(!minion) {
      console.log("Creating Minion group.");
      createGroup(DEFAULT_ROLES.MINION, function(body) {
        console.log("Minion group just created.");
        var minionGroup = { name: DEFAULT_ROLES.MINION, resource: "securityroles/" + body.id };
        console.log("Minion group object to insert into userRoles: { name: " + minionGroup.name + ", resource: '" + minionGroup.resource + "' }");
        createMinionUserRoles(callback, minionGroup);
      });
    } else {
      var minionGroup = { name: DEFAULT_ROLES.MINION, resource: minion.resource };
      console.log("Minion group already created.");
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
  console.log("Creating Minion default roles.");
  dataAccess.listPeople({}, function(err, peopleBody) {
    if(!err) {
      var people = peopleBody.members;
      
      dataAccess.listUserRoles({}, function(err, userRolesBody) {
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
                  console.log("Every person has at least 'Minion' permissions now.");
                  callback(null, true);
                }
              });
            } else {
              countChecked++;
              if(callback && countChecked == people.length) {
                console.log("Every person now has at least 'Minion' permissions now.");
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

var addRole = function(userId, roles, isReinitialization, callback) {
    
    if(isReinitialization) {
      acl.userRoles( userId, function(err, actualRoles) {
        /*if(userId == "110740462676845328422") {
          console.log("Daniil role: " + actualRoles);
        }*/
        if(!err) {
          acl.removeUserRoles( userId, actualRoles, function(err) {
            if(!err) {
              acl.addUserRoles(userId, roles, function(err){
                if(userId == "110740462676845328422") {
                  /*console.log("Daniil new role: " + roles);
                  acl.userRoles("110740462676845328422", function(err, realRoles) {
                    console.log("Daniil actual roles after update: " + realRoles);
                  });
                  acl.allowedPermissions("110740462676845328422", "projects", function(err, permissions){
                    console.log("Daniil allows on project after refresh: " + permissions["projects"]);
                  });*/
                }
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
    },
    {
        "name": "reports",
        "permissions": [
          "viewReports"
        ]
    }
];
