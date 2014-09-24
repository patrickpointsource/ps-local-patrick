'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var util = require('../util/util');
var _ = require( 'underscore' );

var listProjects = function(query, callback) {
    dataAccess.listProjects(query, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading projects', null);
        } else {
            var result = body.data;
            for (var i in result) {
       		    result[i].resource = "projects/" + result[i]._id;
        		result[i].about = "projects/" + result[i]._id;
            }
            callback(null, body);
        }
    });
};


var listProjectsByExecutiveSponsor = function(executiveSponsor, callback) {
    dataAccess.listProjectsByExecutiveSponsor(executiveSponsor, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsByExecutiveSponsor', null);
        } else {
            var result = body.data;
            for (var i in result) {
       		    result[i].resource = "projects/" + result[i]._id;
        		result[i].about = "projects/" + result[i]._id;
            }
            callback(null, body);
        }
    });
};

var listProjectsBetweenDatesByTypesAndSponsors = function(startDate, endDate, types, isCommited, roleResources, callback) {
    dataAccess.listProjectsBetweenDatesByTypesAndSponsors(startDate, endDate, types, isCommited, roleResources, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsBetweenDatesByTypesAndSponsors', null);
        } else {
            var result = body.data;
            body.about = "projects";
            for (var i in result) {
       		    result[i].resource = "projects/" + result[i]._id;
        		result[i].about = "projects/" + result[i]._id;
            }
            callback(null, body);
        }
    });
};

var listProjectsByStatuses = function(statuses, callback) {
    dataAccess.listProjectsByStatuses(statuses, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsByStatuses', null);
        } else {
            var result = body.data;
            body.about = "projects";
            for (var i in result) {
       		    result[i].resource = "projects/" + result[i]._id;
        		result[i].about = "projects/" + result[i]._id;
            }
            callback(null, body);
        }
    });
};

var listCurrentProjectsByPerson = function(resource, callback) {

	listAssignmentsByPerson( resource, function( err, assignments ) {
		if( err ) {
			callback( err, null );
		} else {
									
			var currentProjects = [];
			listProjectsByStatuses("unfinished", function( err, unfinishedProjects ) {
				if( err ) {
					callback( err, null );
				} else {
					_.each(unfinishedProjects, function (project){
						checkProjectForAssignmentsAndPerson(project, assignments, resource, function (checked) {
							if (checked) {
								currentProjects.push(project);
							}
						});							
					});
				}
			} );
										
			callback(null, currentProjects );
		}
	} );
};

var checkProjectForAssignmentsAndPerson = function(project, assignments, personResource, callback) {

	// checks for project in assignments
	_.each(assignments, function (assignment) {

		if (assignment.project && 
					assignment.project.resource == project.resource ) {
			callback(true);
		}
	});

	// checks whether required user is executive sponsor
	if (project.executiveSponsor &&
			project.executiveSponsor.resource == personResource ) {
		callback(true);
	}

	// checks whether required user is sales sponsor
	if (project.salesSponsor &&
			project.salesSponsor.resource == personResource ) {
		callback(true);
	}
	
	// if found nothing returns false
	callback(false)
}

var getProject = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
   		    body.resource = "projects/" + body._id;
       		body.about = "projects/" + body._id;
            callback(null, body);
        }
    });
};

var addProjectLink = function(id, obj, callback) {
	obj.project.resource = "projects/" + id;
    dataAccess.insertItem(obj._id, obj, dataAccess.Links, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert skill', null);
        } else {
            callback(null, body);
        }
    });
};


var listLinks = function(id, query, callback) {
    dataAccess.listLinks(query, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading links by project', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });

};

var listAssignments = function(id, callback) {
	
	//TODO filter by project id
	
    dataAccess.listAssignments(query, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading assignments by project', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });

};


var listAssignmentsByPerson = function(resource, callback) {
	
    dataAccess.listAssignments(null, function(err, result){
        if (err) {
            console.log(err);
            callback('error loading assignments by person', null);
        } else {
			var assignments = [];
			_.each(result.data, function(assignment){
				if (assignment.person && 
						assignment.person.resource && 
							assignment.person.resource == resource ) {
						assignments.push(assignment);
				}
			});
			
            callback(null, assignments);
        }
    });

};

var listRoles = function(callback) {

	//TODO filter by project id

    dataAccess.listRoles(null, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading roles', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

var getRole = function(projectId, roleId, callback) {
    dataAccess.getItem(roleId, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

var insertAssignment = function(projectId, obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.ASSIGNMENTS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert assignment into project', null);
        } else {
            callback(null, body);
        }
    });
};

var deleteProject = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.PROJECTS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

var deleteProjectLink = function(projectId, linkId, obj, callback) {
    dataAccess.deleteItem(linkId, null, dataAccess.LINKS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};



var insertProject = function(obj, callback) {
	
	// get name for executiveSponsor person
	people.getNameByResource(obj.executiveSponsor.resource, function (err, executiveSponsorName) {		
		if (!err) {
			obj.executiveSponsor.name = executiveSponsorName;
		}

		// get name for created person
		people.getNameByResource(obj.created.resource, function (err, createdName) {
			if (!err) {
				obj.created.name = createdName;
			}

			// get name for modified person
			people.getNameByResource(obj.modified.resource, function (err, modifiedName) {
				if (!err) {
					obj.modified.name = modifiedName;
				}
				
				// insert project
			    dataAccess.insertItem(obj._id, obj, dataAccess.PROJECTS_KEY, function(err, body){
			        if (err) {
			            console.log(err);
			            callback('error insert project', null);
			        } else {
			            callback(null, body);
			        }
			    });
				
			});
			
		});
		
	});
	
};

var insertProjectLink = function(projectId, linkId, obj, callback) {
	obj._id = linkId;
    dataAccess.insertItem(obj._id, obj, dataAccess.LINKS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert project', null);
        } else {
            callback(null, body);
        }
    });
};

var getNameByResource = function(resource, callback) {
	if (!resource) {
		callback('No resource', null);
	}
	else {
		util.getIDfromResource(resource, function (err, ID) {
			if (err) {
				callback (err, null);
			}
			else {
				dataAccess.getItem(ID, function(err, item) {
					if (!err) {
						callback(null, item.name);
					}
					else {
						callback(err, null);
					}
				});
			}
		});
	}
			
};

module.exports.listProjects = listProjects;
module.exports.listProjectsByExecutiveSponsor = listProjectsByExecutiveSponsor;
module.exports.listProjectsBetweenDatesByTypesAndSponsors = listProjectsBetweenDatesByTypesAndSponsors;
module.exports.listProjectsByStatuses = listProjectsByStatuses;
module.exports.listCurrentProjectsByPerson = listCurrentProjectsByPerson;
module.exports.getProject = getProject;
module.exports.addProjectLink = addProjectLink;
module.exports.listLinks = listLinks;
module.exports.listAssignments = listAssignments;
module.exports.listAssignmentsByPerson = listAssignmentsByPerson;
module.exports.listRoles = listRoles;
module.exports.getRole = getRole;
module.exports.insertAssignment = insertAssignment;
module.exports.deleteProject = deleteProject;
module.exports.deleteProjectLink = deleteProjectLink;
module.exports.insertProject = insertProject;
module.exports.insertProjectLink = insertProjectLink;
module.exports.getNameByResource = getNameByResource;
