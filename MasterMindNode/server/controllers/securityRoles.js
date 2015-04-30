'use strict';

var _ = require('underscore');

var dataAccess = require('../data/dataAccess');
var winston = require('winston');

module.exports.listSecurityRoles = function( callback ) {
	winston.info('securityRoles:listSecurityRoles');
	
    dataAccess.listSecurityRoles( function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading security roles', null);
        } else {
            //winston.info(body);
            callback(null, body);
        }
    });
};

module.exports.listSecurityRolesByResources = function(resources, callback ) {
	 winston.info('securityRoles:listSecurityRolesByResources:resources=' + resources.join(','));
	 
    dataAccess.listSecurityRolesByResources( resources, function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading security roles', null);
        } else {
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

	
	//12/11/14 MM     var validationMessages = validation.validate(obj, dataAccess.SECURITY_ROLES_KEY);
	//12/11/14 MM     if(validationMessages.length > 0) {
	//12/11/14 MM       callback( validationMessages.join(', '), {} );
	//12/11/14 MM       return;
	//12/11/14 MM     }
    
    winston.info('securityRoles:insert:_id=' + obj._id + ':resource=' + obj.resource + ':name=' + obj.name);
    
    dataAccess.insertItem(obj._id, obj, dataAccess.SECURITY_ROLES_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading security roles:' + JSON.stringify(err), null);
        } else {
        	if (!body.resource) {
            	body._id = body.id;
            	body.resource = 'securityroles/' + body._id;
        	}
            callback(null, body);
        }
    });
};

module.exports.deleteSecurityRole = function(obj, callback) {
	winston.info('securityRoles:delete:_id=' + obj._id + ':resource=' + obj.resource + ':name=' + obj.name);
	 
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.SECURITY_ROLES_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getSecurityRole = function(id, callback) {
	 winston.info('securityRoles:get:_id=' + id);
	 
    dataAccess.getItem(id, function(err, body){
        if (err) {
            winston.info(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};