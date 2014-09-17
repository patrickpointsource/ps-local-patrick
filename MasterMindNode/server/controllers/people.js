'use strict';

var dataAccess = require('../data/dataAccess');
var roles = require('./roles');
var util = require('../util/util');

module.exports.listPeople = function(query, callback) {
    dataAccess.listPeople(query, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.listActivePeopleByRoleResources = function(roleResources, callback) {
	console.log("listActivePeopleByRoleResources.roleResources=" + roleResources);
    dataAccess.listActivePeopleByRoleResources(roleResources, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.listActivePeople = function(callback) {
    dataAccess.listActivePeople(function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertPerson = function(obj, callback) {
	
	// get name for role
	var resource = (obj.primaryRole) ? obj.primaryRole.resource : "";
	roles.getNameByResource(resource, function (err, roleName) {		
		if (!err) {
			obj.primaryRole.name = roleName;
		}

		// upgrade name properties
		upgradeNameProperties(obj, function (err, upgradedObj) {		
			if (!err) {
				obj = upgradedObj;
			}

		    dataAccess.insertItem(obj._id, obj, dataAccess.PEOPLE_KEY, function(err, body){
		        if (err) {
		            console.log(err);
		            callback('error insert person', null);
		        } else {
		            callback(null, body);
		        }
		    });

		});

	});

};

var upgradeNameProperties = function(obj, callback) {
	if (obj.givenName) {
		var name = {};
		name.fullName = obj.name;
		name.givenName = obj.givenName;
		name.familyName = obj.familyName;
		delete obj.name;
		delete obj.givenName;
		delete obj.familyName;
		obj.name = name;
		callback (null, obj);
	}
	else {
		callback ('Name properties already upgraded', null);	
	}
};

module.exports.deletePerson = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.PEOPLE_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getPerson = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};


module.exports.getPersonByGoogleId = function(id, callback) {
    var query = {googleId: id};
    dataAccess.listPeople(query, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading getPersonByGoogleId', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.getMyPerson = function(callback) {
	
	//TODO get id of auth user
	
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getNameByResource = function(resource, callback) {
	if (!resource) {
		callback('No resource', null);
	}
	else {
		util.getIDfromResource(resource, function (err, ID) {
			if (err) {
				callback (err, null);
			}
			else {
				dataAccess.getItem(ID, function(err, person) {
					if (!err) {
						callback(null, person.name);
					}
					else {
						callback(err, null);
					}
				});
			}
		});
	}
			
};

module.exports.getAccessRights = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
        	getAccessRights(body, callback);
        }
    });
};

module.exports.getAccessRightsByGoogleId = function(id, callback) {
    var query = {googleId: id};
    dataAccess.listPeople(query, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading getPersonByGoogleId', null);
        } else {
        	var user = body.members.length == 1 ? body.members[0]: {};
        	getAccessRights(user, callback);
        }
    });
};

var getAccessRights = function(user, callback) {
	var accessRights = {
			hasFinanceRights: false,
			hasAdminRights: false,
			hasManagementRights: false,
			hasProjectManagementRights: false,
			hasExecutiveRights: false,
	};
	
	/**
	 * Members of the 'Executives' group...
	 *
	 * Is in the Executive Sponsor List (queried from People collection)
	 * Can edit any project (projectManagementAccess)
	 * Can view all financial info (financeAccess)
	 * Can make project assignments (projectManagementAccess)
	 * View Staffing Deficits (projectManagementAccess)
	 * Update Role Types (adminAccess)
	 * Can Assign Users to Groups (adminAccess)
	 */
	if( user.groups && user.groups.indexOf( 'Executives' ) !== -1 ) {
		accessRights.hasFinanceRights = true;
		accessRights.hasAdminRights = true;
		accessRights.hasProjectManagementRights = true;
		accessRights.hasManagementRights = true;
		accessRights.hasExecutiveRights = true;
	}

	/**
	 * Members of the 'Management' group...
	 *
	 * Can edit any project (projectManagementAccess)
	 * Can view all financial info (financeAccess)
	 * Can make project assignments (projectManagementAccess)
	 * View Staffing Deficits (projectManagementAccess)
	 * Update Role Types (adminAccess)
	 * Can Assign Users to Groups (adminAccess)
	 */
	if( user.groups && user.groups.indexOf( 'Management' ) !== -1 ) {
		accessRights.hasFinanceRights = true;
		accessRights.hasAdminRights = true;
		accessRights.hasProjectManagementRights = true;
		accessRights.hasManagementRights = true;
	}

	/**
	 * Members of the 'Project Management' group...
	 *
	 * Can edit any project (projectManagementAccess)
	 * Can make project assignments (projectManagementAccess)
	 * View Staffing Deficits (projectManagementAccess)
	 */
	if( user.groups && user.groups.indexOf( 'Project Management' ) !== -1 ) {
		accessRights.hasProjectManagementRights = true;
	}

	/**
	 * Members of the 'Sales' group...
	 *
	 * Is in the Sales Sponsor List (queried from People collection)
	 * Can view all financial info (financeAccess)
	 */
	if( user.groups && user.groups.indexOf( 'Sales' ) !== -1 ) {
		accessRights.hasFinanceRights = true;
	}
	
	callback(null, accessRights);
};


