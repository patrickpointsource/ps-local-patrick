'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var projects = require('./projects.js');
var _ = require('underscore');
var validation = require( '../data/validation.js' );

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

module.exports.listHoursByPersonAndDates = function(person, startDate, endDate, callback) {
    dataAccess.listHoursByPersonAndDates(person, startDate, endDate, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByProjectAndDates = function(project, startDate, endDate, callback) {
    dataAccess.listHoursByProjectAndDates(project, startDate, endDate, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByPerson = function(person, callback) {
    dataAccess.listHoursByPerson(person, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByProjects = function(projects, fields, callback) {
    dataAccess.listHoursByProjects(projects, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listHoursByProjectsAndDates = function(projects, startDate, endDate, fields, callback) {
    dataAccess.listHoursByProjectsAndDates(projects, startDate, endDate, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading hours', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertHours = function(obj, callback) {
    
    var validationMessages = validation.validate(obj, dataAccess.HOURS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
    obj.form = dataAccess.HOURS_KEY;
    console.log('create hours entry:' + JSON.stringify(obj));
    
    // get name for person
	people.getNameByResource(obj.person.resource, function (err, personName) {		
		if (!err) {
			obj.person.name = personName;
		}
		console.log("personName=" + personName);
	    // get name for project
	    if (obj.project && obj.project.name || obj.task)
		  dataAccess.insertItem(obj._id, obj, dataAccess.HOURS_KEY, function(err, body){
                if (err) {
                    console.log(err);
                    callback('error insert hours', null);
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
                console.log("projectName=" + projectName);
                
                dataAccess.insertItem(obj._id, obj, dataAccess.HOURS_KEY, function(err, body){
                    if (err) {
                        console.log(err);
                        callback('error insert hours', null);
                    } else {
                    	prepareItem(obj, body);
                        callback(null, _.extend(obj, body));
                    }
                });
            });
		
	});

};

module.exports.updateHours = function(id, obj, callback) {
    
    var validationMessages = validation.validate(obj, dataAccess.HOURS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
    console.log('update hours entry:' + JSON.stringify(obj));
    
    dataAccess.updateItem(obj._id, obj, dataAccess.HOURS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error update hours', null);
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
}

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
