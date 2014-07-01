'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listPeople = function(callback) {
    dataAccess.listPeople('mm_db_demo', function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            console.log(body);
            callback(null, body);
        }
    });
};