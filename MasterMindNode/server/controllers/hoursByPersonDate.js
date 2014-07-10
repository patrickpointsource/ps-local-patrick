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

module.exports.listHoursByPersonDate = function(params, callback) {
    dbAccess.listHoursByStartEndDates( params, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks', null);
        } else {
            console.log(body);
            callback(null, body);
        }
    });
};