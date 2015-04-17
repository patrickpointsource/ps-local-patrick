'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module( 'Mastermind.controllers.people' ).controller( 'PeopleCtrl', [ '$scope', '$state', '$location', '$filter', '$q', 'Resources', 'People', 'ProjectsService', 'AssignmentService', 'ngTableParams',
function( $scope, $state, $location, $filter, $q, Resources, People, ProjectsService, AssignmentService, TableParams ) {
	$scope.loc = window.location;
	var getTableData = function( ) {
		return new TableParams( params, {
			total: $scope.people.length, // length of data
			getData: function( $defer, params ) {
				var data = $scope.people;

				var start = ( params.page( ) - 1 ) * params.count( );
				var end = params.page( ) * params.count( );

				for( var i = start; ( i < $scope.people.length && i < end ); i++ ) {
					//Annotate people with additional information
					$scope.people[ i ].activeHours = $scope.activeHours ? $scope.activeHours[ $scope.people[ i ].resource ] : '?';

					$scope.people[ i ].activePercentage = $scope.activePercentages ? ( $scope.activePercentages[ $scope.people[ i ].resource ] ? $scope.activePercentages[ $scope.people[ i ].resource ] : 0 ) : '?';

					if( $scope.people[ i ].primaryRole && $scope.people[ i ].primaryRole.resource ) {
						// add the role to the person so we can display it in the table and sort by it
						$scope.people[ i ].primaryRole = $scope.roleGroups[ $scope.people[ i ].primaryRole.resource ];
					}
				}
				// use build-in angular filter
				var orderedData = params.sorting( ) ? $filter('orderBy')( data, params.orderBy( ) ) : data;

				var ret = orderedData.slice( start, end );
				$defer.resolve( ret );
			}
		} );
	};

	var rolePeopleGroupMap = People.getPeopleGroupMapping( );
	
	$scope.sortType = 'name-desc';

	$scope.switchSort = function( prop ) {
		if( $scope.sortType == prop + "-desc" ) {
			$scope.changeSort( prop + "-asc" );
		} else {
			$scope.changeSort( prop + "-desc" );
		}
	};

	$scope.changeSort = function( type ) {

		if( type ) {
			$scope.sortType = type;
		}

		if( type == 'name-desc' ) {
			$scope.people = _.sortBy( $scope.people, function( person ) {
				return $scope.getPersonName(person).toLowerCase() || '';
			} );
		}

		if( type == 'name-asc' ) {
			$scope.people = _.sortBy( $scope.people, function( person ) {
				return $scope.getPersonName(person).toLowerCase() || '';
			} ).reverse( );
		}

		if( type == 'group-desc' ) {
			$scope.people.sort( function( a, b ) {

				if( !a.primaryRole && !b.primaryRole ) {
					return 0;
				}
				if( !a.primaryRole ) {
					return 1;
				}
				if( !b.primaryRole ) {
					return -1;
				}

				if( a.primaryRole.title < b.primaryRole.title ) {
					return -1;
				} else if( a.primaryRole.title > b.primaryRole.title ) {
					return 1;
				} else {
					return 0;
				}
			} );
		}

		if( type == 'group-asc' ) {
			$scope.people.sort( function( a, b ) {

				if( !a.primaryRole && !b.primaryRole ) {
					return 0;
				}
				if( !a.primaryRole ) {
					return 1;
				}
				if( !b.primaryRole ) {
					return -1;
				}

				if( a.primaryRole.title < b.primaryRole.title ) {
					return 1;
				} else if( a.primaryRole.title > b.primaryRole.title ) {
					return -1;
				} else {
					return 0;
				}
			} );
		}

		if( type == 'role-desc' ) {
			$scope.people.sort( function( a, b ) {

				if( !a.primaryRole && !b.primaryRole ) {
					return 0;
				}
				if( !a.primaryRole ) {
					return 1;
				}
				if( !b.primaryRole ) {
					return -1;
				}

				if( a.primaryRole.abbreviation < b.primaryRole.abbreviation ) {
					return -1;
				} else if( a.primaryRole.abbreviation > b.primaryRole.abbreviation ) {
					return 1;
				} else {
					return 0;
				}
			} );
		}

		if( type == 'role-asc' ) {
			$scope.people.sort( function( a, b ) {

				if( !a.primaryRole && !b.primaryRole ) {
					return 0;
				}
				if( !a.primaryRole ) {
					return 1;
				}
				if( !b.primaryRole ) {
					return -1;
				}

				if( a.primaryRole.abbreviation < b.primaryRole.abbreviation ) {
					return 1;
				} else if( a.primaryRole.abbreviation > b.primaryRole.abbreviation ) {
					return -1;
				} else {
					return 0;
				}
			} );

		}


		if( type == 'rate-desc' ) {
			$scope.people.sort( function( a, b ) {
				if( a.activePercentage < b.activePercentage ) {
					return -1;
				} else if( a.activePercentage > b.activePercentage ) {
					return 1;
				} else {
					return 0;
				}
			} );
		}

		if( type == 'rate-asc' ) {
			$scope.people.sort( function( a, b ) {
				if( a.activePercentage < b.activePercentage ) {
					return 1;
				} else if( a.activePercentage > b.activePercentage ) {
					return -1;
				} else {
					return 0;
				}
			} );
		}
	};

	/**
	 * Changes list of people on a filter change
	 */
	$scope.handlePeopleFilterChanged = function( ) {
		var peopleInRoleFields = [ "resource", "name", "familyName", "givenName", "primaryRole", "thumbnail", "jobTitle", "secondaryRoles" ];
		var params = {fields : peopleInRoleFields };

		//Check if the filter is a valid role
		if( $scope.roleGroups && $scope.roleGroups[ $scope.peopleFilter ] ) {
			params.role = $scope.peopleFilter;
			
			Resources.refresh("people/bytypes/byRoles", params).then( function( result ) {
				$scope.people = result.members;
				$scope.fillPeopleProps( );
			} );

		} else if( $scope.peopleFilter == 'my' ) {
			$scope.peopleFilter = 'my';

			People.getMyPeople( $scope.me ).then( function( people ) {
				$scope.people = people;
				$scope.fillPeopleProps( );
			} );
		} else if( $scope.peopleFilter && $scope.peopleFilter != 'all' && ( $scope.peopleFilter.indexOf( ':' ) > -1 || $scope.peopleFilter.indexOf( ',' ) > -1 || !$scope.roleGroups[ $scope.peopleFilter ] ) ) {

			//var tmp = $scope.peopleFilter.split( ':' );
			var tmp = [$scope.peopleFilter];
			tmp = tmp[ tmp.length - 1 ];
			tmp = tmp.split( ',' );
			var includeInactive = _.indexOf( tmp, 'inactive' ) > -1;

            if( !$scope.projectManagementAccess)
                includeInactive = false;
        
			var roles = $scope.mapPeopleGroupToRoles( tmp );
			
			if (roles.length == 0 && includeInactive) {
				var includeAll = _.indexOf( tmp, 'all' ) > -1;
				var res = (includeAll) ? "people" : "people/bytypes/inactive";
				Resources.refresh( res, params).then( function( result ) {
					$scope.people = result.members;
					$scope.fillPeopleProps( );
				} );
			}
			else {
				params.categories = $scope.peopleFilter;
				
				if (includeInactive) {
					params.includeInactive = includeInactive;
				}
				/*
				Resources.refresh( "people/bytypes/byRoles", params).then( function( result ) {
					$scope.people = result.members;
					$scope.fillPeopleProps( );
				} );
				*/
				Resources.refresh( "people/bytypes/byCategories", params).then( function( result ) {
					$scope.people = result.members;
					$scope.fillPeopleProps( );
				} );
			}
		}
		//Otherwise just show all active people
		else {
			params.t = (new Date()).getMilliseconds();
			$scope.peopleFilter = 'all';
			Resources.refresh("people/bytypes/active", params).then( function( result ) {
				$scope.people = result.members;
				$scope.fillPeopleProps( );
			} );
		}
		
	};


	$scope.fillPeopleProps = function( ) {
		$scope.fillPeopleActivePercentages().then( function( ) {
			for( var i = 0; i < $scope.people.length; i++ ) {
				//Annotate people with additional information
				$scope.people[ i ].activeHours = $scope.activeHours ? $scope.activeHours[ $scope.people[ i ].resource ] : '?';

				$scope.people[ i ].activePercentage = $scope.activePercentages ? ( $scope.activePercentages[ $scope.people[ i ].resource ] ? $scope.activePercentages[ $scope.people[ i ].resource ] : 0 ) : '?';

				if( $scope.people[ i ].primaryRole && $scope.people[ i ].primaryRole.resource ) {
					// add the role to the person so we can display it in the table and sort by it
					$scope.people[ i ].primaryRole = $scope.roleGroups[ $scope.people[ i ].primaryRole.resource ];

					var group = "";
					_.each( rolePeopleGroupMap, function( rolesArray, key ) {
						if( $scope.people[ i ].primaryRole && $scope.people[ i ].primaryRole.abbreviation && _.contains( rolesArray, $scope.people[ i ].primaryRole.abbreviation ) ) {
							group = key;
						}
					} );
					if( group.length > 0 ) {
						$scope.people[ i ].group = People.mapPeopleFilterToUI( group );
					} else {
						$scope.people[ i ].group = '';
					}
				}

				// fix cases when name passed as compound string
				if (_.isString($scope.people[ i ].name)) {
					var tmp = $scope.people[ i ].name.split(/\s+/g);

					$scope.people[ i ].name = {
							givenName: tmp[0],
							familyName: tmp[1],
							fullName: $scope.people[ i ].name
					};
				}
			}

			$scope.changeSort( $scope.sortType );
			$scope.hideSpinner = true;
		} );
	};
	
	$scope.fillPeopleActivePercentages = function( ) {
		return People.getPeopleCurrentAssignments( ).then( function( activeAssignments ) {
			//Sum the percentages for all of the active assignments
			var activePercentages = {};
			for( var person in activeAssignments ) {
				var cnt = 0;
				var assignments = activeAssignments[ person ];
				if (assignments) {
					var hoursRateValue = AssignmentService.getAssignmentsHoursRate( assignments );
					activePercentages[ person ] = Math.round( 100 * hoursRateValue / CONSTS.HOURS_PER_WEEK );
				}
			}

			$scope.activePercentages = activePercentages;

		} );
	};
	
	$scope.getPersonName = function(person, isSimply, isFirst) {
		return Util.getPersonName(person, isSimply, isFirst);
	};
	/**
	 * display the month name from a month number (0 - 11)
	 */
	$scope.getMonthName = function( monthNum ) {
		if( monthNum > 11 ) {
			monthNum = monthNum - 12;
		}
		return monthNamesShort[ monthNum ];
	};

	/**
	 * display the month name from a month number (0 - 11)
	 */
	$scope.getShortName = function( date, inc ) {
		var monthNum = date.getMonth( ) + inc;
		var year = date.getFullYear( );
		if( monthNum > 11 ) {
			monthNum = monthNum - 12;
			year++;
		}

		var ret = monthNamesShort[ monthNum ] + ' ' + year.toString( ).substring( 2 );

		return ret;
	};

	/**
	 * build table view
	 */
	$scope.buildTableView = function( ) {
		
		//Actual Table View Data
		if( $scope.showTableView ) {
			$scope.fillPeopleActivePercentages().then( function( ) {
				//Once we have the active people apply the default filter
				//Trigger initial filter change
				$scope.handlePeopleFilterChanged( );
			} );
		}

		//Graph View Data
		else if( $scope.showGraphView ) {
			//Clone start date
			var startDate = new Date( $scope.startDate );
			People.getPeoleAssignments( startDate ).then( function( peopleAssignments ) {
				$scope.qvPeopleAssignments = peopleAssignments;

				//Trigger initial filter change
				$scope.handlePeopleFilterChanged( );

				//
				//	    		  var peopleIds = [];
				//    			  for(var resource in peopleAssignments){
				//    				//{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
				//  	                var oid =
				// {$oid:resource.substring(resource.lastIndexOf('/')+1)};
				//  	                peopleIds.push(oid);
				//	    		  }
				//
				//    			  //Look up all people with relevant assignments
				//    			  var pepQuery = {_id:{$in:peopleIds}};
				//			      var pepFields =
				// {resource:1,name:1,familyName:1,givenName:1,primaryRole:1,thumbnail:1};
				//			      People.query(pepQuery,pepFields).then(function(data){
				//			    	  $scope.qvPeople = data.members;
				//
				//
				//			      });
			} );
		}
	};

	/**
	 * Calculates whether a role is active within a particular month.
	 *
	 * @param project
	 * @param month
	 * @param year
	 */
	$scope.isPersonActiveInMonth = function( assignment, person, month, year ) {
		var nextMonth = month === 11 ? 0 : ( month + 1 ), nextYear = month === 11 ? ( year + 1 ) : year, startDay = new Date( year, month, 1 ), endDay = new Date( nextYear, nextMonth, 0 );

		// If the role start day is before the last day of this month
		// and its end date is after the first day of this month.
		var assignmentStarted = new Date( assignment.startDate ) <= endDay;
		var assignmentEnded = assignment.endDate && new Date( assignment.endDate ) <= startDay;
		var ret = assignmentStarted && !assignmentEnded;

		return ret;
	};

	$scope.toggleTableView = function( ) {
		if( $scope.showGraphView ) {
			$scope.showTableView = !$scope.showTableView;
			$scope.showGraphView = !$scope.showGraphView;
		}
		$scope.buildTableView( );
	};

	$scope.toggleGraphView = function( ) {
		if( $scope.showTableView ) {
			$scope.showGraphView = !$scope.showGraphView;
			$scope.showTableView = !$scope.showTableView;
		}
		$scope.buildTableView( );
	};

	$scope.mapPeopleGroupToRoles = function( peopleGroups ) {
		var result = [ ];
		var mapRoles = {};

		var map = _.map( $scope.roleGroups, function( val, key ) {
			if (val)
			     mapRoles[ val.abbreviation ] = key;
		} );
		var abbrs = [ ];

		for( var i = 0; i < peopleGroups.length; i++ ) {
			abbrs = rolePeopleGroupMap[ peopleGroups[ i ] ];

			for( var j = 0; abbrs && j < abbrs.length; j++ )
				if( mapRoles[ abbrs[ j ] ] )
					result.push( mapRoles[ abbrs[ j ] ] );
		};

		return result;
	};
	/**
	 * Move the starting date back 5 months
	 */
	$scope.ganttPrev = function( ) {
		$scope.startDate.setMonth( $scope.startDate.getMonth( ) - 5 );
		$scope.buildTableView( );
	};

	/**
	 * Move the starting date back to today
	 */
	$scope.ganttReset = function( ) {
		$scope.startDate = new Date( );
		$scope.buildTableView( );
	};

	/**
	 * Move the starting date forward 5 months
	 */
	$scope.ganttNext = function( ) {
		$scope.startDate.setMonth( $scope.startDate.getMonth( ) + 5 );
		$scope.buildTableView( );
	};

	// Table Parameters
	var params = {
		page: 1, // show first page
		count: 100, // count per page
		sorting: {
			familyName: 'asc' // initial sorting
		}
	};

	

	/**
	 * Custom angular filter for person's searchable attributes
	 */
	$scope.filterPerson = function( filter ) {
		return function( person ) {
			if( filter && person ) {
				// Construct search string -- separate person's
				// searchable attributes by whitespace
				var searchStr = "";
				var addToSearchStr = function( searchStr, str ) {
					return searchStr += " " + str.toLowerCase( ).replace( / /g, '' );
				};
				if( person.name ) {
					searchStr = addToSearchStr( searchStr, person.name.fullName );
				}
				if( person.primaryRole && person.primaryRole.abbreviation ) {
					searchStr = addToSearchStr( searchStr, person.primaryRole.abbreviation );
				}
				// Prepare filter for search string
				filter = filter.toLowerCase( ).replace( / /g, '' );
				// Search in search string
				return searchStr.indexOf( filter ) > 0;
			} else
				return person;
		};
	};
	
	var monthNamesShort = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
	
	var init = function () {
		
		$scope.peopleFilter = $state.params.filter ? $state.params.filter : 'all';
		$scope.startDate = new Date( );
		//$scope.startDate.setMonth($scope.startDate.getMonth() + 1);

		$scope.showTableView = $state.params.view ? $state.params.view == 'table' : true;
		$scope.showGraphView = $state.params.view ? $state.params.view == 'graph' : false;
		
		/**
		 * Get All the Role Types
		 */
		Resources.get( 'roles' ).then( function( result ) {
			var roleGroups = {};
			//Save the list of role types in the scope
			$scope.rolesFilterOptions = result.members;
			//Get list of roles to query members
			for( var i = 0; i < result.members.length; i++ ) {
				var role = result.members[ i ];
				var resource = role.resource;
				roleGroups[ resource ] = role;
			}
			$scope.roleGroups = roleGroups;

			//Kick off fetch all the people
			$scope.buildTableView( );
		});

		Resources.get('jobTitles').then(function (result) {
		    var members = result.members;
		    $scope.allTitles = members;
		    var titlesMap = {};
		    for (var i = 0; i < members.length; i++) {
		        titlesMap[members[i].resource] = members[i];
		    }

		    // sorting titles by title
		    $scope.allTitles.sort(function (a, b) {
		        var x = a.title ? a.title.toLowerCase() : '';
		        var y = b.title ? b.title.toLowerCase() : '';
		        return x < y ? -1 : x > y ? 1 : 0;
		    });

		    $scope.titlesMap = titlesMap;
		});
	};
	
	$scope.getJobTitle = function (jobTitle) {
	    var ret = "";
	    if (jobTitle && jobTitle.resource) {
	        var resource = jobTitle.resource;

	        if ($scope.titlesMap && $scope.titlesMap[resource]) {
	            ret = $scope.titlesMap[resource].title;
	        }
	    }

	    return ret;
	};

	init();
	
} ] );
