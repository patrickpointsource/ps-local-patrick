'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module( 'Mastermind.controllers.people' ).controller( 'PeopleCtrl', [ '$scope', '$state', '$location', '$filter', '$q', 'Resources', 'People', 'ProjectsService', 'ngTableParams',
function( $scope, $state, $location, $filter, $q, Resources, People, ProjectsService, TableParams ) {
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

	var rolePeopleGroupMap = People.getPeopleGroupMapping( )

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
	};
	
	$scope.sortType = 'name-desc';

	$scope.switchSort = function( prop ) {
		if( $scope.sortType == prop + "-desc" ) {
			$scope.changeSort( prop + "-asc" );
		} else {
			$scope.changeSort( prop + "-desc" );
		}
	}

	$scope.changeSort = function( type ) {

		if( type ) {
			$scope.sortType = type;
		}

		if( type == 'name-desc' ) {
			$scope.people = _.sortBy( $scope.people, function( person ) {
				return person.familyName ? person.familyName.toLowerCase( ): '';
			} );
		}

		if( type == 'name-asc' ) {
			$scope.people = _.sortBy( $scope.people, function( person ) {
				return person.familyName ? person.familyName.toLowerCase( ): '';
			} ).reverse( );
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

				if( a.primaryRole.title < b.primaryRole.title ) {
					return -1;
				} else if( a.primaryRole.title > b.primaryRole.title ) {
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

				if( a.primaryRole.title < b.primaryRole.title ) {
					return 1;
				} else if( a.primaryRole.title > b.primaryRole.title ) {
					return -1;
				} else {
					return 0;
				}
			} );
		}

		if( type == 'group-desc' ) {
			$scope.people.sort( function( a, b ) {
				if( !a.group && !b.group ) {
					return 0;
				}
				if( !a.group ) {
					return 1;
				}
				if( !b.group ) {
					return -1;
				}

				if( a.group < b.group ) {
					return -1;
				} else if( a.group > b.group ) {
					return 1;
				} else {
					return 0;
				}
			} );
		}

		if( type == 'group-asc' ) {
			$scope.people.sort( function( a, b ) {
				if( !a.group && !b.group ) {
					return 0;
				}
				if( !a.group ) {
					return 1;
				}
				if( !b.group ) {
					return -1;
				}

				if( a.group < b.group ) {
					return 1;
				} else if( a.group > b.group ) {
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
	}


	/**
	 * Changes list of people on a filter change
	 */
	$scope.handlePeopleFilterChanged = function( ) {
		if (window.useAdoptedServices) {
			$scope.handlePeopleFilterUsingFilterResource( );
		}
		else {
			$scope.handlePeopleFilterChangedUsingQuery( );
		}
	};

	/**
	 * Changes list of people on a filter change (using query)
	 */
	$scope.handlePeopleFilterChangedUsingQuery = function( ) {
		//Check if the filter is a valid role
		if( $scope.roleGroups && $scope.roleGroups[ $scope.peopleFilter ] ) {
			var peopleInRoleQuery = {
				'primaryRole.resource': $scope.peopleFilter
			};
			var peopleInRoleFields = {
				resource: 1,
				name: 1,
				familyName: 1,
				givenName: 1,
				primaryRole: 1,
				thumbnail: 1
			};

			People.query( peopleInRoleQuery, peopleInRoleFields).then( function( result ) {
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
			var peopleQuery = {
				$or: [ ]
			};
			var tmp = $scope.peopleFilter.split( ':' );

			tmp = tmp[ tmp.length - 1 ];

			tmp = tmp.split( ',' );

			var includeInactive = _.indexOf( tmp, 'inactive' ) > -1;

            if( !$scope.projectManagementAccess)
                includeInactive = false;
        
			tmp = $scope.mapPeopleGroupToRoles( tmp );

			if( tmp.length > 0 )
				for( var i = 0; i < tmp.length; i++ ) {
					peopleQuery.$or.push( {
						'primaryRole.resource': tmp[ i ]
					} );
				}
			else
				peopleQuery.$or.push( {
					'primaryRole.resource': 'null'
				} );

			if( includeInactive )
				peopleQuery.$or.push( {
					'isActive': 'false'
				} );
			else {
				peopleQuery.$and = [ {
					'isActive': 'true'
				} ];
			}

			var peopleInRoleFields = {
				resource: 1,
				name: 1,
				familyName: 1,
				givenName: 1,
				primaryRole: 1,
				thumbnail: 1
			};

			People.query( peopleQuery, peopleInRoleFields).then( function( result ) {
				$scope.people = result.members;
				$scope.fillPeopleProps( );
			} );

		}
		//Otherwise just show all
		else {
			$scope.peopleFilter = 'all';
			var fields = {
				resource: 1,
				name: 1,
				familyName: 1,
				givenName: 1,
				primaryRole: 1,
				thumbnail: 1
			};
			//var fieldsEncoded = encodeURIComponent(JSON.stringify(fields));
			//var url = 'people?fields='+fieldsEncoded;
			
			People.query( {
				'$and': [ {
					'isActive': 'true'
				} ]
			}, fields ).then( function( result ) {
				$scope.people = result.members;
				$scope.fillPeopleProps( );
			} );
		}

		//Replace the URL in history with the filter
		if( $state.current && $state.current.name.indexOf('people') > -1 && $scope.peopleFilter != $state.params.filter ) {
			var view = false;
			if( $scope.showGraphView ) {
				view = 'graph';
			} else {
				view = 'table';
			}
			var updatedUrl = $state.href( 'people.index', {
				'filter': $scope.peopleFilter,
				'view': view
			} ).replace( '#', '' );
			
			$location.url( updatedUrl ).replace( );
		}
	};




	/**
	 * Changes list of people on a filter change (using filter resource)
	 */
	$scope.handlePeopleFilterUsingFilterResource = function( ) {

		var peopleInRoleFields = {
			resource: 1,
			name: 1,
			familyName: 1,
			givenName: 1,
			primaryRole: 1,
			thumbnail: 1
		};

		//Check if the filter is a valid role
		if( $scope.roleGroups && $scope.roleGroups[ $scope.peopleFilter ] ) {

			People.filter( $scope.peopleFilter, peopleInRoleFields).then( function( result ) {
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

			var tmp = $scope.peopleFilter.split( ':' );
			tmp = tmp[ tmp.length - 1 ];
			tmp = tmp.split( ',' );
			var includeInactive = _.indexOf( tmp, 'inactive' ) > -1;

            if( !$scope.projectManagementAccess)
                includeInactive = false;
        
			var roles = $scope.mapPeopleGroupToRoles( tmp );
			var isActive = !includeInactive;

			People.filter( roles, peopleInRoleFields).then( function( result ) {
				$scope.people = result.members;
				$scope.fillPeopleProps( );
			} );
			
		}
		//Otherwise just show all
		else {
			$scope.peopleFilter = 'all';
			People.filter(null, peopleInRoleFields ).then( function( result ) {
				$scope.people = result.members;
				$scope.fillPeopleProps( );
			} );
		}

		//Replace the URL in history with the filter
		if( $state.current && $state.current.name.indexOf('people') > -1 && $scope.peopleFilter != $state.params.filter ) {
			var view = false;
			if( $scope.showGraphView ) {
				view = 'graph';
			} else {
				view = 'table';
			}
			var updatedUrl = $state.href( 'people.index', {
				'filter': $scope.peopleFilter,
				'view': view
			} ).replace( '#', '' );
			
			$location.url( updatedUrl ).replace( );
		}
	};

	$scope.fillPeopleProps = function( ) {
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
					$scope.people[ i ].group = mapPeopleFilterToUI( group );
				} else {
					$scope.people[ i ].group = '';
				}
			}
		}

		$scope.changeSort( $scope.sortType );
		$scope.hideSpinner = true;
	}
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
		var HOURS_PER_WEEK = CONSTS.HOURS_PER_WEEK;

		//Actual Table View Data
		if( $scope.showTableView ) {
			People.getPeopleCurrentAssignments( ).then( function( activeAssignments ) {
				//Sum the percentages for all of the active assignments
				var activePercentages = {};
				for( var person in activeAssignments ) {
					var cnt = 0;
					var assignments = activeAssignments[ person ];
					for( var i = 0; i < assignments.length; i++ ) {
						var assignment = assignments[ i ];
						cnt += assignment.hoursPerWeek;
					}
					activePercentages[ person ] = Math.round( 100 * cnt / HOURS_PER_WEEK );
				}

				$scope.activePercentages = activePercentages;

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
		} )
		var abbrs = [ ];

		for( var i = 0; i < peopleGroups.length; i++ ) {
			abbrs = rolePeopleGroupMap[ peopleGroups[ i ] ];

			for( var j = 0; abbrs && j < abbrs.length; j++ )
				if( mapRoles[ abbrs[ j ] ] )
					result.push( mapRoles[ abbrs[ j ] ] )
		}

		return result;
	}
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

	var monthNamesShort = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

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
	} );

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
				}
				if( person.name ) {
					searchStr = addToSearchStr( searchStr, person.name );
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
} ] );
