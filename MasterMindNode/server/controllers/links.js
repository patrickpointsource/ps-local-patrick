'use strict';

var dataAccess = require('../data/dataAccess');
var winston = require('winston');
//12/11/14 MM var validation = require( '../data/validation.js' );

module.exports.listLinks = function(callback) {
    dataAccess.listLinks(function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading links', null);
        } else {
            //winston.info(body);
            callback(null, body);
        }
    });
};

module.exports.insertLink = function(obj, callback) {
    
	//12/11/14 MM     var validationMessages = validation.validate(obj, dataAccess.LINKS_KEY);
	//12/11/14 MM     if(validationMessages.length > 0) {
	//12/11/14 MM       callback( validationMessages.join(', '), {} );
	//12/11/14 MM     }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.LINKS_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback('error insert link', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteLink = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.LINKS_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getLink = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            winston.info(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};