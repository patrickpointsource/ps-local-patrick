'use strict';

var _ = require('underscore');

var dataAccess = require('../data/dataAccess');
var validation = require( '../data/validation.js' );

module.exports.listSecurityRoles = function(q, callback) {
    dataAccess.listSecurityRoles(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading security roles', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.insertSecurityRole = function(obj, callback) {
    
	if(obj._id) {
		var tmpId;
		
		if( _.isObject( obj._id ) )
			tmpId = obj._id[ "$oid" ].toString( );
		else
			tmpId = obj._id.toString( );

		
		tmpId = 'securityroles/' + tmpId;

		obj.resource = tmpId;
		obj.about = tmpId;
	}
	
    var validationMessages = validation.validate(obj, dataAccess.SECURITY_ROLES_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.SECURITY_ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading security roles', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteSecurityRole = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.SECURITY_ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getSecurityRole = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};