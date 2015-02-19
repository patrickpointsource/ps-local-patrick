'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, and roles.
 */
angular.module( 'Mastermind' ).controller( 'AreasCtrl', [ '$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'VacationsService', 'NotificationsService',
function( $scope, $state, $rootScope, Resources, ProjectsService, VacationsService, NotificationsService ) {

	// make these vars accessible in scope methods - especially "showHome"
	var apQuery;
	var apFields;

	$scope.widgets = [ {
		'name': 'Hours',
		'templateLocation': 'modules/widgets/hours/hours.html',
		'available': [ 'you', 'me', 'them' ]
	} ];
	
	// Default dashboard view overwritten below if Exec or Management
	$scope.dashboardScreen = 'views/dashboards/baseDashboard.html';
		
	//Load my profile for group and role checking
	Resources.refresh( 'people/me' ).then( function( me ) {
		$scope.me = me;   

		//Load profile access rights using NodeJS service
		if (window.useAdoptedServices) {
			Resources.refresh( 'people/me/accessRights' ).then( function success( accessRights ) {	
				$scope.financeAccess = accessRights.hasFinanceRights;
				$scope.adminAccess = accessRights.hasAdminRights;
				$scope.projectManagementAccess = accessRights.hasProjectManagementRights;
				$scope.executivesAccess = accessRights.hasExecutiveRights;
				$scope.hasManagementRights = accessRights.hasManagementRights;

				if( accessRights.hasExecutiveRights ) {
					$scope.dashboardScreen = 'views/dashboards/execDashboard.html';
				}
				if( accessRights.hasManagementRights || accessRights.hasProjectManagementRights ) {
					$scope.dashboardScreen = 'views/dashboards/managerDashboard.html';
				}

				$scope.notifications = [];
				if( accessRights.hasManagementRights) {
					NotificationsService.getPersonsNotifications($scope.me.about).then(function(result) {
						$scope.notifications = result.members;
					});
				}

				//console.log('Logged In');
				$scope.authState = true;
				$scope.$emit( 'me:loaded' );
			});
		}
		else {
			/**
			 * Members of the 'Executives' group...
			 *
			 * Is in the Executive Sponsor List (queried from People collection)
			 * Can edit any project (projectManagementAccess)
			 * Can view all financial info (financeAccess)
			 * Can make project assignments (projectManagementAccess)
			 * View Staffing Deficits (projectManagementAccess)
			 * Update Role Types (adminAccess)
			 * Can Assign Users to Groups (adminAccess)
			 */
			if( me.groups && me.groups.indexOf( 'Executives' ) !== -1 ) {
				$scope.financeAccess = true;
				$scope.adminAccess = true;
				$scope.projectManagementAccess = true;
				$scope.executivesAccess = true;
				$scope.dashboardScreen = 'views/dashboards/execDashboard.html';
			}

			/**
			 * Members of the 'Management' group...
			 *
			 * Can edit any project (projectManagementAccess)
			 * Can view all financial info (financeAccess)
			 * Can make project assignments (projectManagementAccess)
			 * View Staffing Deficits (projectManagementAccess)
			 * Update Role Types (adminAccess)
			 * Can Assign Users to Groups (adminAccess)
			 */
			if( me.groups && me.groups.indexOf( 'Management' ) !== -1 ) {
				$scope.financeAccess = true;
				$scope.adminAccess = true;
				$scope.projectManagementAccess = true;
				$scope.dashboardScreen = 'views/dashboards/managerDashboard.html';
			}

			/**
			 * Members of the 'Project Management' group...
			 *
			 * Can edit any project (projectManagementAccess)
			 * Can make project assignments (projectManagementAccess)
			 * View Staffing Deficits (projectManagementAccess)
			 */
			if( me.groups && me.groups.indexOf( 'Project Management' ) !== -1 ) {
				$scope.projectManagementAccess = true;
				$scope.dashboardScreen = 'views/dashboards/managerDashboard.html';
			}

			/**
			 * Members of the 'Sales' group...
			 *
			 * Is in the Sales Sponsor List (queried from People collection)
			 * Can view all financial info (financeAccess)
			 */
			if( me.groups && me.groups.indexOf( 'Sales' ) !== -1 ) {
				$scope.financeAccess = true;
			}

			$scope.notifications = [];
			if( me.groups && me.groups.indexOf( 'Management' ) !== -1 ) {
				NotificationsService.getPersonsNotifications($scope.me.about).then(function(result) {
					$scope.notifications = result.members;
				});
			}

			//console.log('Logged In');
			$scope.authState = true;
			$scope.$emit( 'me:loaded' );
		};
	});

	/**
	 * Determine the active area of the application for the user.
	 *
	 * @returns {string}
	 */
	function activeArea( ) {
		// default the value in case none of the states match.
		var area = 'home';

		if( $state.includes( 'projects' ) ) {
			area = 'projects';
		} else if( $state.includes( 'people' ) ) {
			area = 'people';
		} else if( $state.includes( 'staffing' ) ) {
			area = 'staffing';
		} else if( $state.includes( 'admin' ) ) {
			area = 'admin';
		} else if( $state.includes( 'calendar' ) ) {
			area = 'calendar';
		} else if( $state.includes( 'reports' ) ) {
			area = 'reports';
		}

		return area;
	}


	$scope.activeArea = activeArea;

	$scope.getActiveAreaFilter = function( ) {
		return $state.params ? $state.params.filter : 'all';
	};
	
	$scope.getPersonName = function(person, isSimply, isFirst) {
		return Util.getPersonName(person, isSimply, isFirst);
	};

	$scope.showHideMenu = function( ) {

		var isToBeShown = !$( '#navbar-collapse-mobile' ).hasClass( 'in' );
		//var menuWidth = $('#navbar-collapse-mobile').width();
		var menuWidth = 280;
		var minTopHeaderContentWidth = 90;

		if( isToBeShown ) {
			if( !$( '#appContent' ).data( 'origWidth' ) ) {
				$( '#appContent' ).data( 'origWidth', $( '#appContent' ).width( ) );
			}

			$( '#appContent' ).css( 'width', $( '#appContent' ).data( 'origWidth' ) );
			$( '#appContent' ).parent( ).css( 'overflow', 'hidden' );

			$( '#appContent' ).animate( {
				marginLeft: menuWidth + 'px'
			} );

			var paddingLeft = ( menuWidth - 20 );
			var topHeaderWidth = $( '.navbar.navbar-default.navbar-fixed-top' ).width( );

			if( ( topHeaderWidth - paddingLeft ) < minTopHeaderContentWidth ) {
				var w = $( '.navbar.navbar-default.navbar-fixed-top' ).width( );

				$( '.navbar.navbar-default.navbar-fixed-top' ).data( 'origWidth', w );

				$( '.navbar.navbar-default.navbar-fixed-top' ).width( w + minTopHeaderContentWidth - ( topHeaderWidth - paddingLeft ) );
			}

			$( '.navbar.navbar-default.navbar-fixed-top' ).animate( {
				paddingLeft: paddingLeft + 'px'
			} );
		} else {
			$( '#appContent' ).animate( {
				marginLeft: '0px'
			}, function( ) {
				$( '#appContent' ).css( 'width', 'auto' );
				$( '#appContent' ).parent( ).css( 'overflow', 'auto' );
			} );

			$( '.navbar.navbar-default.navbar-fixed-top' ).animate( {
				paddingLeft: '0px'
			}, function( ) {
				if( $( '.navbar.navbar-default.navbar-fixed-top' ).data( 'origWidth' ) ) {
					$( '.navbar.navbar-default.navbar-fixed-top' ).width( $( '.navbar.navbar-default.navbar-fixed-top' ).data( 'origWidth' ) );
				}
			} );
		}

		$( '#navbar-collapse-mobile' ).collapse( 'toggle' );
	};

	$scope.showMainMenu = function( e ) {
		e = e ? e : window.event;
		e.preventDefault( );
		e.stopPropagation( );

		var subnavbar = $( e.target ).closest( '.subnavbar' );

		subnavbar.addClass( 'hidden' );
		return false;
	};
	/*
	 * Navigate to the dashboard.
	 */
	$scope.showHome = function( ) {
	    $scope.hideDashboardSpinner = false;
	    $scope.hoursLoaded = false;
        $scope.bookingForecastLoaded = false;
        $scope.staffingDeficitLoaded = false;
    
		ProjectsService.getMyCurrentProjects( $scope.me ).then( function( result ) {
			$scope.myActiveProjects = result.data;
			if( result.data.length > 0 ) {
				$scope.hasActiveProjects = true;
			}
		} );
		$state.go( 'home' );
	};

	/*
	 * Navigate to the projects index.
	 */
	$scope.showProjects = function( filter ) {
		if( !filter ) {
			$state.go( 'projects.index', {
				filter: 'all'
			} );
		} else {
			$state.go( 'projects.index', {
				filter: filter
			} );
		}
	};

	/*
	 * Navigate to the projects index.
	 */
	$scope.showPeople = function( filter ) {
		if( !filter ) {
			$state.go( 'people.index', {
				filter: 'all'
			} );
		} else {
			$state.go( 'people.index', {
				filter: filter
			} );
		}
	};

	/*
	 * Navigate to the staffing index.
	 */
	$scope.showStaffing = function( ) {
		$state.go( 'staffing' );
	};
	
	/*
	 * Navigates to calendar view
	 */
	$scope.showCalendar = function( ) {
		$state.go( 'calendar' );
	};

	/*
	 * Navigate to the projects index.
	 */
	$scope.showAdmin = function( ) {
		$state.go( 'admin' );
	};

	/*
	 * Navigate to the report index.
	 */
	$scope.showReports = function( ) {
		$state.go( 'reports.shell' );
	};

	/**
	 * Returns a label that represents the project's state
	 *
	 * You must pass the startDate,endDate,type and committed
	 */
	$scope.projectState = function( project ) {
		var state = ProjectsService.getProjectState( project );
		return state;
	};

	/**
	 * Get the icon classes associated with a project state
	 */
	$scope.projectStateIcon = function( project ) {
		var state = $scope.projectState( project );
		var ret = '';
		if( state === 'Investment' ) {
			ret = 'fa fa-flask';
		} else if( state === 'Pipeline' ) {
			ret = 'fa fa-angle-double-left';
		} else if( state === 'Backlog' ) {
			ret = 'fa fa-angle-left';
		} else if( state === 'Active' ) {
			ret = 'fa fa-rocket';
		} else if( state === 'Done' ) {
			ret = 'fa fa-times-circle-o';
		} else if( state === 'Deal Lost' ) {
			ret = 'fa fa-minus-circle';
		}

		return ret;
	};

	$scope.getModal = function( ) {
		return $rootScope.modalDialog;
	};
	
	$scope.$on('request-processed', function(event, resource) {
	  for(var i = 0; i < $scope.notifications.length; i++) {
	    if(resource == $scope.notifications[i].resource) {
	      $scope.notifications.splice(i, 1);
	    }
	  }
	});
	
	$scope.search = function (event)
	{
		if (event.which == 13)
		{
			$scope.showProjects();
			
			setTimeout(function()
			{
				$scope.showProjects();
				$rootScope.$broadcast("project:search", event.target.value);
			}, 200); // temporary hack
		}
	};
	
	$scope.removeNotification = function(index) {
	  var notification = $scope.notifications[index];
	  Resources.remove(notification.resource).then(function(result) {
	    $scope.notifications.splice(index, 1);
	  });
	}
	
	$scope.hoursLoaded = false;
	$scope.bookingForecastLoaded = false;
	$scope.staffingDeficitLoaded = false;
	
	$scope.checkAllLoaded = function() {
	    if ($scope.hoursLoaded && (!$rootScope.bookingForecastAvailable || $scope.bookingForecastLoaded) && (!$rootScope.staffingDeficitAvailable || $scope.staffingDeficitLoaded))
	       $scope.hideDashboardSpinner = true;
	};
	
	$scope.$on('hours:loaded', function() {
	    $scope.hoursLoaded = true;
	    
	    $scope.checkAllLoaded();
	});
	
	$scope.$on('bookingforecast:loaded', function() {
        $scope.bookingForecastLoaded = true;
        
        $scope.checkAllLoaded();
    });
    
    $scope.$on('staffingdeficit:loaded', function() {
        $scope.staffingDeficitLoaded = true;
        
        $scope.checkAllLoaded();
    });

} ] ).directive( 'backImg', function( ) {
	return function( scope, element, attrs ) {
		var url = attrs.backImg;
		element.css( {
			'background-image': 'url(' + url + ')',
			'background-size': 'cover'
		} );
	};
} );
