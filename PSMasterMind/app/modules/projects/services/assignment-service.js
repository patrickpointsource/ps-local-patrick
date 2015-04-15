'use strict';

angular.module( 'Mastermind.services.projects' ).service( 'AssignmentService', [ '$q', 'RateFactory', 'Assignment', 'Resources', 'ProjectsService',
function( $q, RateFactory, Assignment, Resources, ProjectsService ) {
	/**
	 * Change a Assignment's rate type between hourly, weekly, and monthly.
	 *
	 * @param newType 'hourly', 'weekly', or 'monthly'
	 */
	Assignment.prototype.changeType = function( newType ) {
		this.rate = RateFactory.build( newType );
	};

	/**
	 * Create a new role
	 *
	 * @param rateType 'hourly', 'weekly', or 'monthly'
	 */
	this.create = function( props ) {
		return new Assignment( props );
	};

	/**
	 * Validate an assignments collection for specified role.
	 *
	 * @param project
	 * @param assignments
	 */
	this.validateAssignments = function( project, assignments ) {
		var errors = [ ];
		if ( !assignments )
			return errors;

		//Assignee for each entry is Required
		var anyResourceUnassigned = false;
		var anyHoursPerWeekMissed = false;
		var countEmptyPersons = 0;

		for( var i = 0; i < assignments.length; i++ ) {
			if( !( assignments[ i ].person && assignments[ i ].person.resource ) )
				anyResourceUnassigned = true;

			if( !assignments[ i ].hoursPerWeek )
				anyHoursPerWeekMissed = true;

			if( !assignments[ i ].hoursPerWeek || !( assignments[ i ].person && assignments[ i ].person.resource ) )
				countEmptyPersons++;
		}

		// allow one entry assignment to keep role unassigned
		if( anyResourceUnassigned && ( countEmptyPersons >= 1 && assignments.length > 1 ) ) {
			errors.push( 'For each assignee entry can\'t be empty' );
		} else if( anyHoursPerWeekMissed && !anyResourceUnassigned ) {
			errors.push( 'For each assignee entry hours per week is required' );
		}

		return errors;
	};

	/**
	 * Get today for queries
	 */
	this.getToday = function( ) {
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

	/**
	 * Get today for js objects
	 */
	this.getTodayDate = function( ) {
		//Get todays date formatted as yyyy-MM-dd
		var today = new Date( );
		var dd = today.getDate( );
		var mm = today.getMonth( );
		//January is 0!
		var yyyy = today.getFullYear( );

		return new Date( yyyy, mm, dd );
	};


	/**
	 * Get all the assignments for a given project
	 */

	this.getCurrentAndFurtureAssignmentsForProject = function( projectURI ) {
		var params = {};
		params.projectResource = projectURI;
		return Resources.refresh("assignments/bytypes/assignmentsByProject", params);
	};
		
	
	/**
	 * Get the assignment records for a set of projects
	 *
	 * project records that include the about or resource properties set
	 */
	
	this.getAssignments = function( projects, timePeriod ) {
		var params = {};
		var projectResources = [];
		for( var i = 0; i < projects.length; i++ ) {
			var project = projects[ i ];
			var uri = project.about ? project.about : project.resource;

			if( uri && projectResources.indexOf( uri ) == -1 ) {
				projectResources.push( uri );
			}
		}

		params.projectResource = projectResources;
		params.timePeriod = timePeriod;
		
		return Resources.refresh("assignments/bytypes/assignmentsByProjectsAndTimePeriod", params).then(function(assignments){
			
			assignments = prepareAssignment(assignments);
			
			assignments = assignments.members && assignments.members.length != undefined? assignments.members: assignments;
			return assignments;
		});
	};
	
	var prepareAssignment = function ( assignments ) {
		
		// in case when we get "data" collection instead of "members"
		if (_.isObject(assignments) && assignments.data && !assignments.members){
			assignments.members = assignments.data;
			delete assignments.data;
		} else if (_.isObject(assignments) && assignments.project && assignments.members) {
			assignments = {members:[{
				id: assignments._id,
				rev: assignments._rev,
				project: assignments.project,
				form: assignments.form,
				about: assignments.about,
				members: assignments.members,
				
			}]};
					
			
		}
		
		return assignments;
	};

	/**
	 * Get A person's Assignments today and going forward
	 */

	this.getMyCurrentAssignments = function( person ) {
		var params = {};
		params.person = person.about ? person.about : person.resource;
		return Resources.refresh("assignments/bytypes/assignmentsByPerson", params);
	};
	
	this.getActualAssignmentsForPerson = function(assignments, profile) {
		var myAssignments = [];

		for(var projectAssignmentsCounter = 0; projectAssignmentsCounter < assignments.length; projectAssignmentsCounter++) {
			var projectAssignment = assignments[projectAssignmentsCounter];
			for(var membersCounter = 0; membersCounter < projectAssignment.members.length; membersCounter++) {
				var member = projectAssignment.members[membersCounter];
				if(profile.about == member.person.resource) {
					var now = moment( );
					var start = moment( member.startDate );
					if( start.isBefore( now ) || start.isSame( now, 'day' ) ) {
						if( !member.endDate || moment( member.endDate ).isAfter( now ) || moment( member.endDate ).isSame( now, 'day' ) ) {
							member.project = projectAssignment.project;
							myAssignments.push(member);
						}
					}
				}
			} 
		}
		return myAssignments;
	};      
	
	this.getAssignmentsHoursRate = function( assignments ) {
		var cnt = 0;
        for( var i = 0; i < assignments.length; i++ ) {
            var assignment = assignments[ i ];
            var now = moment( );
            if (assignment.project) {
            	if ( !assignment.project.endDate || moment( assignment.project.endDate ).isAfter( now ) ) {
            		var start = moment( assignment.startDate );
            		if( start.isBefore( now ) || start.isSame( now, 'day' ) ) {
            			if( !assignment.endDate || moment( assignment.endDate ).isAfter( now ) || moment( assignment.endDate ).isSame( now, 'day' ) ) {
            				cnt += assignment.hoursPerWeek;
            			}
            		}
            	}
            }
        }
       return cnt;
	};     
	
	
	/**
	 * Filters out a set of assignments based on time period
	 *
	 * 'current' == all active project
	 * 'future' == all assignments that have not yet started
	 * 'past' == all assignments that have already ends
	 *
	 */
	
	this.getAssignmentsByPeriod = function( timePeriod, projectQuery ) {
		var params = {};
		params.projectResource = projectQuery.project.resource;
		params.timePeriod = timePeriod;
		return Resources.refresh("assignments/bytypes/assignmentsByProjectsAndTimePeriod", params).then(function(assignments){
			prepareAssignment(assignments);
			return assignments;
		});
	};
		

	this.filterAssignmentsByPeriod = function( assignmentsObject, period ) {

		if( assignmentsObject && assignmentsObject.members ) {
			var today = this.getTodayDate( );
			var excluded = [ ];
			var included = [ ];

			_.each( assignmentsObject.members, function( m ) {
				if( period == "current" ) {
					if( new Date( m.startDate ) <= today && ( !m.endDate || new Date( m.endDate ) > today ) )
						included.push( m );
					else
						excluded.push( m );
				} else if( period == "future" ) {
					if( new Date( m.startDate ) >= today && ( !m.endDate || new Date( m.endDate ) > today ) )
						included.push( m );
					else
						excluded.push( m );
				} else if( period == "past" ) {
					if( new Date( m.startDate ) < today && ( !m.endDate || new Date( m.endDate ) < today ) )
						included.push( m );
					else
						excluded.push( m );
				} else if( period == "all" )
					included.push( m );
			} );

			assignmentsObject.members = included;
			assignmentsObject.excludedMembers = excluded;
		}

		return assignmentsObject;
	};

	/**
	 * Service function for persisting a project, new or previously
	 * existing.
	 *
	 * @param project
	 */
	this.save = function( project, projectAssignment ) {
		var val;

		for( var i = 0; i < projectAssignment.members.length; i++ ) {
			// fix datepicker making dates = '' when clearing them out
			if( projectAssignment.members[ i ].startDate === null || projectAssignment.members[ i ].startDate === '' ) {
				projectAssignment.members[ i ].startDate = undefined;
			}
			
			if( projectAssignment.members[ i ].endDate === null || projectAssignment.members[ i ].endDate === '' ) {
				projectAssignment.members[ i ].endDate = undefined;
			}

			if (projectAssignment.members[i].project) {
			    projectAssignment.members[i].project = {
			        _id: projectAssignment.members[i].project._id,
			        _rev: projectAssignment.members[i].project._rev,
			        about: projectAssignment.members[i].project.about,
			        resource: projectAssignment.members[i].project.resource,
			        name: projectAssignment.members[i].project.name
			    };
			}
				
			if (projectAssignment.members[i].person.thumbnail) {
			    delete projectAssignment.members[i].person.thumbnail;
			}
		}

		val = Resources.update( projectAssignment );

		return val;
	};

	this.calculateSingleRoleCoverage = function( role, assignments, includePastCoverage ) {

		var tmpDate;

		function alignDate( date ) {
			//return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
			// 0, 0, 0));
			return new Date( date.getFullYear( ), date.getMonth( ), date.getDate( ), 0, 0, 0 );
		}

		var now = alignDate( new Date( ) );
		var today = alignDate( new Date( now.getFullYear( ), now.getMonth( ), now.getDate( ) ) );

		var result = {
			percentageCovered: 0,
			percentageExtraCovered: 0
		};

		assignments = _.filter( assignments, function( a ) {
			return a.person && a.person.resource;
		} );

		var ONE_DAY = CONSTS.ONE_DAY;
		// store info about role assignments on timeline
		tmpDate = alignDate( new Date( role.startDate ) );

		var minDate = ( includePastCoverage || today < tmpDate ) ? tmpDate : today;
		var maxDate = role.endDate ? alignDate( new Date( role.endDate ) ) : null;

		var coverageTimeline = [ {
			date: ( includePastCoverage || today < tmpDate ) ? tmpDate : today,
			entity: role,
			type: 'start',
			hours: 0,
			isRole: true
		} ];

		if( role.endDate )
			coverageTimeline.push( {
				date: alignDate( new Date( role.endDate ) ),
				entity: role,
				type: 'end',
				hours: 0,
				isRole: true
			} );

		var assignmentsWithoutEndDate = [ ];
		var maxStartDate = alignDate( new Date( role.startDate ) );
		var maxEndDate = new Date( maxStartDate );

		var alignEntityStartEndDates = function( restrictPast, entity ) {

			var resultEntity = _.extend( {}, entity );

			resultEntity.startDate = alignDate( new Date( entity.startDate ) );

			if( restrictPast && entity.startDate < today )
				resultEntity.startDate = alignDate( new Date( today ) );

			if( entity.endDate ) {
				resultEntity.endDate = alignDate( new Date( entity.endDate ) );

				if( restrictPast && entity.endDate < today )
					resultEntity.endDate = alignDate( new Date( today ) );
			}

			return resultEntity;
		};

		var entity;

		for( var i = 0; i < assignments.length; i++ ) {

			entity = alignEntityStartEndDates( !includePastCoverage, assignments[ i ] );

			coverageTimeline.push( {
				date: entity.startDate,
				entity: entity,
				type: 'start',
				hours: 0
			} );

			if( maxStartDate < entity.startDate )
				maxStartDate = alignDate( new Date( entity.startDate ) );

			if( entity.endDate && maxEndDate < entity.endDate )
				maxEndDate = alignDate( new Date( entity.endDate ) );

			// prevent from calculation errors where assignments done for earlier or bigger
			// dates than role
			if( coverageTimeline[ coverageTimeline.length - 1 ].date < minDate )
				coverageTimeline[ coverageTimeline.length - 1 ].date = minDate;

			if( maxDate && coverageTimeline[ coverageTimeline.length - 1 ].date > maxDate )
				coverageTimeline[ coverageTimeline.length - 1 ].date = maxDate;

			if( entity.endDate )
				coverageTimeline.push( {
					date: alignDate( new Date( entity.endDate ) ),
					entity: entity,
					type: 'end',
					hours: 0
				} );
			else
				assignmentsWithoutEndDate.push( entity );

			// prevent from calculation errors where assignm,ents done for earlier or bigger
			// dates than role
			if( coverageTimeline[ coverageTimeline.length - 1 ].date < minDate )
				coverageTimeline[ coverageTimeline.length - 1 ].date = minDate;

			if( maxDate && coverageTimeline[ coverageTimeline.length - 1 ].date > maxDate )
				coverageTimeline[ coverageTimeline.length - 1 ].date = maxDate;
		}

		maxStartDate = maxStartDate < today ? alignDate( new Date( today ) ) : maxStartDate;

		var defaultEndDate;

		if( maxEndDate > maxStartDate )
			defaultEndDate = alignDate( new Date( maxEndDate.getTime( ) + ONE_DAY ) );
		else
			defaultEndDate = alignDate( new Date( maxStartDate.getTime( ) + ONE_DAY ) );

		if( !role.endDate )
			coverageTimeline.push( {
				date: defaultEndDate,
				entity: role,
				type: 'end',
				hours: 0,
				isRole: true
			} );

		for( var i = 0; i < assignmentsWithoutEndDate.length; i++ )
			coverageTimeline.push( {
				date: defaultEndDate,
				entity: assignmentsWithoutEndDate[ i ],
				type: 'end',
				hours: 0
			} );
		// sort timeline so that we will have all period divided into few small periods
		// with  stable assignments coverage during this period
		coverageTimeline.sort( function( o1, o2 ) {
			if( o1.date > o2.date )
				return 1;
			else if( o1.date < o2.date )
				return -1;

			if( o1.isRole && !o2.isRole && o1.type == 'end' )
				return 1;
			else if( !o1.isRole && o2.isRole && o2.type == 'end' )
				return -1;
			else if( o1.type == 'end' && o2.type != 'end' )
				return 1;
			else if( o2.type == 'end' && o1.type != 'end' )
				return -1;

			return 0;
		} );
		// calculate for each period its h/w coverage
		var currentHoursPerWeek = 0;

		for( var i = 1; i < ( coverageTimeline.length - 1 ); i++ ) {

			if( coverageTimeline[ i ].type == 'start' )
				currentHoursPerWeek += coverageTimeline[ i ].entity.hoursPerWeek;
			else if( coverageTimeline[ i ].type == 'end' )
				currentHoursPerWeek -= coverageTimeline[ i ].entity.hoursPerWeek;

			coverageTimeline[ i ].hours = currentHoursPerWeek;
		}

		// calculate total percentage coverage
		var HOURS_PER_MONTH = CONSTS.HOURS_PER_MONTH;
		var HOURS_PER_WEEK = CONSTS.HOURS_PER_WEEK;
		var ONE_WEEK = CONSTS.HOURS_PER_WEEK;

		//if ((!role.rate.isFullyUtilized()) && role.rate.type == "hourly")
		if( ( !role.rate.fullyUtilized ) && role.rate.type == "hourly" )
			//ONE_WEEK = Math.round(role.rate.hoursPerMonth() / HOURS_PER_MONTH *
			// HOURS_PER_WEEK)
			ONE_WEEK = Math.round( role.rate.hoursPerMth / HOURS_PER_MONTH * HOURS_PER_WEEK );
		else if( !role.rate.fullyUtilized && role.rate.type == "weekly" )
			//else if (!role.rate.isFullyUtilized() && role.rate.type == "weekly")
			ONE_WEEK = role.rate.hoursPerWeek;

		var totalCountDays = Math.ceil( ( coverageTimeline[ coverageTimeline.length - 1 ].date.getTime( ) - coverageTimeline[ 0 ].date.getTime( ) ) / ONE_DAY );
		var currentCountDays = 0;
		var currentK = 0;
		var currentExtraK = 0;
		var totalCovered = 0;
		var totalExtraCovered = 0;
		var kMin = 1;
		var substractDays = 0;
		var countDaysGap = 0;

		currentCountDays = Math.ceil( ( coverageTimeline[ 1 ].date.getTime( ) - coverageTimeline[ 0 ].date.getTime( ) ) / ONE_DAY );

		countDaysGap += currentCountDays;

		for( var i = 1; i < ( coverageTimeline.length - 1 ); i++ ) {
			currentK = coverageTimeline[ i ].hours / ONE_WEEK;

			currentExtraK = currentK > 1 ? ( currentK - 1 ) : 0;
			currentK = currentK > 1 ? 1 : currentK;

			currentCountDays = Math.ceil( ( coverageTimeline[ i + 1 ].date.getTime( ) - coverageTimeline[ i ].date.getTime( ) ) / ONE_DAY );

			if( currentCountDays == 1 && coverageTimeline[ i + 1 ].type == 'start' && coverageTimeline[ i ].type == 'end' ) {
				currentCountDays = 0;
				substractDays += 1;
			}

			if( currentK == 0 )
				countDaysGap += currentCountDays;

			if( currentCountDays > 0 )
				kMin = kMin > currentK ? currentK : kMin;

			totalCovered += currentCountDays * currentK;
			totalExtraCovered += currentCountDays * currentExtraK;
		}

		totalCountDays -= substractDays;

		result.percentageCovered = totalCountDays ? Math.round( 100 * totalCovered / totalCountDays ) : 0;
		result.hoursExtraCovered = totalCountDays ? Math.round( ONE_WEEK * totalExtraCovered / totalCountDays ) : 0;
		result.hoursNeededToCover = ( result.percentageCovered < 100 && kMin == 1 ) ? ONE_WEEK : Math.round( ONE_WEEK * ( 1 - kMin ) );
		result.daysGap = countDaysGap;
		result.coveredKMin = kMin;

		return result;
	};

	this.calculateRolesCoverage = function( roles, assignments, analysePastCoverage ) {
		var assignmentsMap = {};
		//var calcSingleRoleCoverage =
		// AssignmentService.prototype.calculateSingleRoleCoverage;

		var findRole = function( roleResource ) {
			return _.find( roles, function( r ) {
				return roleResource.indexOf( r._id ) > -1;
			} );
		};

		for( var i = 0; i < roles.length; i++ ) {
			if (!assignmentsMap[ roles[ i ]._id ])	
				assignmentsMap[ roles[ i ]._id ] = [ ];
			else
				roles[ i ]._duplicated = true;
		};

		var role;

		for( var i = 0; i < assignments.length; i++ ) {
			if( assignments[ i ].role && assignments[ i ].role.resource )
				role = findRole( assignments[ i ].role.resource );
			else
				role = null;

			if( role )
				assignmentsMap[ role._id ].push( assignments[ i ] );
		}

		var currentResult;

		for( var i = 0; i < roles.length; i++ ) {
			if (!roles[ i ]._duplicated) {
				currentResult = this.calculateSingleRoleCoverage( roles[ i ], assignmentsMap[ roles[ i ]._id ], analysePastCoverage );
	
				roles[ i ].percentageCovered = currentResult.percentageCovered;
				roles[ i ].hoursExtraCovered = currentResult.hoursExtraCovered;
				roles[ i ].hoursNeededToCover = currentResult.hoursNeededToCover;
				roles[ i ].daysGap = currentResult.daysGap;
				roles[ i ].coveredKMin = currentResult.coveredKMin;
			}
		}

		//return result;
	};
	
	/**
	 * Return the set of staffing deficits assignments for active projects
	 */
	this.getActiveProjectStaffingDeficits = function( ) {
		var deferred = $q.defer( );

		var numDeficits = 0;
		var activeProjects;
		var getAssignments = this.getAssignments;
		var calculateRolesCoverage = this.calculateRolesCoverage;
		var _this = this;

		/**
		 * Get all the active projects
		 */
		ProjectsService.getActiveClientProjects( ).then( function( result ) {
			activeProjects = result.data;
			var activeProjectsWithUnassignedPeople = [ ];
			var unassignedIndex = 0;

			return getAssignments( activeProjects );
		} ).then( function( data ) {
			var fillDeficit = function( addAllRoles ) {
				/*
				 * Loop through all the roles in the active projects
				 */
				for( var b = 0; b < roles.length; b++ ) {
					var activeRole = roles[ b ];

					if( activeRole.hoursNeededToCover > 0 || addAllRoles ) {
						numDeficits++;
					}
				}
			};

			
			/*
			 * Helps to filter past entries - roles and assignees
			 **/
			var filterPastEntries = function( entry ) {
				var today = new Date( );
				var dd = today.getDate( );
				var mm = today.getMonth( );
				var yyyy = today.getFullYear( );

				today = new Date( yyyy, mm, dd );
				if( new Date( entry.startDate ) < today && ( entry.endDate && new Date( entry.endDate ) < today ) )
					return false;

				return true;
			};

			data = data.members != undefined && data.length == undefined ? data.members: data;
			
			var found = false;

			for( var i = 0; i < activeProjects.length; i++ ) {
				var proj = activeProjects[ i ];
				var foundProjMatch = false;
				var roles = _.filter( activeProjects[ i ].roles, filterPastEntries );
				var projAssignments = undefined;

				found = false;

				for( var l = 0; l < data.length; l++ ) {

					projAssignments = data[ l ];

					if( projAssignments.project.resource == proj.resource ) {

						if( projAssignments.members && projAssignments.members.length > 0 ) {
							var assignees = _.filter( projAssignments.members, filterPastEntries );
							found = true;

							if( roles ) {
								_this.calculateRolesCoverage( roles, assignees );
								// add info about deficit roles
								fillDeficit( );

								break;
							}
						}
					}
				}

				// add info about other deficit roles, which doesn't have assignments
				if( !found )
					fillDeficit( true );
			}
			deferred.resolve( numDeficits );
		} );

		return deferred.promise;
	};

} ] ); 