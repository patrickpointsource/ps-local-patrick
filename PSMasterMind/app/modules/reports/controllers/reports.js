'use strict';

/**
 * Controller for Reports.
 */
angular.module( 'Mastermind' ).controller( 'ReportsCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', 'Resources', 'AssignmentService', 'ProjectsService', 'TasksService', 'RolesService', 'HoursService', 'People', 'ngTableParams',
function( $scope, $q, $state, $stateParams, $filter, Resources, AssignmentService, ProjectsService, TasksService, RolesService, HoursService, PeopleService, TableParams ) {

	$scope.activeTab = {
		'hours': true
	};

	$scope.reportTypes = {
		'custom': true
	};

	$scope.reportTerms = {
		'week': true
	};

	$scope.reportClick = function( item ) {
		//alert( item.name );
	};

	$scope.peopleMap = {};

	$scope.tabSelected = function( tabName ) {
		var prop;

		for( prop in $scope.activeTab ) {
			$scope.activeTab[ prop ] = false;
		}

		$scope.activeTab[ tabName ] = true;
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
		all: false,
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

		/*
		//deselect user groups
		for( prop in $scope.userRoles ) {
		$scope.userRoles[ prop ].value = false;
		}
		*/
		//$scope.reportPerson = null;
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

		Resources.query( 'people', peopleInRoleQuery, peopleInRoleFields, function( result ) {
			$scope.peopleList = _.map( result.members, function( m ) {
				$scope.peopleMap[ m.resource ] = {
					name: m.name
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
		$scope.loadRoles( );
		$scope.loadAndInitPeople( );
		$scope.loadAndInitProjectsAndClients( );
	};

	$scope.selectReportType = function( e, report ) {
		var prop;

		for( prop in $scope.reportTypes ) {
			$scope.reportTypes[ prop ] = false;
		}

		$scope.reportTypes[ report ] = true;
	};

	$scope.getReportData = function( cb ) {
		$scope.csvData = null;

		var result = [ ];

		var reportClient = $( 'input[name="reportClient"]' ).typeahead( 'val' );
		var reportPerson = $( 'input[name="reportPerson"]' ).typeahead( 'val' );
		var reportProject = $( 'input[name="reportProject"]' ).typeahead( 'val' );

		reportPerson = _.find( $scope.peopleList, function( p ) {
			return p.value == reportPerson;
		} );

		reportProject = _.find( $scope.projectList, function( p ) {
			return p.value == reportProject;
		} );

		// 1. determine projects for reports
		var selectedRoles = [ ];
		var selectedGroups = [ ];

		var selectedStatuses = [ ];
		var cond = false;
		var i;
		var j;
		$scope.originalProjects = JSON.parse( JSON.stringify( $scope.loadedProjects ) );

		var projectStatuses = ProjectsService.getProjectsStatus( $scope.originalProjects );

		for( i = 0; i < $scope.originalProjects.length; i++ ) {
			cond = false;

			cond = cond || reportProject && reportProject.resource && $scope.originalProjects[ i ].resource == reportProject.resource;
			cond = cond || $scope.projectStates[ 'all' ];
			cond = cond || $scope.projectStates[ projectStatuses[ $scope.originalProjects[ i ].resource ] ];
			cond = cond || $scope.reportClient && $scope.customerName == $scope.reportClient;

			if( cond ) {
				result.push( $scope.originalProjects[ i ] );
			}
		}
		var groupRoleMapping = PeopleService.getPeopleGroupMapping( );

		var prop;
		var roles;
		var i;

		for( prop in $scope.userGroups ) {
			if( $scope.userGroups[ prop ] === true ) {
				roles = groupRoleMapping[ prop ];

				for( i = 0; roles && i < roles.length; i++ )
					if( $scope.userRoles[              roles[ i ].toLowerCase( ) ] )
						$scope.userRoles[              roles[ i ].toLowerCase( ) ].value = true;
			}
		}
		var userRoles = _.object( _.map( $scope.userRoles, function( x ) {
			return [ x.resource, x.value ];
		} ) );

		// 2. filter roles
		for( i = result.length - 1; i >= 0; i-- ) {
			result[ i ].hour = {};

			for( j = result[ i ].roles.length - 1; j >= 0; j-- ) {
				cond = $scope.userRoles[ 'all' ].value;

				cond = cond || userRoles[ result[i].roles[ j ].type.resource ];

				if( !cond )
					result[ i ].roles.splice( j, 1 );
			}

			if( result[ i ].roles.length == 0 )
				result.splice( i, 1 );

		}

		var projectMapping = {};

		// in case of selected task simply put into map because we have no selected
		// projects and it will be returned empty assignments list
		if( reportProject && reportProject.resource && reportProject.resource.indexOf( 'tasks' ) > -1 )
			projectMapping[ reportProject.resource ] = {
				resource: reportProject.resource,
				name: reportProject.value
			};

		var j;

		AssignmentService.getAssignments( result ).then( function( assignments ) {
			var persons = [ ];

			for( i = 0; i < assignments.length; i++ ) {

				//result[ i ].hour.hours = 1;
				for( j = 0; j < assignments[ i ].members.length; j++ ) {

					if( !reportPerson || reportPerson.resource == assignments[ i ].members[ j ].person.resource ) {
						if( !projectMapping[ assignments[ i ].project.resource ] )
							projectMapping[ assignments[ i ].project.resource ] = {};

						if( !projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ] )
							projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ] = [ ];

						projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ].push( {
							resource: assignments[ i ].members[ j ].person.resource,
							name: $scope.peopleMap[ assignments[ i ].members[ j ].person.resource ].name
						} );

						//if( !reportPerson || reportPerson.resource == assignments[ i ].members[ j
						// ].person.resource )
						persons.push( assignments[ i ].members[ j ].person.resource );
					}
				}
			}

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

			HoursService.customQuery( hoursQ ).then( function( reportHours ) {
				var person;
				var mappingEntry;

				for( i = 0; i < reportHours.length; i++ ) {

					if( reportHours[ i ].project && reportHours[ i ].project.resource ) {
						//projectMapping[ reportHours[ i ].task.resource ];
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
								name: $scope.peopleMap[ reportHours[ i ].person.resource ].name,
								resource: reportHours[ i ].person.resource
							};

							projectMapping[ reportHours[ i ].task.resource ].persons.push( person );
						}
					}

					//$scope.peopleMap[ assignments[ i ].members[ j ].person.resource ].name
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

				for( i = 0; i < result.length; i++ )
					for( j = 0; j < result[ i ].roles.length; j++ ) {
						roleResource = result[ i ].resource + '/roles/' + result[i].roles[ j ]._id;

						if( projectMapping[ result[ i ].resource ] && projectMapping[ result[ i ].resource ][ roleResource ] ) {
							result[i].roles[ j ].persons = projectMapping[ result[i].resource ][ roleResource ];
							var l = 0;

							for( l = 0; l < result[i].roles[ j ].persons.length; l++ ) {
								if( result[i].roles[ j ].persons[ l ].hours )
									result[i].roles[ j ].persons[ l ].hours.sort( function( p1, p2 ) {
										if( p1.date < p2.date )
											return 1;
										else if( p1.date > p2.date )
											return -1;
										return 0;
									} );
							}
						} else
							result[i].roles[ j ].persons = [ ];

						result[i].roles[ j ].abbreviation = $scope.rolesMapping[ result[i].roles[ j ].type.resource ].toUpperCase( );
					}

				if( result.length == 0 )
					// put tasks info
					for( prop in projectMapping )
					result.push( projectMapping[ prop ] );

				cb( result );
			} );

		} );

	};

	$scope.getHoursHeader = function( ) {
		return [ 'Project/Task', 'Role', 'Person', 'Date', 'Hours', 'Description' ];
	};

	$scope.JSON2CSV = function( reportData ) {
		var str = '';
		var line = '';

		//Print the header
		//var head = [ 'Project/Task', 'Project type', 'Invoice date', 'Fixed bid
		// revenue', 'Role', 'Role quantity' ];
		var head = $scope.getHoursHeader( );
		var i = 0;

		line += head.join( ',' );
		str += line + '\r\n';

		var i;
		var j;
		var k;

		for( i = 0; i < reportData.length; i++ ) {
			line = '';

			var record = reportData[ i ];
			/*
			line += $scope.hoursToCSV.stringify( record.name ) + ',';
			line += [ '--', '--', '--', '--', '--' ].join( ',' );
			line += '\r\n';
			*/
			//line += [ '--', '--' ].join( ',' );

			for( j = 0; record.roles && j < record.roles.length; j++ ) {
				//line += record.roles[ j ].abbreviation + ',';

				//line += '\r\n';

				for( k = 0; k < record.roles[ j ].persons.length; k++ ) {
					//line += [ '--', '--' ].join( ',' );

					if( !record.roles[ j ].persons[ k ].hours || record.roles[ j ].persons[ k ].hours.length == 0 ) {
						//line += [ '--' ].join( ',' );
						line += $scope.hoursToCSV.stringify( record.name ) + ',';
						line += record.roles[ j ].abbreviation + ',';
						line += [ '--', '--', '--', '--' ].join( ',' );
						line += '\r\n';
					}
					var l = 0;

					for( l = 0; record.roles[ j ].persons[ k ].hours && l < record.roles[ j ].persons[ k ].hours.length; l++ ) {
						//line += [ '--' ].join( ',' );
						line += $scope.hoursToCSV.stringify( record.name ) + ',';
						line += record.roles[ j ].abbreviation + ',';
						line += record.roles[ j ].persons[ k ].name + ',';
						line += record.roles[ j ].persons[ k ].hours[ l ].date + ',';
						line += record.roles[ j ].persons[ k ].hours[ l ].hours + ',';
						line += record.roles[ j ].persons[ k ].hours[ l ].description + ',';
						line += '\r\n';
					}

				}

			}

			// in case of tasks
			if( !record.roles )
				for( k = 0; k < record.persons.length; k++ ) {

					for( l = 0; record.persons[ k ].hours && l < record.persons[ k ].hours.length; l++ ) {
						//line += [ '--' ].join( ',' );
						line += $scope.hoursToCSV.stringify( record.name ) + ',';
						line += '--,';
						line += record.persons[ k ].name + ',';
						line += record.persons[ k ].hours[ l ].date + ',';
						line += record.persons[ k ].hours[ l ].hours + ',';
						line += record.persons[ k ].hours[ l ].description + ',';
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

	$scope.csvData = null;

	var skipGenerate;

	$scope.hoursToCSV = {
		stringify: function( str ) {
			return '"' + str.replace( /^\s\s*/, '' ).replace( /\s*\s$/, '' )// trim spaces
			.replace( /"/g, '""' ) + // replace quotes with double quotes
			'"';
		},

		generate: function( e ) {
			e = e ? e : window.event;
			var btn = $( e.target ).closest( '.btn-export' );

			e.preventDefault( );
			e.stopPropagation( );

			if( skipGenerate )
				return;

			$scope.getReportData( function( reportData ) {
				$scope.csvData = $scope.JSON2CSV( reportData );

				var evt = document.createEvent( "MouseEvents" );

				evt.initMouseEvent( "click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );

				btn.attr( 'href', 'data:text/csv;charset=UTF-8,' + encodeURIComponent( $scope.csvData ) );

				skipGenerate = true;

				var allowDefault = btn.get( 0 ).dispatchEvent( evt );

				window.setTimeout( function( ) {
					skipGenerate = false;
				}, 1000 * 7 );
			} );

		},

		link: function( ) {
			return '';
			//return 'data:text/csv;charset=UTF-8,' + encodeURIComponent( $scope.csvData );
		}
	};

	$scope.init( );
} ] );
