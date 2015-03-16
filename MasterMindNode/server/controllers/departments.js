'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var util = require('../util/util');
var _ = require('underscore');

module.exports.listDepartments = function(callback) {
    dataAccess.listDepartments( function(err, body){
        if (err) {
            console.log(err);
            callback('error loading departments', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.listAvailablePeople = function(callback) {
	 dataAccess.listDepartmentsAvailablePeople( function(err, body){
        if (err) {
            console.log(err);
            callback('error loading departments', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
	 
    
};

module.exports.filterDepartments = function(code, manager, nickname, callback) {
    dataAccess.filterDepartments( code, manager, nickname, function(err, body){
        if (err) {
            console.log(err);
            callback('error filtering departments', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.insertDepartment = function(obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.DEPARTMENTS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error inserting department:' + JSON.stringify(err), null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.updateDepartment = function(id, obj, callback) {
    dataAccess.updateItem(id, obj, dataAccess.DEPARTMENTS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error update department:' + JSON.stringify(err), null);
        } else {
            callback(null, _.extend(obj, body));
        }
    });
};

module.exports.deleteDepartment = function(id, obj, callback) {
    dataAccess.deleteItem(id, obj._rev, dataAccess.DEPARTMENTS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getDepartment = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

