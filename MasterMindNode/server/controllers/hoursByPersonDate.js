'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listHoursByPersonDate = function(callback) {
    dataAccess.listHoursByPersonDate('mm_db_demo', function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks', null);
        } else {
            console.log(body);
            callback(null, body);
        }
    });
};