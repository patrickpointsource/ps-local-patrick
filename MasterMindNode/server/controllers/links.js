'use strict';

var dataAccess = require('../data/dataAccess');
var validation = require( '../data/validation.js' );

module.exports.listLinks = function(q, callback) {
    dataAccess.listLinks(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading links', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.insertLink = function(obj, callback) {
    
    var validationMessages = validation.validate(obj, dataAccess.LINKS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.LINKS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert link', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteLink = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.LINKS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getLink = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};