'use strict';

var dataAccess = require('../data/dataAccess');
var validation = require( '../data/validation.js' );

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

module.exports.listVacationsByPerson = function(personResource, callback) {
    dataAccess.listVacationsByPerson(personResource, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading vacations by person " + personResource, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listVacationsByPeriod = function(people, startDate, endDate, callback) {
    dataAccess.listVacationsByPeriod(people, startDate, endDate, null, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading vacations by period", null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listRequests = function(manager, statuses, startDate, endDate, callback) {
    dataAccess.listRequests(manager, statuses, startDate, endDate, null, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading requests", null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertVacation = function(obj, callback) {
    
    var validationMessages = validation.validate(obj, dataAccess.VACATIONS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
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