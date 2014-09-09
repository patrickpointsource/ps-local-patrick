var dataAccess = require('../data/dataAccess.js');

var acl = require('acl');

acl = new acl(new acl.memoryBackend());

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
					if (userId) {
						addRole(userId, userRoles[i].roles)
					}
				}
			});
		
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
