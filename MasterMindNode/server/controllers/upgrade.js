'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people');
var projects = require('./projects');

var inactivePeople = [
	{fullName : "Mike Albano", date: "20140627_000000"},
	{fullName : "Chelsea Bosworth", date: "20140627_000000"},
	{fullName : "Raj Daswani", date: "20140627_000000"},
	{fullName : "Vahe Kesoyan", date: "20140627_000000"},
	{fullName : "Vera Veramei", date: "20140627_000000"},
	{fullName : "Maksim Leshkevich", date: "20140627_000000"},
	{fullName : "Lorrie Garbarz", date: "20140627_000000"},
	{fullName : "Caroline Lewis", date: "20140627_000000"},
	{fullName : "Phil List", date: "20140627_000000"},
	{fullName : "Melissa Lyon", date: "20140627_000000"},
	{fullName : "Ben Schell", date: "20140627_000000"}
];
						
						
module.exports.executeUpgrade = function(callback) {
	migrateServicesEstimate(function(err, body) {
		if (!err) {
			removeProjectEstimateFields(function (err, body) {
				if (!err) {
					markInactivePeople(callback);
				}
			});
		}	
	});
	
};


var migrateServicesEstimate = function(callback) {
	projects.listProjects(null, function(err, body){
        if (err) {
            callback('error loading projects', null);
        } else {
        	var projectMembers = body.data;
        	projectMembers.forEach(function(project) {
        		if (project.terms.servicesEstimate) {
        			delete project.terms.servicesEstimate;
        			project.terms.fixedBidServicesRevenue = true;
					projects.insertProject(project, function (err, res) {
						if (err) {
							console.log(err);
						}
					});
        		}
        	})
            callback(null, body);
		}
	});
};

var removeProjectEstimateFields = function(callback) {
	projects.listProjects(null, function(err, body){
        if (err) {
            callback('error loading projects', null);
        } else {
        	var projectMembers = body.data;
        	projectMembers.forEach(function(project) {
        		if (project.estimatedTotal) {
        			delete project.estimatedTotal;
					projects.insertProject(project, function (err, res) {
						if (err) {
							console.log(err);
						}
					});
        		}
        	})
            callback(null, body);
		}
	});
};


var markInactivePeople = function(callback) {

	var names = [];
	for(var i = 0; i < inactivePeople.length; i++) {
		names[i] = {name:inactivePeople[i].fullName};
	}
	
	
	var query = { $or: names };
	people.listPeople(query, function(err, body){
        if (err) {
            callback('error loading people', null);
        } else {
        	var peopleMembers = body.members;
        	peopleMembers.forEach(function(person) {
				getInactivePersonByName(person.name, function (result) {
					if (result) {
						person.isActive = 'false';
						person.lastSychronized = result.date;
						people.insertPerson(person, function (err, res) {
							if (err) {
								console.log(err);
							}
						});
					}
				});
			});
            callback(null, body);
        }
    });
    
};


var getInactivePersonByName = function(name, callback) {
   	inactivePeople.forEach(function(person) {
		if (person.fullName == name) {
			callback(person);
		}
	});
	callback(null)
};
