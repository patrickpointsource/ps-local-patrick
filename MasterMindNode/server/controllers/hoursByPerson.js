'use strict';

var dbAccess = require('../data/dbAccess');

module.exports.listHoursByPerson = function(callback) {
    dbAccess.listHoursByPerson(function(err, body){
        if (err) {
            console.log(err);
            callback('error loading tasks', null);
        } else {
            console.log(body);
            callback(null, body);
        }
    });
};