'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module( 'Mastermind' ).controller( 'BreadcrumpCtrl', [ '$q', '$rootScope', '$scope', '$state', '$stateParams', '$location', '$filter', '$controller', 'ProjectsService', 'Resources', 'People', 'RoleTypes', 'Rates', 'AssignmentService', 'HoursService', 'RolesService',
function( $q, $rootScope, $scope, $state, $stateParams, $location, $filter, $controller, ProjectsService, Resources, People, RoleTypes, Rates, AssignmentService, HoursService, RolesService ) {

	$scope.state = $state.current;
	$scope.params = $state.params;
	$scope.fromState = {};
	$scope.fromParams = {};
	$scope.promisedPart = "";
	$scope.breadCrumpParts = [ ];

	var rolePeopleGroupMap = People.getPeopleGroupMapping( );

	var mapPeopleFilterToUI = function( filterPeople ) {
		if( filterPeople == 'businessdevelopment' ) {
			return 'Business Development';
		}
		if( filterPeople == 'clientexpierencemgmt' ) {
			return 'Client Experience Mgmt';
		}
		if( filterPeople == 'digitalexperience' ) {
			return 'Digital Experience';
		}
		if( filterPeople == 'executivemgmt' ) {
			return 'Executive Mgmt';
		}

		var bigLetter = filterPeople[ 0 ].toUpperCase( );
		var endPart = filterPeople.slice( 1, filterPeople.length );
		return bigLetter + endPart;
	}

	$scope.updateBreadCrump = function( ) {
		$scope.breadCrumpParts = _.filter( $scope.breadCrumpParts, function( part ) {
			return part;
		} );

		/*for(var i = 0; i < $scope.breadCrumpParts.length; i++) {
		 if($scope.breadCrumpParts[i].length > 70) {
		 $scope.breadCrumpParts[i] = $scope.breadCrumpParts[i].substring(0, 67) + '...';
		 }
		 }*/
		
		// remove duplicates
		$scope.breadCrumpParts = _.uniq($scope.breadCrumpParts);
	}

	$scope.getBreadCrump = function( ) {
		$scope.breadCrumpParts = [ ];

		if( $scope.state.name == 'home' ) {
			$scope.breadCrumpParts.push( "Dashboard" );
		}

		if( $scope.state.name == 'projects.show' ) {
			$scope.breadCrumpParts.push( "Projects" );
		}

		if( $scope.state.name == 'projects.index' ) {
			$scope.breadCrumpParts.push( "Projects" );

			if( $scope.params.filter ) {

				if( $scope.params.filter == 'all' ) {
					$scope.breadCrumpParts = [ 'Projects' ];
				} else {
					var projectFilters = $scope.params.filter.split( ',' );
					var filtersText = [ ];

					for( var i = 0; i < projectFilters.length; i++ ) {
						if( projectFilters[ i ] == 'active' ) {
							filtersText.push( "Active" );
						}
						if( projectFilters[ i ] == 'backlog' ) {
							filtersText.push( "Backlog" );
						}
						if( projectFilters[ i ] == 'pipeline' ) {
							filtersText.push( "Pipeline" );
						}
						if( projectFilters[ i ] == 'investment' ) {
							filtersText.push( "Investment" );
						}
						if( projectFilters[ i ] == 'complete' ) {
							filtersText.push( "Complete" );
						}
						if( projectFilters[ i ] == 'deallost' ) {
							filtersText.push( "Deal Lost" );
						}
					}

					$scope.breadCrumpParts.push( filtersText.join( ',' ) );
				}
			}
		}

		if( $scope.state.name == 'staffing' ) {
			$scope.breadCrumpParts.push( "Staffing" );
		}

		if( $scope.state.name == 'admin' ) {
			$scope.breadCrumpParts.push( "Administration" );
		}

		if( $scope.state.name == 'reports' ) {
			$scope.breadCrumpParts.push( "Reports" );
		}
		
		if( $scope.state.name == 'reportsshell' ) {
			$scope.breadCrumpParts.push( "Reports Dashboard" );
		}
		
		if( $scope.state.name == 'reports.people.choice' ) {
			$scope.breadCrumpParts.push( "Reports Dashboard" );
			$scope.breadCrumpParts.push( "People Report Choice" );
		}
		
		if( $scope.state.name == 'reports.people.output' ) {
			$scope.breadCrumpParts.push( "Reports Dashboard" );
			$scope.breadCrumpParts.push( "People Report" );
		}

		if( $scope.state.name == 'projects.show' || $scope.state.name == 'projects.edit' || $scope.state.name == 'projects.show.tabEdit' ) {
			$scope.breadCrumpParts = [ 'Projects' ];

			if( $scope.params.filter && $scope.params.filter != "all" ) {
				var projectFilters = $scope.params.filter.split( ',' );
				var filtersText = [ ];

				for( var i = 0; i < projectFilters.length; i++ ) {
					if( projectFilters[ i ] == 'active' ) {
						filtersText.push( "Active" );
					}
					if( projectFilters[ i ] == 'backlog' ) {
						filtersText.push( "Backlog" );
					}
					if( projectFilters[ i ] == 'pipeline' ) {
						filtersText.push( "Pipeline" );
					}
					if( projectFilters[ i ] == 'investment' ) {
						filtersText.push( "Investment" );
					}
					if( projectFilters[ i ] == 'complete' ) {
						filtersText.push( "Complete" );
					}
					if( projectFilters[ i ] == 'deallost' ) {
						filtersText.push( "Deal Lost" );
					}
				}

				$scope.breadCrumpParts.push( filtersText.join( ", " ) );
			}

			if( $scope.params.projectId ) {
				$scope.breadCrumpParts.push( "" );
				ProjectsService.getForEdit( $scope.params.projectId ).then( function( project ) {
					$scope.breadCrumpParts.push( project.name );
					$scope.updateBreadCrump( );
				} )
			}
		}

		if( $scope.state.name == 'people.index' ) {
			$scope.breadCrumpParts = [ 'People' ];
			if( $scope.params.filter ) {
				if( $scope.params.filter == 'none' ) {
					$scope.breadCrumpParts = [ 'People' ];
				} else {
					if( $scope.params.filter == 'all' ) {
						$scope.breadCrumpParts = [ 'People', 'All' ];
					} else {
						/*RolesService.getRolesMapByResource().then(function(map) {

						 if (map[$scope.params.filter]) {
						 $scope.breadCrumpParts.push(map[$scope.params.filter].title);
						 $scope.updateBreadCrump();
						 }
						 });*/
						if( $scope.params.filter.indexOf( "all" ) == 0 ) {
							$scope.breadCrumpParts.push( "All" );
						} else {
							var filterPeople = $scope.params.filter.split( ',' );

							for( var i = 0; i < filterPeople.length; i++ ) {
								filterPeople[ i ] = mapPeopleFilterToUI( filterPeople[ i ] );
							}

							$scope.breadCrumpParts.push( filterPeople.join( ', ' ) );
						}

						$scope.updateBreadCrump( );

					}
				}
			}
		}

		if( $scope.state.name == 'people.show' ) {
			var fromPeopleList = false;
			$scope.breadCrumpParts = [ 'People' ];

			if( $scope.fromParams.filter && $scope.fromParams.filter != "all" ) {
				var filterPeople = $scope.fromParams.filter.split( ',' );

				for( var i = 0; i < filterPeople.length; i++ ) {
					filterPeople[ i ] = mapPeopleFilterToUI( filterPeople[ i ] );
				}

				$scope.breadCrumpParts.push( filterPeople.join( ', ' ) );
			}

			if( $scope.fromState.name == 'people.index' ) {
				if( $scope.fromParams.filter ) {
					var splittedPeopleFilter = $scope.fromParams.filter.split( ',' );
					if( splittedPeopleFilter.length == 1 ) {
						$scope.breadCrumpParts.push( mapPeopleFilterToUI( splittedPeopleFilter[ 0 ] ) );

						fromPeopleList = true;
					} else {
						//	  						$scope.breadCrumpParts = [ 'People', '' ];
					}
				} else {
					//	  					$scope.breadCrumpParts = [ 'People', '' ];
				}
			}

			
			if( $scope.params.profileId ) {
				People.get( $scope.params.profileId ).then( function( profile ) {
					// fix cases when name passed as compound string
					if (_.isString(profile.name)) {
					     var tmp = profile.name.split(/\s+/g);    
					     profile.name = {
					         givenName: tmp[0],
					         familyName: tmp[1],
					         fullName: profile.name
					     };
					 }
					if( profile.accounts.length > 0 ) {
						if( fromPeopleList ) {
							RolesService.getRolesMapByResource( ).then( function( map ) {
								if( profile.primaryRole ) {
									var roleAbbr = map[ profile.primaryRole.resource ] ? map[ profile.primaryRole.resource ].abbreviation : '';
									var mapRoles = rolePeopleGroupMap[ $scope.fromParams.filter ];
									if( _.contains( mapRoles, roleAbbr ) ) {
										if( $scope.breadCrumpParts[ 1 ] != mapPeopleFilterToUI( splittedPeopleFilter[ 0 ] ) ) {
											if( $scope.breadCrumpParts.indexOf( profile.name.fullName ) == -1 )
												$scope.breadCrumpParts.push( profile.name.fullName );
										} else {
											if( $scope.breadCrumpParts.indexOf( profile.name.fullName ) == -1 )
												$scope.breadCrumpParts.push( profile.name.fullName );
										}
									} else {
										if( $scope.breadCrumpParts.indexOf( profile.name.fullName ) == -1 )
											$scope.breadCrumpParts.push( profile.name.fullName );
									}

									$scope.updateBreadCrump( );
								} else {
									$scope.updateBreadCrump( );
								}
							} );
							$scope.breadCrumpParts.push( profile.name.fullName );
						} else {
							$scope.breadCrumpParts.push( profile.name.fullName );
						}

					}
					/*RolesService.getRolesMapByResource().then(function(map) {
					 if(profile.primaryRole) {
					 var role = map[profile.primaryRole.resource];
					 $scope.breadCrumpParts[1] = map[profile.primaryRole.resource].title;
					 $scope.updateBreadCrump();
					 } else {
					 $scope.updateBreadCrump();
					 }
					 });*/
				} );
			}
		}

		$scope.updateBreadCrump( );
		
		$scope.breadCrumpParts = _.uniq($scope.breadCrumpParts);
	};

	$scope.navigate = function( index ) {
		if( index == 0 ) {
			if( $scope.state.name.indexOf( "people." ) == 0 )
				$state.go( "people.index", {
					filter: null
				} );
			else if( $scope.state.name.indexOf( "projects." ) == 0 )
				$state.go( "projects.index", {
					filter: null
				} );
		} else if( index == 1 ) {
			if( $scope.state.name.indexOf( "people." ) == 0 )
				$state.go( "people.index", {
					filter: $scope.fromParams.filter
				} );
			else if( $scope.state.name.indexOf( "projects." ) == 0 )
				$state.go( "projects.index", {
					filter: $scope.params.filter
				} );
		}
	};

	$scope.getBreadCrump( );

	$rootScope.$on( '$stateChangeStart', _.bind( function( event, toState, toParams, fromState, fromParams ) {
		$scope.state = toState;
		$scope.params = toParams;
		$scope.fromState = fromState;
		$scope.fromParams = fromParams;

		$scope.getBreadCrump( );
	} ) );
} ] ); 