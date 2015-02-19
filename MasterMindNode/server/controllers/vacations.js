'use strict';

var dataAccess = require('../data/dataAccess');
//12/11/14 MM var validation = require( '../data/validation.js' );

module.exports.listVacations = function(callback) {
    dataAccess.listVacations(function(err, body){
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

module.exports.listVacationsByPeriod = function(people, startDate, endDate, fields, callback) {
    dataAccess.listVacationsByPeriod(people, startDate, endDate, fields, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading vacations by period", null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listRequests = function(manager, statuses, startDate, endDate, fields, callback) {
    dataAccess.listRequests(manager, statuses, startDate, endDate, fields, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading requests", null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertVacation = function(obj, callback) {
    
	//12/11/14 MM     var validationMessages = validation.validate(obj, dataAccess.VACATIONS_KEY);
	//12/11/14 MM     if(validationMessages.length > 0) {
	//12/11/14 MM       callback( validationMessages.join(', '), {} );
	//12/11/14 MM       return;
	//12/11/14 MM     }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.VACATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert vacation:' + JSON.stringify(err), null);
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