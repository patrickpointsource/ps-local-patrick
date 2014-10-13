'use strict';

var dataAccess = require('../data/dataAccess');
var projects = require('./projects');
var util = require('../util/util');
var _ = require( 'underscore' );


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
		listAssignmentsByPersonResource( person, startDate, endDate, callback );
	}
	else {
		// Get assignments by projects
		dataAccess.listAssignments(q, function(err, body){
			if (err) {
				console.log(err);
				callback('error loading assignments', null);
			} else {
				//console.log(body);
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

var listCurrentAssigments = function(callback) {
	
    dataAccess.listCurrentAssigments(function(err, body){
        if (err) {
            console.log(err);
            callback("error loading current assignments", null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });

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

							if ( timePeriod == "all" ) {
								included.push(member);
							}

						});

						assignment.members = included;
						assignment.excludedMembers = excluded;
						assignments.push(assignment);
					}

				}
			});
				
		});
		var result;
		if ( assignments && assignments.length == 1 )  {
			result =assignments[0];
		}
		else if ( assignments && assignments.length > 1 )  {
			result = {};
			result.members = assignments;
		}
		callback (null, result);
	});
};

var listAssignmentsByPersonResource = function(personResource, startDateMoment, endDateMoment, callback) {
	
    dataAccess.listAssignmentsByPerson(personResource, function(err, result){
        if (err) {
            console.log(err);
            callback('error loading assignments by person :' + JSON.stringify(resource), null);
        } else {
            //console.log(body);
        	
			var myProjects = [ ];
			var assignments = [ ];
			var HOURS_PER_WEEK = 45;
			
			//Fixing date order (frontend use incorrect order in some cases for the old backend)
			if (endDateMoment < startDateMoment) {
				endDateMoment = [startDateMoment, startDateMoment = endDateMoment][0];
			}
			
			for( var i = 0; i < result.length; i++ ) {

				//Add the project to the list of projects to resolve
				var projectAssignment = result[ i ];
				if( projectAssignment.project && projectAssignment.project.resource && myProjects.indexOf( projectAssignment.project.resource ) === -1 ) {
					//Push the assignee onto the active list
					var resource = projectAssignment.project.resource;
					var oid = resource.substring( resource.lastIndexOf( '/' ) + 1 );
					myProjects.push( oid );
				}

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
						if ( 
								( !endDateMoment || ( endDateMoment >= assignment.startDate  ) ) && 
								( !startDateMoment || !endDate || ( startDateMoment <= assignment.endDate ) ) 
							) {
							assignments.push( assignment );
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
module.exports.listCurrentAssigments = listCurrentAssigments;
module.exports.listAssignmentsByPersonResource = listAssignmentsByPersonResource;
module.exports.listAssignmentsByProjectResourcesAndTimePeriod = listAssignmentsByProjectResourcesAndTimePeriod;
