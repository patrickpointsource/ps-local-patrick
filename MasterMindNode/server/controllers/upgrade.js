'use strict';

var _ = require( 'underscore' );
var dataAccess = require('../data/dataAccess');
var people = require('./people');
var projects = require('./projects');
var google = require('googleapis');

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
	
	syncPeople(function (err, resp) {
		if (err) {
			console.log("Error while sync people: " + err);
		}
		
		migrateServicesEstimate(function(err, body) {
			if (!err) {
				console.log("Error while migrating service estimates: " + err);
			}	

			removeProjectEstimateFields(function (err, body) {
				if (!err) {
					console.log("Error while removing project estimate fields: " + err);
				}
				markInactivePeople(function (err, body) {
					if (!err) {
						console.log("Error while marking inactive people: " + err);
					}
					callback(null, null);
				});
			});
		});
		
	});
	
};

var syncPeople = function(callback) {
	
	getGoogleProfiles( 
		function(err, profiles) {
			if (err) {
				console.log("Error while getting google profiles: " + err);
			}
			else {
	        	_.each(profiles.users, function(profile) {
	        		var person = {};
	        		people.getPersonByGoogleId (profile.id, function (err, result) {
	        			if (!err) {
				        	var personDB = result.members.length == 1 ? result.members[0]: null;
	        				if (personDB) {
	        					person = personDB;
	        				}
	        			}
 	        			if (personDB == null || (personDB && personDB.isActive)) {
		        			//profile.type = 'Google';
		        			person.googleId = profile.id;
		        			person.mBox = profile.primaryEmail;
		        			person.name = profile.name;
		        			if (profile.thumbnailPhotoUrl) {
		        				person.thumbnail = profile.thumbnailPhotoUrl;
		        			}
		        			upgradeNameProperties(person);
		        			console.log("insert data for person");
		        			
 					        people.insertPerson(person, function (err, resp) {
 					        	if (err) {
 					        		console.log("error'" + err + "' for person " + person.name.fullName)
 					        	}
 					        	else {
 					        		console.log("User'" + person.name.fullName + "' has been updated");
 					        	}
 					        });

	        			} 
	        		});
	        		
	        	})
				
			}
		}
	);
	callback(null, null);
	
}

var upgradeNameProperties = function(obj) {
	if (obj.givenName) {
		delete obj.givenName;
		delete obj.familyName;
	}
}

var getGoogleProfiles = function(callback) {

	var authClient = new google.auth.JWT(
    '141952851027-1u88oc96rik8l6islr44ha65o984tn3q@developer.gserviceaccount.com',
    'server/cert/key.pem',
    null,
    ['https://www.googleapis.com/auth/admin.directory.user.readonly', 'https://www.googleapis.com/auth/admin.directory.user.readonly'],
    'psapps@pointsourcellc.com');

	google
	    .discover('admin', 'directory_v1')
	    .execute(function(err, client) {
	
	        authClient.authorize(function(err, result) {
	            if(err) {
	            	callback (err, null);
	            }
	
	            client.admin.users.list({
	            	"domain": "pointsource.com" 
	        	})
	                .withAuthClient(authClient)
	                .execute(function(err, result) {
	                    callback (err, result);
	            });
	        });
	    });    
}

var migrateServicesEstimate = function(callback) {
	projects.listProjects(null, function(err, body){
        if (err) {
            callback('error loading projects', null);
        } else {
        	var projectMembers = body.data;
        	_.each(projectMembers, function(project) {
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
        	_.each(projectMembers, function(project) {
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
        	_.each(peopleMembers, function(person) {
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
   	_.each(inactivePeople, function(person) {
		if (person.fullName == name) {
			callback(person);
		}
	});
	callback(null)
};
