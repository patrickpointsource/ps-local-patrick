'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listConfiguration = function(q, callback) {
    dataAccess.listConfiguration(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading configuration', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.insertConfiguration = function(obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.CONFIGURATION_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert configuration', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteConfiguration = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.CONFIGURATION_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getConfiguration = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};