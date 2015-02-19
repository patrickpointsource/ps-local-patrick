'use strict';

var dataAccess = require('../data/dataAccess');
//12/11/14 MM var validation = require( '../data/validation.js' );

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

module.exports.listTasksBySubstr = function(substr, callback) {
    dataAccess.listTasksBySubstr(substr, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks by ' + substr, null);
        } else {
            callback(null, body);
        }
    });
};



module.exports.insertTask = function(obj, callback) {
    
	//12/11/14 MM     var validationMessages = validation.validate(obj, dataAccess.TASKS_KEY);
	//12/11/14 MM     if(validationMessages.length > 0) {
	//12/11/14 MM       callback( validationMessages.join(', '), {} );
	//12/11/14 MM       return;
	//12/11/14 MM     }
    
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