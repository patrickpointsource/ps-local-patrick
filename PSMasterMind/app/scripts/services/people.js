'use strict';

/**
 * People Service
 */
angular.module( 'Mastermind' ).factory( 'People', [ '$q', 'Restangular', 'Resources', 'ProjectsService',
function( $q, Restangular, Resources, ProjectsService ) {

	/*
	 * Create a reference to a server side resource for People.
	 *
	 * The query method returns an object with a property 'data' containing
	 * the list of projects.
	 */
	var Resource = Restangular.withConfig( Util.fixRestAngularPathMethod() ).all( 'people' );

	/**
	 * Service function for retrieving all people.
	 *
	 * @returns {*}
	 */
	function query( query, fields ) {
		var deferred = $q.defer( );

		if (window.useAdoptedServices) {
			
			var updFields = [];
			for (var attr in fields) {
				if (fields.hasOwnProperty(attr) && fields[attr] == 1) {
					updFields.push(attr);
				}
			}
			var params = { fields : updFields };
			params.t = (new Date()).getMilliseconds();
			Resources.get( 'people/byTypes/active', params ).then (function( result ) {
				deferred.resolve( result );
			} );
			
		}
		else {
			Resources.query( 'people', query, fields, function( result ) {
				deferred.resolve( result );
			} );
		}

		

		return deferred.promise;
	}

	function get( id ) {
		return Resource.get( id );
	}

	/**
	 * Function declaration getPerson(personResource)
	 * Returns a role abbreviation corresponding to a resource reference
	 *
	 * @param project
	 * @param newRole
	 */
	function getPerson( personResource ) {

		var peoplePromise;
		//console.log("getPerson() called with", personResource);

		var peopleWithResourceQuery = {
			'resource': personResource
		};
		var pepInRolesFields = {
			resource: 1,
			name: 1,
			familyName: 1,
			givenName: 1,
			primaryRole: 1,
			thumbnail: 1
		};
		var returnVar = Resources.query( 'people', peopleWithResourceQuery, pepInRolesFields );
		//console.log("getPerson() returning with", returnVar);

		return returnVar;

	};

	var getToday = function( ) {
		//Get todays date formatted as yyyy-MM-dd
		var today = new Date( );
		var dd = today.getDate( );
		var mm = today.getMonth( ) + 1;
		//January is 0!
		var yyyy = today.getFullYear( );
		if( dd < 10 ) {
			dd = '0' + dd;
		}
		if( mm < 10 ) {
			mm = '0' + mm;
		}
		today = yyyy + '-' + mm + '-' + dd;
		return today;
	};

	var getQueryDate = function( date ) {
		//Get todays date formatted as yyyy-MM-dd
		var dd = date.getDate( );
		var mm = date.getMonth( ) + 1;
		//January is 0!
		var yyyy = date.getFullYear( );
		if( dd < 10 ) {
			dd = '0' + dd;
		}
		if( mm < 10 ) {
			mm = '0' + mm;
		}
		date = yyyy + '-' + mm + '-' + dd;
		return date;
	};

	var getQueryDateSixMonthsFromNow = function( date ) {
		var sixMontsFromNow = new Date( date );
		sixMontsFromNow.setMonth( date.getMonth( ) + 6 );
		var dd6 = sixMontsFromNow.getDate( );
		var mm6 = sixMontsFromNow.getMonth( ) + 1;
		//January is 0!
		var yyyy6 = sixMontsFromNow.getFullYear( );
		if( dd6 < 10 ) {
			dd6 = '0' + dd6;
		}
		if( mm6 < 10 ) {
			mm6 = '0' + mm6;
		}
		var sixMontsFromNowQuery = yyyy6 + '-' + mm6 + '-' + dd6;

		return sixMontsFromNowQuery;
	}
	
	var getIDfromResource = function(resource) {
		
		var ind = resource.lastIndexOf("/");
		if (ind != -1) {
			var id = resource.substring(ind + 1, resource.length);
			return id;
		}
		return;
	};
	
	/**
	 * Query to get the list of people working on
	 * active projects.
	 */
	function getActivePeople( ) {
		if (window.useAdoptedServices) {
			return getActivePeopleUsingGet();
		}
		else {
			return getActivePeopleUsingQuery();
		}
		
	}
		
		
	/**
	 * Query to get the list of people working on
	 * active projects ( using Resources.get() ).
	 */
	function getActivePeopleUsingGet() {
		return Resources.get( 'people/bytypes/activeAssignments');
	}
		
	/**
	 * Query to get the list of people working on
	 * active projects ( using Resources.query() ).
	 */
	function getActivePeopleUsingQuery( ) {
		var deferred = $q.defer( );
		var today = getToday( );
		var assignmentsQuery = {
			members: {
				$elemMatch: {
					startDate: {
						$lte: today
					},
					$or: [ {
						endDate: {
							$exists: false
						}
					}, {
						endDate: {
							$gt: today
						}
					} ]
				}
			}
		};

		//Fetch all the active assignments
		Resources.query( 'assignments', assignmentsQuery, {}, function( result ) {
			var projectAssignments = result.data;
			var activePeople = [ ];
			//For each project find the active assignments and add it to the people
			for( var i = 0; i < projectAssignments.length; i++ ) {
				var projectAssignment = projectAssignments[ i ];

				//Loop over the assignments for a project
				for( var j = 0; j < projectAssignment.members.length; j++ ) {
					var assignment = projectAssignment.members[ j ];
					if( assignment.person && assignment.person.resource && activePeople.indexOf( assignment.person.resource ) === -1 ) {
						//Push the assignee onto the active list
						var resource = assignment.person.resource;
						//{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
						var oid = {
							$oid: resource.substring( resource.lastIndexOf( '/' ) + 1 )
						};
						activePeople.push( oid );
					}
				}
			}

			var pepInRolesQuery = {
				_id: {
					$nin: activePeople
				},
				'primaryRole.resource': {
					$exists: true
				}
			};
			var pepInRolesFields = {
				resource: 1,
				name: 1,
				familyName: 1,
				givenName: 1,
				primaryRole: 1,
				thumbnail: 1
			};
			query(pepInRolesQuery, pepInRolesFields).then( function( result ) {
				deferred.resolve( result );
			} );
		} );

		return deferred.promise;
	}

	/**
	 * Gets the next six months of assignments mapped per person URI starting form a
	 * given date
	 *
	 * Resolves some of the data for the people and projects represented
	 */
	function getPeoleAssignments( fromDate ) {
		var deferred = $q.defer( );
		var startQueryDate = getQueryDate( fromDate );
		var stopQueryDate = getQueryDateSixMonthsFromNow( fromDate );
		var stopDate = new Date( stopQueryDate );

		var apQuery = {
			members: {
				'$elemMatch': {
					startDate: {
						$lte: stopQueryDate
					},
					$or: [ {
						endDate: {
							$exists: false
						}
					}, {
						endDate: {
							$gt: startQueryDate
						}
					} ]
				}
			}
		};
		var apFields = {};
		Resources.query( 'assignments', apQuery, apFields, function( result ) {
			var projectAssignments = result.data;
			//Map to return
			var ret = {};
			var today = new Date( );
			var projectURIs = [ ];

			for( var i = 0; i < projectAssignments.length; i++ ) {
				var projectAssignment = projectAssignments[ i ];
				//Loop through all the assignments in for a project
				for( var j = 0; j < projectAssignment.members.length; j++ ) {
					var assignment = projectAssignment.members[ j ];

					//Reference the project directly in the assignment
					assignment.project = projectAssignment.project;
					if( projectURIs.indexOf( assignment.project.resource ) == -1 ) {
						projectURIs.push( assignment.project.resource );
					}

					var startDate = new Date( assignment.startDate );
					var endDate = assignment.endDate ? new Date( assignment.endDate ) : null;
					//Only include current assignments
					if( assignment.person && startDate <= stopDate && ( !endDate || endDate > fromDate ) ) {
						var personURI = assignment.person.resource;

						if( ret.hasOwnProperty( personURI ) ) {
							ret[ personURI ].push( assignment );
						} else {
							ret[ personURI ] = [ assignment ];
							projectURIs.push( personURI );
						}
					}
				}
			}

			var projectIds = [ ];
			for( var i = 0; i < projectURIs.length; i++ ) {
				var projectURI = projectURIs[ i ];
				var oid = {
					$oid: projectURI.substring( projectURI.lastIndexOf( '/' ) + 1 )
				};
				projectIds.push( oid );
			}

			var projectQuery = {
				_id: {
					$in: projectIds
				}
			};
			var projectFields = {
				resource: 1,
				name: 1,
				customerName: 1,
				committed: 1,
				type: 1,
				startDate: 1,
				endDate: 1
			};
			Resources.query( 'projects', projectQuery, projectFields, function( result ) {
				var projects = result.data;
				//Collate resolved projects with the list of assignments
				for( var personURI in ret ) {
					var assignments = ret[ personURI ];
					for( var i = 0; i < assignments.length; i++ ) {
						var assignment = assignments[ i ];
						var projectURI = assignment.project.resource;
						for( var j = 0; j < projects.length; j++ ) {
							var project = projects[ j ];
							if( projectURI == project.resource ) {
								assignment.project = project;
								break;
							}
						}
					}
				}

				deferred.resolve( ret );
			} );
		} );

		return deferred.promise;
	}


	
	/**
	 * Get a map per user with all of there current assignment records
	 */

	function getPeopleCurrentAssignments( ) {
		if (window.useAdoptedServices) {
			return getPeopleCurrentAssignmentsUsingGet();
		}
		else {
			return getPeopleCurrentAssignmentsUsingQuery();
		}
	}
	

	/**
	 * Get a map per user with all of there current assignment records ( using Resource.get() )
	 */

	function getPeopleCurrentAssignmentsUsingGet() {
		return Resources.get( 'assignments/bytypes/currentAssignments');
	}
	
	/**
	 * Get a map per user with all of there current assignment records ( using Resource.query() )
	 */
	
	function getPeopleCurrentAssignmentsUsingQuery( ) {
		var deferred = $q.defer( );
		var startDateQuery = getToday( );

		var apQuery = {
			members: {
				'$elemMatch': {
					startDate: {
						$lte: startDateQuery
					},
					$or: [ {
						endDate: {
							$exists: false
						}
					}, {
						endDate: {
							$gt: startDateQuery
						}
					} ]
				}
			}
		};
		var apFields = {};
		Resources.query( 'assignments', apQuery, apFields, function( result ) {
			var projectAssignments = result.data;
			//Map to return
			var ret = {};
			var today = new Date( );
			for( var i = 0; i < projectAssignments.length; i++ ) {
				var projectAssignment = projectAssignments[ i ];
				//Loop through all the assignments in for a project
				for( var j = 0; j < projectAssignment.members.length; j++ ) {
					var assignment = projectAssignment.members[ j ];

					var startDate = new Date( assignment.startDate );
					var endDate = assignment.endDate ? new Date( assignment.endDate ) : null;
					//Only include current assignments
					if( assignment.person && startDate <= today && ( !endDate || endDate > today ) ) {
						var personURI = assignment.person.resource;

						if( ret.hasOwnProperty( personURI ) ) {
							ret[ personURI ].push( assignment );
						} else {
							ret[ personURI ] = [ assignment ];
						}
					}
				}
			}

			deferred.resolve( ret );
		} );

		return deferred.promise;
	}

	/**
	 * Returns a list of people per role for display
	 *
	 * role: is the URI for a role i.e. 'roles/{roleid}'
	 * fields: if the mongo filter to limit the fields returned for each person
	 */
	function getPeoplePerRole( role, fields ) {
		if (window.useAdoptedServices) {
			return getPeoplePerRoleUsingGet(role, fields );
		}
		else {
			return getPeoplePerRoleUsingQuery(role, fields );
		}
	}
	

	/**
	 * Returns a list of people per role for display ( using Resources.query() )
	 *
	 * role: is the URI for a role i.e. 'roles/{roleid}'
	 * fields: if the mongo filter to limit the fields returned for each person
	 */
	function getPeoplePerRoleUsingQuery( role, fields ) {
		var deferred = $q.defer( );

		var pepInRolesQuery = {};
		if( role ) {
			pepInRolesQuery = {
				'primaryRole.resource': role
			};
		} else {
			pepInRolesQuery = {
				'primaryRole.resource': {
					$exists: true
				}
			};
		}
						
		query( pepInRolesQuery, fields).then( function( result ) {
			deferred.resolve( result );
		} );
		
		return deferred.promise;
	}


	/**
	 * Returns a list of people per role using filter for display ( using Resources.get() )
	 *
	 * role: is the URI for a role i.e. 'roles/{roleid}'
	 * fields: if the mongo filter to limit the fields returned for each person
	 */
	 
	function getPeoplePerRoleUsingGet( role, fields ) {

		var updFields = [];
		for (var attr in fields) {
			if (fields.hasOwnProperty(attr) && fields[attr] == 1) {
				updFields.push(attr);
			}
		}

		return Resources.get( "people/byroleid/" + getIDfromResource(role), { field : fields } );
	}

	/**
	 * Return the list of people you work with
	 */
	function getMyPeople( me ) {
		if (window.useAdoptedServices) {
			return getMyPeopleUsingGet(me);
		}
		else {
			return getMyPeopleUsingQuery(me);
		}
	}
	
	function getMyPeopleUsingGet( me ) {
		var deferred = $q.defer( );
		Resources.get( "people/bytypes/myPeople").then( function( result ) {
			deferred.resolve( result.members );
		});
		return deferred.promise;
	};
	

		
	function getMyPeopleUsingQuery( me ) {
		var deferred = $q.defer( );

		var startDateQuery = getToday( );
		var personURI = me.about ? me.about : me.resource;
		var now = moment( );
		var _this = this;
		
		var query = {
			members: {
				'$elemMatch': {
					person: {
						resource: personURI
					},
					$or: [ {
						endDate: {
							$exists: false
						}
					}, {
						endDate: {
							$gt: startDateQuery
						}
					} ]
				}
			}
		};
		var fields = {
			project: 1,
			"members.startDate": 1,
			"members.endDate": 1,
			"members.person": 1
		};
		Resources.query( 'assignments', query, fields, function( result ) {
			var projectAssignments = result.data;
			var peopleIds = [ ];
			var peopleURIs = [ ];
			//Loop through all the project assignments
			var peopleIds = [ ];
			//Loop through all the project assignments
			for( var i = 0; i < projectAssignments.length; i++ ) {
				var projectAssignment = projectAssignments[ i ];
				//console.log('Project:' + projectAssignment.project.resource);
				var members = projectAssignment.members;
				//Loop though all the assignment records
				for( var j = 0; j < members.length; j++ ) {
					var assignment = members[ j ];
					var uri = assignment.person.resource;
					//Check if we have already added this person
					if( personURI != uri && $.inArray( uri, peopleURIs ) == -1 ) {
						//contruct oids for query over people
						var oid = {
							$oid: uri.substring( uri.lastIndexOf( '/' ) + 1 )
						};
						//Check the assignment end data to see if it is a past related employee
						var endDate = assignment.endDate ? moment( assignment.endDate ) : now.add( 'day', 1 );
						if( now.unix( ) <= endDate.unix( ) ) {
							peopleIds.push( oid );
							peopleURIs.push( uri );
						}
					}
				}
			}

			// get exec sponsors projects
			ProjectsService.getMyExecSponsoredProjects( me ).then( function( execSponsoredProjects ) {
				for( var p = 0; p < execSponsoredProjects.count; p++ ) {
					var roles = execSponsoredProjects.data[ p ].roles;
					for( var r = 0; r < roles.length; r++ ) {
						var assignees = roles[ r ].assignees;
						for( var s = 0; s < assignees.length; s++ ) {
							if( assignees[ s ].person.resource ) {
								var uri = assignees[ s ].person.resource;
								//Check if we have already added this person
								if( personURI != uri && $.inArray( uri, peopleURIs ) == -1 ) {
									//contruct oids for query over people
									var oid = {
										$oid: uri.substring( uri.lastIndexOf( '/' ) + 1 )
									};
									//Check the assignment end data to see if it is a past related employee
									var endDate = assignees[ s ].endDate ? moment( assignees[ s ].endDate ) : now.add( 'day', 1 );
									if( now.unix( ) <= endDate.unix( ) ) {

										peopleIds.push( oid );
										peopleURIs.push( uri );
									}
								}
							}
						}
					}
				}

				if( peopleIds.length <= 0 ) {
					deferred.resolve( [ ] );
				} else {
					//Fetch all the people
					var pepInRolesQuery = {
						_id: {
							$in: peopleIds
						}
					};
					var pepInRolesFields = {
						resource: 1,
						name: 1,
						familyName: 1,
						givenName: 1,
						primaryRole: 1,
						thumbnail: 1
					};
					resultAPI.query( pepInRolesQuery, pepInRolesFields).then( function( result ) {
						deferred.resolve( result.members );
					} );
				}
			} );
		} );

		return deferred.promise;
	}

	function getPeopleGroupMapping( ) {
		return {
			"development": [ 'SE', 'SSE', 'SEO', 'SSEO', 'ST', 'SI' ],
			"architects": [ 'SSA', 'SA', 'ESA', 'SSAO' ],
			"administration": [ 'ADMIN' ],
			"clientexpierencemgmt": [ "SBA", "BA", "PM", "CxD" ],
			"digitalexperience": [ "UXD", "SUXD", "DxM", "CD" ],
			"executivemgmt": [ "EXEC", "DD", "CxD", "CD", "DMDE" ],
			"marketing": [ "MKT", "DMDE", "MS" ],
			"sales": [ "SALES" ]
		};
	}

    var resultAPI = {
        query: query,
        get: get,
        getActivePeople: getActivePeople,
        getPeoplePerRole: getPeoplePerRole,
        getMyPeople: getMyPeople,
        getPeoleAssignments: getPeoleAssignments,
        getPeopleCurrentAssignments: getPeopleCurrentAssignments,
        getPerson: getPerson,
        getPeopleGroupMapping: getPeopleGroupMapping
    };
    
	return resultAPI;
} ] );
