'use strict';

var dataAccess = require('../data/dataAccess');

var listAssignments = function(q, callback) {
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

var getAssignment = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error get assignment', null);
        } else {
            callback(null, body);
        }
    });
};

var listCurrentAssigmentsByPeople = function(callback) {
	
    dataAccess.listCurrentAssigmentsByPeople(function(err, body){
        if (err) {
            console.log(err);
            callback('error loading assignments by types :' + JSON.stringify(types), null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });

};

module.exports.listAssignments = listAssignments;
module.exports.getAssignment = getAssignment;
module.exports.listCurrentAssigmentsByPeople = listCurrentAssigmentsByPeople;
