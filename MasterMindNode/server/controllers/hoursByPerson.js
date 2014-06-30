'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listHoursByPerson = function(callback) {
    dataAccess.listHoursByPerson('mm_db_demo', function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks', null);
        } else {
            console.log(body);
            callback(null, body);
        }
    });
};