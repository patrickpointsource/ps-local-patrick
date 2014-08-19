'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listNotifications = function(q, callback) {
    dataAccess.listNotifications(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading notifications', null);
        } else {
            callback(null, body);
        }
    });
};



module.exports.insertNotification = function(obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.NOTIFICATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert notification', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteNotification = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.NOTIFICATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error delete notification', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getNotification = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error get notification', null);
        } else {
            callback(null, body);
        }
    });
};