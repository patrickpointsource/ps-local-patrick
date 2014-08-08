'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, staffing and roles.
 */
var mmModule = angular.module( 'Mastermind' ).controller( 'StaffingCtrl', [ '$scope', '$state', '$filter', '$q', 'Resources', 'RolesService', 'ProjectsService', 'AssignmentService', 'ngTableParams',
function( $scope, $state, $filter, $q, Resources, RolesService, ProjectsService, AssignmentService, TableParams ) {
	// Table Parameters
	var params = {
		page: 1, // show first page
		count: 100, // count per page
		sorting: {
			title: 'asc' // initial sorting
		}
	};
	
	$scope.navigateToResourceTab = function (selectedRoleAndProject)
    {
        var params = {
          tab: 'resourcefinder',
          projectName: selectedRoleAndProject.projectName, 
          projectResource: selectedRoleAndProject.projectResource,
          roleId: selectedRoleAndProject.roleId,
          role: selectedRoleAndProject.role
        };
        
        $state.go("staffing", params);
    };
	
	$scope.activeTab = 'staffing';
	
	var tab = $state.params.tab;
	if(tab) {
	  if(tab == 'resourcefinder') {
	    $scope.activeTab = 'resourcefinder';
	    
	    if($state.params.startDate && $state.params.endDate) {
	      $scope.navigateToResourceTab({startDate: $state.params.startDate, endDate: $state.params.endDate});
	    }
	  }
	}
	
	$scope.tabSelected = function(tab) {
	  $scope.activeTab = tab;
	}
	
	$scope.summarySwitcher = 'projects';
	$scope.startDate = new Date( );
	$scope.activeAndBacklogProjects = [ ];
	
	// TODO: change to css class
	$scope.getProjectItemCss = function( isProjectItem ) {
		var ret = "";
		if( isProjectItem ) {
			ret = "background-color: antiquewhite;";
		}

		return ret;
	};

	$scope.filterStaffing = function( filter ) {
		return function( item ) {
			return filter ? item.clientName && item.clientName.toLowerCase( ).indexOf( filter.toLowerCase( ) ) != -1 || item.projectName && item.projectName.toLowerCase( ).indexOf( filter.toLowerCase( ) ) != -1 || item.role && item.role.toLowerCase( ).indexOf( filter.toLowerCase( ) ) != -1 : item;
		};
	};

	var today = new Date( );
	var dd = today.getDate( );
	var mm = today.getMonth( );
	var yyyy = today.getFullYear( );

	today = new Date( yyyy, mm, dd );

	/*
	 * Helps to filter past entries - roles and assignees
	 **/
	$scope.filterPastEntries = function( entry ) {
		if( new Date( entry.startDate ) < today && ( entry.endDate && new Date( entry.endDate ) < today ) )
			return false;

		return true
	};
	/*
	 * Fetch a list of all the active Projects.
	 *
	 */
	var activeStaffing = {};
	var activeProjects = [ ];
	var activeProjectsWithUnassignedPeople = [ ];
	var unassignedIndex = 0;
	$scope.activeProjectsWithUnassignedPeople = [ ];

	ProjectsService.getActiveAndBacklogProjects( function( result ) {
		$scope.activeAndBacklogProjects = result.data;
		//console.log("staffing.js activeAndBacklogProjects:",
		// $scope.activeAndBacklogProjects);
	} );

	RolesService.getRolesMapByResource( ).then( function( data ) {
		activeStaffing.rolesMap = data;
		$scope.rolesMap = data;

		return ProjectsService.getActiveClientProjects( );
	} ).then( function( data ) {
		activeStaffing.projects = data;
		$scope.activeProjects = data;
		//console.log("staffing.js activeProjects:", $scope.activeProjects);
		$scope.projectCount = data.count;

		/* Next, with the list of active projects, find the resource deficit on these
		 * projects.*/
		$scope.qvProjects = data.data;
		activeProjects = $scope.qvProjects;

		/* Next, run through the list of projects and set the active projects and people.
		 * */
		return AssignmentService.getAssignments( activeProjects );
	} ).then( function( data ) {
		/*
		 * Finally set projects without any assigned people.
		 *
		 */

		var fillDeficit = function( addAllRoles ) {
			/*
			 * Loop through all the roles in the active projects
			 */
			for( var b = 0; b < roles.length; b++ ) {
				var activeRole = roles[ b ];

				if( activeRole.hoursNeededToCover > 0 || addAllRoles ) {
					$scope.activeProjectsWithUnassignedPeople[ unassignedIndex++ ] = {
						clientName: proj.customerName,
						projectName: proj.name,
						title: proj.customerName + ': ' + proj.name,
						projectResource: proj.resource,
						hours: getHoursDescription( activeRole.rate.fullyUtilized, activeRole.rate.type, activeRole.rate.hoursPerWeek, activeRole.rate.hoursPerMth ),
						role: $scope.rolesMap[ activeRole.type.resource ].abbreviation,
						roleId: activeRole._id,
						startDate: activeRole.startDate,
						endDate: activeRole.endDate,
						rate: activeRole.rate.amount,
						_rate: activeRole.rate
					};
				};
			};
		};

		var found = false;

		for( var i = 0; i < activeProjects.length; i++ ) {
			var proj = activeProjects[ i ];
			var foundProjMatch = false;
			var roles = _.filter( activeProjects[ i ].roles, $scope.filterPastEntries );

			var projAssignments = undefined;

			found = false;

			for( var l = 0; l < data.length; l++ ) {

				projAssignments = data[ l ];

				if( projAssignments.project.resource == proj.resource ) {

					if( projAssignments.members && projAssignments.members.length > 0 ) {
						var assignees = _.filter( projAssignments.members, $scope.filterPastEntries );

						found = true;

						if( roles ) {
							AssignmentService.calculateRolesCoverage( roles, assignees );
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

		/*
		 * Build out the table that contains the Active Projects with resource deficits
		 */
		$scope.unassignedRoleList = new TableParams( params, {
			total: $scope.activeProjectsWithUnassignedPeople.length, // length of data
			getData: function( $defer, params ) {

				var data = $scope.activeProjectsWithUnassignedPeople;
				var start = ( params.page( ) - 1 ) * params.count( );
				var end = params.page( ) * params.count( );
				// use build-in angular filter
				var orderedData = params.sorting( ) ? $filter('orderBy')( data, params.orderBy( ) ) : data;
				var ret = orderedData.slice( start, end );

				$defer.resolve( ret );
			}
		} );
	} );

	/*
	 * Next, with the list of backlog projects, create a table with the resource
	 * deficit on these projects.
	 *
	 */
	ProjectsService.getBacklogProjects( function( result ) {
		$scope.projectBacklog = result;
		$scope.backlogCount = result.count;
		$scope.backlogProjectsList = [ ];

		//console.log("main.js $scope.projectBacklog:", $scope.projectBacklog);
		var projectBacklog = result.data;

		var unassignedIndex = 0;
		var rolesPromise = RolesService.getRolesMapByResource( );
		$q.all( rolesPromise ).then( function( rolesMap ) {
			//console.log("staging.js using rolesMap:", rolesMap);
			$scope.rolesMap = rolesMap;
			return AssignmentService.getAssignments( projectBacklog, "all" );
		} ).then( function( assignments ) {

			/*
			 * Set backlog projects deficits
			 *
			 */
			var fillBacklogDeficit = function( addAllRoles ) {
				/*
				 * Loop through all the roles in the backlog projects
				 */
				var projectRolesInfo = {};
								
				for( var b = 0; b < roles.length; b++ ) {
					var activeRole = roles[ b ];

					if( activeRole.hoursNeededToCover > 0 || addAllRoles ) {
						$scope.backlogProjectsList.push({
							clientName: proj.customerName,
							projectName: proj.name,
							title: proj.customerName + ': ' + proj.name,
							projectResource: proj.resource,
							hours: getHoursDescription( activeRole.rate.fullyUtilized, activeRole.rate.type, activeRole.rate.hoursPerWeek, activeRole.rate.hoursPerMth ),
							role: $scope.rolesMap[ activeRole.type.resource ].abbreviation,
							roleId: activeRole._id,
							startDate: activeRole.startDate,
							endDate: activeRole.endDate,
							rate: activeRole.rate.amount,
							_rate: activeRole.rate
						});
					}
				
					if( !projectRolesInfo[ $scope.rolesMap[ activeRole.type.resource ].abbreviation ] )
                            projectRolesInfo[ $scope.rolesMap[ activeRole.type.resource ].abbreviation ] = 0;

                    projectRolesInfo[ $scope.rolesMap[ activeRole.type.resource ].abbreviation ] += 1;
				};

				var rolesInfo = _.map( projectRolesInfo, function( val, key ) {
					return key + '(' + val + ')';
				} );
				
				
				$scope.backlogProjectsList.push({
					clientName: proj.customerName,
					projectName: proj.name,
					title: proj.customerName + ': ' + proj.name,
					projectResource: proj.resource,
					hours: '-',
					role: rolesInfo.join( ', ' ),
					startDate: activeRole.startDate,
					endDate: activeRole.endDate,
					rate: activeRole.rate.amount,
					isProjectItem: true
				} );

			};

			var found = false;

			for( var i = 0; i < projectBacklog.length; i++ ) {
				var proj = projectBacklog[ i ];
				var foundProjMatch = false;
				var roles = _.filter( projectBacklog[ i ].roles, $scope.filterPastEntries );

				var projAssignments = undefined;

				found = false;

				for( var l = 0; l < assignments.length; l++ ) {

					projAssignments = assignments[ l ];

					if( projAssignments.project.resource == proj.resource ) {

						if( projAssignments.members && projAssignments.members.length > 0 ) {
							var assignees = _.filter( projAssignments.members, $scope.filterPastEntries );

							found = true;

							if( roles ) {
								AssignmentService.calculateRolesCoverage( roles, assignees );
								// add info about deficit roles
								fillBacklogDeficit( );

								break;
							};
						};
					};
				};

				// add info about other deficit roles, which doesn't have assignments
				if( !found )
					fillBacklogDeficit( true );
			}
			
			$scope.backlogProjectsList.sort(function(p1, p2){
			    if (p1.projectName > p2.projectName ) 
			         return 1;
			    else if (p1.projectName < p2.projectName ) 
                     return -1;
                
                else if (p1.projectName == p2.projectName && p1.isProjectItem && !p2.isProjectItem)
                    return -1;
                else if (p1.projectName == p2.projectName && !p1.isProjectItem && p2.isProjectItem)
                    return 1;
                    
                
                return 0;
			});

			/*
			 * Build out the table that contains the backlog Projects with resource deficits
			 */
			var backlogTableParams = {
				page: 1, // show first page
				count: 100, // count per page
				sorting: {} // initial sorting is already done
			};

			$scope.backlogRoleList = new TableParams( backlogTableParams, {
				total: $scope.backlogProjectsList.length, // length of data
				getData: function( $defer, params ) {

					var data = $scope.backlogProjectsList;
					var start = ( params.page( ) - 1 ) * params.count( );
					var end = params.page( ) * params.count( );
					// use build-in angular filter
					var orderedData = params.sorting( ) ? $filter('orderBy')( data, params.orderBy( ) ) : data;
					var ret = orderedData.slice( start, end );
					//console.log("Ret value for Backlog Role list:",ret);

					$defer.resolve( ret );
				}
			} );
		} );
	} );

	/*
	 * Next, with the list of pipeline projects, create a table that shows the
	 * pipeline with staff needs.
	 *
	 */
	ProjectsService.getPipelineProjects( function( result ) {
		$scope.projectPipeline = result;
		$scope.pipelineCount = result.count;
		$scope.pipelineProjectsList = [ ];

		//console.log("main.js $scope.projectPipeline:", $scope.projectPipeline);
		var projectPipeline = result.data;

		var unassignedIndex = 0;

		var rolesPromise = RolesService.getRolesMapByResource( );
		$q.all( rolesPromise ).then( function( rolesMap ) {
			//console.log("staging.js using rolesMap:", rolesMap);
			$scope.rolesMap = rolesMap;
			return AssignmentService.getAssignments( projectPipeline, "all" );
		} ).then( function( assignments ) {

			var fillPipelineDeficit = function( addAllRoles ) {
				/*
				 * Loop through all the roles in the pipeline projects
				 */
				
				var projectRolesInfo = {};

				for( var b = 0; b < roles.length; b++ ) {
					var activeRole = roles[ b ];

					if( !projectRolesInfo[ $scope.rolesMap[ activeRole.type.resource ].abbreviation ] )
                            projectRolesInfo[ $scope.rolesMap[ activeRole.type.resource ].abbreviation ] = 0;

                    projectRolesInfo[ $scope.rolesMap[ activeRole.type.resource ].abbreviation ] += 1;
				};
				
				var rolesInfo = _.map( projectRolesInfo, function( val, key ) {
                    return key + '(' + val + ')';
                } );
                
                $scope.pipelineProjectsList.splice( unassignedIndex ++, 0, {
                    clientName: proj.customerName,
                    projectName: proj.name,
                    title: proj.customerName + ': ' + proj.name,
                    projectResource: proj.resource,
                    hours: '-',
                    role: rolesInfo.join( ', ' ),
                    startDate: activeRole ? activeRole.startDate : null,
                    endDate: activeRole ? activeRole.endDate : null,
                    rate: activeRole ? activeRole.rate.amount : null,
                    isProjectItem: true
                } );
			};

			var found = false;

			for( var i = 0; i < projectPipeline.length; i++ ) {
				var proj = projectPipeline[ i ];
				var foundProjMatch = false;
				var roles = _.filter( projectPipeline[ i ].roles, $scope.filterPastEntries );

				var projAssignments = undefined;

				found = false;

				for( var l = 0; l < assignments.length; l++ ) {

					projAssignments = assignments[ l ];

					if( projAssignments.project.resource == proj.resource ) {

						if( projAssignments.members && projAssignments.members.length > 0 ) {
							var assignees = _.filter( projAssignments.members, $scope.filterPastEntries );

							found = true;

							if( roles ) {
								AssignmentService.calculateRolesCoverage( roles, assignees );
								// add info about deficit roles
								fillPipelineDeficit( );

								break;
							};
						};
					};
				};

				// add info about other deficit roles, which doesn't have assignments
				if( !found )
					fillPipelineDeficit( true );
			}

			return $scope.pipelineProjectsList;
		} ).then( function( pipelineProjectsList ) {
			/*
			 * Build out the table that contains the backlog Projects with resource deficits
			 */
			$scope.pipeListProjects = new TableParams( params, {
				total: pipelineProjectsList.length, // length of data
				getData: function( $defer, params ) {

					var data = pipelineProjectsList;
					var start = ( params.page( ) - 1 ) * params.count( );
					var end = params.page( ) * params.count( );
					// use build-in angular filter
					var orderedData = params.sorting( ) ? $filter('orderBy')( data, params.orderBy( ) ) : data;
					var ret = orderedData.slice( start, end );
					//console.log("Ret value for Backlog Role list:",ret);

					$defer.resolve( ret );
				}
			} );
		} );
	} );

	/**
	 * Function to return a text description of the number of hours
	 */
	var getHoursDescription = function( fullyUtilized, type, hoursPerWeek, hoursPerMth ) {
		//console.log("getHoursDescription called with", hours, fullyUtilized, type);
		if( !type ) {
			return '';
		}

		var hoursDesc;

		if( fullyUtilized ) {
			hoursDesc = "100%";
		} else {
			switch (type) {
				case 'hourly':
					hoursDesc = hoursPerMth + "/m";
					break;
				case 'weekly':
					hoursDesc = hoursPerWeek + "/w";
					break;
				case 'monthly':
					hoursDesc = '100%';
			}
		}
		//console.log("getHoursDescription returning ", hoursDesc);
		return hoursDesc;
	}
} ] );

mmModule.directive( 'exportBacklog', [ '$parse',
function( $parse ) {
	return {
		restrict: '',
		scope: false,
		link: function( scope, element, attrs ) {
			var data = '';
			var csv = {
				stringify: function( str ) {
					if( str ) {
						// trim spaces
						var startSpace = str.replace( /^\s\s*/, '' );
						var endSpace = startSpace.replace( /\s*\s$/, '' );
						// replace quotes with double quotes
						var replaceDoubleQuotes = endSpace.replace( /"/g, '""' );
						return '"' + replaceDoubleQuotes + '"';
					} else {
						return '"' + '"';
					}
				},
				rawJSON: function( ) {
					return scope.backlogProjectsList;
				},
				rawCSV: function( ) {
					return data;
				},
				generate: function( ) {
					var project = scope.project;
					var deficitRoles = scope.backlogRoleList.data;

					for( var i = 0; i < deficitRoles.length; i++ ) {
						data = csv.JSON2CSV( project, deficitRoles );
					}
				},
				link: function( ) {
					return 'data:text/csv;charset=UTF-8,' + encodeURIComponent( data );
				},
				JSON2CSV: function( project, deficitRoles ) {
					var str = '';
					var line = '';

					//Print the header
					var head = [ 'Project', 'Role', 'Hours', 'Start Date', 'End Date' ];
					for( var i = 0; i < head.length; i++ ) {
						line += head[ i ] + ',';
					}
					//Remove last comma and add a new line
					line = line.slice( 0, -1 );
					str += line + '\r\n';

					//Print the values
					for( var x = 0; x < deficitRoles.length; x++ ) {
						line = '';

						var role = deficitRoles[ x ];

						//Project
						line += csv.stringify( role.title ) + ',';
						line += csv.stringify( role.role ) + ',';
						line += csv.stringify( role.hours ) + ',';
						line += csv.stringify( role.startDate ) + ',';
						line += csv.stringify( role.endDate ) + ',';

						str += line + '\r\n';
					}
					return str;
				}
			};
			$parse( attrs.exportBacklog ).assign( scope.$parent, csv );
		}
	};
} ] );

mmModule.directive( 'exportActive', [ '$parse',
function( $parse ) {
	return {
		restrict: '',
		scope: false,
		link: function( scope, element, attrs ) {
			var data = '';
			var csv = {
				stringify: function( str ) {
					if( str ) {
						// trim spaces
						var startSpace = str.replace( /^\s\s*/, '' );
						var endSpace = startSpace.replace( /\s*\s$/, '' );
						// replace quotes with double quotes
						var replaceDoubleQuotes = endSpace.replace( /"/g, '""' );
						return '"' + replaceDoubleQuotes + '"';
					} else {
						return '"' + '"';
					}
				},
				rawJSON: function( ) {
					return scope.activeProjectsWithUnassignedPeople;
				},
				rawCSV: function( ) {
					return data;
				},
				generate: function( ) {
					var project = scope.project;
					var deficitRoles = scope.unassignedRoleList.data;

					for( var i = 0; i < deficitRoles.length; i++ ) {
						data = csv.JSON2CSV( project, deficitRoles );
					}
				},
				link: function( ) {
					return 'data:text/csv;charset=UTF-8,' + encodeURIComponent( data );
				},
				JSON2CSV: function( project, deficitRoles ) {
					var str = '';
					var line = '';

					//Print the header
					var head = [ 'Project', 'Role', 'Hours', 'Start Date', 'End Date' ];
					for( var i = 0; i < head.length; i++ ) {
						line += head[ i ] + ',';
					}
					//Remove last comma and add a new line
					line = line.slice( 0, -1 );
					str += line + '\r\n';

					//Print the values
					for( var x = 0; x < deficitRoles.length; x++ ) {
						line = '';

						var role = deficitRoles[ x ];

						//Project
						line += csv.stringify( role.title ) + ',';
						line += csv.stringify( role.role ) + ',';
						line += csv.stringify( role.hours ) + ',';
						line += csv.stringify( role.startDate ) + ',';
						line += csv.stringify( role.endDate ) + ',';

						str += line + '\r\n';
					}
					return str;
				}
			};
			$parse( attrs.exportActive ).assign( scope.$parent, csv );
		}
	};
} ] );

mmModule.directive( 'exportPipeline', [ '$parse',
function( $parse ) {
	return {
		restrict: '',
		scope: false,
		link: function( scope, element, attrs ) {
			var data = '';
			var csv = {
				stringify: function( str ) {
					if( str ) {
						// trim spaces
						var startSpace = str.replace( /^\s\s*/, '' );
						var endSpace = startSpace.replace( /\s*\s$/, '' );
						// replace quotes with double quotes
						var replaceDoubleQuotes = endSpace.replace( /"/g, '""' );
						return '"' + replaceDoubleQuotes + '"';
					} else {
						return '"' + '"';
					}
				},
				rawJSON: function( ) {
					return scope.pipelineProjectsList;
				},
				rawCSV: function( ) {
					return data;
				},
				generate: function( ) {
					var pipelineProjects = scope.pipeListProjects.data;

					for( var i = 0; i < pipelineProjects.length; i++ ) {
						data = csv.JSON2CSV( pipelineProjects );
					}
				},
				link: function( ) {
					return 'data:text/csv;charset=UTF-8,' + encodeURIComponent( data );
				},
				JSON2CSV: function( pipelineProjects ) {
					var str = '';
					var line = '';

					//Print the header
					var head = [ 'Project', 'Roles', 'Start Date', 'End Date' ];
					for( var i = 0; i < head.length; i++ ) {
						line += head[ i ] + ',';
					}
					//Remove last comma and add a new line
					line = line.slice( 0, -1 );
					str += line + '\r\n';

					//Print the values
					for( var x = 0; x < pipelineProjects.length; x++ ) {
						line = '';

						var proj = pipelineProjects[ x ];

						//Project
						line += csv.stringify( proj.title ) + ',';
						line += csv.stringify( proj.roles ) + ',';
						line += csv.stringify( proj.startDate ) + ',';
						line += csv.stringify( proj.endDate ) + ',';

						str += line + '\r\n';
					}
					return str;
				}
			};
			$parse( attrs.exportPipeline ).assign( scope.$parent, csv );
		}
	};
} ] );
