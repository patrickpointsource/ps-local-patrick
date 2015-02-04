'use strict';

var dataAccess = require('../data/dataAccess');
var memoryCache = require('../data/memoryCache.js')
var projects = require('./projects');
var util = require('../util/util');
var _ = require( 'underscore' );
var validation = require( '../data/validation.js' );


var listAssignments = function(q, callback) {
	// Get assignments by persons
	if (q && q.members && q.members.$elemMatch && q.members.$elemMatch.person) {
		var member = q.members.$elemMatch;
		var person = member.person.resource;
		var endDate;
		var startDate;
		
		if (member.startDate) {
			var startDate = member.startDate.lt ? member.startDate.$lt : 
				member.startDate.$lte? member.startDate.$lte : null;
		}
		if (member.$or) {
			for( var i = 0; i < member.$or.length; i++ ) {
				if (member.$or[i].endDate) {
					endDate = member.$or[i].endDate.$gt ? member.$or[i].endDate.$gt : 
						member.$or[i].endDate.$gte ? member.$or[i].endDate.$gte : null;
				}
			}
		}
		listAssignmentsByPersonResourceAndTimePeriod( person, startDate, endDate,function (err, result) {
			if (!err) {
				callback(null,  dataAccess.prepareRecords( result, null, "projects/", "/assignments" ));
			}
			else {
				callback (err, null);
			}
		} );
	}
	else {
		// Get assignments by projects
		dataAccess.listAssignments(q, function(err, body){
			if (err) {
				console.log(err);
				callback('error loading assignments', null);
			} else {
				callback(null, body);
			}
		});
	}
};

var getAssignment = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error get assignment', null);
        } else {
            callback(null, body);
        }
    });
};

var getProjectAssignment = function (project, callback) {
    listAssignments({}, function (err, body) {
        if (err) {
            callback("Can't find assignment for " + project.about, null);
        } else {
            var filteredAssignments = _.filter(body.data, function(assign) {
                if (assign.project.resource == project.about) {
                    return true;
                }

                return false;
            });
            
            if (filteredAssignments.length > 0) {
                var assignment = filteredAssignments[0];

                if (assignment) {
                    callback(null, assignment);
                } else {
                    callback("Can't find assignment for " + project.about, null);
                }
            } else {
                callback("Can't find assignment for " + project.about, null);
            }
        }
    });
}

var insertAssignment = function(assignmentId, obj, callback) {
    
    var validationMessages = validation.validate(obj, dataAccess.ASSIGNMENTS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
    //TODO: Duplicate assignment check should be moved to the database
    memoryCache.deleteObject( dataAccess.ASSIGNMENTS_KEY );
    listAssignmentsByProjectResourcesAndTimePeriod(obj.project.resource, "all", function(err, assignment) {
    	dataAccess.insertItem(assignment ? assignment._id : assignmentId, obj, dataAccess.ASSIGNMENTS_KEY, function(err, body) {
    		if (err) {
    			console.log(err);
    			callback('error insert assignment into project', null);
    		} else {
    			callback(null, _.extend(obj, body));
    		}
    	});
    });
};

var listCurrentAssigments = function(callback) {
	
    dataAccess.listCurrentAssigments(function(err, listCurrentAssigments){
        if (err) {
            console.log(err);
            callback("error loading current assignments", null);
        } else {
            //console.log(body);
        	projects.listProjects(null, function (err, projectsResult) {
				if (err) {
					callback (err, null);
				}
				var projects = projectsResult.data;
				
				for( var index in listCurrentAssigments ) {
					var assignments = listCurrentAssigments[ index ];
					//Collate projects with assignments
					for( var i = 0; i < assignments.length; i++ ) {
						var assignment = assignments[ i ];

						//Find the matching project
						for( var j = 0; j < projects.length; j++ ) {
							var project = projects[ j ];
							if( assignment.project && project.resource == assignment.project.resource ) {
								assignment.project = project;
								break;
							}
						}
					}
				}

				callback(null, listCurrentAssigments);

			});
        }
    });

};

var listAssignmentsByPersonResource = function(resource, callback) {
	dataAccess.listAssignmentsByPerson(personResource, function(err, result){
        if (err) {
            console.log(err);
            callback('error loading assignments by person :' + JSON.stringify(resource), null);
        } else {
        	 callback(null, result);
        }});
};

var listAssignmentsByProjectResourcesAndTimePeriod = function (projectResources, timePeriod, callback) {
	if (!(projectResources instanceof Array)) {
		projectResources = [projectResources];
	}
	listAssignments( null, function (err, result) {
		if (err) {
			callback (err, null);
		}
		
		var assignments = [];
		var processedAssignment;
		
		_.each(result.data, function(assignment){

			_.each(projectResources, function (projectResource){
				if (projectResource && 
						assignment.project && 
							assignment.project.resource == projectResource ) {


					if (assignment && assignment.members) {
						var excluded = [ ];
						var included = [ ];

						_.each(assignment.members, function (member){

							if ( timePeriod == "current" ) {
								if ( member.startDate <= util.getTodayDate() && ( !member.endDate || member.endDate  > util.getTodayDate() ) ) {
									included.push(member);
								}
								else {
									excluded.push(member);
								}
							}
								
							if ( timePeriod == "future" ) {
								if ( member.startDate >= util.getTodayDate() && ( !member.endDate || member.endDate  > util.getTodayDate() ) ) {
									included.push(member);
								}
								else {
									excluded.push(member);
								}
							}
								
							if ( timePeriod == "past" ) {
								if ( member.startDate < util.getTodayDate() && ( !member.endDate || member.endDate  < util.getTodayDate() ) ) {
									included.push(member);
								}
								else {
									excluded.push(member);
								}
							}

							// in case if timePeriod not provided
							if ( !timePeriod || timePeriod == "all" ) {
								included.push(member);
							}

						});
						
						// clone assignment before changing its properties to prevent from global modification
						processedAssignment = _.clone(assignment);
						
						processedAssignment.members = included;
						processedAssignment.excludedMembers = excluded;
						
						assignments.push(processedAssignment);
					}

				}
			});
				
		});
		
		var result = assignments;
		if ( assignments && assignments.length == 1 )  {
			result = assignments[0];
		}
		else if ( assignments && assignments.length > 1 )  {
			result = {};
			result.members = assignments;
		}
		callback (null, result);
	});
};

var listAssignmentsByPersonResourceAndTimePeriod = function(personResource, startDateMoment, endDateMoment, callback) {
	
    dataAccess.listAssignmentsByPerson(personResource, function(err, result){
        if (err) {
            console.log(err);
            callback('error loading assignments by person :' + JSON.stringify(resource), null);
        } else {
            //console.log(body);
        	
			
			var assignments = [ ];
			var HOURS_PER_WEEK = 45;
			
			//Fixing date order (frontend use incorrect order in some cases for the old backend)
			if (endDateMoment < startDateMoment) {
				endDateMoment = [startDateMoment, startDateMoment = endDateMoment][0];
			}
			
			for( var i = 0; i < result.length; i++ ) {

				//Add the project to the list of projects to resolve
				var projectAssignment = _.clone(result[ i ]);
				
				//Find all the assignments for this person
				for( var j = 0; j < projectAssignment.members.length; j++ ) {
					var assignment = projectAssignment.members[ j ];
					var endDate = assignment.endDate ? assignment.endDate : null;
					
					if( personResource == assignment.person.resource && ( !endDate || endDate > util.getTodayDate() ) ) {
						//Associate the project directly with the an assignment
						if (projectAssignment.project) {
							assignment.project = projectAssignment.project;
						}
						assignment.percentage = Math.round( 100 * assignment.hoursPerWeek / HOURS_PER_WEEK );
						
						if ( ( !endDateMoment || ( endDateMoment >= assignment.startDate  ) ) && 
								( !startDateMoment || !endDate || ( startDateMoment <= assignment.endDate ) ) 
							) {
							var duplicateAssignments = _.filter(assignments, function(assign) { return assign.project.resource == assignment.project.resource; });
							if (duplicateAssignments.length == 0)
								assignments.push( projectAssignment );
						}
					}
				}
			}
			
			projects.listProjects(null, function (err, projectsResult) {
				if (err) {
					callback (err, null);
				}
				var projects = projectsResult.data;
				
				//Collate projects with assignments
				for( var i = 0; i < assignments.length; i++ ) {
					var assignment = assignments[ i ];

					//Find the matching project
					for( var j = 0; j < projects.length; j++ ) {
						var project = projects[ j ];
						if( assignment.project && project.resource == assignment.project.resource ) {
							assignment.project = project;
							break;
						}
					}
				}

				callback(null, assignments);

			});
			
			
        }
    });

};

module.exports.listAssignments = listAssignments;
module.exports.getAssignment = getAssignment;
module.exports.insertAssignment = insertAssignment;
module.exports.listCurrentAssigments = listCurrentAssigments;
module.exports.listAssignmentsByPersonResource = listAssignmentsByPersonResource;
module.exports.listAssignmentsByPersonResourceAndTimePeriod = listAssignmentsByPersonResourceAndTimePeriod;
module.exports.listAssignmentsByProjectResourcesAndTimePeriod = listAssignmentsByProjectResourcesAndTimePeriod;
module.exports.getProjectAssignment = getProjectAssignment;
