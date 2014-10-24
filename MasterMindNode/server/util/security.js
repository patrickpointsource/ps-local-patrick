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
    acl.isAllowed(userId, resource, permissions, function(err, allowed){
        //TODO: remove this later
        allowed = true;
        
        if (err) {
          	response.json(500, err);
        }
        else if (!allowed) {
          	response.json(403, 'Content ' + resource + ' is not allowed');
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

module.exports.initialize = function() {
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

var createDeaultRoles = function() {
  dataAccess.listSecurityRoles({}, function(err, body) {
    var securityGroups = body.members;
    
    // check for 4 default roles (Management, Executives, PM, Sales)
    var executivesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.EXECUTIVES });
    var managementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MANAGEMENT });
    var projectManagementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.PM });
    var salesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.SALES });
    
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
  });
};

module.exports.createDeaultRoles = createDeaultRoles;

var createGroup = function(name) {
  var group = { 
    name: name,
    resources: fullResourcesMap
  };
  
  dataAccess.insertItem(null, group, dataAccess.SECURITY_ROLES_KEY, function(err, body){
    if (err) {
      console.log('Error in creating default security group: ' + group.name + ". Error: " + err);
    } else {
      console.log("Added default security group: " + group.name);
    }
  });
};

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
