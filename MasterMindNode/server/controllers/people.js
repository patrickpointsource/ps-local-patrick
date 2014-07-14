'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listPeople = function(query, callback) {
    dataAccess.listPeople(query, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading people', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};