'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listAssignments = function(callback) {
    dataAccess.listAssignments('mm_db_demo', function(err, body){
        if (err) {
            console.log(err);
            callback('error loading assignments', null);
        } else {
            console.log(body);
            callback(null, body);
        }
    });
};