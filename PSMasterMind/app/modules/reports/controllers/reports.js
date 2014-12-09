'use strict';

/**
 * Controller for Reports.
 */
angular.module( 'Mastermind.controllers.reports' ).controller( 'ReportsCtrl', [ '$scope', '$rootScope', '$q', '$state', '$stateParams', '$filter', 'Resources', 'AssignmentService', 'ProjectsService', 'TasksService', 'RolesService', 'HoursService', 'People', 'ngTableParams',
function( $scope, $rootScope, $q, $state, $stateParams, $filter, Resources, AssignmentService, ProjectsService, TasksService, RolesService, HoursService, People, TableParams ) {

	$scope.activeTab = {
		'hours': true
	};

	$scope.reportTypes = {
		'custom': true
	};

	$scope.reportTerms = {
		'month': true
	};

	$scope.csvData = null;
	$scope.generationTimer = null;
	$scope.reportServicePingInterval = 5000;
	$scope.peopleGroups = null;
	
	$scope.peopleGroups = [];
	$scope.selectedPeopleGroups = null;
	
	$scope.reportClick = function( item ) {
		//alert( item.name );
	};

	$scope.peopleMap = {};
	$scope.projectStatesDisabled = false;

	$scope.roleDepartementMapping = People.getPeopleGroupMapping( );

	$scope.tabSelected = function( tabName ) {
		var prop;

		for( prop in $scope.activeTab ) {
			$scope.activeTab[ prop ] = false;
		}

		$scope.activeTab[ tabName ] = true;

		for( prop in $scope.reportTypes )
		$scope.reportTypes[ prop ] = false;

		if( tabName == 'billing' ) {
			$scope.reportTypes[ "customforecast" ] = true;
			$scope.projectStatesDisabled = true;

			for( prop in $scope.projectStates ) {
				$scope.projectStates[ prop ] = false;
			}

			$scope.projectStates[ "active" ] = true;
		} else if( tabName == 'hours' ) {
			for( var state in $scope.projectStates )
			$scope.projectStates[ state ] = false;

			$scope.projectStates[ "all" ] = true;
			$scope.projectStatesDisabled = false;
		} else {
			for( var state in $scope.projectStates )
			$scope.projectStates[ state ] = false;

			$scope.projectStatesDisabled = false;

			$scope.projectStates[ "all" ] = true;
			$scope.reportTypes[ "custom" ] = true;
			$scope.projectStatesDisabled = false;
		}

	};

	$scope.rolesMapping = {};

	$scope.userRoles = {
		all: {
			value: true
		}
	};

	$scope.arrangedRoles = [ [ {
		abbreviation: "Select all roles",
		value: "all"
	} ], [ ], [ ] ];

	$scope.reportClient = '';
	$scope.reportProject = '';
	$scope.reportPerson = '';

	$scope.projectStates = {
		all: true,
		active: false,
		backlog: false,
		forecasted: false,
		investment: false,
		deallost: false,
		complete: false
	};

	$scope.userGroups = {
		all: false,
		sales: false,
		administration: false,
		clientexperience: false,
		development: false,
		architects: false,
		marketing: false,
		digitalexperience: false,
		executives: false
	};

	$scope.selectProjectState = function( e, state ) {
		var prop;

		if( $scope.projectStatesDisabled )
			return;

		if( state == 'all' && !$scope.projectStates[ state ] )
			for( prop in $scope.projectStates ) {
				$scope.projectStates[ prop ] = true;
			}
		else if( state == 'all' && $scope.projectStates[ state ] )
			for( prop in $scope.projectStates ) {
				$scope.projectStates[ prop ] = false;
			}
		else if( state != 'all' && $scope.projectStates[ state ] )
			$scope.projectStates[ 'all' ] = false;

		$scope.reportProject = null;
	};

	$scope.selectUserGroup = function( e, group ) {
		var prop;

		if( group == 'all' && !$scope.userGroups[ group ] )
			for( prop in $scope.userGroups ) {
				$scope.userGroups[ prop ] = true;
			}
		else if( group == 'all' && $scope.userGroups[ group ] )
			for( prop in $scope.userGroups ) {
				$scope.userGroups[ prop ] = false;
			}
		else if( group != 'all' && $scope.userGroups[ group ] )
			$scope.userGroups[ 'all' ] = false;
	};

	$scope.selectUserRole = function( e, role ) {
		var prop;

		if( role == 'all' && !$scope.userRoles[ role ].value )
			for( prop in $scope.userRoles ) {
				$scope.userRoles[ prop ].value = true;
			}
		else if( role == 'all' && $scope.userRoles[ role ].value )
			for( prop in $scope.userRoles ) {
				$scope.userRoles[ prop ].value = false;
			}
		else if( role != 'all' && $scope.userRoles[ role ] )
			$scope.userRoles[ 'all' ].value = false;

	};

	$scope.loadRoles = function( ) {
		Resources.get( 'roles' ).then( function( result ) {

			var countInRow = Math.floor( ( result.members.length + 1 ) / 3 );
			var ind = 0;
			var nestedInd = 0;

			var i = 0;
			//Get list of roles to query members
			for( i = 0; i < result.members.length; i++ ) {
				var role = result.members[ i ];
				var resource = role.resource;

				ind = Math.floor( i / countInRow );
				nestedInd = ind > 0 ? i % countInRow : ( i % countInRow + 1 );

				if( ind == 2 )
					nestedInd = i - 2 * countInRow;

				$scope.arrangedRoles[ind][ nestedInd ] = role;
				role.value = role.abbreviation.toLowerCase( );

				$scope.userRoles[ role.value ] = {
					value: true,
					resource: role.resource
				};

				$scope.rolesMapping[ role.resource ] = role.value;
			}

		} );
	};

	$scope.selectReportTerms = function( e, term ) {
		var prop;

		for( prop in $scope.reportTerms ) {
			$scope.reportTerms[ prop ] = false;
		}

		$scope.reportTerms[ term ] = true;
	};

	$scope.initPeopleGroups = function() {
		var peopleGroups = People.getPeopleGroupMapping();
		
		$scope.peopleGroups = [];
		$scope.selectedPeopleGroups = null;
		
		for (var group in peopleGroups)
			$scope.peopleGroups.push({
				name: group,
				id: group,
				roles: peopleGroups[group]
			});
		
		$(".select-people-groups").selectpicker();
	};
	
	$scope.loadAndInitPeople = function( ) {
		var peopleInRoleQuery = {};

		var peopleInRoleFields = {
			resource: 1,
			name: 1,
			familyName: 1,
			givenName: 1,
			primaryRole: 1,
			thumbnail: 1
		};

		People.query( peopleInRoleQuery, peopleInRoleFields ).then( function( result ) {
			//Resources.query( 'people', peopleInRoleQuery, peopleInRoleFields, function(
			// result ) {
			var abbr;
			
			$scope.peopleList = _.map( result.members, function( m ) {
				abbr =  m.primaryRole && m.primaryRole.resource ? $scope.rolesMapping[m.primaryRole.resource]: CONSTS.UNDETERMINED_ROLE;
				
				if (abbr)
					abbr = abbr.toUpperCase();
				
				$scope.peopleMap[ m.resource ] = {
					name: m.name,
					abbreviation: abbr
				};

				return {
					value: m.name,
					resource: m.resource
				};
			} );

			$( 'input[name="reportPerson"]' ).typeahead( {
				minLength: 2,
				highlight: true
			}, {
				templates: {
					empty: 'No matching people'
				},
				name: 'peopleds',
				source: Util.getTypeaheadStrFilter( $scope.peopleList )
			} );
		} );

	};

	$scope.loadAndInitProjectsAndClients = function( ) {
		var query = {};

		var fields = {
			resource: 1,
			name: 1,
			familyName: 1,
			givenName: 1,
			primaryRole: 1,
			thumbnail: 1
		};

		ProjectsService.getAllProjects( function( result ) {
			$scope.loadedProjects = result.data;

			$scope.projectList = _.map( result.data, function( m ) {
				return {
					value: m.name,
					resource: m.resource
				};
			} );

			TasksService.refreshTasks( ).then( function( tasks ) {
				tasks = _.map( tasks, function( t ) {
					return {
						value: t.name,
						resource: t.resource
					};
				} );

				$scope.projectList = $scope.projectList.concat( tasks );

				$( 'input[name="reportProject"]' ).typeahead( {
					minLength: 2,
					highlight: true
				}, {
					templates: {
						empty: 'No matching project'
					},
					name: 'projectds',
					source: Util.getTypeaheadStrFilter( $scope.projectList )
				} );

				$( 'input[name="reportProject"]' ).on( 'typeahead:selected', function( e, selected ) {
					$scope.$apply( function( ) {
						var prop;

						for( prop in $scope.projectStates ) {
							$scope.projectStates[ prop ] = false;
						}

						$scope.reportClient = null;
					} );
				} );

			} );

			$scope.clientList = _.map( result.data, function( m ) {
				return {
					value: m.customerName

				};
			} );

			$scope.clientList = _.uniq( $scope.clientList, function( c ) {
				return c.value;
			} );

			$( 'input[name="reportClient"]' ).typeahead( {
				minLength: 2,
				highlight: true
			}, {
				templates: {
					empty: 'No matching client'
				},
				name: 'clientds',
				source: Util.getTypeaheadStrFilter( $scope.clientList )
			} );

			$( 'input[name="reportClient"]' ).on( 'typeahead:selected', function( e, selected ) {
				$scope.$apply( function( ) {

					$scope.reportProject = null;
				} );
			} );
		} );

	};

	$scope.init = function( ) {

		$scope.startGenerationTimers();
		$scope.checkGenerationStatus();

		$scope.loadRoles( );
		$scope.loadAndInitPeople( );
		$scope.loadAndInitProjectsAndClients( );
		$scope.initPeopleGroups();
	};

	$scope.selectReportType = function( e, report ) {
		var prop;

		for( prop in $scope.reportTypes ) {
			$scope.reportTypes[ prop ] = false;
		}

		$scope.reportTypes[ report ] = true;
	};

	$scope.processAndApplyFilters = function( ) {
		// store projects which fits to filtering conditions into array
		var result = [ ];

		// extract selected values as strings
		var reportClient = $( 'input[name="reportClient"]' ).typeahead( 'val' );
		var reportPerson = $( 'input[name="reportPerson"]' ).typeahead( 'val' );
		var reportProject = $( 'input[name="reportProject"]' ).typeahead( 'val' );

		// find objects associated with selected values
		reportPerson = _.find( $scope.peopleList, function( p ) {
			return p.value == reportPerson;
		} );

		reportProject = _.find( $scope.projectList, function( p ) {
			return p.value == reportProject;
		} );

		// 1. determine projects for reports
		var cond = false;
		var i;
		var j;

		// create new instance of projects collection to prevent from using previously
		// filtered roles and removed project values
		$scope.originalProjects = JSON.parse( JSON.stringify( $scope.loadedProjects ) );

		// get map between project resources and string statuses - {project_resource} -
		// {"active" | "investment" | "deallost" | ...}
		var projectStatuses = ProjectsService.getProjectsStatus( $scope.originalProjects );
		
		// filter all projects according to selected values
		for( i = 0; i < $scope.originalProjects.length; i++ ) {
			cond = false;

			cond = cond || !reportProject || (reportProject.resource && $scope.originalProjects[ i ].resource == reportProject.resource);
			cond = cond || $scope.projectStates[ 'all' ];
			cond = cond || $scope.projectStates[ projectStatuses[ $scope.originalProjects[ i ].resource ] ];
			cond = cond || reportClient && $scope.originalProjects[ i ].customerName == reportClient;

			if( cond ) {
				result.push( $scope.originalProjects[ i ] );
			}
		}

		// map between people group names and roles: {"DEVELOPMENT": ["SSE", "SSA", "SE
		// ...]}
		var groupRoleMapping = People.getPeopleGroupMapping( );

		var prop;
		var roles;

		// set a selected roles for which were selected apropriate groups - migrate
		// selection from groups to roles
		for( prop in $scope.userGroups ) {
			if( $scope.userGroups[ prop ] === true ) {
				roles = groupRoleMapping[ prop ];

				for( i = 0; roles && i < roles.length; i++ )
					if( $scope.userRoles[                                                   roles[ i ].toLowerCase( ) ] )
						$scope.userRoles[                                                   roles[ i ].toLowerCase( ) ].value = true;
			}
		}

		// create map between {role_resource} and {selection_value}
		var userRoles = _.object( _.map( $scope.userRoles, function( x ) {
			return [ x.resource, x.value ];
		} ) );

		// 2. filter projects according to selected roles
		for( i = result.length - 1; i >= 0; i-- ) {
			result[ i ].hour = {};

			for( j = result[ i ].roles.length - 1; j >= 0; j-- ) {
				cond = $scope.userRoles[ 'all' ].value;

				cond = cond || userRoles[ result[i].roles[ j ].type.resource ];

				// init abbreviation
				if( $scope.rolesMapping[ result[i].roles[ j ].type.resource ] )
					result[i].roles[ j ].abbreviation = $scope.rolesMapping[ result[i].roles[ j ].type.resource ].toUpperCase( );
				else
					result[i].roles[ j ].abbreviation = '--';

				if( !cond )
					result[ i ].roles.splice( j, 1 );
			}
			
			// add role on which we will assign hours from all unassigned persons
			result[ i ].roles.push({
				type: {
					resource: CONSTS.UNKNOWN_ROLE
				},
				abbreviation: CONSTS.UNKNOWN_ROLE
			});
			
			if( result[ i ].roles.length == 0 )
				result.splice( i, 1 );
			

		}

		// put tasks into result collection
		if (reportProject && reportProject.resource && reportProject.resource.indexOf('tasks') > -1)
			result.push(_.extend({
				name: reportProject.value
			}, reportProject));
		
		// map between {project_resource - [roles_list] - [associated_persons]}
		var projectMapping = {};

		// in case of selected task simply put into map because we have no selected
		// projects and it will be returned empty assignments list
		if( reportProject && reportProject.resource && reportProject.resource.indexOf( 'tasks' ) > -1 )
			projectMapping[ reportProject.resource ] = {
				resource: reportProject.resource,
				name: reportProject.value
			};

		return {
			result: result,
			reportClient: reportClient,
			reportProject: reportProject,
			reportPerson: reportPerson,
			projectMapping: projectMapping
		};
	};

	$scope.generateBillingForecastReport = function( cb ) {
		$scope.csvData = null;

		var filtered = $scope.processAndApplyFilters( );
		var projects = filtered.result;
		var i, j;

		var targetType = '';

		if( $scope.reportTerms[ 'month' ] )
			targetType = 'monthly';
		else if( $scope.reportTerms[ 'week' ] )
			targetType = 'weekly';
		else if( $scope.reportTerms[ 'quarter' ] )
			targetType = 'quarterly';

		var startDate = null;
		var endDate = null;

		if( $scope.reportStartDate ) {
			startDate = $scope.reportStartDate;

			if( targetType == 'monthly' )
				endDate = moment( startDate ).add( 'month', 1 ).format( 'YYYY-MM-DD' );
			else if( targetType == 'weekly' )
				endDate = moment( startDate ).add( 'week', 1 ).format( 'YYYY-MM-DD' );
			else if( targetType == 'quarterly' )
				endDate = moment( startDate ).add( 'month', 3 ).format( 'YYYY-MM-DD' );
		} else if( $scope.reportCustomStartDate && $scope.reportCustomEndDate ) {
			startDate = $scope.reportCustomStartDate;
			endDate = $scope.reportCustomEndDate;
		}

		for( i = projects.length - 1; i >= 0; i-- ) {
			// remove projects which has different report type
			if( !projects[ i ].terms.billingFrequency ) {
				projects.splice( i, 1 );
			} else if( projects[ i ].terms.billingFrequency.indexOf( targetType ) == -1 ) {
				projects.splice( i, 1 );
			} else if( startDate && ( projects[ i ].terms.billingDate < startDate || projects[ i ].terms.billingDate > endDate ) ) {
				projects.splice( i, 1 );
			}
		}

		$scope.onReportGenerated( projects );
	};

	$scope.generateBillingAccrualsReport  = function( ) {
		$scope.csvData = null;

		var filtered = $scope.processAndApplyFilters( );
		var projects = filtered.result;
		var i, j;

		var targetType = '';

		if( $scope.reportTerms[ 'month' ] )
			targetType = 'monthly';
		else if( $scope.reportTerms[ 'week' ] )
			targetType = 'weekly';
		else if( $scope.reportTerms[ 'quarter' ] )
			targetType = 'quarterly';

		var startDate = null;
		var endDate = null;

		if( $scope.reportStartDate ) {
			startDate = $scope.reportStartDate;

			if( targetType == 'monthly' )
				endDate = moment( startDate ).add( 'month', 1 ).format( 'YYYY-MM-DD' );
			else if( targetType == 'weekly' )
				endDate = moment( startDate ).add( 'week', 1 ).format( 'YYYY-MM-DD' );
			else if( targetType == 'quarterly' )
				endDate = moment( startDate ).add( 'month', 3 ).format( 'YYYY-MM-DD' );
		} else if( $scope.reportCustomStartDate && $scope.reportCustomEndDate ) {
			startDate = $scope.reportCustomStartDate;
			endDate = $scope.reportCustomEndDate;
		}

		var currentBillingDate;

		for( i = projects.length - 1; i >= 0; i-- ) {
			// remove projects which has different report type ot which have billing
			if( !projects[ i ].terms.billingFrequency ) {
				projects.splice( i, 1 );
			} else if( projects[ i ].terms.billingFrequency.indexOf( targetType ) == -1 ) {
				projects.splice( i, 1 );
			} else {
				currentBillingDate = projects[ i ].terms.billingDate;

				var now = new moment();
				var prev = startDate;
				var billingMaxDate = projects[ i ].terms.lastBillingDate ? projects[ i ].terms.lastBillingDate : projects[ i ].endDate;

				while( currentBillingDate < now && currentBillingDate < billingMaxDate ) {
					prev = currentBillingDate;

					if( projects[ i ].terms.billingFrequency == 'monthly' )
						currentBillingDate = moment( startDate ).add( 'month', 1 ).format( 'YYYY-MM-DD' );
					else if( projects[ i ].terms.billingFrequency == 'weekly' )
						currentBillingDate = moment( startDate ).add( 'week', 1 ).format( 'YYYY-MM-DD' );
					else if( projects[ i ].terms.billingFrequency == 'quarterly' )
						currentBillingDate = moment( startDate ).add( 'month', 3 ).format( 'YYYY-MM-DD' );
				}

				currentBillingDate = prev;

				if( startDate && ( currentBillingDate < startDate || currentBillingDate > endDate ) ) {
					projects.splice( i, 1 );
				}
			}
		}
        
        var result = filtered.result;
		var reportClient = filtered.reportClient;
		var reportProject = filtered.reportProject;
		var reportPerson = filtered.reportPerson;
		var projectMapping = filtered.projectMapping;
		
		var params = {
          projectResources: $scope.getProjectResources(projects),
          reportClient: reportClient,
          reportProject: reportProject,
          reportPerson: reportPerson,
          projectMapping: projectMapping,
          startDate: startDate,
          endDate: endDate,
          targetType: targetType
        };

        Resources.refresh("/reports/asyncBillingAccurals/generate", params, {});
        
		//var i, j;
		// load assignments for filtered projects
		/*AssignmentService.getAssignments( projects ).then( function( assignments ) {
			var persons = [ ];

			for( i = 0; i < assignments.length; i++ ) {

				//result[ i ].hour.hours = 1;
				for( j = 0; j < assignments[ i ].members.length; j++ ) {

					if( !reportPerson || reportPerson.resource == assignments[ i ].members[ j ].person.resource ) {
						if( !projectMapping[ assignments[ i ].project.resource ] )
							projectMapping[ assignments[ i ].project.resource ] = {};

						if( !projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ] )
							projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ] = [ ];

						person = {
							resource: assignments[ i ].members[ j ].person.resource,
							hoursPerWeek: assignments[ i ].members[ j ].hoursPerWeek,
							startDate: assignments[ i ].members[ j ].startDate,
							endDate: assignments[ i ].members[ j ].endDate,
							name: Util.getPersonName($scope.peopleMap[ assignments[ i ].members[ j ].person.resource ])
						};

						var project = _.find( projects, function( p ) {
							return p.resource == assignments[ i ].project.resource;
						} );
						var now = moment( ).format( 'YYYY-MM-DD' );

						startDate = project.terms.billingDate;
						var prev = startDate;

						while( startDate < now ) {
							prev = startDate;

							if( targetType == 'monthly' )
								startDate = moment( startDate ).add( 'month', 1 ).format( 'YYYY-MM-DD' );
							else if( targetType == 'weekly' )
								startDate = moment( startDate ).add( 'week', 1 ).format( 'YYYY-MM-DD' );
							else if( targetType == 'quarterly' )
								startDate = moment( startDate ).add( 'month', 3 ).format( 'YYYY-MM-DD' );
						}

						startDate = prev;

						if( targetType == 'monthly' )
							endDate = moment( startDate ).add( 'month', 1 ).format( 'YYYY-MM-DD' );
						else if( targetType == 'weekly' )
							endDate = moment( startDate ).add( 'week', 1 ).format( 'YYYY-MM-DD' );
						else if( targetType == 'quarterly' )
							endDate = moment( startDate ).add( 'month', 3 ).format( 'YYYY-MM-DD' );

						projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ].push( person );

						person.hours = person.hours ? person.hours : [ ];

						person.startBillingDate = startDate;
						person.endBillingDate = endDate;

						if( person.startDate > person.startBillingDate )
							person.startBillingDate = person.startDate;

						if( person.endDate < person.endBillingDate )
							person.endBillingDate = person.endDate;

						//if( !reportPerson || reportPerson.resource == assignments[ i ].members[ j
						// ].person.resource )
						persons.push( assignments[ i ].members[ j ].person.resource );
					}
				}
			}

			// prepare requests to load hours for associated with filtered projects people
			var hoursQ = {
				$or: [ ]
			};

			var prop;

			hoursQ.$or = _.map( projectMapping, function( val, key ) {
				if( key.indexOf( 'tasks' ) > -1 )
					return {
						"task.resource": key
					};
				return {
					"project.resource": key
				};
			} );
			hoursQ.$or = _.uniq( hoursQ.$or, function( p ) {
				return p[ "project.resource" ];
			} );
			
			if( hoursQ[ "$or" ].length > 0 ) {
				var fields = {
					hoursQ: hoursQ,
				};
				Resources.refresh("/reports/project/generate", null, fields);
			}
			else
				$scope.cancelReportGeneration( );

		} );*/

	};
	
	$scope.getBillingAccrualsReportData = function ( reportHours, cb ) {
		
		var filtered = $scope.processAndApplyFilters( );

		var projects = filtered.result;
		var reportClient = filtered.reportClient;
		var reportProject = filtered.reportProject;
		var reportPerson = filtered.reportPerson;
		var projectMapping = filtered.projectMapping;
		
		var person;
		var mappingEntry;

		// find by person_resource person in {roles_mapping}-[persons]
		var findPersonOnProject = function( rolesPersonMapping, resource ) {
			var prop;
			var result = null;

			for( prop in rolesPersonMapping ) {
				result = result || _.find( rolesPersonMapping[ prop ], function( p ) {
					return p.resource == resource;
				} );
			}

			return result;
		};
		
		for(var i = 0; i < reportHours.length; i++ ) {

			// find person entry associated with current hours entry
			if( reportHours[ i ].project && reportHours[ i ].project.resource ) {
				mappingEntry = projectMapping[ reportHours[ i ].project.resource ];
				person = findPersonOnProject( mappingEntry, reportHours[ i ].person.resource );
			} else if( reportHours[ i ].task && reportHours[ i ].task.resource ) {
				person = null;

				if( projectMapping[ reportHours[ i ].task.resource ].persons )
					person = _.find( projectMapping[ reportHours[ i ].task.resource ].persons, function( p ) {
						return p.resource == reportHours[ i ].person.resource;
					} );

				if( !projectMapping[ reportHours[ i ].task.resource ].persons )
					projectMapping[ reportHours[ i ].task.resource ].persons = [ ];

				if( !person ) {
					person = {
						name:  Util.getPersonName($scope.peopleMap[ reportHours[ i ].person.resource ]),
						resource: reportHours[ i ].person.resource
					};

					projectMapping[ reportHours[ i ].task.resource ].persons.push( person );
				}
			}

			// for found person put current hours entry into hours collection
			if( person ) {

				if( reportHours[ i ].date >= person.startBillingDate && reportHours[ i ].date <= person.endBillingDate ) {
					person.hours.push( {
						hours: reportHours[ i ].hours,
						description: reportHours[ i ].description,
						date: reportHours[ i ].date
					} );

				}
			}
		}

		var roleResource;
		// migrate initialized persons collection with associated hours for each role to
		// each project role
		for(var i = 0; i < projects.length; i++ )
			for(var j = 0; j < projects[ i ].roles.length; j++ ) {
				roleResource = projects[ i ].resource + '/roles/' + projects[i].roles[ j ]._id;

				if( projectMapping[ projects[ i ].resource ] && projectMapping[ projects[ i ].resource ][ roleResource ] ) {
					projects[i].roles[ j ].persons = projectMapping[ projects[i].resource ][ roleResource ];
					
					for(var l = 0; l < projects[i].roles[ j ].persons.length; l++ ) {
						if( projects[i].roles[ j ].persons[ l ].hours )
							projects[i].roles[ j ].persons[ l ].hours.sort( function( p1, p2 ) {
								if( p1.date < p2.date )
									return 1;
								else if( p1.date > p2.date )
									return -1;
								return 0;
							} );
					}
				} else
					projects[i].roles[ j ].persons = [ ];

			}

		if( projects.length == 0 )
			// put tasks info
			for( prop in projectMapping )
			projects.push( projectMapping[ prop ] );
		
		cb( projects );

	};
	
	$scope.getProjectResources = function(projects) {
	  var projectResources = [];
      for( var i = 0; i < projects.length; i++ ) {
        var project = projects[ i ];
        var uri = project.about ? project.about : project.resource;

        if( uri && projectResources.indexOf( uri ) == -1 ) {
          projectResources.push( uri );
        }
      }
      
      return projectResources;
	};

	$scope.generateHoursReport = function( ) {
		$scope.csvData = null;

		var filtered = $scope.processAndApplyFilters( );

		var result = filtered.result;
		var reportClient = filtered.reportClient;
		var reportProject = filtered.reportProject;
		var reportPerson = filtered.reportPerson;
		var projectMapping = filtered.projectMapping;
        
		var i, j;
		//var hoursData = [];
		
		var params = {
		  projectResources: $scope.getProjectResources(result),
		  reportClient: reportClient,
		  reportProject: reportProject,
		  reportPerson: reportPerson,
		  projectMapping: projectMapping
		};
		
		if ($scope.reportCustomStartDate && $scope.reportCustomEndDate ) {
          params.startDate = $scope.reportCustomStartDate;
          params.endDate = $scope.reportCustomEndDate;
        }
        
        Resources.refresh("/reports/asyncHours/generate", params, {});
	};

	$scope.getHoursReportData = function ( reportHours, cb ) {
		
		var filtered = $scope.processAndApplyFilters( );

		var projects = filtered.result;
		var reportClient = filtered.reportClient;
		var reportProject = filtered.reportProject;
		var reportPerson = filtered.reportPerson;
		var projectMapping = filtered.projectMapping;
		
		var person;
		var mappingEntry;
		var personEntry;
		
		// find by person_resource person in {roles_mapping}-[persons]
		var findPersonOnProject = function( rolesPersonMapping, resource ) {
			var prop;
			var res = null;

			for( prop in rolesPersonMapping ) {
				res = res || _.find( rolesPersonMapping[ prop ], function( p ) {
					return p.resource == resource;
				} );
			}

			return res;
		};
		
		//init projectMapping with entries related to hours which were logged by persons who are not assigned on project
		for (var i = 0; i < reportHours.length; i ++) {
			
			// when we have project logged entry
			if (reportHours[ i ].project) {
				if(  reportHours[ i ].project.resource && !projectMapping[ reportHours[ i ].project.resource ] )
					projectMapping[ reportHours[ i ].project.resource ] = {};

				if( !projectMapping[ reportHours[ i ].project.resource ][ CONSTS.UNKNOWN_ROLE ] )
					projectMapping[ reportHours[ i ].project.resource ][ CONSTS.UNKNOWN_ROLE ] = [ ];

				personEntry = _.find(projectMapping[ reportHours[ i ].project.resource ][CONSTS.UNKNOWN_ROLE], function(p) { 
					return p.resource == reportHours[ i ].person.resource;
				});
				
				if (!personEntry)
					projectMapping[ reportHours[ i ].project.resource ][ CONSTS.UNKNOWN_ROLE ].push( {
						resource: reportHours[ i ].person.resource,
						name:  Util.getPersonName($scope.peopleMap[ reportHours[ i ].person.resource ])
					} );
			
			// when we have logged entry for tasks
			} else if (reportHours[ i ].task) {
				if(  reportHours[ i ].task.resource && !projectMapping[ reportHours[ i ].task.resource ] )
					projectMapping[ reportHours[ i ].task.resource ] = {};
				
				if( !projectMapping[ reportHours[ i ].task.resource ][ CONSTS.UNKNOWN_ROLE ] )
					projectMapping[ reportHours[ i ].task.resource ][ CONSTS.UNKNOWN_ROLE ] = [ ];

				personEntry = _.find(projectMapping[ reportHours[ i ].task.resource ][CONSTS.UNKNOWN_ROLE], function(p) { 
					return p.resource == reportHours[ i ].person.resource;
				});
				
				if (!personEntry)
					projectMapping[ reportHours[ i ].task.resource ][ CONSTS.UNKNOWN_ROLE ].push( {
						resource: reportHours[ i ].person.resource,
						name:  Util.getPersonName($scope.peopleMap[ reportHours[ i ].person.resource ]),
						abbreviation: $scope.peopleMap[ reportHours[ i ].person.resource ].abbreviation
					} );
			}
		}

		for(var i = 0; i < reportHours.length; i++ ) {

			// find person entry associated with current hours entry
			if( reportHours[ i ].project && reportHours[ i ].project.resource ) {
				mappingEntry = projectMapping[ reportHours[ i ].project.resource ];
				person = findPersonOnProject( mappingEntry, reportHours[ i ].person.resource );
			} else if( reportHours[ i ].task && reportHours[ i ].task.resource ) {
				person = null;

				if( projectMapping[ reportHours[ i ].task.resource ].persons )
					person = _.find( projectMapping[ reportHours[ i ].task.resource ][ CONSTS.UNKNOWN_ROLE ], function( p ) {
						return p.resource == reportHours[ i ].person.resource;
					} );

				if( !projectMapping[ reportHours[ i ].task.resource ].persons )
					projectMapping[ reportHours[ i ].task.resource ].persons = [ ];

				if( !person ) {
					person = {
						name:  Util.getPersonName($scope.peopleMap[ reportHours[ i ].person.resource ]),
						resource: reportHours[ i ].person.resource
					};

					projectMapping[ reportHours[ i ].task.resource ].persons.push( person );
				}
			}

			// for found person put current hours entry into hours collection
			if( person ) {
				person.hours = person.hours ? person.hours : [ ];

				if( ( !$scope.reportCustomStartDate || reportHours[ i ].date >= $scope.reportCustomStartDate ) && ( !$scope.reportCustomEndDate || reportHours[ i ].date <= $scope.reportCustomEndDate ) )
					person.hours.push( {
						hours: reportHours[ i ].hours,
						description: reportHours[ i ].description,
						date: reportHours[ i ].date
					} );
			}
		}

		var roleResource;
		// migrate initialized persons collection with associated hours for each role to
		// each project role
		for(var i = 0; i < projects.length; i++ ) {
			
			// add empty - will be treated as undetermined
			if (!projects[ i ].roles)
				projects[ i ].roles = [{abbreviation: CONSTS.UNDETERMINED_ROLE}];
		
			for(var j = 0; j < projects[ i ].roles.length; j++ ) {
				
				if (projects[i].roles[ j ]._id)
					roleResource = projects[ i ].resource + '/roles/' + projects[i].roles[ j ]._id;
				else
					roleResource = CONSTS.UNKNOWN_ROLE;

				if( projectMapping[ projects[ i ].resource ] && projectMapping[ projects[ i ].resource ][ roleResource ] ) {
					projects[i].roles[ j ].persons = projectMapping[ projects[i].resource ][ roleResource ];
					var l = 0;

					for( l = 0; l < projects[i].roles[ j ].persons.length; l++ ) {
						if( projects[i].roles[ j ].persons[ l ].hours )
							projects[i].roles[ j ].persons[ l ].hours.sort( function( p1, p2 ) {
								if( p1.date < p2.date )
									return 1;
								else if( p1.date > p2.date )
									return -1;
								return 0;
							} );
					}
				} else
					projects[i].roles[ j ].persons = [ ];

			}
		}

		if( projects.length == 0 )
			// put tasks info
			for( prop in projectMapping )
				projects.push( projectMapping[ prop ] );
		
		cb( projects );
		
	};
	
	$scope.getHoursHeader = function( ) {
		if( $scope.activeTab[ 'hours' ] )
			return [ 'Project/Task', 'Person', 'Role', 'Department', 'Date', 'Hours', 'Description' ];

		if( $scope.activeTab[ 'billing' ] ) {
			if( $scope.reportTypes[ 'customforecast' ] )
				return [ 'Project/Task', 'Project type', 'Invoice date', 'Fixed bid revenue', 'Role', 'Role quantity', 'Theoretical monthly revenue total' ];
			else if( $scope.reportTypes[ 'customaccruals' ] )
				return [ 'Project/Task', 'Project type', 'Invoice date', 'Fixed bid revenue', 'Role', 'Role quantity', 'Theoretical monthly total', 'Assignment name', 'Hours logged', 'Theoretical hours remaining', 'Total Revenue expected for month' ];
		}

	};
	
	$scope.CSVSplitter = ',';
	
	$scope.JSON2CSV = function( reportData ) {
		var str = '';
		var line = '';

		//Print the header
		var head = $scope.getHoursHeader( );
		var i = 0;

		line += head.join( $scope.CSVSplitter );
		str += line + '\r\n';

		var i;
		var j;
		var k;

		for( i = 0; i < reportData.length; i++ ) {
			line = '';

			var record = reportData[ i ];

			// financial: include information about fixed bid project
			if( $scope.reportTypes[ 'customaccruals' ] || $scope.reportTypes[ 'customforecast' ] ) {

				if( record.terms && record.terms.type == 'fixed' ) {
					line += $scope.hoursToCSV.stringify( record.name ) + $scope.CSVSplitter;

					line += 'fixed' + $scope.CSVSplitter;

					if( record.terms.billingDate )
						line += record.terms.billingDate + $scope.CSVSplitter;
					else
						line += '--' + $scope.CSVSplitter;

					var projectDuration = moment( record.endDate ).diff( record.startDate, 'days' ) / 30;

					if( record.terms && record.terms.type == 'fixed' ) {
						//line += $scope.hoursToCSV.stringify( Util.formatCurrency( Math.round(
						// record.terms.fixedBidServicesRevenue / projectDuration ) ) + '$ per month' ) +
						// ',';
						line += $scope.hoursToCSV.stringify( Util.formatCurrency( record.terms.monthlyInvoiceAmount ) ) + $scope.CSVSplitter;
						line += [ '--', '--', '--', '--', '--', '--', '--' ].join( $scope.CSVSplitter ) + $scope.CSVSplitter;
					} else
						line += '--' + $scope.CSVSplitter;

					line += '\r\n';

				}
			}

			var getDepartment = function( role ) {
				var group;
				var result = [ ];

				for( group in $scope.roleDepartementMapping ) {
					if( _.find( $scope.roleDepartementMapping[ group ], function( r ) {
						return r == role;
					} ) ) {
						result.push( group );
					}
				}

				return result.join( $scope.CSVSplitter );
			};
			for( j = 0; record.roles && j < record.roles.length; j++ ) {

				if( $scope.activeTab[ 'hours' ] ) {
					// for hours report
					for( k = 0; record.roles[ j ].persons && k < record.roles[ j ].persons.length; k++ ) {
						//line += [ '--', '--' ].join( ',' );

						if( !record.roles[ j ].persons[ k ].hours || record.roles[ j ].persons[ k ].hours.length == 0 ) {
							//line += [ '--' ].join( ',' );
							line += $scope.hoursToCSV.stringify( record.name ) + $scope.CSVSplitter;
							line += $scope.hoursToCSV.stringify( record.roles[ j ].persons[ k ].name ) + $scope.CSVSplitter;
							line += (record.roles[ j ].abbreviation == CONSTS.UNKNOWN_ROLE ? 'Currently Unassigned': $scope.hoursToCSV.stringify( record.roles[ j ].abbreviation )) + $scope.CSVSplitter;
							line += $scope.hoursToCSV.stringify( getDepartment( record.roles[ j ].abbreviation ) ) + $scope.CSVSplitter;
							line += [ '--', '--', '--', '--' ].join( $scope.CSVSplitter );
							line += '\r\n';
						}
						var l = 0;

						for( l = 0; record.roles[ j ].persons[ k ].hours && l < record.roles[ j ].persons[ k ].hours.length; l++ ) {
							//line += [ '--' ].join( ',' );
							line += $scope.hoursToCSV.stringify( record.name ) + $scope.CSVSplitter;
							line += $scope.hoursToCSV.stringify( record.roles[ j ].persons[ k ].name ) + $scope.CSVSplitter;
							
							if (record.roles[ j ].persons[ k ].abbreviation)
								line += record.roles[ j ].persons[ k ].abbreviation + $scope.CSVSplitter;
							else
								line += (record.roles[ j ].abbreviation == CONSTS.UNKNOWN_ROLE ? 'Currently Unassigned': $scope.hoursToCSV.stringify( record.roles[ j ].abbreviation )) + $scope.CSVSplitter;
							
							line += $scope.hoursToCSV.stringify( getDepartment( record.roles[ j ].abbreviation ) ) + $scope.CSVSplitter;

							line += record.roles[ j ].persons[ k ].hours[ l ].date + $scope.CSVSplitter;
							line += record.roles[ j ].persons[ k ].hours[ l ].hours + $scope.CSVSplitter;
							line += $scope.hoursToCSV.stringify( record.roles[ j ].persons[ k ].hours[ l ].description ) + $scope.CSVSplitter;
							line += '\r\n';
						}

					}
				} else if( $scope.activeTab[ 'billing' ] ) {
					// for financial reports
					if( !record.roles[ j ].persons && record.terms && record.terms.type != 'fixed' ) {
						line += $scope.hoursToCSV.stringify( record.name ) + $scope.CSVSplitter;

						if( record.terms && record.terms.type == 'timeAndMaterials' )
							line += 't&m' + $scope.CSVSplitter;

						if( record.terms.billingDate )
							line += record.terms.billingDate + $scope.CSVSplitter;
						else
							line += '--' + $scope.CSVSplitter;

						line += '--' + $scope.CSVSplitter;

						var hoursPerMonth = Util.getHoursPerMonthFromRate( record.roles[ j ].rate );

						var monthTotal = 0;

						if ( record.roles[ j ].rate ) {
							if( record.roles[ j ].rate.type == 'monthly' )
								monthTotal = record.roles[ j ].rate.amount;
							else if( record.roles[ j ].rate.type == 'hourly' )
								monthTotal = record.roles[ j ].rate.amount * hoursPerMonth;
							else if( record.roles[ j ].rate.type == 'weekly' )
								monthTotal = record.roles[ j ].rate.amount * 4.5;
						}

						line += record.roles[ j ].abbreviation + $scope.CSVSplitter;
						line += hoursPerMonth + ' h/m ' + $scope.CSVSplitter;
						line += $scope.hoursToCSV.stringify( Util.formatCurrency( monthTotal ) ) + $scope.CSVSplitter;
						line += '\r\n';
					} else if( record.roles[ j ].persons && record.terms && record.terms.type != 'fixed' ) {

						// add empty person to keep consistent logic
						if( !record.roles[ j ].persons || record.roles[ j ].persons.length == 0 )
							record.roles[ j ].persons = [ {
								name: '--',
								hours: [ ],
								hoursPerWeek: 0
							} ];

						// var projectDuration = moment( record.endDate ).diff( record.startDate, 'days')
						// ) / 30;
						var now = moment( ).format( 'YYYY-MM-DD' );

						for( k = 0; k < record.roles[ j ].persons.length; k++ ) {
							if( record.roles[ j ].persons[ k ].startBillingDate < now ) {
								line += $scope.hoursToCSV.stringify( record.name ) + $scope.CSVSplitter;

								if( record.terms && record.terms.type == 'timeAndMaterials' )
									line += 't&m' + $scope.CSVSplitter;

								if( record.terms.billingDate )
									line += record.terms.billingDate + $scope.CSVSplitter;
								else
									line += '--' + $scope.CSVSplitter;

								line += '--' + $scope.CSVSplitter;

								var hoursPerMonth = Util.getHoursPerMonthFromRate( record.roles[ j ].rate );

								var monthTotal = 0;

								if ( record.roles[ j ].rate ) {
									if( record.roles[ j ].rate.type == 'monthly' )
										monthTotal = record.roles[ j ].rate.amount;
									else if( record.roles[ j ].rate.type == 'hourly' )
										monthTotal = record.roles[ j ].rate.amount * hoursPerMonth;
									else if( record.roles[ j ].rate.type == 'weekly' )
										monthTotal = record.roles[ j ].rate.amount * 4.5;
								}

								line += record.roles[ j ].abbreviation + $scope.CSVSplitter;
								line += hoursPerMonth + ' h/m ' + $scope.CSVSplitter;
								line += $scope.hoursToCSV.stringify( Util.formatCurrency( monthTotal ) ) + $scope.CSVSplitter;

								var hoursLogged = 0;
								var l = 0;

								for( l = 0; record.roles[ j ].persons[ k ].hours && l < record.roles[ j ].persons[ k ].hours.length; l++ ) {
									hoursLogged += record.roles[ j ].persons[k].hours[ l ].hours;
								}

								var weeks = moment( record.roles[ j ].persons[ k ].endBillingDate ).diff( now, 'days' ) / 7;

								if( weeks < 0 )
									weeks = 0;

								var expectedHours = Math.round( weeks * record.roles[ j ].persons[ k ].hoursPerWeek );

								line += $scope.hoursToCSV.stringify( record.roles[ j ].persons[ k ].name ) + $scope.CSVSplitter;
								line += hoursLogged + $scope.CSVSplitter;
								line += expectedHours + $scope.CSVSplitter;

								var hourRate = 0;

								if ( record.roles[ j ].rate ) {
									if( record.roles[ j ].rate.type == 'monthly' )
										hourRate = record.roles[ j ].rate.amount / CONSTS.HOURS_PER_MONTH;
									else if( record.roles[ j ].rate.type == 'hourly' )
										hourRate = record.roles[ j ].rate.amount;
									else if( record.roles[ j ].rate.type == 'weekly' )
										hourRate = record.roles[ j ].rate.amount / CONSTS.HOURS_PER_WEEK;
								}

								var revenueExpected = ( expectedHours + hoursLogged ) * hourRate;

								line += $scope.hoursToCSV.stringify( Util.formatCurrency( revenueExpected ) ) + $scope.CSVSplitter;

								line += '\r\n';
							}
						}
					}
				}
			}

			// in case of tasks
			if( !record.roles )
				for( k = 0; record.persons && k < record.persons.length; k++ ) {

					for( l = 0; record.persons[ k ].hours && l < record.persons[ k ].hours.length; l++ ) {
						//line += [ '--' ].join( ',' );
						line += $scope.hoursToCSV.stringify( record.name ) + $scope.CSVSplitter;
						line += '--' + $scope.CSVSplitter;
						line += $scope.hoursToCSV.stringify( record.persons[ k ].name ) + $scope.CSVSplitter;
						line += record.persons[ k ].hours[ l ].date + $scope.CSVSplitter;
						line += record.persons[ k ].hours[ l ].hours + $scope.CSVSplitter;
						line += $scope.hoursToCSV.stringify( record.persons[ k ].hours[ l ].description ) + $scope.CSVSplitter;
						line += '\r\n';
					}

				}
			//line += record.hour.date + ',';
			//    line += record.hour.hours + ',';
			//line += $scope.hoursToCSV.stringify( record.hour.description ?
			// record.hour.description : '' ) + ',';

			if( line )
				str += line + '\r\n';
		}

		return str;
	};
	
	$scope.startGenerationTimers = function ( ) {
		
		if ($scope.isGenerationInProgress)
			return;
		
		if (!$rootScope.reportGenerationStartTime)
			$rootScope.reportGenerationStartTime = new moment();
				
		$scope.generationTimer = setInterval( function( ) {
			var timer = document.getElementById('lblTimer');		
			if (timer) {
				var now = new moment( );
				var spentTime = moment.utc(moment(now,"DD/MM/YYYY HH:mm:ss")
						.diff(moment($rootScope.reportGenerationStartTime,"DD/MM/YYYY HH:mm:ss")))
						.format("HH:mm:ss");
				timer.textContent = spentTime;
			}
		},
		1000);
		
		$scope.generationPing = setInterval( function( ) {
			$scope.checkGenerationStatus();
		},
		$scope.reportServicePingInterval);
		
		$scope.isGenerationInProgress = true;
	};
	
	$scope.stopGenerationTimers = function ( ) {
		if ($scope.generationTimer) {
			clearInterval($scope.generationTimer);
		}
		if ($scope.generationPing) {
			clearInterval($scope.generationPing);
		}
	};
	
	$scope.cancelReportGeneration = function ( ) {
		$scope.stopGenerationTimers();
		$scope.isGenerationInProgress = false;	
		$rootScope.reportGenerationStartTime = null;
		console.log( 'Report generation aborted' );
	};
	
	$scope.checkGenerationStatus = function ( ) {
		return Resources.refresh("/reports/status").then(function( result ){
			if (result.status != "Running" && result.status != "Completed") {
				$scope.cancelReportGeneration();
			}
			if (result.status == "Completed") {
				Resources.refresh("/reports/get").then(function( result ){
				    console.log("Generated report type: " + result.type);
				    if(result && result.data && result.data.hours && result.data.hours.members) {
				      $scope.onReportGenerated( result.data.hours.members );
				    }
				});
			}
			return result.status;
		}).catch(function( err ){
			$scope.cancelReportGeneration();
			return err.data;
		});
	};
	
	$scope.onReportGenerated = function ( report ) {
		
		var reportDataCb = function( reportData ) {
			$scope.csvData = $scope.JSON2CSV( reportData );
			$scope.hoursToCSV.link = 'data:text/csv;charset=UTF-8,' + encodeURIComponent( $scope.csvData );
			console.log( 'Report generation completed' );
			$scope.cancelReportGeneration();
		};
		
		if( $scope.activeTab[ 'hours' ] )
			$scope.getHoursReportData( report, function( reportData ) {
				reportDataCb( reportData );
			} );
		else if( $scope.activeTab[ 'billing' ] && $scope.reportTypes[ 'customaccruals' ] )
			$scope.getBillingAccrualsReportData( report, function( reportData ) {
				reportDataCb( reportData );
			} );
		else if( $scope.activeTab[ 'billing' ] && $scope.reportTypes[ 'customforecast' ] )
			reportDataCb( report );
		else {
			$scope.cancelReportGeneration();
		}
	};
	
	$scope.generateReport = function ( source ) {	
				
		if ($scope.isGenerationInProgress)
			return;
		
		console.log( 'Report generation started' );
		
		$scope.startGenerationTimers();
				
		source.preventDefault( );
		source.stopPropagation( );

		if( $scope.activeTab[ 'hours' ] )
			$scope.generateHoursReport( );
		else if( $scope.activeTab[ 'billing' ] && $scope.reportTypes[ 'customaccruals' ] )
			$scope.generateBillingAccrualsReport( );
		else if( $scope.activeTab[ 'billing' ] && $scope.reportTypes[ 'customforecast' ] )
			$scope.generateBillingForecastReport( );
		else {
			$scope.cancelReportGeneration();
		}
		
	};
	
	$scope.getVerticalbarChartData = function() {
		return {
			"hours" : [{
				label: "managers",
				value: 33
			}, {
				label: "developers",
				value: 56
			}, {
				label: "architects",
				value: 10
			}],
			"expected hours" : [{
				label: "managers",
				value: 5
			}, {
				label: "developers",
				value: 12
			}, {
				label: "architects",
				value: 4
			}]
		}
  };
  
  $scope.getPieChartData = function() {
		return [{
			key: "developers",
			value: 45
		}, {
			key: "architects",
			value: 15
		}, {
			key: "managers",
			value: 30
		}, {
			key: "sales",
			value: 10
		}];
	}

	$scope.hoursToCSV = {
		stringify: function( str ) {
			return '"' + str.replace( /^\s\s*/, '' ).replace( /\s*\s$/, '' )// trim spaces
			.replace( /"/g, '""' ) + // replace quotes with double quotes
			'"';
		},

		/*Only called when our custom event fired*/
		onInnerReportLink: function( e ) {
			e = e ? e : window.event;

			//e.preventDefault();
			e.stopPropagation( );

			$( e.target ).closest( 'a' ).unbind( 'click' );
		},

		generate: function( e ) {
			
			if ($scope.isGenerationInProgress)
				return;
			
			e = e ? e : window.event;
			
			if( $scope.csvData ) {
				$rootScope.modalDialog = {
					title: "Generate report",
					text: "Report already generated. Would you like to generate new report?",
					ok: "Yes",
					no: "No",
					okHandler: function( ) {
						$( ".modalYesNoCancel" ).modal( 'hide' );
						$scope.generateReport( e );
					},
					noHandler: function( ) {
						$( ".modalYesNoCancel" ).modal( 'hide' );
					}
				};
				$( ".modalYesNoCancel" ).modal( 'show' );
			} else {
				$scope.generateReport( e );
			}
		},
		
		cancelGeneration: function( e ) {
			Resources.refresh("/reports/cancel").then(function( result ){
				$scope.cancelReportGeneration();
			}).catch(function( err ){
				$scope.cancelReportGeneration();
			});
		},
		
		link: {}
		
	};

	$scope.$on("$destroy", function(){
		$scope.stopGenerationTimers();
	});
	
	$scope.init( );
	
} ] );