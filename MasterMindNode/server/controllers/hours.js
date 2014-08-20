'use strict';

var dataAccess = require('../data/dataAccess');
var _ = require('underscore');

module.exports.listHours = function(q, callback) {
    dataAccess.listHours(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};



module.exports.insertHours = function(obj, callback) {
    obj.form = "Hours";
    console.log('create hours entry:' + JSON.stringify(obj));
    
    dataAccess.insertItem(obj._id, obj, dataAccess.HOURS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert hours', null);
        } else {
            callback(null, _.extend(obj, body));
        }
    });
};

module.exports.deleteHours = function(id, obj, callback) {
    dataAccess.deleteItem(id, obj._rev, dataAccess.HOURS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error delete hours', null);
        } else {
            callback(null, body);
        }
    });
};
