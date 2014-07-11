'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listRoles = function(callback) {
    dataAccess.listRoles(function(err, body){
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
    dataAccess.insertRole(obj._id, obj, dataAccess.ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks', null);
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