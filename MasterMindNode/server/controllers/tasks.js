'use strict';

var dataAccess = require('../data/dataAccess');
var validation = require( '../data/validation.js' );

module.exports.listTasks = function( callback ) {
    dataAccess.listTasks( function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listTasksByName = function(name, callback) {
    dataAccess.listTasksByName(name, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks by ' + name, null);
        } else {
            callback(null, body);
        }
    });
};



module.exports.insertTask = function(obj, callback) {
    
    var validationMessages = validation.validate(obj, dataAccess.TASKS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.TASKS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert task', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteTask = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.TASKS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error delete task', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getTask = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error get task', null);
        } else {
            callback(null, body);
        }
    });
};