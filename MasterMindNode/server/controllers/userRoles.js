'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listUserRoles = function(q, callback) {
    dataAccess.listUserRoles(q, function(err, body){
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
    dataAccess.insertItem(obj._id, obj, dataAccess.USER_ROLES_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading security roles', null);
        } else {
            callback(null, body);
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