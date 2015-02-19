'use strict';

var dataAccess = require('../data/dataAccess');
//12/11/14 MM var validation = require( '../data/validation.js' );
var _ = require( 'underscore' );

module.exports.listUserRoles = function(callback) {
    dataAccess.listUserRoles(function(err, body){
        if (err) {
            console.log(err);
            callback('error loading user roles', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.insertUserRoles = function(obj, callback) {
    
	//12/11/14 MM     var validationMessages = validation.validate(obj, dataAccess.USER_ROLES_KEY);
	//12/11/14 MM     if(validationMessages.length > 0) {
	//12/11/14 MM       callback( validationMessages.join(', '), {} );
	//12/11/14 MM       return;
	//12/11/14 MM     }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.USER_ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error inserting user roles: ' + JSON.stringify(err), null);
        } else {
            obj._id = body.id;
            
            callback(null, _.extend(obj, body));
        }
    });
};

module.exports.deleteUserRoles = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.USER_ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getUserRoles = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};