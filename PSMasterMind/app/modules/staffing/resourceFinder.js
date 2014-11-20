'use strict';

angular.module( 'Mastermind' ).controller( 'ResourceFinderCtrl', [ '$scope', '$state', '$location', '$filter', '$q', 'Resources', 'People', 'AssignmentService', 'ProjectsService',
function( $scope, $state, $location, $filter, $q, Resources, People, AssignmentService, ProjectsService ) {

	var HOURS_PER_WEEK = CONSTS.HOURS_PER_WEEK;
	var ROLE_NOTSELECTED = "Select a role or group";
	var $parent_changeSort = $scope.$parent.changeSort;

	$scope.showTableView = true;

	$scope.$parent.hideSpinner = false;
	
	$scope.getPersonName = function (person)
	{
		return Util.getPersonName(person);
	};

	$scope.findResources = function( args ) {
		$scope.projectToAssignTo = {
			name: args.projectName,
			resource: args.projectResource,
			roleId: args.roleId
		};
		$scope.filterStartDate = args.startDate || $scope.formatDate( new Date( ) );

		var endDate = args.endDate;

		// If no end date specified, end date is set to 2 month from the startDate.
		if( !endDate ) {
			endDate = new Date( $scope.filterStartDate );

			endDate.setMonth( endDate.getMonth( ) + 12 );

			endDate = $scope.formatDate( endDate );
		}

		$scope.filterEndDate = endDate;

		for( var i = 0, count = $scope.allRoles.length; i < count; i++ )
			if( $scope.allRoles[ i ].abbreviation == args.role ) {
				$scope.filterRole2 = $scope.allRoles[ i ].resource;
				break;
			}
	}

	$scope.sortType = "availabilityPercentage-desc";

	$scope.switchSort = function( prop ) {
		$scope.changeSort( prop + ( $scope.sortType == prop + "-desc" ? "-asc" : "-desc" ) );
	};

	$scope.changeSort = function( type ) {
		$scope.$parent.changeSort( type );

		$scope.sortType = type;

		var sign = type.indexOf( "-asc" ) == -1 ? -1 : 1;

		if( type.indexOf( "availabilityDate-" ) == 0 )
			$scope.people.sort( function( a, b ) {
				if( a.availabilityDate != null && b.availabilityDate == null || a.availabilityDate < b.availabilityDate )
					return -sign;

				if( a.availabilityDate == null && b.availabilityDate != null || a.availabilityDate > b.availabilityDate )
					return sign;

				return 0;
			} );
		else if( type.indexOf( "availabilityPercentage-" ) == 0 )
			$scope.people.sort( function( a, b ) {
				if( a.availabilityPercentage != null && b.availabilityPercentage == null || a.availabilityPercentage < b.availabilityPercentage )
					return -sign;

				if( a.availabilityPercentage == null && b.availabilityPercentage != null || a.availabilityPercentage > b.availabilityPercentage )
					return sign;

				return 0;
			} );
	};

	$scope.formatDate = function( date ) {
		return date ? date.getFullYear( ) + "-" + formatDayOrMonth( date.getMonth( ) + 1 ) + "-" + formatDayOrMonth( date.getDate( ) ) : "";
	};

	function formatDayOrMonth( value ) {
		return value < 10 ? "0" + value : value;
	}


	$scope.assignProject = function( project, person, startDate, endDate ) {
		var newMember = {
			startDate: startDate,
			endDate: endDate,
			hoursPerWeek: project.rate && project.rate.hoursPerWeek || HOURS_PER_WEEK,
			person: {
				resource: person.resource
			},
			role: {
				resource: project.resource + "/" + project.roleId
			}
		};

		var assignment = {
			about: project.resource + "/assignments",
			members: [ ],
			project: {
				resource: project.resource
			}
		};
		
		$scope.hideSpinner = false;

        // initially load all list of assignments  (collection of memebers), then add to it our new member
		AssignmentService.getAssignmentsByPeriod( "all", {
			project: {
				resource: project.resource
			}
		} ).then( function( data ) {
		    // use data from existing assignment entry
			
			assignment._id = data._id;
			assignment._rev = data._rev;
			
			if (data.members && data.members.length > 0) {
				assignment.members = data.members;
				
			} else
				assignment.members = [];
		    
		    assignment.members.push(newMember);
		    
			AssignmentService.save( project, assignment ).then( function( result ) {
				/*for( var i = 0, count = $scope.people.length; i < count; i++ )
					if( $scope.people[ i ].resource == result.members[ 0 ].person.resource ) {
						$scope.people.splice( i, 1 );
						$scope.filterStartDate = $scope.filterStartDate;
						break;
					}
				*/	
				
				var ind = -1;
				
				for (var i = 0; i < result.members.length; i ++) {
				    ind = -1;
				    
				    _.find($scope.people, function(p, k) {
				        if (p.resource == result.members[ i ].person.resource) {
				            ind = k;
				            
				            return true;
				        }
				        
				        return false;
				    });
				    
				    if (ind >= 0) {
				        $scope.people.splice( ind, 1 );
				    }
				}
				
				$scope.hideSpinner = true;
			} );

		} );

	};

	$scope.$on( "resfinder:select", function( event, args ) {
		$scope.findResources( args );
	} );

	$scope.$parent.buildTableView = function( ) {

		//Actual Table View Data
		if( $scope.$parent.showTableView ) {

			People.getPeopleCurrentAssignments( ).then( function( activeAssignments ) {
				$scope.activeAssignments = activeAssignments;

				//Once we have the active people apply the default filter
				//Trigger initial filter change
				$scope.$parent.handlePeopleFilterChanged( );
			} );
		}

		//Graph View Data
		else if( $scope.showGraphView ) {

		}
	};

	ProjectsService.getAllProjects( function( result ) {
		$scope.projectList = result.data;
	} );

	Resources.get( 'roles' ).then( function( result ) {
		var members = result.members;
		$scope.allRoles = members;
		var rolesMap = {};
		for( var i = 0; i < members.length; i++ ) {
			$scope.allRoles[ i ].category = "Roles";
			rolesMap[ members[ i ].resource ] = members[ i ];
		}

		$scope.allRoles.push( {
			title: "Administration",
			resource: "Administration",
			category: "Groups"
		}, {
			title: "Client Experience Mgmt",
			resource: "Client Experience Mgmt",
			category: "Groups"
		}, {
			title: "Development",
			resource: "Development",
			category: "Groups"
		}, {
			title: "Architects",
			resource: "Architects",
			category: "Groups"
		}, {
			title: "Marketing",
			resource: "Marketing",
			category: "Groups"
		}, {
			title: "Digital Experience",
			resource: "Digital Experience",
			category: "Groups"
		}, {
			title: "Executive Mgmt",
			resource: "Executive Mgmt",
			category: "Groups"
		}, {
			title: "Sales",
			resource: "Sales",
			category: "Groups"
		} );

		// sorting roles by title
		$scope.allRoles.sort( function( a, b ) {
			var x = a.title.toLowerCase( );
			var y = b.title.toLowerCase( );
			return x < y ? -1 : x > y ? 1 : 0;
		} );

		// add unspecified item to roles dropdown
		$scope.allRoles.unshift( {
			'title': ROLE_NOTSELECTED
		} );

		if( $state.params ) {
			$scope.findResources( $state.params );
		}

		//		$scope.rolesMap = rolesMap;
		//
		//		$scope.getRoleName = function( resource ) {
		//			var ret = UNSPECIFIED;
		//			if( resource && $scope.rolesMap[ resource ] ) {
		//				ret = $scope.rolesMap[ resource ].title;
		//			}
		//			return ret;
		//		};
	} );

	$scope.filterResources = function( startDate, endDate, role, availabilityPercentage ) {
		return function( person ) {
			if( person && $scope.activeAssignments && startDate && endDate ) {
				var actualWorkingHours = 0;
				var assignments = $scope.activeAssignments[ person.resource ];
				var availabilityDate = null;
				var workingHours = 0;
				var days = 0;
				var now = new Date( );

				startDate = new Date( Date.parse( startDate ) );

				if( startDate < now )
					startDate = now;

				endDate = new Date( Date.parse( endDate ) );

				if( !person.primaryRole || role && role != person.primaryRole.resource && ( !person.group || role != person.group ) )
					return false;

				if( assignments == null ) {
					person.availabilityDate = startDate;
					person.availabilityPercentage = 100;

					return true;
				}

				for( var currentDate = new Date( startDate.valueOf( ) ); currentDate <= endDate; currentDate.setDate( currentDate.getDate( ) + 1 ) ) {
					var day = currentDate.getDay( );

					if( day != 0 && day != 6 ) {
						days++;

						workingHours = 0;

						for( var i = 0, count = assignments.length; i < count; i++ ) {
							var assignment = assignments[ i ];
							var assignmentEndDate = new Date( Date.parse( assignment.endDate || "2029-01-01" ) );
							// 2029: end of time. rising of skynet

							// Processing only those assignments which intersect the specified range.
							if( assignmentEndDate >= currentDate ) {
								workingHours += assignment.hoursPerWeek;

								if( workingHours >= HOURS_PER_WEEK )
									break;
							}
						}

						if( !availabilityDate && workingHours < HOURS_PER_WEEK )
							availabilityDate = new Date( currentDate.valueOf( ) );

						actualWorkingHours += Math.min( workingHours, HOURS_PER_WEEK );
					}
				}

				person.availabilityDate = availabilityDate;

				person.availabilityPercentage = 100 - Math.round( actualWorkingHours / ( days * HOURS_PER_WEEK ) * 100 );

				return person.availabilityPercentage > ( availabilityPercentage || 0 );
			} else
				return false;
		};
	};
} ] ).directive( 'resRepeater', function( ) {
	return function( $scope, element, attrs ) {
		if( $scope.$last ) {
			$scope.changeSort( $scope.sortType );

			$scope.$parent.hideSpinner = true;
		}
	};
} );
