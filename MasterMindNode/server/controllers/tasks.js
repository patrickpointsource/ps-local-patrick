'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listTasks = function(callback) {
    dataAccess.listTasks(function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};