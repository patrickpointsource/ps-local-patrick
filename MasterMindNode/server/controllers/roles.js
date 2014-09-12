'use strict';

var dataAccess = require('../data/dataAccess');
var util = require('../util/util');

module.exports.listRoles = function(q, callback) {
    dataAccess.listRoles(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading roles', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.insertRole = function(obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading roles', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteRole = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getRole = function(id, callback) {
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
				dataAccess.getItem(ID, function(err, item) {
					if (!err) {
						callback(null, item.title);
					}
					else {
						callback(err, null);
					}
				});
			}
		});
	}
			
};
