'use strict';

// Data access layer for cloudant
var config = require('../config/config.js');

var nano = require('nano')(config.cloudant.url);

var cloudantView = function(database, designName, viewName, callback){
    var db = nano.db.use(database);
    db.view(designName, viewName, function(err, body){
        if (err) {
            callback(err, null);
        } else {
          callback(null, body);
        }
    });
};

module.exports.listHoursByPerson = function(database, callback) {
    cloudantView(database, 'views', 'HoursByPerson', function(err, body){
        callback(err, body);
    });
};

module.exports.listHoursByPersonDate = function(database, callback) {
    cloudantView(database, 'views', 'testHoursByPersonDate', function(err, body){
        callback(err, body);
    });
};

module.exports.listProjects = function(database, callback) {
    cloudantView(database, 'views', 'Projects', function(err, body){
        callback(err, body);
    });
};

module.exports.listPeople = function(database, callback) {
    cloudantView(database, 'views', 'People', function(err, body){
        callback(err, body);
    });
};

module.exports.listTasks = function(database, callback) {
    cloudantView(database, 'views', 'Tasks', function(err, body){
        callback(err, body);
    });
};

module.exports.listAssignments = function(database, callback) {
    cloudantView(database, 'views', 'Assignments', function(err, body){
        callback(err, body);
    });
};
