'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listTasks = function(q, callback) {
    dataAccess.listTasks(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks', null);
        } else {
            callback(null, body);
        }
    });
};



module.exports.insertTask = function(obj, callback) {
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