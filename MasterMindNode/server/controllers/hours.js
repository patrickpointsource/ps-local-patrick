'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var projects = require('./projects.js');
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
    
    // get name for person
	people.getNameByResource(obj.person.resource, function (err, personName) {		
		if (!err) {
			obj.person.name = personName;
		}
		console.log("personName=" + personName);
	    // get name for project
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
		            callback(null, _.extend(obj, body));
		        }
		    });
		});
		
	});

};

module.exports.updateHours = function(id, obj, callback) {
    console.log('update hours entry:' + JSON.stringify(obj));
    
    dataAccess.updateItem(obj._id, obj, dataAccess.HOURS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error update hours', null);
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
