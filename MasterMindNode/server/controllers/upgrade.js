'use strict';

var _ = require('underscore');
var dataAccess = require('../data/dataAccess');
var people = require('./people');
var projects = require('./projects');
var securityRolesCtrl = require('./securityRoles');
var userRolesCtrl = require('./userRoles');
var google = require('googleapis');
var security = require( '../util/security' );

var DEFAULT_PROFILE_IMG_LINK = "https://ssl.gstatic.com/s2/profiles/images/silhouette200.png";

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

module.exports = function(params) {
	
	var SERVICE_ACCOUNT_EMAIL = params.accountEmail;
	var SERVICE_ACCOUNT_KEY_FILE = params.privateKeyPath;

	var SERVICE_SCOPE = [
			'https://www.googleapis.com/auth/admin.directory.user.readonly',
			'https://www.googleapis.com/auth/admin.directory.user.readonly' ];
	var APP_ACCOUNT_EMAIL = 'psapps@pointsourcellc.com';
	
	module.exports.executeUpgrade = function(callback) {
	
		syncPeople(function(err, resp) {
			if (err) {
				console.log("Error while sync people: " + err);
			} else {
			  console.log("Upgrade: People sync-ed");
			}
			
	
			migrateServicesEstimate(function(err, body) {
				if (err) {
					console.log("Error while migrating service estimates: " + err);
				} else {
	              console.log("Upgrade: Services estimates migrated.");
	            }
	
				removeProjectEstimateFields(function(err, body) {
					if (err) {
						console.log("Error while removing project estimate fields: " + err);
					} else {
	                  console.log("Upgrade: Project estimates fields removed.");
	                }
					markInactivePeople(function(err, body) {
						if (err) {
						    console.log("Error while marking inactive people: " + err);
						} else {
	                      console.log("Upgrade: Inactive people marked.");
	                    }
	
						fixSecurityRolesIds(function(err, body) {
						    if (err) {
	                          console.log("Error while fixing security roles id's: " + err);
	                        } else {
	                          console.log("Upgrade: Security(User) Roles fixed.");
	                        }
						    security.createDefaultRoles(function(err, isOk) {
						        if(err) {
						            console.log(err);
						        } else {
	                              console.log("Upgrade: Default security roles created.");
						        }
						        
						        security.initialize(true);
						        addReportResourceInSecurityRole(function (err, body) {
							        if(err) {
							            console.log(err);
							        } else {
		                              console.log("Upgrade: Report resource added to security roles.");
							        }
							        
							        fixLinksInProjects(function (err, body) {
								        if(err) {
								            console.log(err);
								        } else {
			                              console.log("Upgrade: Links in projects fixed.");
								        }
							        	
							        	callback(null, null);
							        });

						        });
						    });
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
					var person = {isActive : 'true' };
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
				|| (!person.thumbnail || person.thumbnail != googleProfile.thumbnailPhotoUrl);
		if (hasChanges) {
			// profile.type = 'Google';
			person.googleId = googleProfile.id;
			person.mBox = googleProfile.primaryEmail;
			person.name = googleProfile.name;
			if (googleProfile.thumbnailPhotoUrl) {
				person.thumbnail = googleProfile.thumbnailPhotoUrl;
			} else {
				person.thumbnail =  DEFAULT_PROFILE_IMG_LINK;				
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
		projects.listProjects(null, null, function(err, body) {
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
		projects.listProjects(null, null, function(err, body) {
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
	
	var addReportResourceInSecurityRole = function (callback) {
		var reportsResource = {name : "reports", permissions : ["viewReports"]};
		dataAccess.listSecurityRoles({}, function(err, body) {
			var securityRoles = body.members;
			for (var i = 0; i < securityRoles.length; i++) {
				var securityRole = securityRoles[i];
			    var hoursResource = _.findWhere(securityRole.resources, { name: "hours"});
			    var isReportResourceExists = _.findWhere(securityRole.resources, {name : "reports"} );
			    var isViewHoursReportsAndCSV = _.findWhere(hoursResource.permissions, "viewHoursReportsAndCSV");
			    if ( isViewHoursReportsAndCSV && !isReportResourceExists) {
			    	securityRole.resources.push(reportsResource);
			    	dataAccess.insertItem(securityRole._id, securityRole, dataAccess.SECURITY_ROLES_KEY, function (err, body) {
			    		if (err) {
			    			console.log(err);
			    		}
			    	});
			    }
			}
			callback(null, body);
		});
	};
	
	var fixLinksInProjects = function (callback) {
		projects.listProjects(null, null, function(err, body) {
			if (err) {
				callback('error loading projects', null);
			} else {
				var projectMembers = body.data;
				_.each(projectMembers, function(project) {
					
					dataAccess.listLinksByProject(project.resource, function (err, result) {
						if (err) {
			    			console.log(err);
						} else 
						if (result.members && result.members[0]) {
							var linksObject;
							var members = [];
							var initialMembers;
							var index = 0;
							if (result.members.length > 1) {
								linksObject = { project : project };
								linksObject.form = "Links";
								initialMembers = result.members;
							}
							else if (result.members.length == 1){
								var linksObject = result.members[0];
								if (linksObject.members) {
									initialMembers = linksObject.members;
								}
								else {
									linksObject = { project : project };
									linksObject.form = "Links";
									initialMembers = result.members;
								}
							}
							_.each(initialMembers, function(link) {
								link.index = index++;
								members.push(link);
								if (link._id && link._rev) {
									dataAccess.deleteItem(link._id, link._rev, 'Links', function (err, body) {
										if (err) {
											console.log(err);
										}
									})
								}
							});

							linksObject.members = members;
							dataAccess.insertItem(linksObject._id, linksObject, 'Links', function (err, body){
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
	}
	
	var fixSecurityRolesIds = function(callback) {
		dataAccess.listSecurityRoles({}, function(err, body) {
			var securityRoles = body.members;
	
			dataAccess.listUserRoles({}, null, function(err, body) {
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
							});
	
							if (role)
								userRoles[i].roles[j] = {
									name : roleName,
									resource : role.resource
								};
						}
					}
	
					if (!anyFound)
						countNeedsTobeUpdated -= 1;
	
					else
						updateFn.push(_.bind(function() {
							dataAccess.insertItem(userRoles[this.ind].id, userRoles[this.ind], dataAccess.USER_ROLES_KEY,
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
				
	
				if (updateFn[0]) {
					updateFn[0]();
				} else {
				  callback();
				}
	
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
		people.listPeople(query, null, function(err, body) {
			if (err) {
				callback('error loading people', null);
			} else {
				var peopleMembers = body.members;
				_.each(peopleMembers, function(person) {
					getInactivePersonByName(person.name, function(result) {
						if (result) {
							person.isActive = 'false';
							person.lastSynchronized = result.date;
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
};
