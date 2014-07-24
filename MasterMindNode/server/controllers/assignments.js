'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listAssignments = function(q, callback) {
    dataAccess.listAssignments(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading assignments', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.getAssignment = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error get assignment', null);
        } else {
            callback(null, body);
        }
    });
};