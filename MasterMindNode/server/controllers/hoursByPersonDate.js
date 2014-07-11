'use strict';

var dbAccess = require('../data/dbAccess');
/*
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
*/

module.exports.listHoursByPersonDate = function(startParams, endParams, callback) {
    dbAccess.listHoursByStartEndDates( startParams, endParams, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading hours by start and end dates', null);
        } else {
            console.log(body);
            callback(null, body);
        }
    });
};