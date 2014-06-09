'use strict';

/**
 * Hours Service
 */
angular.module( 'Mastermind' ).factory( 'Hours', [ '$q', 'Restangular', 'Resources', 'RolesService',
function( $q, Restangular, Resources, RolesService ) {

	/*
	 * Create a reference to a server side resource for Hours.
	 *
	 * The query method returns an object with a property 'data' containing
	 * the list of projects.
	 */
	var Resource = Restangular.all( 'hours' );

	/**
	 * Service function for retrieving all hours.
	 *
	 * @returns {*}
	 */
	function query( query, fields ) {
		var deferred = $q.defer( );

		Resources.query( 'hours', query, fields, function( result ) {
			deferred.resolve( result );
		} );

		return deferred.promise;
	}

	function get( id ) {
		return Resource.get( id );
	}

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

	var getQueryDateOneMonthAgo = function( date ) {
		var oneMonthBeforeToday = new Date( date );
		oneMonthBeforeToday.setMonth( date.getMonth( ) - 1 );
		var dd1 = oneMonthBeforeToday.getDate( );
		var mm1 = oneMonthBeforeToday.getMonth( ) - 1;
		//January is 0!
		var yyyy1 = oneMonthBeforeToday.getFullYear( );
		if( dd1 < 10 ) {
			dd1 = '0' + dd1;
		}
		if( mm1 < 10 ) {
			mm1 = '0' + mm1;
		}
		var oneMonthBeforeToday = yyyy1 + '-' + mm1 + '-' + dd1;

		return oneMonthBeforeToday;
	};
	
	/**
	 * Query to get the list of hours working on
	 * active projects.
	 */
	function getTaskHours( ) {
		var deferred = $q.defer( );
		var today = getToday( );
		var tasksQuery = {
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
			var activeHours = [ ];
			//For each project find the active assignments and add it to the hours
			for( var i = 0; i < projectAssignments.length; i++ ) {
				var projectAssignment = projectAssignments[ i ];

				//Loop over the assignments for a project
				for( var j = 0; j < projectAssignment.members.length; j++ ) {
					var assignment = projectAssignment.members[ j ];
					if( assignment.person && assignment.person.resource && activeHours.indexOf( assignment.person.resource ) === -1 ) {
						//Push the assignee onto the active list
						var resource = assignment.person.resource;
						//{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
						var oid = {
							$oid: resource.substring( resource.lastIndexOf( '/' ) + 1 )
						};
						activeHours.push( oid );
					}
				}
			}

			var pepInRolesQuery = {
				_id: {
					$nin: activeHours
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
			Resources.query( 'hours', pepInRolesQuery, pepInRolesFields, function( result ) {
				deferred.resolve( result );
			} );
		} );

		return deferred.promise;
	}

	/**
	 * Returns a list of hours per role for display
	 *
	 * role: is the URI for a role i.e. 'roles/{roleid}'
	 * fields: if the mongo filter to limit the fields returned for each person
	 */
	function getHoursPerRole( role, fields ) {
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

		Resources.query( 'hours', pepInRolesQuery, fields, function( result ) {
			deferred.resolve( result );
		} );

		return deferred.promise;
	}

	/**
	 * Return the list of hours you work with
	 */
	function getMyHours( me ) {
		var deferred = $q.defer( );

		var startDateQuery = getToday( );
		var personURI = me.about ? me.about : me.resource;
		var now = moment( );
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
			var hoursIds = [ ];
			var hoursURIs = [ ];
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
					if( personURI != uri && $.inArray( uri, hoursURIs ) == -1 ) {
						//contruct oids for query over hours
						var oid = {
							$oid: uri.substring( uri.lastIndexOf( '/' ) + 1 )
						};
						//Check the assignment end data to see if it is a past related employee
						var endDate = assignment.endDate ? moment( assignment.endDate ) : now.add( 'day', 1 );
						if( now.unix( ) <= endDate.unix( ) ) {
							//console.log('Adds:' + uri);

							hoursIds.push( oid );
							hoursURIs.push( uri );
						}
						//        				else{
						//        					console.log('Bad Date for: ' + uri + ', ' + now + ' <= ' +
						// endDate);
						//        				}
					}
					//        			else{
					//            			console.log('Ingnore: ' + uri);
					//            		}
				}
			}

			if( hoursIds.length <= 0 ) {
				deferred.resolve( [ ] );
			} else {
				//Fetch all the hours
				var pepInRolesQuery = {
					_id: {
						$in: hoursIds
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
				Resources.query( 'hours', pepInRolesQuery, pepInRolesFields, function( result ) {
					deferred.resolve( result.members );
				} );
			}
		} );

		return deferred.promise;
	}

	function getHoursGroupMapping( ) {
		return {
			"development": [ 'SE', 'SSE', 'SSEO', 'ST', 'SI' ],
			"architects": [ 'SSA', 'SA' ],
			"administration": [ 'ADMIN' ],
			"clientexpierencemgmt": [ "SBA", "BA", "PM", "CxD" ],
			"digitalexperience": [ "UXD", "SUXD", "DxM" ],
			"executivemgmt": [ "EXEC", "DD", "CxD", "CD", "DMDE" ],
			"marketing": [ "MKT", "DMDE" ],
			"sales": [ "SALES" ]
		};
	}

	return {
		query: query,
		get: get,
		getActiveHours: getActiveHours,
		getHoursPerRole: getHoursPerRole,
		getMyHours: getMyHours,
		getPeoleAssignments: getPeoleAssignments,
		getHoursCurrentAssignments: getHoursCurrentAssignments,
		getPerson: getPerson,
		getHoursGroupMapping: getHoursGroupMapping
	};
} ] );
