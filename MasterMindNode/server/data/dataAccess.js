'use strict';

// Data access layer for cloudant
var config = require('../config/config.js');

var nano = require('nano')(config.cloudant.url);

var cloudantView = function(database, designName, viewName, params, callback){
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

module.exports.listHoursByPerson = function(database, callback) {
    cloudantView(database, 'views', 'HoursByPerson', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listHoursByStartEndDates = function(database, params, callback) {
    cloudantView(database, 'HoursBy', 'PersonDate', params, function(err, body){
        callback(err, body);
    });
};

module.exports.listHoursByPersonDate = function(database, callback) {
    cloudantView(database, 'views', 'testHoursByPersonDate', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listProjects = function(database, callback) {
    cloudantView(database, 'views', 'Projects', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listPeople = function(database, callback) {
    cloudantView(database, 'views', 'People', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listTasks = function(database, callback) {
    cloudantView(database, 'views', 'Tasks', null, function(err, body){
        callback(err, body);
    });
};

module.exports.listAssignments = function(database, callback) {
    cloudantView(database, 'views', 'Assignments', null, function(err, body){
        callback(err, body);
    });
};
