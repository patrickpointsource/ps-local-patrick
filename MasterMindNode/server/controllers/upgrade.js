'use strict';

var _ = require('underscore');
var dataAccess = require('../data/dataAccess');
var people = require('./people');
var projects = require('./projects');
var securityRolesCtrl = require('./securityRoles');
var userRolesCtrl = require('./userRoles');
var google = require('googleapis');

var inactivePeople = [ {
	fullName : "Mike Albano",
	date : "20140627_000000"
}, {
	fullName : "Chelsea Bosworth",
	date : "20140627_000000"
}, {
	fullName : "Raj Daswani",
	date : "20140627_000000"
}, {
	fullName : "Vahe Kesoyan",
	date : "20140627_000000"
}, {
	fullName : "Vera Veramei",
	date : "20140627_000000"
}, {
	fullName : "Maksim Leshkevich",
	date : "20140627_000000"
}, {
	fullName : "Lorrie Garbarz",
	date : "20140627_000000"
}, {
	fullName : "Caroline Lewis",
	date : "20140627_000000"
}, {
	fullName : "Phil List",
	date : "20140627_000000"
}, {
	fullName : "Melissa Lyon",
	date : "20140627_000000"
}, {
	fullName : "Ben Schell",
	date : "20140627_000000"
} ];

var SERVICE_ACCOUNT_EMAIL = '141952851027-1u88oc96rik8l6islr44ha65o984tn3q@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = 'server/cert/key.pem';
var SERVICE_SCOPE = [
		'https://www.googleapis.com/auth/admin.directory.user.readonly',
		'https://www.googleapis.com/auth/admin.directory.user.readonly' ];
var APP_ACCOUNT_EMAIL = 'psapps@pointsourcellc.com';

module.exports.executeUpgrade = function(callback) {

	syncPeople(function(err, resp) {
		if (err) {
			console.log("Error while sync people: " + err);
		}

		migrateServicesEstimate(function(err, body) {
			if (!err) {
				console.log("Error while migrating service estimates: " + err);
			}

			removeProjectEstimateFields(function(err, body) {
				if (!err) {
					console
							.log("Error while removing project estimate fields: "
									+ err);
				}
				markInactivePeople(function(err, body) {
					if (!err) {
						console.log("Error while marking inactive people: "
								+ err);
					}

					fixSecurityRolesIds(function(err, body) {
						callback(null, null);
					});

				});
			});
		});

	});

};

var syncPeople = function(callback) {

	getGoogleProfiles(function(err, profiles) {
		if (err) {
			console.log("Error while getting google profiles: " + err);
		} else {
			_.each(profiles.users, function(profile) {
				var person = {};
				people.getPersonByGoogleId(profile.id, function(err, result) {
					if (!err) {
						if (result) {
							person = result;
						}
					}
					if (result == null || (result && result.isActive)) {
						updatePerson(person, profile);
					}
				});

			});

		}
	});
	callback(null, null);

};

var updatePerson = function(person, googleProfile) {

	var hasChanges = person.googleId != googleProfile.id
			|| person.mBox != googleProfile.primaryEmail
			|| (person.name && person.name.fullName != googleProfile.name.fullName)
			|| (googleProfile.thumbnailPhotoUrl && person.thumbnail != googleProfile.thumbnailPhotoUrl);
	if (hasChanges) {
		// profile.type = 'Google';
		person.googleId = googleProfile.id;
		person.mBox = googleProfile.primaryEmail;
		person.name = googleProfile.name;
		if (googleProfile.thumbnailPhotoUrl) {
			person.thumbnail = googleProfile.thumbnailPhotoUrl;
		}
		upgradeNameProperties(person);
		people.insertPerson(person, function(err, resp) {
			if (err) {
				console.log("Synchronization error'" + err + "' for user "
						+ person.name.fullName);
			} else {
				console.log("User'" + person.name.fullName
						+ "' has been synchronized with google profile");
			}
		});
	}
};

var upgradeNameProperties = function(obj) {
	if (obj.givenName) {
		delete obj.givenName;
		delete obj.familyName;
	}
};

var getGoogleProfiles = function(callback) {

	var authClient = new google.auth.JWT(SERVICE_ACCOUNT_EMAIL,
			SERVICE_ACCOUNT_KEY_FILE, null, SERVICE_SCOPE, APP_ACCOUNT_EMAIL);

	google.discover('admin', 'directory_v1').execute(function(err, client) {

		authClient.authorize(function(err, result) {
			if (err) {
				callback(err, null);
			}

			client.admin.users.list({
				"domain" : "pointsource.com",
				"maxResults" : 500
			// Default is 100. Maximum is 500.
			}).withAuthClient(authClient).execute(function(err, result) {
				callback(err, result);
			});

		});
	});
};

var getGoogleProfile = function(googleId, callback) {

	var authClient = new google.auth.JWT(SERVICE_ACCOUNT_EMAIL,
			SERVICE_ACCOUNT_KEY_FILE, null, SERVICE_SCOPE, APP_ACCOUNT_EMAIL);

	google.discover('admin', 'directory_v1').execute(function(err, client) {

		authClient.authorize(function(err, result) {
			if (err) {
				callback(err, null);
			}

			client.admin.users.get({
				"userKey" : googleId,
			}).withAuthClient(authClient).execute(function(err, result) {
				callback(err, result);
			});
		});
	});
};

var migrateServicesEstimate = function(callback) {
	projects.listProjects(null, function(err, body) {
		if (err) {
			callback('error loading projects', null);
		} else {
			var projectMembers = body.data;
			_.each(projectMembers, function(project) {
				if (project.terms.servicesEstimate) {
					delete project.terms.servicesEstimate;
					project.terms.fixedBidServicesRevenue = true;
					projects.insertProject(project, function(err, res) {
						if (err) {
							console.log(err);
						}
					});
				}
			});
			callback(null, body);
		}
	});
};

var removeProjectEstimateFields = function(callback) {
	projects.listProjects(null, function(err, body) {
		if (err) {
			callback('error loading projects', null);
		} else {
			var projectMembers = body.data;
			_.each(projectMembers, function(project) {
				if (project.estimatedTotal) {
					delete project.estimatedTotal;
					projects.insertProject(project, function(err, res) {
						if (err) {
							console.log(err);
						}
					});
				}
			});
			callback(null, body);
		}
	});
};

var fixSecurityRolesIds = function(callback) {
	securityRolesCtrl.listSecurityRoles({}, function(err, body) {
		var securityRoles = body.members;

		userRolesCtrl.listUserRoles({}, function(err, body) {
			var userRoles = body.members;
			var anyFound = false;
			var roleName;
			var role;
			var countUpdated = 0;
			var countNeedsTobeUpdated = userRoles.length;
			var updateFn = [];
			var updateInd = 0;

			for (var i = 0; i < userRoles.length; i++) {
				anyFound = false;

				for (var j = 0; j < userRoles[i].roles.length; j++) {
					if (_.isString(userRoles[i].roles[j])) {
						anyFound = true;
						roleName = userRoles[i].roles[j];

						role = _.find(securityRoles, function(r) {
							if (r.name.toLowerCase() == roleName.toLowerCase())
								return true;
						})

						if (role)
							userRoles[i].roles[j] = {
								name : roleName,
								resource : role.resource
							}
					}
				}

				if (!anyFound)
					countNeedsTobeUpdated -= 1;

				else
					updateFn.push(_.bind(function() {
						userRolesCtrl.insertUserRoles(userRoles[this.ind],
								function(err) {
									if (!err)
										countUpdated += 1;

									updateInd += 1;

									if (countUpdated == countNeedsTobeUpdated) {
										console.log('All userRoles updated');
										callback(err, body);
									} else if (updateFn[updateInd])
										updateFn[updateInd]();

								});
					}, {
						ind : i
					}));

				
			}
			

			if (updateFn[0])
				updateFn[0]();

		});

	});
};

var markInactivePeople = function(callback) {

	var names = [];
	for (var i = 0; i < inactivePeople.length; i++) {
		names[i] = {
			name : inactivePeople[i].fullName
		};
	}

	var query = {
		$or : names
	};
	people.listPeople(query, function(err, body) {
		if (err) {
			callback('error loading people', null);
		} else {
			var peopleMembers = body.members;
			_.each(peopleMembers, function(person) {
				getInactivePersonByName(person.name, function(result) {
					if (result) {
						person.isActive = 'false';
						person.lastSychronized = result.date;
						people.insertPerson(person, function(err, res) {
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
	callback(null);
};
