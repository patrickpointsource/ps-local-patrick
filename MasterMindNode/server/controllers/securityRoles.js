'use strict';

var dataAccess = require('../data/dataAccess');

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