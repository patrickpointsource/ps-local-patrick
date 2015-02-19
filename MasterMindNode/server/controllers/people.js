'use strict';

var dataAccess = require('../data/dataAccess');
var roles = require('./roles');
var util = require('../util/util');
var _ = require( 'underscore' );

var security = require('../util/security');

module.exports.listPeople = function(callback) {
    dataAccess.listPeople( function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.listPeopleByRoles = function(roleIds, includeInactive, fields, callback) {
    dataAccess.listPeopleByRoles(roleIds, includeInactive, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.listPeopleByPerson = function(person, callback) {
    dataAccess.listPeopleByPerson(person, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people by person ' + person, null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.listPeopleByIsActiveFlag = function(isActive, fields, callback) {
    dataAccess.listPeopleByIsActiveFlag(isActive, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listPeopleWithPrimaryRole = function(fields, callback) {
    dataAccess.listPeopleWithPrimaryRole(fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listPeopleByGroups = function(groups, fields, callback) {
    dataAccess.listPeopleByGroups(groups, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people by groups', null);
        } else {
            callback(null, body);
        }
    });
};


module.exports.listActivePeopleByAssignments = function(fields, callback) {
    dataAccess.listActivePeopleByAssignments(fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading active people by assignments', null);
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
			// TODO: remove this method after jsonValidation full integration and update of all docs. 
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
    dataAccess.listPeopleByGoogleIds(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading getPersonByGoogleId', null);
        } else {
           var person = body && body.members.length > 0 ? body.members[0]: {};
          person.about = "people/" + person._id;
          callback(null, person);
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
						/*
						 *  12/02/14 Max 
						 *  THIS IS WRONG: callback(null, person.name);
						 *  person.name is an Object
						 */
						callback(null, person.name.fullName);
					}
					else {
						callback(err, null);
					}
				});
			}
		});
	}
};

module.exports.getPersonByResource = function(resource, callback) {
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
                        callback(null, person);
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
    dataAccess.getProfileByGoogleId(id, function(err, user){
        if (err) {
            console.log(err);
            callback('error loading getPersonByGoogleId', null);
        } else {
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
	
  security.getUserRoles(user, function(err, userRole) {
    
    if(err) {
      callback(err, null);
    } else {
    
      if(!userRole || !userRole.roles || userRole.roles.length == 0) {
        callback(null, accessRights);
      } else {
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
        if( _.findWhere(userRole.roles, { name: security.DEFAULT_ROLES.EXECUTIVES }) 
          || _.findWhere(userRole.roles, { name: security.DEFAULT_ROLES.ADMIN })) {
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
        if( _.findWhere(userRole.roles, { name: security.DEFAULT_ROLES.MANAGEMENT }) ) {
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
        if( _.findWhere(userRole.roles, { name: security.DEFAULT_ROLES.PM }) 
          || _.findWhere(userRole.roles, { name: security.DEFAULT_ROLES.SSA }) ) {
          accessRights.hasFinanceRights = true;
          accessRights.hasProjectManagementRights = true;
        }

    /**
     * Members of the 'Sales' group...
     *
     * Is in the Sales Sponsor List (queried from People collection)
     * Can view all financial info (financeAccess)
     */
        if( _.findWhere(userRole.roles, { name: security.DEFAULT_ROLES.SALES }) ) {
          accessRights.hasFinanceRights = true;
        }
    
        callback(null, accessRights);
      }
	}
  });
};


