'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listVacations = function(q, callback) {
    dataAccess.listVacations(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading vacations', null);
        } else {
            callback(null, body);
        }
    });
};



module.exports.insertVacation = function(obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.VACATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert vacation', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteVacation = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.VACATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error delete vacation', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getVacation = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error get vacation', null);
        } else {
            callback(null, body);
        }
    });
};