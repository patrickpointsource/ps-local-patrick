'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var util = require('../util/util');
var _ = require( 'underscore' );
var validation = require( '../data/validation.js' );
var assignments = require( '../controllers/assignments.js' );

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


var listProjectsByResources = function(resources, callback) {
    dataAccess.listProjectsByResources(resources, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsByResources', null);
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

	dataAccess.listCurrentProjectsByPerson( resource, function( err, projects ) {
		if( err ) {
			callback( err, null );
		} else {
			callback(null, projects );
		}
	} );
	
};


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
    if(!obj.project) {
      obj.project = {};
    }
	obj.project.resource = "projects/" + id;
    dataAccess.insertItem(obj._id, obj, dataAccess.LINKS_KEY, function(err, body){
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
            callback('error loading links', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });

};


var listLinksByProject = function(id, callback) {
	
    dataAccess.listLinksByProject( util.getFullID(id, 'projects'), function(err, body){
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
	
	assignments.listAssignments(query, function(err, body){
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
	
	assignments.listAssignmentsByPersonResource(resource, function(err, result){
        if (err) {
            console.log(err);
            callback('error loading assignments by person', null);
        } else {			
            callback(null, result);
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

var insertAssignment = function(assignmentId, obj, callback) {
    assignments.insertAssignment(assignmentId, obj, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert assignment into project', null);
        } else {
            callback(null, body);
        }
    });
};

var deleteProject = function (obj, callback) {
    getProject(obj._id, function(projErr, project) {
        if (projErr) {
            callback(projErr, null);
        } else {
            assignments.getProjectAssignment(project, function (assignmentErr, assignment) {
                if (assignmentErr) {
                    callback(assignmentErr, null);
                } else {
                    dataAccess.deleteItem(assignment._id, assignment._rev, dataAccess.ASSIGNMENTS_KEY, function (deleteAssignmentErr, deleteAssignemntBody) {
                        if (assignmentErr) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            dataAccess.deleteItem(obj._id, obj._rev, dataAccess.PROJECTS_KEY, function (err, body) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    callback(null, body + " " + deleteAssignemntBody);
                                }
                            });
                        }
                    });
                }
            });
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
	
	var validationMessages = validation.validate(obj, dataAccess.PROJECTS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
	
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
				
				var isNew = !obj._id;
				
				// insert project
			    dataAccess.insertItem(obj._id, obj, dataAccess.PROJECTS_KEY, function(err, body){
			        if (err) {
			            console.log(err);
			            callback('error insert project', null);
			        } else {
			        	if (!isNew)
			        		callback(null, body);
			        	else {
			        		obj._id = body.id;
			        		
			        		callback(null, _.extend(obj, body));
			        	}
			        }
			    });
				
			});
			
		});
		
	});
	
};

var insertProjectLink = function(projectId, linkId, obj, callback) {
    var validationMessages = validation.validate(obj, dataAccess.LINKS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
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

// main project functions
module.exports.listProjects = listProjects;
module.exports.listProjectsByExecutiveSponsor = listProjectsByExecutiveSponsor;
module.exports.listProjectsBetweenDatesByTypesAndSponsors = listProjectsBetweenDatesByTypesAndSponsors;
module.exports.listProjectsByStatuses = listProjectsByStatuses;
module.exports.listProjectsByResources = listProjectsByResources;
module.exports.listCurrentProjectsByPerson = listCurrentProjectsByPerson;
module.exports.getProject = getProject;
module.exports.deleteProject = deleteProject;

// project links functions
module.exports.listLinks = listLinks;
module.exports.listLinksByProject = listLinksByProject;
module.exports.addProjectLink = addProjectLink;
module.exports.insertProject = insertProject;
module.exports.insertProjectLink = insertProjectLink;
module.exports.deleteProjectLink = deleteProjectLink;

// project assignments functions
module.exports.listAssignments = listAssignments;
module.exports.listAssignmentsByPerson = listAssignmentsByPerson;
module.exports.insertAssignment = insertAssignment;

// project roles functions
module.exports.listRoles = listRoles;
module.exports.getRole = getRole;

// common project functions
module.exports.getNameByResource = getNameByResource;
