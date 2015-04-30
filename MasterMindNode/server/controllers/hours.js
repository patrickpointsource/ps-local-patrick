'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var projects = require('./projects.js');
var _ = require('underscore');
var winston = require('winston');
// 12/11/14 MM var validation = require( '../data/validation.js' );

module.exports.listHours = function(q, fields, callback) {
    dataAccess.listHours(q, fields,  function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByPersonAndDates = function(person, startDate, endDate, callback) {
    dataAccess.listHoursByPersonAndDates(person, startDate, endDate, function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByProjectAndDates = function(project, startDate, endDate, callback) {
    dataAccess.listHoursByProjectAndDates(project, startDate, endDate, function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByPerson = function(person, fields, callback) {
    dataAccess.listHoursByPerson(person, fields, function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByProjects = function(projects, fields, callback) {
    dataAccess.listHoursByProjects(projects, fields, function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByProjectsAndDates = function(projects, startDate, endDate, fields, callback) {
    dataAccess.listHoursByProjectsAndDates(projects, startDate, endDate, fields, function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertHours = function(obj, callback) {

    obj.form = dataAccess.HOURS_KEY;
    winston.info('create hours entry:' + JSON.stringify(obj));
    
    // get name for person
	people.getNameByResource(obj.person.resource, function (err, personName) {		
		if (!err) {
			obj.person.name = personName;
		}

	    // get name for project
	    if (obj.project && obj.project.name || obj.task)
		  dataAccess.insertItem(obj._id, obj, dataAccess.HOURS_KEY, function(err, body){
                if (err) {
                    winston.info(err);
                    callback('error insert hours:' + JSON.stringify(err), null);
                } else {
                	prepareItem(obj, body);
                    callback(null, _.extend(obj, body));
                }
            });
        else if (obj.project && obj.project.resource)
            projects.getNameByResource(obj.project.resource, function (err, projectName) {      
                if (!err) {
                    obj.project.name = projectName;
                }
                
                dataAccess.insertItem(obj._id, obj, dataAccess.HOURS_KEY, function(err, body){
                    if (err) {
                        winston.info(err);
                        callback('error insert hours:' + JSON.stringify(err), null);
                    } else {
                    	prepareItem(obj, body);
                        callback(null, _.extend(obj, body));
                    }
                });
            });
		
	});

};

module.exports.updateHours = function(id, obj, callback) {
    
    winston.info('update hours entry:' + JSON.stringify(obj));
    
    dataAccess.updateItem(obj._id, obj, dataAccess.HOURS_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback('error update hours:' + JSON.stringify(err), null);
        } else {
        	prepareItem(obj, body);
            callback(null, _.extend(obj, body));
        }
    });
};

var prepareItem = function (obj, body) {
    obj._id = body.id;
    obj._rev = body.rev;
    obj.resource = "hours/" + obj._id;
};

var prepareItem = function (obj, body) {
    obj._id = body.id;
    obj._rev = body.rev;
    obj.resource = "hours/" + obj._id;
}

module.exports.deleteHours = function(id, obj, callback) {
    dataAccess.deleteItem(id, obj._rev, dataAccess.HOURS_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback('error delete hours', null);
        } else {
            callback(null, body);
        }
    });
};
