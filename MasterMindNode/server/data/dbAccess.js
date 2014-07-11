'use strict';

// Data access layer for cloudant
var config = require('../config/config.js');

var nano = require('nano')(config.cloudant.url);

var database = config.db;

var cloudantView = function(designName, viewName, params, callback){
    var db = nano.db.use(database);
    if (params)
        db.view(designName, viewName, params, function(err, body){
            if (err) {
                callback(err, null);
            } else {
              callback(null, body);
            }
        });
    else
        db.view(designName, viewName, function(err, body){
            if (err) {
                callback(err, null);
            } else {
              callback(null, body);
            }
        });
};


var insertItem = function(id, item, callback){
    var db = nano.db.use(database);
    db.insert(item, id, function(err, body){
    	if (err) {
			callback(err, null);
		} else {
        	callback(null, body);
		}
    });
};

var deleteItem = function(id, rev, callback){
    var db = nano.db.use(database);
    db.destroy(id, rev, function(err, body){
    	if (err) {
			callback(err, null);
		} else {
        	callback(null, body);
		}
    });
};

var getItem = function(id, callback){
    var db = nano.db.use(database);
    db.get(id, function(err, body){
    	if (err) {
			callback(err, null);
		} else {
        	callback(null, body);
		}
    });
};

module.exports.listHoursByPerson = function(callback) {
    cloudantView('views', 'HoursByPerson', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listHoursByStartEndDates = function(params, callback) {
    cloudantView('HoursBy', 'PersonDate', params, function(err, body){
        callback(err, body);
    });
};

module.exports.listHoursByPersonDate = function(callback) {
    cloudantView('views', 'testHoursByPersonDate', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listProjects = function(callback) {
    cloudantView('views', 'Projects', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listPeople = function(callback) {
    cloudantView('views', 'People', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listTasks = function(callback) {
    cloudantView('views', 'Tasks', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listAssignments = function(callback) {
    cloudantView('views', 'Assignments', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listRoles = function(callback) {
    cloudantView('views', 'Roles', {include_docs : true}, function(err, body){
        callback(err, body);
    });
};

module.exports.insertItem = insertItem;
module.exports.deleteItem = deleteItem;
module.exports.getItem = getItem;

