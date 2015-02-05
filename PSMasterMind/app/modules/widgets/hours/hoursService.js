'use strict';

/*
 * Services dealing with the hours service
 */
angular.module( 'Mastermind' ).service( 'HoursService', [ '$q', 'Resources',
function( $q, Resources ) {

	/**
	 * Pushes a set of hours records out to the server
	 *
	 * If a record has an _id property push it out at an update else process
	 * it as a create
	 */
	this.updateHours = function( hoursRecords ) {
		var requests = [ ], i;

		for( i = 0; i < hoursRecords.length; i++ ) {
			var record = hoursRecords[ i ];
			var id = record[ '_id' ];

			if( record.hours && (            parseInt( record.hours ) ).toString( ) == record.hours.toString( ) )
				record.hours = parseInt( record.hours );
			else if( record.hours && !isNaN( parseFloat( record.hours ) ) )
				record.hours = parseFloat( record.hours );

			// TODO check the hours client side and inform user they have
			// entered an impossible number (Sprint 11 task 25576)
			if( record.hours > 24 )
				record.hours = 8;

			if( id ) {
				if( record.hours <= 0 ) {
					requests.push( Resources.remove( record.resource ) );
				} else {
					// Default description
					/*if( !record.description ) {
					 record.description = 'No Description Entered';
					 }
					 */
					requests.push( Resources.update( record ) );
				}
			} else if( record.hours >= 0 ) {
				// Default description
				/*if( !record.description ) {
				 record.description = 'No Description Entered';
				 }
				 */
				requests.push( Resources.create( 'hours', record ) );
			}
		}

		return $q.all( requests );
	};

	/**
	 * Get today for queries
	 */
	this.getToday = function( ) {
		// Get todays date formatted as yyyy-MM-dd
		var today = new Date( );
		var dd = today.getDate( );
		var mm = today.getMonth( ) + 1;
		// January is 0!
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


	/**
	 * Returns a set of hours entries for all day between 2 dates for a
	 * given user
	 */
	this.getHoursRecordsBetweenDates = function( person, startDate, endDate ) {

		if (window.useAdoptedServices) {
			return this.getHoursRecordsBetweenDatesUsingGet(person, startDate, endDate);
		}
		else {
			return this.getHoursRecordsBetweenDatesUsingQuery(person, startDate, endDate);
		}
	
	}
	
	/**
	 * Returns a set of hours entries for all day between 2 dates for a
	 * given user
	 */
	this.getHoursRecordsBetweenDatesUsingGet = function( person, startDate, endDate ) {
		
		var deferred = $q.defer( );

		var now = new Date();
		
		var startDateMoment = moment( startDate );
		var endDateMoment = moment( endDate );
		// Adding one to be inclusive
		var numDays = endDateMoment.diff( startDateMoment, 'days' ) + 1;

		var projectURIs = [ ];
		
		var params = {};
		var personURI = person.about ? person.about : person.resource;
		
		params.person = personURI;
		params.startDate = startDate;
		params.endDate = endDate;
		params.t = now.getMilliseconds( );
		
		logger.log('getHoursRecordsBetweenDatesUsingGet:before:0');
		
		Resources.refresh( 'assignments/bytypes/assignmentsByPerson', params ).then( function( result ) {

			logger.log('getHoursRecordsBetweenDatesUsingGet:step:1:' + ((new Date()).getTime() - now.getTime()));
			
			var projectAssignments = result;

			Resources.refresh( 'hours/persondates', params ).then( function( result ) {
				
				logger.log('getHoursRecordsBetweenDatesUsingGet:step:2:' + ((new Date()).getTime() - now.getTime()));

						var hoursResults = result.members;
						var ret = [ ], i;

						// Init the array
						for( i = 0; i < numDays; i++ ) {
							var dateMoment = moment( startDate ).add( 'days', i );
							var date = dateMoment.format( 'YYYY-MM-DD' );
							ret[ i ] = {
								totalHours: 0,
								date: date,
								hoursEntries: [ ]
							};
						}

						
						// Go through all the hours results and add them to the
						// return array
						for( var i = 0; i < hoursResults.length; i++ ) {
							var hoursRecord = hoursResults[ i ];
							var hoursMoment = moment( hoursRecord.date );

							// Get the difference in days
							var diff = hoursMoment.diff( startDateMoment, 'days' );
							var entries = ret[ diff ];

							// Create the new entry if it does not exist
							if( !entries ) {
								console.warn( 'Adding for hours out side inital array: ' + hoursRecord.date + ' ' + startDate + ' ' + endDate );

								entries = {
									totalHours: 0,
									date: hoursRecord.date,
									hoursEntries: [ ]
								};
								ret[ diff ] = entries;
							}

							// Increment the total hours
							entries.totalHours += hoursRecord.hours;

							entries.hoursEntries.push( {
								project: hoursRecord.project,
								hoursRecord: hoursRecord
							} );

							// Add this to the list of project we need to resolve
							if( hoursRecord.project && projectURIs.indexOf( hoursRecord.project.resource ) === -1 ) {
								var resource = hoursRecord.project.resource;
								projectURIs.push( resource );
							}

						}
						
						
						// Go through all the assignments and add them to the return
						// array
						for( var i = 0; i < projectAssignments.length; i++ ) {
							var assignmentRecord = projectAssignments[ i ];
							var assignmentProjectURI = assignmentRecord.project.resource;

							// Loop through all the days
							for( var j = 0; j < numDays; j++ ) {
								var entries = ret[ j ];
								// Create the new entry if it does not exist
								var dateMoment = moment( startDate ).add( 'days', j );

								if( !entries ) {
									console.warn( 'Adding for assignment out side inital array: ' + date + ' ' + startDate + ' ' + endDate );
									var date = dateMoment.format( 'YYYY-MM-DD' );
									entries = {
											totalHours: 0,
											date: date,
											hoursEntries: [ ]
									};
									ret[ j ] = entries;
								}

								// Check if it is a current assignment
								var assignmentStartDate = moment( assignmentRecord.project.startDate );
								// If no end date default to the passed in end
								// date
								var assignmentEndDate = assignmentRecord.project.endDate ? moment( assignmentRecord.project.endDate ) : endDateMoment;
								if( dateMoment.unix( ) >= assignmentStartDate.unix( ) && dateMoment.unix( ) <= assignmentEndDate.unix( ) ) {
									// Look through the hours records to see if
									// there is one for this assignments project
									var existingEntry = null;
									for( var k = 0; k < entries.hoursEntries.length; k++ ) {
										var entry = entries.hoursEntries[ k ];

										if( entry.project ) {
											var hoursProjectURI = entry.project.resource;

											if( hoursProjectURI == assignmentProjectURI ) {
												existingEntry = entry.assignment = assignmentRecord;
												break;
											}
										}

									}

									// Not Found
									if( !existingEntry ) {

										// add empty record with recored hours equal 0
										entries.hoursEntries.push( {
											project: {
												resource: assignmentProjectURI
											},
											assignment: assignmentRecord,
											hoursRecord: {
												//hours: 0,
												hours: "",
												project: {
													resource: assignmentProjectURI
												}
											}
										} );
										// Add this to the list of project we
										// need to resolve
										if( projectURIs.indexOf( assignmentProjectURI ) === -1 ) {
											var resource = assignmentProjectURI;
											projectURIs.push( resource );
										}
									}
								}
							}
						}

						logger.log('getHoursRecordsBetweenDatesUsingGet:before:projects:' + ((new Date()).getTime() - now.getTime()));
						
						var params = {};
						params.resource = projectURIs;
						Resources.refresh( 'projects/byTypes/projectsByResources', params).then( function( result ) {
							var projects = result.data;

							logger.log('getHoursRecordsBetweenDatesUsingGet:after:projects:' + ((new Date()).getTime() - now.getTime()));
							
							// Fill in all the resolved projects
							for( var i = 0; i < ret.length; i++ ) {
								var day = ret[ i ];
								if( day && day.hoursEntries ) {
									for( var j = day.hoursEntries.length - 1; j >= 0; j-- ) {
										var entry = day.hoursEntries[ j ];

										if( entry.project ) {
											var entryProjectURI = entry.project.resource;
											// Find the matching resolved project
											var found = false;

											for( var k = 0; k < projects.length; k++ ) {
												var project = projects[ k ];
												if( entryProjectURI == project.resource ) {
													// Replace the project
													entry.project = project;
													found = true;
													break;
												}
											}

											if( !found )
												day.hoursEntries.splice( j, 1 );
										}
									}
								}
							}

							deferred.resolve( ret );
												
						} );
						
					} );
				} );
	
			
		return deferred.promise;
	
	};
	
		
	/**
	 * Returns a set of hours entries for all day between 2 dates for a
	 * given user
	 */
	this.getHoursRecordsBetweenDatesUsingQuery = function( person, startDate, endDate ) {
		var deferred = $q.defer( );

		var _this = this;
		// Start by getting all assignments for a person between two dates
		var personURI = person.about ? person.about : person.resource;
		var startDateMoment = moment( startDate );
		var endDateMoment = moment( endDate );
		// Adding one to be inclusive
		var numDays = endDateMoment.diff( startDateMoment, 'days' ) + 1;

		var projectURIs = [ ];
		var projectOIDs = [ ];

		var query = {
			members: {
				'$elemMatch': {
					person: {
						resource: person.about
					},
					startDate: {
						$lte: endDate
					},
					$or: [ {
						endDate: {
							$exists: false
						}
					}, {
						endDate: {
							$gte: startDate
						}
					} ]
				}
			}
		};
		var fields = {
			project: 1,
			"members.startDate": 1,
			"members.endDate": 1,
			"members.person": 1,
			"members.role": 1,
			"members.hoursPerWeek": 1
		};
		// Resources.get('assignments', {query:query,
		// fields:fields}).then(function(result){
		Resources.query( 'assignments', query, fields ).then( function( result ) {
			var projectAssignments = result.data;
			if (!result.data) {	
				projectAssignments = [];
				for (var i = 0; i < result.length; i++) {
					projectAssignments.push({
						members : [result[i]],
						project : result[i].project
					});
				}
			}

			// Fetch all hours entries between these two dates
			var hoursQuery = {
				person: {
					resource: person.about
				},
				$and: [ {
					date: {
						$lte: endDate
					}
				}, {
					date: {
						$gte: startDate
					}
				} ]

			};

			var hoursFields = {};

			_this.query( hoursQuery, hoursFields ).then( function( result ) {
				var hoursResults = result.members;
				var ret = [ ], i;
				// Init the array
				for( i = 0; i < numDays; i++ ) {
					var dateMoment = moment( startDate ).add( 'days', i );
					var date = dateMoment.format( 'YYYY-MM-DD' );
					ret[ i ] = {
						totalHours: 0,
						date: date,
						hoursEntries: [ ]
					};
				}

				// Go through all the hours results and add them to the
				// return array
				for( var i = 0; i < hoursResults.length; i++ ) {
					var hoursRecord = hoursResults[ i ];
					var hoursMoment = moment( hoursRecord.date );

					// Get the difference in days
					var diff = hoursMoment.diff( startDateMoment, 'days' );
					var entries = ret[ diff ];

					// Create the new entry if it does not exist
					if( !entries ) {
						console.warn( 'Adding for hours out side inital array: ' + hoursRecord.date + ' ' + startDate + ' ' + endDate );

						entries = {
							totalHours: 0,
							date: hoursRecord.date,
							hoursEntries: [ ]
						};
						ret[ diff ] = entries;
					}

					// Increment the total hours
					entries.totalHours += hoursRecord.hours;

					entries.hoursEntries.push( {
						project: hoursRecord.project,
						hoursRecord: hoursRecord
					} );

					// Add this to the list of project we need to resolve
					if( hoursRecord.project && projectURIs.indexOf( hoursRecord.project.resource ) === -1 ) {
						var resource = hoursRecord.project.resource;
						projectURIs.push( resource );
						var oid = {
							$oid: resource.substring( resource.lastIndexOf( '/' ) + 1 )
						};
						projectOIDs.push( oid );

					}

				}

				// Go through all the assignments and add them to the return
				// array
				for( var i = 0; i < projectAssignments.length; i++ ) {
					var assignments = projectAssignments[ i ].members;
					var assignmentProjectURI = projectAssignments[ i ].project.resource;
					var assignmentRecord = null;

					for( var p = 0; p < assignments.length; p++ ) {
						var assignment = assignments[ p ];

						if( assignment.person && assignment.person.resource && personURI == assignment.person.resource ) {
							// Check if it is a current assignment
							var assignmentStartDate = moment( assignment.startDate );
							// If no end date default to the passed in end
							// date
							var assignmentEndDate = assignment.endDate ? moment( assignment.endDate ) : endDateMoment;

							if( endDateMoment.unix( ) >= assignmentStartDate.unix( ) && startDateMoment.unix( ) <= assignmentEndDate.unix( ) ) {
								assignmentRecord = assignment;
								break;
							}
						}
					}

					// if we found a matching assignment
					if( assignmentRecord ) {
						// Loop through all the days
						for( var j = 0; j < numDays; j++ ) {
							var entries = ret[ j ];
							// Create the new entry if it does not exist
							var dateMoment = moment( startDate ).add( 'days', j );

							if( !entries ) {
								console.warn( 'Adding for assignment out side inital array: ' + date + ' ' + startDate + ' ' + endDate );
								var date = dateMoment.format( 'YYYY-MM-DD' );
								entries = {
									totalHours: 0,
									date: date,
									hoursEntries: [ ]
								};
								ret[ j ] = entries;
							}

							// Check if it is a current assignment
							var assignmentStartDate = moment( assignment.startDate );
							// If no end date default to the passed in end
							// date
							var assignmentEndDate = assignment.endDate ? moment( assignment.endDate ) : endDateMoment;
							if( dateMoment.unix( ) >= assignmentStartDate.unix( ) && dateMoment.unix( ) <= assignmentEndDate.unix( ) ) {
								// Look through the hours records to see if
								// there is one for this assignments project
								var existingEntry = null;
								for( var k = 0; k < entries.hoursEntries.length; k++ ) {
									var entry = entries.hoursEntries[ k ];

									if( entry.project ) {
										var hoursProjectURI = entry.project.resource;

										if( hoursProjectURI == assignmentProjectURI ) {
											existingEntry = entry.assignment = assignmentRecord;
											break;
										}
									}

								}

								// Not Found
								if( !existingEntry ) {

									// add empty record with recored hours equal 0
									entries.hoursEntries.push( {
										project: {
											resource: assignmentProjectURI
										},
										assignment: assignmentRecord,
										hoursRecord: {
											//hours: 0,
											hours: "",
											project: {
												resource: assignmentProjectURI
											}
										}
									} );
									// Add this to the list of project we
									// need to resolve
									if( projectURIs.indexOf( assignmentProjectURI ) === -1 ) {
										var resource = assignmentProjectURI;
										projectURIs.push( resource );
										var oid = {
											"$oid": resource.substring( resource.lastIndexOf( '/' ) + 1 )
										};
										projectOIDs.push( oid );

									}
								}
							}
						}
					}

				}

				// Fetch all the projects associated with these assignments
				var projectsQuery = {
					_id: {
						$in: projectOIDs
					}
				};

				var projectsFields = {
					resource: 1,
					name: 1,
					customerName: 1,
					startDate: 1,
					endDate: 1,
					type: 1,
					committed: 1
				};
				
				Resources.query( 'projects', projectsQuery, projectsFields ).then( function( result ) {
					var projects = result.data;

					// Fill in all the resolved projects
					for( var i = 0; i < ret.length; i++ ) {
						var day = ret[ i ];
						if( day && day.hoursEntries ) {
							for( var j = day.hoursEntries.length - 1; j >= 0; j-- ) {
								var entry = day.hoursEntries[ j ];

								if( entry.project ) {
									var entryProjectURI = entry.project.resource;
									// Find the matching resolved project
									var found = false;

									for( var k = 0; k < projects.length; k++ ) {
										var project = projects[ k ];
										if( entryProjectURI == project.resource ) {
											// Replace the project
											entry.project = project;
											found = true;
											break;
										}
									}

									if( !found )
										day.hoursEntries.splice( j, 1 );
								}
							}
						}
					}

					deferred.resolve( ret );
				} );

			} );
		} );

		return deferred.promise;
	};

	
	this.getCurrentPersonProjects = function( person ) {
		
		if (window.useAdoptedServices) {
			var resource = person.about ? person.about : person.resource;
			var id = resource.substring( resource.lastIndexOf( '/' ) + 1 );
			return Resources.refresh("projects/byperson/" + id  + "/current").then(function(projects) {
				if (projects && projects.data && projects.data.length > 0)
					return projects.data;
				
				return projects;
			});
		}
		else {
			return this.getCurrentPersonProjectsUsingQuery(person);
		}

	}
	
	
	this.getCurrentPersonProjectsUsingQuery = function( person ) {
		var deferred = $q.defer( );

		// Start by getting all assignments for a person between two dates
		var personURI = person.about ? person.about : person.resource;
		var projectURIs = [ ];
		var projectOIDs = [ ];

		// find all projects on which current person was assigned
		var query = {
			members: {
				'$elemMatch': {
					person: {
						resource: person.about
					}
				}
			}
		};

		var fields = {
			project: 1
		};
		// Resources.get('assignments', {query:query,
		// fields:fields}).then(function(result){
		Resources.query( 'assignments', query, fields ).then( function( result ) {
			var projectAssignments = result.data;

			var projectOIDs = [ ];
			var resource;

			for( var i = 0; i < projectAssignments.length; i++ ) {
				resource = projectAssignments[ i ].project.resource;

				projectOIDs.push( {
					$oid: resource.substring( resource.lastIndexOf( '/' ) + 1 )
				} );
			}

			var projectsQuery = {
				_id: {
					$in: projectOIDs
				}
			};
			var projectFields = {
				resource: 1,
				name: 1,
				startDate: 1,
				endDate: 1,
				'roles': 1,
				customerName: 1,
				committed: 1,
				type: 1,
				description: 1
			};

			Resources.query( 'projects', projectsQuery, projectFields, function( result ) {
				var projectsResults = result.members;

				deferred.resolve( result.data );
			} );
		} );

		return deferred.promise;
	};

	this.query = function( query, fields ) {
		var deferred = $q.defer( );
		var hoursFields = {};
		var hoursQuery = {};

		if( window.useAdoptedServices ) {
			var onlyAndDates = query.$and && query.$and.length > 0;
			var orEmpty = !query.$or || query.$or.length > 0;
			var onlyProjects = query.$or && query.$or.length > 0;

			var startDate = null;
			var endDate = null;

			var projects = [ ];

			for( var i = 0; query.$and && i < query.$and.length; i++ ) {
				onlyAndDates = onlyAndDates && query.$and[ i ].date;

				if( onlyAndDates && query.$and[ i ].date.$lte )
					endDate = onlyAndDates && query.$and[ i ].date.$lte;
				else if( onlyAndDates && query.$and[ i ].date.$lt )
					endDate = onlyAndDates && query.$and[ i ].date.$lt;
				else if( onlyAndDates && query.$and[ i ].date.$gt )
					startDate = onlyAndDates && query.$and[ i ].date.$gt;
				else if( onlyAndDates && query.$and[ i ].date.$gte )
					startDate = onlyAndDates && query.$and[ i ].date.$gte;

			}

			// init onlyProjects flag
			for( var i = 0; query.$or && i < query.$or.length; i++ ) {
				onlyProjects = onlyProjects && query.$or[ i ][ 'project.resource' ];

				if( onlyProjects )
					projects.push( query.$or[ i ][ 'project.resource' ] );
			}

			fields = fields ? fields : {};

			var updFields = [];
			for (var attr in fields) {
				if (fields.hasOwnProperty(attr) && fields[attr] == 1) {
					updFields.push(attr);
				}
			}
			
			var now = new Date();
			
			if( !query.project && query.person && query.person.resource && startDate && endDate && orEmpty && onlyAndDates ) {
				logger.log('query:before:hours/persondates:before:' + ((new Date()).getTime() - now.getTime()));
				
				Resources.get( 'hours/persondates', {
					person: query.person.resource,
					startDate: startDate,
					endDate: endDate,
					fields: updFields,
					// to prevent from getting values from cache
					t: ( new Date( ) ).getMilliseconds( )
				} ).then( function( result ) {
					logger.log('query:before:hours/persondates:after:' + ((new Date()).getTime() - now.getTime()));
					
					deferred.resolve( result );
				} );
			} else if( !query.person && (onlyProjects || (query.project && query.project.resource) )  && startDate && endDate && orEmpty && onlyAndDates ) {
				var prj = (query.project && query.project.resource) ? query.project.resource : projects;
				Resources.get( 'hours/projectdates', {
					project: prj,
					startDate: startDate,
					endDate: endDate,
					fields: updFields,
					// to prevent from getting values from cache
					t: ( new Date( ) ).getMilliseconds( )
				} ).then( function( result ) {
					deferred.resolve( result );
				} );
			} else if( ( query.person || query[ 'person.resource' ] ) && !query.project && !startDate && !endDate && orEmpty && !onlyAndDates ) {
				var resource = query[ 'person.resource' ] ? query[ 'person.resource' ] : null;

				if( !resource )
					resource = query.person ? query.person.resource : null;

				Resources.get( 'hours/person', {
					person: resource,
					fields: updFields,
					// to prevent from getting values from cache
					t: ( new Date( ) ).getMilliseconds( )
				} ).then( function( result ) {
					deferred.resolve( result );
				} );

			} else if( onlyProjects ) {
				Resources.get( 'hours/projects', {
					projects: projects,
					fields: updFields,
					// to prevent from getting values from cache
					t: ( new Date( ) ).getMilliseconds( )
				} ).then( function( result ) {
					deferred.resolve( result );
				} );

			} else
				Resources.query( 'hours', _.extend( hoursQuery, query ), _.extend( hoursFields, fields ), function( result ) {
					deferred.resolve( result );
				} );
		} else
			Resources.query( 'hours', _.extend( hoursQuery, query ), _.extend( hoursFields, fields ), function( result ) {
				deferred.resolve( result );
			} );
		return deferred.promise;
	};
} ] );
