'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var util = require('../util/util');

module.exports.listProjects = function(query, callback) {
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


module.exports.listProjectsByExecutiveSponsor = function(executiveSponsor, callback) {
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

module.exports.listProjectsBetweenDatesByTypesAndSponsors = function(startDate, endDate, types, isCommited, roleResources, callback) {
    dataAccess.listProjectsBetweenDatesByTypesAndSponsors(startDate, endDate, types, isCommited, roleResources, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading listProjectsBetweenDatesByTypesAndSponsors', null);
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


module.exports.getProject = function(id, callback) {
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

module.exports.addProjectLink = function(id, obj, callback) {
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


module.exports.listLinks = function(id, query, callback) {
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

module.exports.listAssignments = function(id, callback) {
	
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

module.exports.listRoles = function(callback) {

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

module.exports.getRole = function(projectId, roleId, callback) {
    dataAccess.getItem(roleId, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertAssignment = function(projectId, obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.ASSIGNMENTS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert assignment into project', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteProject = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.PROJECTS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteProjectLink = function(projectId, linkId, obj, callback) {
    dataAccess.deleteItem(linkId, null, dataAccess.LINKS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};



module.exports.insertProject = function(obj, callback) {
	
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

module.exports.insertProjectLink = function(projectId, linkId, obj, callback) {
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

module.exports.getNameByResource = function(resource, callback) {
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
