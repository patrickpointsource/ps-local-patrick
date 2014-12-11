'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var util = require('../util/util');
var _ = require( 'underscore' );
var validation = require( '../data/validation.js' );
var assignments = require( '../controllers/assignments.js' );

var listProjects = function(query, fields, callback) {
    dataAccess.listProjects(query, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading projects', null);
        } else {
            callback(null, body);
        }
    });
};


var listProjectsByExecutiveSponsor = function(executiveSponsor, fields, callback) {
    dataAccess.listProjectsByExecutiveSponsor(executiveSponsor, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsByExecutiveSponsor', null);
        } else {
            callback(null, body);
        }
    });
};

var listProjectsBetweenDatesByTypesAndSponsors = function(startDate, endDate, types, isCommited, roleResources, fields, callback) {
    dataAccess.listProjectsBetweenDatesByTypesAndSponsors(startDate, endDate, types, isCommited, roleResources, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsBetweenDatesByTypesAndSponsors', null);
        } else {
            var result = body.data;
            callback(null, body);
        }
    });
};

var listProjectsByStatuses = function(statuses, fields, callback) {
    dataAccess.listProjectsByStatuses(statuses, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsByStatuses', null);
        } else {
            callback(null, body);
        }
    });
};


var listProjectsByResources = function(resources, fields, callback) {
    dataAccess.listProjectsByResources(resources, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsByResources', null);
        } else {
            callback(null, body);
        }
    });
};

var listCurrentProjectsByPerson = function(resource, fields, callback) {

	dataAccess.listCurrentProjectsByPerson( resource, fields, function( err, projects ) {
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
	
	listLinksByProject(id, function (err, result){
		if (err) {
            console.log(err);
            callback('error add project link', null);
		} else {
			var linksObject;
			var index = 0;
			if (result && result.members) {
				linksObject = result.members[0];
				index = (linksObject.members && linksObject.members.length > 0) ? (linksObject.members[linksObject.members.length - 1].index + 1) : 0;
			}
			else {
				linksObject = {project : { resource : "projects/" + id }};
				linksObject.members = [];
			}
			linksObject.members.push({url : obj.url, label : obj.label, icon : obj.icon, index : index});
			
		    dataAccess.insertItem(linksObject._id, linksObject, dataAccess.LINKS_KEY, function(err, body){
		        if (err) {
		            console.log(err);
		            callback('error insert project link', null);
		        } else {
		            callback(null, body);
		        }
		    });
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

var deleteProjectLink = function(projectId, linkIndex, callback) {
	
	listLinksByProject(projectId, function (err, result){
		if (err) {
            console.log(err);
            callback('error list project links', null);
		} else {
			var linksObject = result.members[0];
			_.each(linksObject.members, function(link, initialIndex) {
				if (link.index == linkIndex) {
					linksObject.members = _.without (linksObject.members, link);					
				}
			});
		    dataAccess.insertItem(linksObject._id, linksObject, dataAccess.LINKS_KEY, function(err, body){
		        if (err) {
		            console.log(err);
		            callback('error delete project link', null);
		        } else {
		            callback(null, body);
		        }
		    });
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

var insertProjectLink = function(projectId, linkIndex, obj, callback) {
    var validationMessages = validation.validate(obj, dataAccess.LINKS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
	listLinksByProject(projectId, function (err, result){
		if (err) {
            console.log(err);
            callback('error list project links', null);
		} else {
			var linksObject = result.members[0];
			_.each(linksObject.members, function(link, initIndex) {
				if (link.index == linkIndex) {
					linksObject.members[initIndex] = obj;
				}
			});

		    dataAccess.insertItem(linksObject._id, linksObject, dataAccess.LINKS_KEY, function(err, body){
		        if (err) {
		            console.log(err);
		            callback('error insert project link', null);
		        } else {
		            callback(null, body);
		        }
		    });
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
