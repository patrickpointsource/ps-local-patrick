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


module.exports.insertPerson = function(obj, callback) {
	
	// get name for role
	roles.getNameByResource(obj.primaryRole.resource, function (err, roleName) {		
		console.log("roleName=" + roleName);
		if (!err) {
			obj.primaryRole.name = roleName;
		}

		// upgrade name properties
		upgradeNameProperties(obj, function (err, upgradedObj) {		
			console.log("upgradedObj=" + upgradedObj);
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
}

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

