var dbAccess = require('../data/dbAccess.js');
var memoryCache = require('../data/memoryCache.js');

var config = require('../config/config.js');

var PROJECTS_KEY = 'Projects';
var PEOPLE_KEY = 'People';
var ASSIGNMENTS_KEY = 'Assignments';
var TASKS_KEY = 'Tasks';
var ROLES_KEY = 'Roles';

var listProjects = function(callback) {

	var result = memoryCache.getObject(PROJECTS_KEY);
	if (result) {
		console.log("read " + PROJECTS_KEY + " from memory cache");
		callback(null, result);
	}
	else {
		dbAccess.listProjects(function(err, body){
		if (!err) {
			console.log("save " + PROJECTS_KEY + " to memory cache");
	    	memoryCache.putObject(PROJECTS_KEY, body);
	    }
	    callback (err, body);
		});
	}
		
};

var listPeople = function(callback) {

	var result = memoryCache.getObject(PEOPLE_KEY);
	if (result) {
		console.log("read " + PEOPLE_KEY + " from memory cache");
		callback(null, result);
	}
	else {
		dbAccess.listPeople(function(err, body){
		if (!err) {
			console.log("save " + PEOPLE_KEY + " to memory cache");
	    	memoryCache.putObject(PEOPLE_KEY, body);
	    }
	    callback (err, body);
		});
	}
		
};

var listAssignments = function(callback) {

	var result = memoryCache.getObject(ASSIGNMENTS_KEY);
	if (result) {
		console.log("read " + ASSIGNMENTS_KEY + " from memory cache");
		callback(null, result);
	}
	else {
		dbAccess.listAssignments(function(err, body){
		if (!err) {
			console.log("save " + ASSIGNMENTS_KEY + " to memory cache");
	    	memoryCache.putObject(ASSIGNMENTS_KEY, body);
	    }
	    callback (err, body);
		});
	}
		
};

var listTasks = function(callback) {

	var result = memoryCache.getObject(TASKS_KEY);
	if (result) {
		console.log("read " + TASKS_KEY + " from memory cache");
		callback(null, result);
	}
	else {
		dbAccess.listTasks(function(err, body){
		if (!err) {
			console.log("save " + TASKS_KEY + " to memory cache");
	    	memoryCache.putObject(TASKS_KEY, body);
	    }
	    callback (err, body);
		});
	}
		
};

var listRoles = function(callback) {

	var result = memoryCache.getObject(ROLES_KEY);
	if (result) {
		console.log("read " + ROLES_KEY + " from memory cache");
		callback(null, result);
	}
	else {
		dbAccess.listRoles(function(err, body){
		if (!err) {
			console.log("save " + ROLES_KEY + " to memory cache");
	    	memoryCache.putObject(ROLES_KEY, body);
	    }
	    callback (err, body);
		});
	}
		
};

var insertItem = function(id, obj, type, callback) {
	dbAccess.insertItem(id, obj, function(err, body){
		if (!err) {
			console.log("Object with id " + id + " created in db");
	    	memoryCache.deleteObject(type);
	    }
	    callback (err, body);
		});
}

var deleteItem = function(id, rev, type, callback) {
	dbAccess.deleteItem(id, rev, function(err, body){
		if (!err) {
			console.log("Object with id " + id + " deleted from db");
	    	memoryCache.deleteObject(type);
	    }
	    callback (err, body);
		});
}

var getItem = function(id , callback) {
	dbAccess.getItem(id, function(err, body){
		if (!err) {
			console.log("Read object with id " + id + " from db");
	    }
	    callback (err, body);
		});
}


module.exports.listProjects = listProjects;
module.exports.listPeople = listPeople;
module.exports.listAssignments = listAssignments;
module.exports.listTasks = listTasks;
module.exports.listRoles = listRoles;

module.exports.insertItem = insertItem;
module.exports.deleteItem = deleteItem;
module.exports.getItem = getItem;
