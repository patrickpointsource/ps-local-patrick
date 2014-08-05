var dataAccess = require('../data/dataAccess.js');

var acl = require('acl');

acl = new acl(new acl.memoryBackend());

module.exports.isAllowed = function(userId, response, resource, permissions, callback) {
    acl.isAllowed(userId, resource, permissions, function(err, allowed){
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

module.exports.initSecurity = function(id, callback) {
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
			callback(errStr, false);					
		}
		else {
			getRolesByGoogleId(id, function (err, result) {
				if (!err) {
					addRole(id, result.roles)
					callback(err, true);					
				}
				else {
					callback(err, false);					
				}	
			});
		}
	});
};

var getRolesByGoogleId = function(id, callback) {
	dataAccess.getItem(id + "_SecurityRoles", function (err, result) {
		callback(err, result);
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

module.exports.insertRoles = function(id, roles, callback) {
	var obj = {"_id" : id + "_SecurityRoles", "roles" : roles };
	console.log("obj._id=" + obj._id);
	console.log("obj.roles=" + obj.roles);
	
	dataAccess.insertItem(obj._id, obj, obj._id, function (err, result) {
		callback(err, result);
	});
};
