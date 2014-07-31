'use strict';

/**
 * Controller for Reports.
 */
angular.module( 'Mastermind' ).controller( 'ReportsCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', 'Resources', 'AssignmentService', 'ProjectsService', 'TasksService', 'RolesService', 'ngTableParams',
function( $scope, $q, $state, $stateParams, $filter, Resources, AssignmentService, ProjectsService, TasksService, RolesService, TableParams ) {

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
		alert( item.name );
	};

	$scope.tabSelected = function( tabName ) {
		var prop;

		for( prop in $scope.activeTab ) {
			$scope.activeTab[ prop ] = false;
		}

		$scope.activeTab[ tabName ] = true;
	};

	$scope.userRoles = {
		all: {
			value: false
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

		/*
		//deselect user groups
		for( prop in $scope.userGroups ) {
		$scope.userGroups[ prop ] = false;
		}
		*/
		//$scope.reportPerson = null;
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
					value: false,
					resource: role.resource
				};
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
		    $scope.originalProjects = result.data;
		    
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

	$scope.getReportData = function( ) {
       var result = [];
       
		$scope.reportClient = $( 'input[name="reportClient"]' ).typeahead( 'val' );
		$scope.reportPerson = $( 'input[name="reportPerson"]' ).typeahead( 'val' );
		$scope.reportProject = $( 'input[name="reportProject"]' ).typeahead( 'val' );

		$scope.reportPerson = _.find( $scope.peopleList, function( p ) {
			return p.value == $scope.reportPerson;
		} );

		$scope.reportProject = _.find( $scope.projectList, function( p ) {
			return p.value == $scope.reportProject;
		} );
        
        var selectedRoles = [];
        var selectedGroups = [];
        
        var selectedStatuses = [];
        var cond = false;
        var i;
        
        for (i = 0; i < $scope.originalProjects.length; i ++) {
            cond = false;
            
            cond = cond || $scope.reportProject && $scope.reportProject.resource && $scope.originalProjects[i].about == $scope.reportProject.resource;
            
            if (cond) {
                result.push($scope.originalProjects[i]);
            }
        }
		return result;
	};

	$scope.JSON2CSV = function( reportData ) {
		var str = '';
		var line = '';

		//Print the header
		var head = [ 'Project/Task', 'Project type', 'Invoice date', 'Fixed bid revenue', 'Role', 'Role quantity' ];

		for( var i = 0; i < head.length; i++ ) {
			line += head[ i ] + ',';
		}
		//Remove last comma and add a new line
		line = line.slice( 0, -1 );
		str += line + '\r\n';

		for( var i = 0; i < reportData.length; i++ ) {
			line = '';

			var record = reportData[ i ];

			if( record.project )
				line += $scope.hoursToCSV.stringify( record.project.name ) + ',';
			else
				line += $scope.hoursToCSV.stringify( record.task.name ) + ',';

			if( record.project )
				line += $scope.hoursToCSV.stringify( record.project.name ) + ',';
			else
				line += ','

			line += record.invoiceDate + ',';
			line += record.fixedBidRevenue + ',';

			//line += $scope.hoursToCSV.stringify( record.hour.description ) + ',';
			str += line + '\r\n';
		}

		return str;
	};

	$scope.csvData = null;
	$scope.hoursToCSV = {
		stringify: function( str ) {
			return '"' + str.replace( /^\s\s*/, '' ).replace( /\s*\s$/, '' )// trim spaces
			.replace( /"/g, '""' ) + // replace quotes with double quotes
			'"';
		},

		generate: function( ) {
			var reportData = $scope.getReportData( );

			$scope.csvData = $scope.JSON2CSV( $scope.getReportData( ) );
		},

		link: function( ) {
			return 'data:text/csv;charset=UTF-8,' + encodeURIComponent( $scope.csvData );
		}
	};

	$scope.init( );
} ] );
