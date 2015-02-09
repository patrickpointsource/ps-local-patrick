'use strict';

var dataAccess = require('../data/dataAccess');
var util = require('../util/util');
var _ = require('underscore');
var validation = require( '../data/validation.js' );

module.exports.listRoles = function(callback) {
    dataAccess.listRoles( function(err, body){
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
    
    var validationMessages = validation.validate(obj, dataAccess.ROLES_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading roles', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.udpateRole = function(id, obj, callback) {
    dataAccess.updateItem(id, obj, dataAccess.ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error update role', null);
        } else {
            callback(null, _.extend(obj, body));
        }
    });
};

module.exports.deleteRole = function(id, obj, callback) {
    dataAccess.deleteItem(id, obj._rev, dataAccess.ROLES_KEY, function(err, body){
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
