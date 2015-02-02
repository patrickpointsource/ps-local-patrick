var dbAccess = require( '../data/dbAccess.js' );
var memoryCache = require( '../data/memoryCache.js' );
var _ = require( 'underscore' );
var q = require('q');
var sift = require( 'sift' );
var config = require( '../config/config.js' );
var dataFilter = require( './dataFilter' );
var fieldFilter = require( './fieldFilter' );
var util = require( '../util/util.js' );

var PROJECTS_KEY = 'Projects';
var PEOPLE_KEY = 'People';
var ASSIGNMENTS_KEY = 'Assignments';
var TASKS_KEY = 'Tasks';
var ROLES_KEY = 'Roles';
var SECURITY_ROLES_KEY = 'SecurityRoles';
var USER_ROLES_KEY = 'UserRoles';
var CONFIGURATION_KEY = 'Configuration';
var VACATIONS_KEY = 'Vacations';
var SKILLS_KEY = 'Skills';
var LINKS_KEY = 'Links';
var HOURS_KEY = 'Hours';
var NOTIFICATIONS_KEY = 'Notifications';

/*
 * 
 * Example of usage q lib
    var deferred = q.defer();
   
    input.on('end', function() {
        // since you're done, you would resolve the promise, passing back the 
        // thing that would be passed to the next part of the chain, e.g. .then()
        deferred.resolve("Wouldn't you want to return something to 'then' with?");
    });

    // you return the promise from the deferred - not the deferred itself
    return deferred.promise;

*/

//TODO: fix $oid to _id, and move from "$exists: 1" to "$exists: 0"
var alignQuery = function( q, qP, pProp, pInd ) {

	if( _.isArray( q ) )
		for( var j = 0; j < q.length; q++ )
			alignQuery( q[ j ], q, null, j );
	else if( _.isObject( q ) )
		for( var prop in q ) {
			if( prop == "$oid" ) {
				//q[ "_id" ] = q[ prop ];
				//delete q[ "$oid" ];

				if( pInd == undefined )
					qP[ pRop ] = q[ prop ];
				else
					qP[pProp][ pInd ] = q[ prop ];
			} else if( prop == "$exists" ) {
				q[ prop ] = q[ prop ] ? true : false;
			} else if( _.isArray( q[ prop ] ) )
				for( var j = 0; j < q[ prop ].length; j++ )
					alignQuery( q[prop][ j ], q, prop, j );
			else if( _.isObject( q[ prop ] ) )
				alignQuery( q[ prop ], q, prop );
		}
	;
	//return q;
};

var validQuery = function(q) {
    var valid = true;
    
    if (q && (q.person && !q.person.resource || q.project && !q.project.resource))
        valid = false;
        
    return valid;
};

var queryRecords = function( data, q, propName, resourcePrefix, postfix, fields ) {
	var res = {
		about: data.about
	};
	if( !q )
		q = {};

	alignQuery( q );

	if( !propName ) {
		//res.data = _.query( data.data,  q);
		res.data = generateProperties( sift( q, data.data ), resourcePrefix, postfix, fields );

		res.count = res.data.length;
	} else {
		//res[propName] = _.query( data.data,  q);
		res[ propName ] = generateProperties( sift( q, data.data ), resourcePrefix, postfix, fields );

		res.count = res[ propName ].length;
	}

	return res;
};

var prepareRecords = function( data, propName, resourcePrefix, postfix, fields ) {
	var res = {
		about: data.about
	};

	if( !propName ) {
		res.data = generateProperties( data, resourcePrefix, postfix, fields );
		res.count = res.data.length;
	} else {
		res[ propName ] = generateProperties( data, resourcePrefix, postfix, fields );
		res.count = res[ propName ].length;
	}
	return res;
};

var generateProperties = function( collection, resourcePrefix, postfix, fields ) {
	var tmpId;

	for( var i = collection.length - 1; i >= 0; i-- ) {
		  if(!collection[ i ] && collection.splice)
			  collection.splice(i, 1);  
	}
		  
	for( var i = 0; i < collection.length; i++ ) {
	  if(collection[ i ] && collection[ i ]._id) {
		if( _.isObject( collection[ i ]._id ) )
			tmpId = collection[i]._id[ "$oid" ].toString( );
		else
			tmpId = collection[ i ]._id.toString( );

		if( postfix )
			tmpId = resourcePrefix + tmpId + postfix;
		else
			tmpId = resourcePrefix + tmpId;

		collection[ i ].resource = tmpId;
		collection[ i ].about = tmpId;
	  }
	}
	if (fields) {
		collection = fieldFilter.filterByFields(collection, fields);
	}
	return collection;
};


var filterRecordsByStartEndDates = function(data, startDate, endDate) {
	var result = {
			about: data.about,
			members: []
	};
	
	for (var k= 0; k < data.members.length; k ++) {
		if (data.members[k].date <= endDate && data.members[k].date >= startDate) {
			result.members.push(data.members[k]);
		}
	}
	
	result.count = result.members.length;
	
	
	return result;
};

var listProjects = function( q, callback ) {

	var result = memoryCache.getObject( PROJECTS_KEY );
	var data = null;

	if( result ) {
		console.log( "read " + PROJECTS_KEY + " from memory cache" );

		callback( null, queryRecords( result, q, null, "projects/" ) );
	} else {
		dbAccess.listProjects( function( err, body ) {
			if( !err ) {
				console.log( "save " + PROJECTS_KEY + " to memory cache" );
				memoryCache.putObject( PROJECTS_KEY, body );
			}

			callback( err, queryRecords( body, q, null, "projects/" ) );
		} );
	}

};

var listProjectsByExecutiveSponsor = function( roleResource, callback ) {

	var result = memoryCache.getObject( PROJECTS_KEY );
	if( result ) {
		console.log( "read " + PROJECTS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterProjectsByExecutiveSponsor(roleResource, result.data), null, "projects/" ) );
	} else {
		dbAccess.listProjects( function( err, body ) {
			if( !err ) {
				console.log( "save " + PROJECTS_KEY + " to memory cache" );
				memoryCache.putObject( PROJECTS_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterProjectsByExecutiveSponsor(roleResource, body.data), null, "projects/" ) );
		} );
	}

};


var listProjectsBetweenDatesByTypesAndSponsors = function( startDate, endDate, types, isCommited, roleResources, callback ) {

	var result = memoryCache.getObject( PROJECTS_KEY );
	if( result ) {
		console.log( "read " + PROJECTS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterProjectsBetweenDatesByTypesAndSponsors(startDate, endDate, types, isCommited, roleResources, result.data), null, "projects/" ) );
	} else {
		dbAccess.listProjects( function( err, body ) {
			if( !err ) {
				console.log( "save " + PROJECTS_KEY + " to memory cache" );
				memoryCache.putObject( PROJECTS_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterProjectsBetweenDatesByTypesAndSponsors(startDate, endDate, types, isCommited, roleResources, body.data), null, "projects/" ) );
		} );
	}

};


var listProjectsByStatuses = function( statuses, callback ) {

	var result = memoryCache.getObject( PROJECTS_KEY );
	if( result ) {
		console.log( "read " + PROJECTS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterProjectsByStatuses(statuses, result.data), null, "projects/" ) );
	} else {
		dbAccess.listProjects( function( err, body ) {
			if( !err ) {
				console.log( "save " + PROJECTS_KEY + " to memory cache" );
				memoryCache.putObject( PROJECTS_KEY, body );
			}
			
			callback( err, prepareRecords( dataFilter.filterProjectsByStatuses(statuses, body.data), null, "projects/" ) );
		} );
	}

};

var listProjectsByResources = function( resources, callback ) {

	var result = memoryCache.getObject( PROJECTS_KEY );
	if( result ) {
		console.log( "read " + PROJECTS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterProjectsByResources(resources, result.data), null, "projects/" ) );
	} else {
		dbAccess.listProjects( function( err, body ) {
			if( !err ) {
				console.log( "save " + PROJECTS_KEY + " to memory cache" );
				memoryCache.putObject( PROJECTS_KEY, body );
			}
			
			callback( err, prepareRecords( dataFilter.filterProjectsByResources(resources, body.data), null, "projects/" ) );
		} );
	}

};

var listCurrentProjectsByPerson = function(resource, callback) {

	listAssignmentsByPerson( resource, function( err, assignments ) {
		if( err ) {
			callback( err, null );
		} else {
									
			listProjectsByStatuses("unfinished", function( err, unfinishedProjects ) {
				if( err ) {
					callback( err, null );
				} else {
					var currentProjects = [];
					_.each(unfinishedProjects.data, function (project){
						checkProjectForAssignmentsAndPerson(project, assignments, resource, function (checked) {
							if (checked) {
								currentProjects.push(project);
							}
						});							
					});
					callback(null, prepareRecords( currentProjects , null, "projects/" ) );
				}
			} );
										
		}
	} );
};

var checkProjectForAssignmentsAndPerson = function(project, assignments, personResource, callback) {

	var cDate = new Date();
	
	var checked = false;
	// checks for project in assignments
	_.each(assignments, function (assignment) {
		
		if (assignment.project && 
				assignment.project.resource == project.resource 
		) {
			if (assignment.members) {
				_.each(assignment.members, function (member) {
					if (member.person && member.person.resource == personResource && 
							( !member.startDate || new Date(member.startDate) <= cDate ) &&
								( !member.endDate || new Date(member.endDate) >= cDate )
					) {
						checked = true;
					} 
					
					
				});
				
			}
			project.status = {}
			// checks whether required user is executive sponsor
			if (project.executiveSponsor &&
					project.executiveSponsor.resource == personResource ) {
				project.status.isExecutiveSponsor = true;
			}

			// checks whether required user is sales sponsor
			if (project.salesSponsor &&
					project.salesSponsor.resource == personResource ) {
        		project.status.isSalesSponsor = true;
			}

		}
	});

	
	return callback(checked)
}

var getProfileByGoogleId = function( id, callback ) {
	var query = {
		googleId: id
	};
	listPeople( query, function( err, list ) {
		if( !err ) {
			callback( null, list["members"][ 0 ] );
		} else {
			callback( err, null );
		}
	} );
};

var listPeople = function( q, callback ) {

	var result = memoryCache.getObject( PEOPLE_KEY );
	if( result ) {
		console.log( "read " + PEOPLE_KEY + " from memory cache" );
		callback( null, queryRecords( result, q, "members", "people/" ) );
	} else {
		dbAccess.listPeople( function( err, body ) {
			if( !err ) {
				console.log( "save " + PEOPLE_KEY + " to memory cache" );
				memoryCache.putObject( PEOPLE_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "people/" ) );
		} );
	}

};

var listPeopleByRoles = function( roleIds, includeInactive, fields, callback ) {
	var result = memoryCache.getObject( PEOPLE_KEY );
	if( result ) {
		console.log( "read " + PEOPLE_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterPeopleByRoles(roleIds, includeInactive, result.data), "members", "people/", null, fields ) );
	} else {
		dbAccess.listPeople( function( err, body ) {
			if( !err ) {
				console.log( "save " + PEOPLE_KEY + " to memory cache" );
				memoryCache.putObject( PEOPLE_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterPeopleByRoles(roleIds, includeInactive, body.data), "members", "people/", null, fields ) );
		} );
	}

};


var listPeopleByIsActiveFlag = function(isActive, fields, callback ) {

	var result = memoryCache.getObject( PEOPLE_KEY );
	if( result ) {
		console.log( "read " + PEOPLE_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterPeopleByIsActiveFlag(result.data, isActive), "members", "people/", null, fields ) );
	} else {
		dbAccess.listPeople( function( err, body ) {
			if( !err ) {
				console.log( "save " + PEOPLE_KEY + " to memory cache" );
				memoryCache.putObject( PEOPLE_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterPeopleByIsActiveFlag(body.data, isActive), "members", "people/", null, fields ) );
		} );
	}

};

var listPeopleWithPrimaryRole = function(fields, callback ) {

	var result = memoryCache.getObject( PEOPLE_KEY );
	if( result ) {
		console.log( "read " + PEOPLE_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterPeopleWithPrimaryRole(result.data), "members", "people/", null, fields ) );
	} else {
		dbAccess.listPeople( function( err, body ) {
			if( !err ) {
				console.log( "save " + PEOPLE_KEY + " to memory cache" );
				memoryCache.putObject( PEOPLE_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterPeopleWithPrimaryRole(body.data), "members", "people/", null, fields ) );
		} );
	}

};

var listPeopleByGroups = function(groups, fields, callback ) {

	var result = memoryCache.getObject( PEOPLE_KEY );
	if( result ) {
		console.log( "read " + PEOPLE_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterPeopleByGroups(groups, result.data), "members", "people/", null, fields ) );
	} else {
		dbAccess.listPeople( function( err, body ) {
			if( !err ) {
				console.log( "save " + PEOPLE_KEY + " to memory cache" );
				memoryCache.putObject( PEOPLE_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterPeopleByGroups(groups, body.data), "members", "people/", null, fields ) );
		} );
	}

};


var listPeopleByPerson = function(person, callback ) {
	
	listAssignmentsByPerson(person, function (err, result) {
		if (err) {
			callback(err, null);
		} else {

			var peopleURIs = [ ];
			for( var i = 0; i < result.length; i++ ) {

				var projectAssignment = result[ i ];
				for( var j = 0; j < projectAssignment.members.length; j++ ) {
					var assignment = projectAssignment.members[ j ];
					if( ( !assignment.endDate || assignment.endDate > util.getTodayDate() ) && 
							assignment.startDate <= util.getTodayDate()  
							) {
						var uri = assignment.person.resource;
						if( person != uri && !_.contains( peopleURIs, uri ) ) {
							peopleURIs.push( uri );
						}
					}
				}
			}
			
			
			var peopleResult = [];
			listPeopleByIsActiveFlag(true, null, function(err, people) {
				if (err) {
					callback(err, null);
				}
				_.each(people.members, function (person){
					var uri = person.resource;
					if( _.contains( peopleURIs, uri ) ) {
						peopleResult.push (person);
					}
				});

				callback( err, prepareRecords( peopleResult, "members", "people/" ) );
				
			});
			
		}
	});
	
};


var listActivePeopleByAssignments = function(fields, callback ) {
	var activePeopleResources = [];
	listAssignments(null, function (err, assignments) {
		if (err) {
			callback(err, null);
		} else {
			_.each(assignments.data, function (assignment){
				if (assignment.members) {
					_.each(assignment.members, function (member){
						if ( member.person &&
								member.person.resource && 
									activePeopleResources.indexOf(member.person.resource) == -1 ) {
							activePeopleResources.push(member.person.resource);
						}
					
					});
					
				}
			});
			
			listPeopleByIsActiveFlag(true, null, function (err, activePeople) {
				if (err) {
					callback(err, null);
				} else {
					var result = [];
					_.each(activePeople.members, function (person){
						if ( person.primaryRole && 
								person.primaryRole.resource && 
									activePeopleResources.indexOf(util.getFullID(person._id, "people")) != -1 ) {
							result.push(person);
						}
					});
				
				}
				callback( err, prepareRecords( result, "members", "people/", null, fields ) );
//				callback (err, activePeople);
			
			});
			
				
			//console.log("result=" + JSON.stringify(result));
			
		}
	});
	
};

var listCurrentAssigments = function(callback ) {

	listAssignments(null, function (err, assignments) {
		if (err) {
			callback(err, null);
		} else {
			var result = {};
			_.each(assignments.data, function (assignment){
				if (assignment.members) {
					_.each(assignment.members, function (member){
					
						if ( member.person && 
								member.startDate <= util.getTodayDate() &&
									( !member.endDate || member.endDate > util.getTodayDate() ) ) {
							var personResource = member.person.resource;
							member.project = assignment.project;
							if( result.hasOwnProperty( personResource ) ) {
								result[ personResource ].push( member );
							} else {
								result[ personResource ] = [ member ];
							}
						}
					});
						
				}
			});
			callback (null, result);
		}
	});

};

var listAssignmentsByPerson = function(resource, callback) {
	
    listAssignments(null, function(err, result){
        if (err) {
            console.log(err);
            callback('error loading assignments by person', null);
        } else {
			var assignments = [];
			_.each(result.data, function(assignment){
				if (assignment.members) {
					_.each(assignment.members, function (member){
						if (member.person && member.person.resource && 
							member.person.resource == resource) {
							var duplicateAssignments = _.filter(assignments, function(assign) { return assign.project.resource == assignment.project.resource; });
							if (duplicateAssignments.length == 0)
								assignments.push(assignment);
						}
					});
				}
			});
			
            callback(null, assignments);
        }
    });

};


var listAssignments = function( q, callback ) {
    if( !validQuery( q ) ) {
        callback( null, {
            about: 'assignments',
            count: 0,
            data: [ ]
        } );
        return;
    }
    
	var result = memoryCache.getObject( ASSIGNMENTS_KEY );
	var finalRecords = [];
	var i = 0;
	
	if( result ) {
		console.log( "read " + ASSIGNMENTS_KEY + " from memory cache" );
		finalRecords = queryRecords( result, q, null, "projects/", "/assignments" );
		
		for (i = 0; i < finalRecords.data.length; i ++)
		      generateProperties(finalRecords.data[i].members, "assignments/");
		      
		callback( null, finalRecords );
	} else {
		dbAccess.listAssignments( function( err, body ) {
			if( !err ) {
				console.log( "save " + ASSIGNMENTS_KEY + " to memory cache" );
				memoryCache.putObject( ASSIGNMENTS_KEY, body );
			}
			
			console.log('\r\n\r\nloading:assignments:q=' + JSON.stringify(q) + '\r\n');
			
			 finalRecords = queryRecords( body, q, null, "projects/", "/assignments" );
			
			for (i = 0; i < finalRecords.data.length; i ++)
              generateProperties(finalRecords.data[i].members, "assignments/");
              
			callback( err, finalRecords );
		} );
	}

};

var listTasks = function( callback ) {

	var result = memoryCache.getObject( TASKS_KEY );
	if( result ) {
		console.log( "read " + TASKS_KEY + " from memory cache" );
		callback( null, prepareRecords( result.data, "members", "tasks/" ) );
	} else {
		dbAccess.listTasks( function( err, body ) {
			if( !err ) {
				console.log( "save " + TASKS_KEY + " to memory cache" );
				memoryCache.putObject( TASKS_KEY, body );
			}
			callback( err, prepareRecords( body.data, "members", "tasks/" ) );
		} );
	}

};

var listTasksByName = function( name, callback ) {

	var result = memoryCache.getObject( TASKS_KEY );
	if( result ) {
		console.log( "read " + TASKS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterTasksByName(name, result.data), "members", "tasks/" ) );
	} else {
		dbAccess.listTasks( function( err, body ) {
			if( !err ) {
				console.log( "save " + TASKS_KEY + " to memory cache" );
				memoryCache.putObject( TASKS_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterTasksByName(name, body.data), "members", "tasks/" ) );
		} );
	}

};

var listRoles = function( q, callback ) {

	var result = memoryCache.getObject( ROLES_KEY );
	if( result ) {
		console.log( "read " + ROLES_KEY + " from memory cache" );
		callback( null, queryRecords( result, q, "members", "roles/" ) );
	} else {
		dbAccess.listRoles( function( err, body ) {
			if( !err ) {
				console.log( "save " + ROLES_KEY + " to memory cache" );
				memoryCache.putObject( ROLES_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "roles/" ) );
		} );
	}

};

var listNonBillableRoles = function( callback ) {

	var result = memoryCache.getObject( ROLES_KEY );
	if( result ) {
		console.log( "read " + ROLES_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterNonBillableRoles(result.data), "members", "roles/" ) );
	} else {
		dbAccess.listRoles( function( err, body ) {
			if( !err ) {
				console.log( "save " + ROLES_KEY + " to memory cache" );
				memoryCache.putObject( ROLES_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterNonBillableRoles(body.data), "members", "roles/" ) );
		} );
	}

};

var listLinks = function( q, callback ) {

	var result = memoryCache.getObject( LINKS_KEY );
	if( result ) {
		console.log( "read " + LINKS_KEY + " from memory cache" );
		callback( null, queryRecords( result, q, "members", "links/" ) );
	} else {
		dbAccess.listLinks( function( err, body ) {
			if( !err ) {
				console.log( "save " + LINKS_KEY + " to memory cache" );
				memoryCache.putObject( LINKS_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "links/" ) );
		} );
	}

};


var listLinksByProject = function( project, callback ) {

	var result = memoryCache.getObject( LINKS_KEY );
	if( result ) {
		console.log( "read " + LINKS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterLinksByProject(project, result.data), "members", "links/" ) );
	} else {
		dbAccess.listLinks( function( err, body ) {
			if( !err ) {
				console.log( "save " + LINKS_KEY + " to memory cache" );
				memoryCache.putObject( LINKS_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterLinksByProject(project, body.data), "members", "links/" ) );
		} );
	}

};

var listConfiguration = function( q, callback ) {

	var result = memoryCache.getObject( CONFIGURATION_KEY );
	if( result ) {
		console.log( "read " + CONFIGURATION_KEY + " from memory cache" );
		callback( null, queryRecords( result, q, "members", "configuration/" ) );
	} else {
		dbAccess.listConfiguration( function( err, body ) {
			if( !err ) {
				console.log( "save " + CONFIGURATION_KEY + " to memory cache" );
				memoryCache.putObject( CONFIGURATION_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "configuration/" ) );
		} );
	}

};

var listSkills = function( q, callback ) {

	var result = memoryCache.getObject( SKILLS_KEY );
	if( result ) {
		console.log( "read " + SKILLS_KEY + " from memory cache" );
		callback( null, queryRecords( result, q, "members", "skills/" ) );
	} else {
		dbAccess.listSkills( function( err, body ) {
			if( !err ) {
				console.log( "save " + SKILLS_KEY + " to memory cache" );
				memoryCache.putObject( SKILLS_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "skills/" ) );
		} );
	}

};

var listVacations = function( callback ) {

	var result = memoryCache.getObject( VACATIONS_KEY );
	if( result ) {
		console.log( "read " + VACATIONS_KEY + " from memory cache" );
		callback( null, prepareRecords( result.data, "members", "vacations/" ) );
	} else {
		dbAccess.listVacations( function( err, body ) {
			if( !err ) {
				console.log( "save " + VACATIONS_KEY + " to memory cache" );
				memoryCache.putObject( VACATIONS_KEY, body );
			}
			callback( err, prepareRecords( body.data, "members", "vacations/" ) );
		} );
	}

};

var listVacationsByPerson = function( personResource, callback ) {

	var result = memoryCache.getObject( VACATIONS_KEY );
	if( result ) {
		console.log( "read " + VACATIONS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterVacationsByPerson(personResource, result.data), "members", "vacations/" ) );
	} else {
		dbAccess.listVacations( function( err, body ) {
			if( !err ) {
				console.log( "save " + VACATIONS_KEY + " to memory cache" );
				memoryCache.putObject( VACATIONS_KEY, body );
			}
			callback( err, prepareRecords( dataFilter.filterVacationsByPerson(personResource, body.data), "members", "vacations/" ) );
		} );
	}

};


var listVacationsByPeriod = function( people, startDate, endDate, callback ) {

	var result = memoryCache.getObject( VACATIONS_KEY );
	if( result ) {
		console.log( "read " + VACATIONS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterVacationsByPeriod(people, startDate, endDate, result.data), "members", "vacations/" ) );
	} else {
		dbAccess.listVacations( function( err, body ) {
			if( !err ) {
				console.log( "save " + VACATIONS_KEY + " to memory cache" );
				memoryCache.putObject( VACATIONS_KEY, body );
			}
			callback( null, prepareRecords( dataFilter.filterVacationsByPeriod(people, startDate, endDate, body.data), "members", "vacations/" ) );
		} );
	}

};


var listRequests = function( manager, statuses, startDate, endDate, callback ) {

	var result = memoryCache.getObject( VACATIONS_KEY );
	if( result ) {
		console.log( "read " + VACATIONS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterRequests(manager, statuses, startDate, endDate, result.data), "members", "vacations/" ) );
	} else {
		dbAccess.listVacations( function( err, body ) {
			if( !err ) {
				console.log( "save " + VACATIONS_KEY + " to memory cache" );
				memoryCache.putObject( VACATIONS_KEY, body );
			}
			callback( null, prepareRecords( dataFilter.filterRequests(manager, statuses, startDate, endDate, body.data), "members", "vacations/" ) );
		} );
	}

};


var listSecurityRoles = function( callback ) {
	var result = memoryCache.getObject( SECURITY_ROLES_KEY );
	if( result ) {
		console.log( "read " + SECURITY_ROLES_KEY + " from memory cache" );
		callback( null, prepareRecords( result.data, "members", "securityroles/" ) );
	} else {
		dbAccess.listSecurityRoles( function( err, body ) {
			if( !err ) {
				console.log( "save " + SECURITY_ROLES_KEY + " to memory cache" );
				memoryCache.putObject( SECURITY_ROLES_KEY, body );
			}
			callback( null, prepareRecords( body.data, "members", "securityroles/" ) );
		} );
	}

};

var listSecurityRolesByResources = function( resources, callback ) {
	var result = memoryCache.getObject( SECURITY_ROLES_KEY );
	if( result ) {
		console.log( "read " + SECURITY_ROLES_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterSecurityRolesByResources(resources, result.data), "members", "securityroles/" ) );
	} else {
		dbAccess.listSecurityRoles( function( err, body ) {
			if( !err ) {
				console.log( "save " + SECURITY_ROLES_KEY + " to memory cache" );
				memoryCache.putObject( SECURITY_ROLES_KEY, body );
			}
			callback( null, prepareRecords( dataFilter.filterSecurityRolesByResources(resources, body.data), "members", "securityroles/" ) );
		} );
	}

};

var listUserRoles = function( callback ) {
	var result = memoryCache.getObject( USER_ROLES_KEY );
	if( result ) {
		console.log( "read " + USER_ROLES_KEY + " from memory cache" );
		callback( null, prepareRecords( result.data, "members", "userRoles/" ) );
	} else {
		dbAccess.listUserRoles( function( err, body ) {
			if( !err ) {
				console.log( "save " + USER_ROLES_KEY + " to memory cache" );
				memoryCache.putObject( USER_ROLES_KEY, body );
			}
			callback( null, prepareRecords( body.data, "members", "userRoles/" ) );
		} );
	}

};

var listUserRolesByGoogleId = function( googleId, callback ) {
	var result = memoryCache.getObject( USER_ROLES_KEY );
	if( result ) {
		console.log( "read " + USER_ROLES_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterUserRolesByGoogleId(googleId, result.data), "members", "userRoles/" ) );
	} else {
		dbAccess.listUserRoles( function( err, body ) {
			if( !err ) {
				console.log( "save " + USER_ROLES_KEY + " to memory cache" );
				memoryCache.putObject( USER_ROLES_KEY, body );
			}
			callback( null, prepareRecords( dataFilter.filterUserRolesByGoogleId(googleId, body.data), "members", "notifications/" ) );

		} );
	}

};

var listNotifications = function( q, callback ) {

	var result = memoryCache.getObject( NOTIFICATIONS_KEY );
	if( result ) {
		console.log( "read " + NOTIFICATIONS_KEY + " from memory cache" );
		callback( null, queryRecords( result, q, "members", "notifications/" ) );
	} else {
		dbAccess.listNotifications( function( err, body ) {
			if( !err ) {
				console.log( "save " + NOTIFICATIONS_KEY + " to memory cache" );
				memoryCache.putObject( NOTIFICATIONS_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "notifications/" ) );
		} );
	}

};


var listNotificationsByPerson = function( person, callback ) {

	var result = memoryCache.getObject( NOTIFICATIONS_KEY );
	if( result ) {
		console.log( "read " + NOTIFICATIONS_KEY + " from memory cache" );
		callback( null, prepareRecords( dataFilter.filterNotificationsByPerson(person, result.data), "members", "notifications/" ) );
	} else {
		dbAccess.listNotifications( function( err, body ) {
			if( !err ) {
				console.log( "save " + NOTIFICATIONS_KEY + " to memory cache" );
				memoryCache.putObject( NOTIFICATIONS_KEY, body );
			}
			callback( null, prepareRecords( dataFilter.filterNotificationsByPerson(person, body.data), "members", "notifications/" ) );
		} );
	}

};

var listHours = function( q, callback ) {
    var onlyAndDates = q.$and && q.$and.length > 0;
    var orEmpty = !q.$or || q.$or.length > 0;
    var onlyProjects = q.$or && q.$or.length > 0;

    var startDate = null;
    var endDate = null;

    var projects = [ ];
    var project = q.project ? q.project.resource: q['project.resource'];
    var person = q.person ? q.person.resource: q['person.resource'];

    for( var i = 0; q.$and && i < q.$and.length; i++ ) {
        onlyAndDates = onlyAndDates && q.$and[ i ].date;

        if( onlyAndDates && q.$and[ i ].date.$lte )
            endDate = onlyAndDates && q.$and[ i ].date.$lte;
        else if( onlyAndDates && q.$and[ i ].date.$lt )
            endDate = onlyAndDates && q.$and[ i ].date.$lt;
        else if( onlyAndDates && q.$and[ i ].date.$gt )
            startDate = onlyAndDates && q.$and[ i ].date.$gt;
        else if( onlyAndDates && q.$and[ i ].date.$gte )
            startDate = onlyAndDates && q.$and[ i ].date.$gte;

    }

    // init onlyProjects flag
    for( var i = 0; q.$or && i < q.$or.length; i++ ) {
        onlyProjects = onlyProjects && (q.$or[ i ][ 'project.resource' ] || q.$or[ i ][ 'task.resource' ]);

        if( onlyProjects && q.$or[ i ][ 'project.resource' ])
            projects.push( q.$or[ i ][ 'project.resource' ] );
        else if( onlyProjects && q.$or[ i ][ 'task.resource' ])
            projects.push( q.$or[ i ][ 'task.resource' ] );
        	
    }
    
    if (!onlyProjects && !q.$or && !q.$and && !q.person) {
        project = q.project ? q.project.resource: q['project.resource'];
        
        if (project) {
            onlyProjects = true;
            
            projects.push(project);
        }
        
    }
    // TODO: remove it later when all hours services will be finaly migrated
    if( !project && person && startDate && endDate && orEmpty && onlyAndDates ) {
        dbAccess.listHoursByStartEndDates( [ "PersonDate", person, startDate ], [ "PersonDate", person, endDate ], function( err, body ) {
            if( err ) {
                console.log( err );
                callback( 'error loading hours by start and end dates', null );
            } else {
                console.log( body );
                callback( err, queryRecords( body, q, "members", "hours/" ) );
            }
        } );
    } else if( !person && project && startDate && endDate && orEmpty && onlyAndDates ) {
        dbAccess.listHoursByStartEndDates( [ "ProjectDate", project, startDate ], [ "ProjectDate", project, endDate ], function( err, body ) {
            if( err ) {
                console.log( err );
                callback( 'error loading hours by start and end dates', null );
            } else {
                console.log( body );
                callback( err, queryRecords( body, q, "members", "hours/" ) );
            }
        } );
    } else if( person && project && startDate && endDate && orEmpty && onlyAndDates ) {
        dbAccess.listHoursByStartEndDates( [ "ProjectPersonDate", project, person, startDate ], [ "ProjectPersonDate", project, person, startDate ], function( err, body ) {
            if( err ) {
                console.log( err );
                callback( 'error loading hours by start and end dates', null );
            } else {
                console.log( body );
                callback( err, queryRecords( body, q, "members", "hours/" ) );
            }
        } );
    } else if( person && !project && !startDate && !endDate && orEmpty && !onlyAndDates ) {

        dbAccess.listHoursByStartEndDates( [ "PersonDate", person, '1900-01-01' ], [ "PersonDate", person, '2050-01-01' ], function( err, body ) {
            if( err ) {
                console.log( err );
                callback( 'error loading hours by start and end dates', null );
            } else {
                console.log( body );
                callback( err, queryRecords( body, q, "members", "hours/" ) );
            }
        } );
    } else if( onlyProjects )
        dbAccess.listHoursByProjects( projects, function( err, body ) {
            if( err ) {
                console.log( err );
                callback( 'error loading hours by start and end dates', null );
            } else {
                console.log( body );
                callback( err, queryRecords( body, q, "members", "hours/" ) );
            }
        } );
    else
    callback( 'error loading hours by passed query', null );
};

var listHoursByPersonAndDates = function( person, startDate, endDate, callback ) {

    dbAccess.listHoursByStartEndDates( [ "PersonDate", person, startDate ], [ "PersonDate", person, endDate ], function( err, body ) {
        if( err ) {
            console.log( err );
            callback( 'error loading hours by start and end dates', null );
        } else {
            console.log( body );
            callback( err, queryRecords( body, {}, "members", "hours/" ) );
        }
    } );
};

var listHoursByProjectAndDates = function( project, startDate, endDate, callback ) {

    dbAccess.listHoursByStartEndDates( [ "ProjectDate", project, startDate ], [ "ProjectDate", project, endDate ], function( err, body ) {
        if( err ) {
            console.log( err );
            callback( 'error loading hours by start and end dates', null );
        } else {
            console.log( body );
            callback( err, queryRecords( body, {}, "members", "hours/" ) );
        }
    } );
};

var listHoursByPerson = function( person, callback ) {

    dbAccess.listHoursByStartEndDates( [ "PersonDate", person, '1900-01-01' ], [ "PersonDate", person, '2050-01-01' ], function( err, body ) {
        if( err ) {
            console.log( err );
            callback( 'error loading hours by start and end dates', null );
        } else {
            console.log( body );
            callback( err, queryRecords( body, {}, "members", "hours/" ) );
        }
    } );

};

var listHoursByProjects = function( projects, fields, callback ) {
    dbAccess.listHoursByProjects( projects, function( err, body ) {
        if( err ) {
            console.log( err );
            callback( 'error loading hours by start and end dates', null );
        } else {
            callback( err, queryRecords( body, {}, "members", "hours/", null, fields ) );
        }
    } );
};

var listHoursByProjectsAndDates = function( projects, startDate, endDate, fields, callback ) {
    dbAccess.listHoursByProjectsAndDates( projects, startDate, endDate, function( err, body ) {
        if( err ) {
            console.log( err );
            callback( 'error loading hours by start and end dates', null );
        } else {
        	var hours = queryRecords( body, {}, "members", "hours/", null, fields );
        	
            callback( err, filterRecordsByStartEndDates(hours, startDate, endDate) );
        }
    } );
};

var insertItem = function( id, obj, type, callback ) {
	if( type ) {
		obj.form = type;
	}
	
	if (!obj.form)
	   callback( "Form field is missing", {} );
	  
	dbAccess.insertItem( id, obj, function( err, body ) {
		if( !err ) {
			if( obj._deleted ) {
				if( body.id ) {
					console.log( "Object with id " + body.id + " marked as deleted in db" );
				}
			} else {
				if( body.id ) {
					console.log( "Object with id " + body.id + " inserted in db" );
				}
			}
		}
		memoryCache.deleteObject( type );
		callback( err, _.extend(obj, body) );
	} );
};

var updateItem = function( id, obj, type, callback ) {
	if( type ) {
		obj.form = type;
	}
	
	dbAccess.updateItem( id, obj, function( err, body ) {
		if( !err ) {
			if( obj._deleted ) {
				console.log( "Object with id " + id + " marked as deleted in db" );
			} else {
				console.log( "Object with id " + id + " updated in db" );
			}
		}
		memoryCache.deleteObject( type );
		callback( err, body );
	} );
};

var deleteItem = function( id, rev, type, callback ) {
	if( rev ) {
		dbAccess.deleteItem( id, rev, function( err, body ) {
			if( !err ) {
				console.log( "Object with id " + id + " deleted from db" );
			}
			memoryCache.deleteObject( type );
			callback( err, body );
		} );
	} else {
		var actualObject = getItem( id, function( err, body ) {
			if( err ) {
				console.log( "cannot delete item: " + id );
			} else {
				body._deleted = true;

				insertItem( id, body, type, function( err, body ) {
					if( err ) {
						console.log( err );
						callback( 'error delete item by inserting _deleted flag', null );
					} else {
						callback( null, body );
					}
				} );
			}
			memoryCache.deleteObject( type );
		} );
	}

};

var getItem = function( id, callback ) {
	dbAccess.getItem( id, function( err, body ) {
		if( !err ) {
			console.log( "Read object with id " + id + " from db" );
		}
		callback( err, body );
	} );
};

module.exports.listProjects = listProjects;
module.exports.listProjectsByExecutiveSponsor = listProjectsByExecutiveSponsor;
module.exports.listProjectsBetweenDatesByTypesAndSponsors = listProjectsBetweenDatesByTypesAndSponsors;
module.exports.listProjectsByStatuses = listProjectsByStatuses;
module.exports.listProjectsByResources = listProjectsByResources;
module.exports.listCurrentProjectsByPerson = listCurrentProjectsByPerson;

module.exports.listPeople = listPeople;
module.exports.listPeopleByPerson = listPeopleByPerson;
module.exports.listPeopleByRoles = listPeopleByRoles;
module.exports.listPeopleByIsActiveFlag = listPeopleByIsActiveFlag;
module.exports.listPeopleWithPrimaryRole = listPeopleWithPrimaryRole;
module.exports.listPeopleByGroups = listPeopleByGroups;
module.exports.listActivePeopleByAssignments = listActivePeopleByAssignments;
module.exports.listAssignments = listAssignments;
module.exports.listCurrentAssigments = listCurrentAssigments;
module.exports.listAssignmentsByPerson = listAssignmentsByPerson;

module.exports.listTasks = listTasks;

module.exports.listHours = listHours;
module.exports.listHoursByPersonAndDates = listHoursByPersonAndDates;
module.exports.listHoursByProjectAndDates = listHoursByProjectAndDates;
module.exports.listHoursByProjectsAndDates = listHoursByProjectsAndDates;
module.exports.listHoursByPerson = listHoursByPerson;
module.exports.listHoursByProjects = listHoursByProjects;

module.exports.listRoles = listRoles;
module.exports.listNonBillableRoles = listNonBillableRoles;
module.exports.listLinks = listLinks;
module.exports.listLinksByProject = listLinksByProject;
module.exports.listNotifications = listNotifications;
module.exports.listNotificationsByPerson = listNotificationsByPerson;
module.exports.listSkills = listSkills;
module.exports.listConfiguration = listConfiguration;
module.exports.listVacations = listVacations;
module.exports.listVacationsByPerson = listVacationsByPerson;
module.exports.listVacationsByPeriod = listVacationsByPeriod;
module.exports.listRequests = listRequests;
module.exports.listSecurityRoles = listSecurityRoles;
module.exports.listSecurityRolesByResources = listSecurityRolesByResources;
module.exports.listUserRoles = listUserRoles;
module.exports.listUserRolesByGoogleId = listUserRolesByGoogleId;
module.exports.getProfileByGoogleId = getProfileByGoogleId;
module.exports.listTasksByName = listTasksByName;

module.exports.insertItem = insertItem;
module.exports.updateItem = updateItem;
module.exports.deleteItem = deleteItem;
module.exports.getItem = getItem;

module.exports.VACATIONS_KEY = VACATIONS_KEY;
module.exports.NOTIFICATIONS_KEY = NOTIFICATIONS_KEY;
module.exports.SECURITY_ROLES_KEY = SECURITY_ROLES_KEY;
module.exports.USER_ROLES_KEY = USER_ROLES_KEY;
module.exports.ASSIGNMENTS_KEY = ASSIGNMENTS_KEY;
module.exports.PROJECTS_KEY = PROJECTS_KEY;
module.exports.PEOPLE_KEY = PEOPLE_KEY;
module.exports.ROLES_KEY = ROLES_KEY;
module.exports.HOURS_KEY = HOURS_KEY;
module.exports.LINKS_KEY = LINKS_KEY;
module.exports.CONFIGURATION_KEY = CONFIGURATION_KEY;
module.exports.SKILLS_KEY = SKILLS_KEY;
module.exports.TASKS_KEY = TASKS_KEY;

module.exports.prepareRecords = prepareRecords;
