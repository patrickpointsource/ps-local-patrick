angular.module( 'Mastermind' ).controller( 'HoursCtrl', [ '$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'HoursService', 'TasksService', 'RolesService', 'AssignmentService',
function( $scope, $state, $rootScope, Resources, ProjectsService, HoursService, TasksService, RolesService, AssignmentService ) {

	$scope.checkForFutureness = function( date ) {
		var a = moment( );
		var b = moment( date );

		var futureness;

		if( b.year( ) > a.year( ) ) {
			futureness = true;
		} else if( b.year( ) == a.year( ) && b.month( ) > a.month( ) && b.date( ) > a.date( ) ) {
			futureness = true;
		} else if( b.year( ) == a.year( ) && b.month( ) == a.month( ) && b.date( ) > a.date( ) ) {
			futureness = true;
		} else {
			futureness = false;
		}

		return futureness;
	};
	$scope.moment = moment;

	$scope.displayedMonthDays = [ ];
	$scope.currentMonth = $scope.moment( );
	$scope.startDate = new Date( );
	$scope.ongoingProjects = [ ];

	$scope.hoursProjects = [ ];
	// fill it in hours controller
	$scope.hoursTasks = [ ];

	$scope.projectTasksList = [ ];

	$scope.hasAssignment = false;
	$rootScope.hasAssignment = false;

	$scope.mode = $scope.mode ? $scope.mode : 'week';
	$scope.subMode = $scope.subMode ? $scope.subMode : 'weekly';

	$scope.customHoursStartDate = '';
	$scope.customHoursEndDate = '';

	$scope.setSubmode = function( e, subMode ) {
    // should be runned only once when subMode changes
    if ($scope.subMode == subMode) {
      return;
    }

		e = e ? e : window.event;

		e.stopPropagation( );

		$scope.subMode = subMode;
		$scope.hoursRequest( );

		if( $scope.mode == 'month' && $scope.subMode == 'monthly' ) {
			if( $scope.selected )
				$scope.currentMonth = $scope.moment( $scope.selected.date );

			$rootScope.showHoursMonthInfo = true;

			if( $scope.setCurrentMonth )
				$scope.setCurrentMonth( $scope.currentMonth.month( ) );
		} else
			$rootScope.showHoursMonthInfo = false;
	};

	$scope.isDisplayedWeek = function( ) {
		return $scope.mode == 'month' && $scope.subMode == 'weekly' || $scope.mode == 'week';
	};

	$scope.showHideWidget = function( show ) {
		$scope.hasAssignment = show;
		$rootScope.hasAssignment = show;
	};

	$scope.applyCustomHoursPeriod = function( ) {

		if( $scope.setCustomPeriod )
			$scope.setCustomPeriod( $scope.customHoursStartDate, $scope.customHoursEndDate );

		$rootScope.showHoursMonthInfo = true;
	};

	$scope.JSON2CSV = function( person, hours ) {
		var str = '';
		var line = '';

		console.log( 'hours:' + hours );

		//Print the header
		var head = [ 'Project/Task', 'Date', 'Hours', 'Description' ];
		for( var i = 0; i < head.length; i++ ) {
			line += head[ i ] + ',';
		}
		//Remove last comma and add a new line
		line = line.slice( 0, -1 );
		str += line + '\r\n';

		//Print the values
		for( var x = 0; x < hours.length; x++ ) {
			line = '';

			var record = hours[ x ];

			if( record.project )
				line += $scope.hoursToCSV.stringify( record.project.name ) + ',';
			else
				line += $scope.hoursToCSV.stringify( record.task.name ) + ',';

			line += record.hour.date + ',';
			line += record.hour.hours + ',';

			line += $scope.hoursToCSV.stringify( record.hour.description ) + ',';
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
			var project;
			var hours = [ ];

			if( $scope.projectHours ) {
				for( var i = 0; i < $scope.projectHours.length; i++ ) {

					for( var j = 0; j < $scope.projectHours[ i ].hours.length; j++ ) {
						if( $scope.projectHours[i].hours[ j ].show ) {
							$scope.projectHours[ i ].hours[ j ].project = {
								name: $scope.projectHours[ i ].project.name,
								roles: $scope.projectHours[ i ].project.roles
							};

							hours = hours.concat( $scope.projectHours[ i ].hours[ j ] );
						}

					}

				}
			}

			if( $scope.taskHours ) {
				for( var i = 0; i < $scope.taskHours.length; i++ ) {

					for( var j = 0; j < $scope.taskHours[ i ].hours.length; j++ ) {

						if( $scope.taskHours[i].hours[ j ].show ) {
							$scope.taskHours[ i ].hours[ j ].task = {
								name: $scope.taskHours[ i ].name
							};

							hours = hours.concat( $scope.taskHours[ i ].hours[ j ] );
						}

					}
				}
			}

			$scope.csvData = $scope.JSON2CSV( $scope.getCurrentPerson( ), hours );
		},

		link: function( ) {
			return 'data:text/csv;charset=UTF-8,' + encodeURIComponent( $scope.csvData );
		}
	};

	var taskIconsMap = {
		"meetings": "fa-comments-o",
		"design": "fa-lightbulb-o",
		"sales": "fa-usd",
		"pre-sales support": "fa-phone",
		"training": "fa-bolt",
		"marketing": "fa-bar-chart-o",
		"administration": "fa-cogs",
		"documentation": "fa-folder-o",
		"sick time": "fa-ambulance",
	};

	var taskIconStylseMap = {
		"meetings": "padding: 3px 7px;",
		"design": "padding: 3px 10px;",
		"sales": "padding: 3px 10px;",
		"pre-sales support": "padding: 3px 8px;",
		"training": "padding: 3px 10px;",
		"marketing": "padding: 3px 6px;",
		"administration": "padding: 3px 6px;",
		"documentation": "padding: 4px 7.5px;",
		"sick time": "padding: 3px 6px;",
	};

	var monthNamesShort = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
	/**
	 * display the month name from a month number (0 -
	 * 11)
	 */
	$scope.getMonthName = function( monthNum ) {
		if( monthNum > 11 ) {
			monthNum = monthNum - 12;
		}
		return monthNamesShort[ monthNum ];
	};

	// Get todays date formatted as yyyy-MM-dd
	var dd = $scope.startDate.getDate( );
	var mm = $scope.startDate.getMonth( ) + 1;
	// January
	// is 0!
	var yyyy = $scope.startDate.getFullYear( );
	if( dd < 10 ) {
		dd = '0' + dd;
	}
	if( mm < 10 ) {
		mm = '0' + mm;
	}

	$scope.getCurrentPerson = function( ) {
		if( $scope.mode == 'month' )
			return $scope.profile;

		return $scope.me;
	};
	/**
	 * Set up the projects to be added to the hours
	 * entry drop down
	 */

	$scope.loadProjects = function( ) {
		ProjectsService.getOngoingProjects( function( result ) {

			$scope.ongoingProjects = result.data;

			ProjectsService.getMyCurrentProjects( $scope.getCurrentPerson( ) ).then( function( myCurrentProjects ) {
				$scope.myProjects = myCurrentProjects.data;
				if( $scope.myProjects.length > 0 ) {
					$scope.hasActiveProjects = true;
				}

				var myProjects = [ ], m;

				for( m = 0; m < $scope.myProjects.length; m++ ) {
					var myProj = $scope.myProjects[ m ];

					myProj.title = myProj.customerName + ': ' + myProj.name;
					myProjects.push( myProj );

					if( myProj && myProj.status && myProj.status.hasAssignment ) {
						$scope.showHideWidget( true );
					}

				}

				var otherProjects = [ ], n;

				for( n = $scope.ongoingProjects.length - 1; n >= 0; n-- ) {
					var proj = _.find( myProjects, function( mp ) {
						return mp.resource == $scope.ongoingProjects[ n ].resource;
					} );

					if( !proj ) {
						var myProj = $scope.ongoingProjects[ n ];

						otherProjects.push( myProj );

						myProj.isOtherProj = true;
					}
				}

				$scope.hoursProjects = myProjects.concat( otherProjects );

				$scope.projectTasksList = $scope.projectTasksList.concat( myProjects.concat( otherProjects ) );

				// load projects on which current person have at least one assignment in
				// past/present/future
				HoursService.getCurrentPersonProjects( $scope.getCurrentPerson( ) ).then( function( projectsWithMyAssignments ) {

					var found, i;

					for( i = 0; i < projectsWithMyAssignments.length; i++ ) {
						found = _.find( $scope.projectTasksList, function( tp ) {
							return tp.resource == projectsWithMyAssignments[ i ].resource;
						} );
						if( found )
							delete found.isOtherProj;
					}

					AssignmentService.getMyCurrentAssignments($scope.getCurrentPerson()).then(function (assignments)
					{
			        	$scope.myAssignments = assignments;

			            $scope.sortProjectTaskList();
					});

					$scope.projectTasksList = $scope.projectTasksList.concat( projectsWithMyAssignments );

					$scope.sortProjectTaskList( );
				} );
			} );

		} );
	};

	$scope.newHoursRecord = {};
	// default open status of hours entry form
	$scope.entryFormOpen = false;
	$scope.lastSelectedDay = {};
	// $scope.hoursToDelete = [];
	/*
	 * $scope.openHoursEntry = function (day) {
	 *
	 * $scope.hoursToDelete = [];
	 * //console.log($scope.selected)
	 *
	 * if ($scope.entryFormOpen && day ===
	 * $scope.selected) { $scope.entryFormOpen = false
	 * delete $scope.selected; } else { // use deep
	 * cloning to prevent from errors when some entries
	 * were removed and then canceled $scope.selected =
	 * $scope.cloneDay(day);
	 * //$('#editHours').modal('show');
	 * $scope.entryFormOpen = true;
	 * $scope.showHideHoursDialog(true)
	 *  } };
	 */
	$scope.sortProjectTaskList = function( ) {
		$scope.projectTasksList = _.uniq( $scope.projectTasksList, function( tp ) {
			return tp.resource;
		} );

		$scope.projectTasksList.sort( function( item1, item2 ) {
			if( item1.isOtherProj && !item2.isOtherProj )
				return 1;
			else if( !item1.isOtherProj && item2.isOtherProj )
				return -1;
			else if( item1.isTask && !item2.isTask )
				return 1;
			else if( !item1.isTask && item2.isTask )
				return -1;
			else if( item1.title < item2.title )
				return -1;
			if( item1.title > item2.title )
				return 1;
			return 0;
		} );
	};

	$scope.showNewHoursEntry = function( e ) {
		$( '.dashboard-widget.hours .row.hours-logged .hours-logged-entry' ).each( function( ind, el ) {

			if( $( el ).scope( ).hourEntry && $( el ).scope( ).hourEntry.hoursRecord.isAdded && ( $( el ).scope( ).hourEntry.hoursRecord.hours == 0 || $( el ).scope( ).hourEntry.hoursRecord.hours == "" || $( el ).scope( ).hourEntry.hoursRecord.hours == undefined ) )
				$( el ).addClass( 'view-entry' );

		} );

		e = e ? e : window.event;

		$( e.target ).closest( '.hours-logged-entry' ).find( '.close-new' ).show( );
		$( e.target ).closest( '.hours-logged-entry' ).find( '.add' ).hide( );
	};

	$scope.closeNewHoursEntry = function( e ) {
		$( '.dashboard-widget.hours .row.hours-logged .hours-logged-entry' ).each( function( ind, el ) {

			if( $( el ).scope( ).hourEntry && $( el ).scope( ).hourEntry.hoursRecord.isAdded && ( $( el ).scope( ).hourEntry.hoursRecord.hours == 0 || $( el ).scope( ).hourEntry.hoursRecord.hours == "" || $( el ).scope( ).hourEntry.hoursRecord.hours == undefined ) )
				$( el ).removeClass( 'view-entry' );

			/*
			 $scope.$apply( function( ) {
			 $scope.editHoursEntry( null, $( el ).scope( ).hourEntry, $( el ).find(
			 'input[name="project-task-select"]' ).eq( 0 ) );
			 } );
			 */
		} );

		e = e ? e : window.event;

		$( e.target ).closest( '.hours-logged-entry' ).find( '.close-new' ).hide( );
		$( e.target ).closest( '.hours-logged-entry' ).find( '.add' ).show( );

		e.stopPropagation( );
	};

	$scope.showHideDesc = function( e, hourEntry ) {
		e = e ? e : window.event;

		var i = $( e.target ).closest( '.hours-logged-details' ).find( 'i' );
		var entry = $( e.target ).closest( '.hours-logged-entry' );
		var desc = entry.find( 'span.hours-logged-desc' );

		if( !hourEntry.detailsVisible ) {
			i.removeClass( 'fa-chevron-down' ).addClass( 'fa-chevron-up' );
			desc.addClass( 'mobile-visible' );
			entry.find( '.edit' ).addClass( 'mobile-visible' );
			hourEntry.detailsVisible = true;
			//entry.css('paddingBottom', '20px');
		} else {
			i.removeClass( 'fa-chevron-up' ).addClass( 'fa-chevron-down' );
			desc.removeClass( 'mobile-visible' );
			entry.find( '.edit' ).removeClass( 'mobile-visible' );
			hourEntry.detailsVisible = false;
			//entry.css('paddingBottom', '0px')
		}

	};

	$scope.editHoursEntry = function( e, hourEntry, tagetInput ) {
		e = e ? e : window.event;

		if( e ) {
			var hoursLoggedEntry = $( e.target ).closest( '.hours-logged-entry' );

			hoursLoggedEntry.find( '.mobile-visible' ).removeClass( 'mobile-visible' );
			hoursLoggedEntry.find( '.fa-chevron-up' ).removeClass( 'fa-chevron-up' ).addClass( 'fa-chevron-down' );
		}

		hourEntry.hoursRecord.editMode = true;

		hourEntry.hoursRecord.hoursEdited = hourEntry.hoursRecord.hours;
		hourEntry.hoursRecord.descriptionEdited = hourEntry.hoursRecord.description;

		// if (!hourEntry.hoursRecord.isAdded){
		hourEntry.selectedItem = hourEntry.hoursRecord.project ? hourEntry.project : hourEntry.hoursRecord.task;

		setExpectedHoursPrompt( hourEntry, hourEntry.hoursRecord.project ? hourEntry.project : hourEntry.hoursRecord.task );
		// }

		tagetInput = tagetInput ? tagetInput : hoursLoggedEntry.find( '[name="project-task-select"]' );

		$scope.bindAutocompleteHandlers( tagetInput );
	};

	/**
	 * Mobile version while operation distributed
	 */
	$scope.closeEditHoursEntry = function( e, hourEntry ) {
		e = e ? e : window.event;
		$scope.clearAutocompleteHandlers( $( e.target ).closest( '.hours-logged-entry' ).find( '[name="project-task-select"]' ) );

		hourEntry.hoursRecord.editMode = false;
		hourEntry.detailsVisible = false;
	};

	$scope.deleteHoursEntry = function( e, hourEntry, index ) {
		$scope.removeOrCloseHourEntry( e, hourEntry, index );
	};

	$scope.removeOrCloseHourEntry = function( e, hourEntry, index ) {
		e = e ? e : window.event;

		if( hourEntry.hoursRecord.isAdded )
			return;

		//if( hourEntry.hoursRecord.editMode ) {

		// if (!hourEntry.hoursRecord.isCopied) {
		hourEntry.hoursRecord.editMode = false;
		$scope.clearAutocompleteHandlers( $( e.target ).closest( '.hours-logged-entry' ).find( '[name="project-task-select"]' ) );
		// }

		//delete hourEntry.hoursRecord.isCopied;

		//$scope.validateAndCalculateTotalHours( );

		//} else {
		// $scope.deleteHoursRecord(index)
		$scope.selected.hoursEntries.splice( index, 1 );

		if( hourEntry.hoursRecord )
			Resources.remove( hourEntry.hoursRecord.resource, hourEntry.hoursRecord ).then( function( ) {
				// $scope.hoursRequest();
				$scope.validateAndCalculateTotalHours( );
				$scope.$emit( 'hours:deleted', $scope.selected );
			} );
		//}
	};

	$scope.saveHoursEntry = function( e, hourEntry, isAdded ) {
		var tmpHours = hourEntry.hoursRecord.hours;
		var tmpDesc = hourEntry.hoursRecord.description;

		hourEntry.hoursRecord.hours = hourEntry.hoursRecord.hoursEdited;
		hourEntry.hoursRecord.description = hourEntry.hoursRecord.descriptionEdited;

		$scope.getNewHoursValidationErrors( hourEntry );

		if( $scope.hoursValidation.length > 0 ) {
			hourEntry.hoursRecord.hours = tmpHours;
			hourEntry.hoursRecord.description = tmpDesc;

			return;
		}

		if( hourEntry.hoursRecord.isAdded && ( hourEntry.hoursRecord.hours == "" || !hourEntry.selectedItem ) )
			return;

		isAdded = isAdded || hourEntry.hoursRecord.isAdded;
		delete hourEntry.hoursRecord.hoursEdited;
		delete hourEntry.hoursRecord.descriptionEdited;
		delete hourEntry.hoursRecord.editMode;
		delete hourEntry.hoursRecord.isAdded;
		delete hourEntry.hoursRecord.isCopied;
		delete hourEntry.hoursRecord.isDefault;

		if( hourEntry.selectedItem ) {
			delete hourEntry.hoursRecord.project;
			delete hourEntry.hoursRecord.task;
			delete hourEntry.project;
			delete hourEntry.task;

			if( hourEntry.selectedItem.resource.indexOf( 'projects' ) > -1 ) {
				hourEntry.project = hourEntry.selectedItem;

				hourEntry.hoursRecord.project = {
					resource: hourEntry.selectedItem.resource,
					name: hourEntry.selectedItem.name
				};
			} else if( hourEntry.selectedItem.resource.indexOf( 'tasks' ) > -1 ) {
				hourEntry.task = hourEntry.selectedItem;

				hourEntry.hoursRecord.task = {
					resource: hourEntry.selectedItem.resource,
					name: hourEntry.selectedItem.name
				};
			}
			delete hourEntry.selectedItem;
		}

		hourEntry.hoursRecord.editMode = false;
		hourEntry.detailsVisible = false;

		$scope.addHours( hourEntry, isAdded );
	};

	$scope.setSelected = function( e, day, index ) {
		var i = 0;

		// skip situation when overriding provided editing for specific day
		//if ($scope.selected && $scope.selected.date == day.date)
		//    return;

		if( $scope.selected && $scope.isDisplayedWeek( ) ) {
			for( i = 0; i < $scope.displayedHours.length; i++ ) {
				if( $scope.selected.date === $scope.displayedHours[ i ].date ) {
					$scope.displayedHours[ i ] = $scope.selected;
				}
			}
		} else if( $scope.selected ) {

			for( i = 0; i < $scope.displayedMonthDays.length; i++ ) {
				if( $scope.selected.date === $scope.displayedMonthDays[ i ].date ) {
					$scope.displayedMonthDays[ i ] = $scope.selected;
				}
			}
		}

		if( index > -1 )
			day = $scope.isDisplayedWeek( ) ? $scope.displayedHours[ index ] : $scope.displayedMonthDays[ index ];

		//TODO: resolve situation when $scope.displayedMonthDays still not loaded and
		// contains string days representation
		if( _.isString( day ) )
			return;

		if( $scope.selected )
			delete $scope.selected;

		$scope.selected = $scope.cloneDay( day );

		var anyLogged = _.find( $scope.selected.hoursEntries, function( h ) {
			return h.hoursRecord.hours > 0;
		} );

		for( var i = 0; !anyLogged && i < $scope.selected.hoursEntries.length; i++ ) {
			if( $scope.selected.hoursEntries[ i ].hoursRecord && $scope.selected.hoursEntries[ i ].hoursRecord.hours == 0 ) {
				$scope.selected.hoursEntries[ i ].hoursRecord.editMode = true;
				$scope.selected.hoursEntries[ i ].hoursRecord.isDefault = true;
			}
		}

		e = e ? e : window.event;

		var isCircle = e ? $( e.target ).closest( '.active-circle' ).size( ) > 0 : false;

		if( isCircle ) {
			$scope.showHideLoggedHours( e, index );
		} else if( !$scope.isDisplayedWeek( ) )
			$( '.dashboard-widget.hours .row.hours-logged' ).hide( );

		$scope.$emit( 'hours:selectedNew', $scope.selected );
	};

	$scope.showHideLoggedHours = function( e, index ) {
		var loggedHours = $( '.dashboard-widget.hours .row.hours-logged' );
		//var size = $( '.dashboard-widget.hours .row.hours-logged
		// .hours-logged-entry:visible' ).size();
		index = index % 7 == 0 ? ( index + 1 ) : index;

		if( !loggedHours.is( ':visible' ) ) {
			loggedHours.show( );

			if( Math.floor( index / 7 ) >= 3 ) {
				loggedHours.css( 'top', '' );
				loggedHours.css( 'bottom', ( 5 - Math.floor( index / 7 ) ) * 110 - 5 + 'px' );
			} else {

				loggedHours.css( 'bottom', '' );
				loggedHours.css( 'top', ( Math.ceil( index / 7 ) + 1 ) * 110 + 'px' );
			}
		} else
			loggedHours.hide( );

	};

	$scope.clearSelectedItem = function( e, hourEntry ) {
		delete hourEntry.selectedItem;
	};

	$scope.bindEventHandlers = function( ) {
		$( document ).bind( 'click', $scope.handleDocClick );
	};
	$scope.unbindEventHandlers = function( ) {
		$( document ).unbind( 'click', $scope.handleDocClick );
	};

	$scope.bindAutocompleteHandlers = function( input ) {
		input.bind( 'dblclick', function( ) {
			var autocomplete = $( this ).parent( ).find( 'ul.dropdown-menu' );

			autocomplete.find( 'li' ).css( 'display', '' );
			autocomplete.show( );
		} );

		input.next( '.search-icon' ).bind( 'click', function( ) {
			var autocomplete = input.parent( ).find( 'ul.dropdown-menu' );

			autocomplete.find( 'li' ).css( 'display', '' );
			autocomplete.show( );
		} );

		input.bind( 'keyup', function( e ) {
			e = e ? e : window.event;

			var input = $( e.target ).closest( 'input' );
			var val = input.val( ).toLowerCase( );
			var autocomplete = input.parent( ).find( 'ul.dropdown-menu' );

			var filter = function( txt, substr ) {

				if( substr )
					txt = txt.replace( new RegExp( substr, "gi" ), function( s ) {
						return '<span class="highlight">' + s + '</span>';
					} );

				return txt;
			};

			autocomplete.find( 'li' ).each( function( ind, el ) {
				var taskName = $( el ).find( '.task-name' ).text( ).toLowerCase( );
				var projectName = $( el ).find( '.project-name' ).text( ).toLowerCase( );
				var projectCustomerName = $( el ).find( '.project-customer-name' ).text( ).toLowerCase( );

				if( !$( el ).find( '.task-name' ).attr( '_origName' ) )
					$( el ).find( '.task-name' ).attr( '_origName', $( el ).find( '.task-name' ).text( ) );

				if( !$( el ).find( '.project-name' ).attr( '_origName' ) )
					$( el ).find( '.project-name' ).attr( '_origName', $( el ).find( '.project-name' ).text( ) );

				if( !$( el ).find( '.project-customer-name' ).attr( '_origName' ) )
					$( el ).find( '.project-customer-name' ).attr( '_origName', $( el ).find( '.project-customer-name' ).text( ) );

				var result = taskName && taskName.indexOf( val ) > -1;

				result = result || projectName && projectName.indexOf( val ) > -1;
				result = result || projectCustomerName && projectCustomerName.indexOf( val ) > -1;

				if( result ) {
					$( el ).css( 'display', '' );
				} else
					$( el ).css( 'display', 'none' );

				var newText = '';

				if( taskName && taskName.indexOf( val ) > -1 ) {
					newText = filter( $( el ).find( '.task-name' ).attr( '_origName' ), val );
					$( el ).find( '.task-name' ).html( newText );
				}

				if( projectName && projectName.indexOf( val ) > -1 ) {
					newText = filter( $( el ).find( '.project-name' ).attr( '_origName' ), val );

					$( el ).find( '.project-name' ).html( newText );
				}

				if( projectCustomerName && projectCustomerName.indexOf( val ) > -1 ) {
					newText = filter( $( el ).find( '.project-customer-name' ).attr( '_origName' ), val );
					$( el ).find( '.project-customer-name' ).html( newText );
				}

			} );

			autocomplete.show( );
		} );
	};

	$scope.clearAutocompleteHandlers = function( input ) {
		input.unbind( 'click' );
		input.unbind( 'dblclick' );
		input.next( '.search-icon' ).unbind( 'click' );

		input.unbind( 'keydown' );
	};

	$scope.menuItemSelected = function( menuItem ) {
		var id = menuItem.attr( '_id' );

		var item = _.find( $scope.projectTasksList, function( tp ) {
			return tp.resource == id;
		} );
		var ul = menuItem.closest( 'ul' );

		// ul.prev('input').val(item.name);

		var entry = ul.closest( '.hours-logged-entry' );
		var currentInd = entry.attr( 'hourentryindex' );

		var hourEntry = $scope.selected.hoursEntries[ currentInd ];

		$scope.$apply( function( ) {
			hourEntry.selectedItem = item;

			setExpectedHoursPrompt( hourEntry, item );
		} );

	};

	function setExpectedHoursPrompt(hourEntry, selectedProject)
	{
		hourEntry.expectedHours = null;

		if (selectedProject && selectedProject.resource && selectedProject.resource.indexOf("projects/") == 0)
		{
			var currentUser = $scope.getCurrentPerson();

			for (var i = 0, assignmentCount = $scope.myAssignments.length; i < assignmentCount; i++)
			{
				var assignment = $scope.myAssignments[i];

				if (assignment.project && assignment.project.about == selectedProject.resource)
					for (var j = 0, memberCount = assignment.members.length; j < memberCount; j++)
					{
						var member = assignment.members[j];

						if (member.person && member.person.resource == currentUser.about)
						{
							hourEntry.expectedHours = Math.round(member.hoursPerWeek / 5);
							return;
						}
					}
			}
		}
	}


	$scope.handleDocClick = function( e ) {
		e = e ? e : window.event;

		var menuItem = $( e.target ).closest( 'a.menu-item' );
		var activeMenu = null;

		if( menuItem.length == 1 )
			$scope.menuItemSelected( menuItem );

		if( $( e.target ).closest( 'input[name="project-task-select"]' ).length > 0 ) {
			activeMenu = $( e.target ).closest( 'input[name="project-task-select"]' ).parent( ).find( 'ul.dropdown-menu' );
			// return
		}

		if( $( e.target ).closest( '.search-icon' ).length > 0 ) {
			activeMenu = $( e.target ).closest( '.search-icon' ).parent( ).find( 'ul.dropdown-menu' );
			// return
		}

		$( 'ul.dropdown-menu.ddProjectsTasksMenu' ).each( function( ind, el ) {
			if( !activeMenu || activeMenu && el != activeMenu.get( 0 ) )
				$( el ).hide( );
		} );
	};

	$scope.initNewHoursEntry = function( hourEntry ) {
		if( hourEntry.hoursRecord && ( hourEntry.hoursRecord.isAdded || hourEntry.hoursRecord && hourEntry.hoursRecord.isCopied || hourEntry.hoursRecord.isDefault ) ) {
			// use timeout to perform code after init
			window.setTimeout( function( ) {

				$( '.dashboard-widget.hours .row.hours-logged .hours-logged-entry' ).each( function( ind, el ) {

					if( hourEntry == $( el ).scope( ).hourEntry && ( $( el ).scope( ).hourEntry.hoursRecord.hours == 0 || $( el ).scope( ).hourEntry.hoursRecord.hours == "" || $( el ).scope( ).hourEntry.hoursRecord.hours == undefined || $( el ).scope( ).hourEntry.hoursRecord.isCopied ) )
						$scope.$apply( function( ) {
							$scope.editHoursEntry( null, $( el ).scope( ).hourEntry, $( el ).find( 'input[name="project-task-select"]' ).eq( 0 ) );
						} );
				} );
			}, 0 );
		}
	};

	/*
	$scope.addHoursEntry = function( ) {
	$scope.addNewHours( );
	};*/
	// MOVE THIS TO FORM CONTROLLER WHEN READY
	$scope.addNewHours = function( isTask ) {
		// match date with current hours
		var displayedHoursLength = $scope.displayedHours.length;

		for( var i = 0; i < displayedHoursLength; i++ ) {
			if( $scope.selected.date === $scope.displayedHours[ i ].date ) {
				// $scope.activeAddition =
				// $scope.displayedHours[i];

				if( $scope.selected.totalHours > 0 || $scope.anyCopied( ) || ( $scope.selected.hoursEntries && $scope.selected.hoursEntries.length == 0 ) ) {
					$scope.newHoursRecord = {
						date: $scope.selected.date,
						description: "",
						hours: "",
						person: $scope.getCurrentPerson( ),
						editMode: true,
						isAdded: true

					};

					if( !isTask )
						$scope.newHoursRecord.project = {};
					else
						$scope.newHoursRecord.task = {};

					// sync selected object with
					// displayedHours collection
					if( $scope.selected.hoursEntries ) {
						$scope.selected.hoursEntries.unshift( {
							hoursRecord: $scope.newHoursRecord
						} );
					} else {
						$scope.selected.hoursEntries = [ ];
						$scope.selected.hoursEntries.unshift( {
							hoursRecord: $scope.newHoursRecord
						} );
					}
				} else {
					// switch to edit mode predefined
					// entries
					for( var j = 0; j < $scope.selected.hoursEntries.length; j++ ) {
						if( $scope.selected.hoursEntries[ j ].hoursRecord ) {
							$scope.selected.hoursEntries[ j ].hoursRecord.editMode = true;
							$scope.selected.hoursEntries[ j ].hoursRecord.isAdded = true;
						}
					}
				}

			}
		}
	};

	$scope.addNewHoursRecord = function( day ) {
		var newHoursRecord = {
			date: day.date,
			description: "",
			hours: "",
			project: {},
			person: $scope.getCurrentPerson( ),
			editMode: true,
			isAdded: true

		};

		// sync selected object with
		// displayedHours collection
		if( day.hoursEntries ) {
			day.hoursEntries.unshift( {
				hoursRecord: newHoursRecord
			} );
		} else {
			day.hoursEntries = [ ];
			day.hoursEntries.unshift( {
				hoursRecord: newHoursRecord
			} );
		}
	};

	$scope.anyAdded = function( ) {
		var result = false;

		for( var i = 0; i < $scope.selected.hoursEntries.length; i++ ) {
			var entry = $scope.selected.hoursEntries[ i ];

			if( entry.hoursRecord && entry.hoursRecord.isAdded || entry.hoursRecord && entry.hoursRecord.isCopied )
				result = true;
		}

		return result;
	};

	$scope.anyCopied = function( ) {
		var result = false;

		for( var i = 0; i < $scope.selected.hoursEntries.length; i++ ) {
			var entry = $scope.selected.hoursEntries[ i ];

			if( entry.hoursRecord && entry.hoursRecord.editMode && entry.hoursRecord && entry.hoursRecord.isCopied )
				result = true;
		}

		return result;
	};

	$scope.addNewTaskHours = function( ) {
		$scope.addNewHours( true );
	};

	$scope.loadAvailableTasks = function( ) {
		TasksService.refreshTasks( ).then( function( tasks ) {
			_.each( tasks, function( t ) {
				$scope.hoursTasks.push( t );
				$scope.projectTasksList.push( t );

				t.isTask = true;
				t.icon = taskIconsMap[                                   t.name.toLowerCase( ) ];
				t.iconCss = taskIconStylseMap[                                   t.name.toLowerCase( ) ];
				t.visible = t.name != "Vacation" && t.name != "Appointment";
			} );

			$scope.sortProjectTaskList( );
		} );
	};
	// date formatter helper
	$scope.formatTheDate = function( d ) {
		var dd = d.getDate( );
		var mm = d.getMonth( ) + 1;
		var yyyy = d.getFullYear( );
		if( dd < 10 ) {
			dd = '0' + dd;
		}
		if( mm < 10 ) {
			mm = '0' + mm;
		}
		$scope.theDayFormatted = yyyy + '-' + mm + '-' + dd;

		var dayFormat = yyyy + '-' + mm + '-' + dd;
		return dayFormat;

	};

	$scope.formatHours = function (hours)
	{
	    return hours.toString().indexOf(".") === -1 ? hours : hours.toFixed(1);
	};

	var me = $scope.getCurrentPerson( ) ? $scope.getCurrentPerson( ).about : '';

	// Doc Brown - time travel.
	$scope.dateIndex = 0;

	$scope.backInTime = function( ) {
		$scope.dateIndex = $scope.dateIndex + 7;
		$scope.entryFormOpen = false;
		delete $scope.selected;
		$scope.hoursRequest( );

		$scope.$emit( 'hours:backInTime' );
	};
	$scope.forwardInTime = function( ) {
		$scope.dateIndex = $scope.dateIndex - 7;
		$scope.entryFormOpen = false;
		// console.log($scope.dateIndex);

		delete $scope.selected;
		$scope.hoursRequest( );

		$scope.$emit( 'hours:forwardInTime' );
	};

	$scope.backDay = function( ) {
		var foundInd;

		for( var i = 0; i < $scope.displayedHours.length; i++ ) {
			if( $scope.selected.date === $scope.displayedHours[ i ].date ) {
				foundInd = i;
			}
		}

		if( foundInd > 0 )
			//$scope.selected = $scope.displayedHours[ foundInd - 1 ];
			$scope.setSelected( null, $scope.displayedHours[ foundInd - 1 ], foundInd - 1 );
		else {
			$scope.dateIndex = $scope.dateIndex + 7;
			delete $scope.selected;

			$scope.hoursRequest( function( ) {
				//$scope.selected = $scope.displayedHours[ $scope.displayedHours.length - 1 ];
				$scope.setSelected( null, $scope.displayedHours[ $scope.displayedHours.length - 1 ], $scope.displayedHours.length - 1 );
			} );
		}

	};

	$scope.nextDay = function( ) {
		var foundInd;

		for( var i = 0; i < $scope.displayedHours.length; i++ ) {
			if( $scope.selected.date === $scope.displayedHours[ i ].date ) {
				foundInd = i;
			}
		}

		if( foundInd < $scope.displayedHours.length - 1 )
			//$scope.selected = $scope.displayedHours[ foundInd + 1 ];
			$scope.setSelected( null, $scope.displayedHours[ foundInd + 1 ], foundInd + 1 );
		else {
			$scope.dateIndex = $scope.dateIndex - 7;
			delete $scope.selected;

			$scope.hoursRequest( function( ) {
				//$scope.selected = $scope.displayedHours[ 0 ];
				$scope.setSelected( null, $scope.displayedHours[ 0 ], 0 );
			} );
		}

		// $scope.hoursRequest();

	};

	$scope.nextMonth = function( ) {
		$scope.currentMonth = $scope.moment( $scope.currentMonth ).add( 1, 'month' );

		if( $scope.setCurrentMonth )
			$scope.setCurrentMonth( $scope.currentMonth.month( ) );

		$scope.hoursRequest( );
	};

	$scope.backMonth = function( ) {
		$scope.currentMonth = $scope.moment( $scope.currentMonth ).subtract( 1, 'month' );

		if( $scope.setCurrentMonth )
			$scope.setCurrentMonth( $scope.currentMonth.month( ) );

		$scope.hoursRequest( );
	};

	$scope.thisWeek = function( ) {
		$scope.dateIndex = 0;
		$scope.entryFormOpen = false;
		delete $scope.selected;
		$scope.hoursRequest( );
	};

	$scope.fillWeekDays = function( startOfWeek ) {
		// array to hold the dates
		$scope.thisWeekDates = [ ];
		$scope.thisWeekDayLables = [ ];

		// run through and build out the array of the
		// week's dates
		for( var i = 0; i < 7; i++ ) {
			var moment = $scope.moment( startOfWeek ).add( i, 'days' );
			var dateFormatted = moment.format( 'YYYY-MM-DD' );

			$scope.thisWeekDates.push( dateFormatted );
			$scope.thisWeekDayLables[ i ] = moment.format( 'ddd' );
		}
	};

	$scope.getTodaysDate = function( ) {
		var today = $scope.moment( );

		if( !$scope.today && $scope.firstBusinessDay )
			return $scope.firstBusinessDay.format( 'YYYY-MM-DD' );

		return today.format( 'YYYY-MM-DD' );
	};

	// TODO task: get this week of dates
	$scope.showWeekDates = function( callback ) {
		$scope.todaysDate = $scope.getTodaysDate( );

		var moment = null;

		if( !$scope.selected )
			moment = $scope.moment( $scope.todaysDate ).subtract( $scope.dateIndex, 'days' );
		else {

			moment = $scope.moment( $scope.selected.date ).startOf( 'week' );

			//$scope.dateIndex = $scope.moment( $scope.selected.date ).subtract(
			// $scope.moment( ) ).days( );
			//$scope.dateIndex = $scope.moment.duration($scope.moment( $scope.selected.date
			// ).diff( $scope.moment( ) )).days();
			$scope.dateIndex = $scope.moment( $scope.todaysDate ).diff( $scope.moment( $scope.selected.date ), 'days' );
		}

		$scope.fillWeekDays( moment.day( 0 ) );

		$scope.prettyCalendarFormats( $scope.thisWeekDates[ 0 ], $scope.thisWeekDates[ 6 ] );

		callback( $scope.thisWeekDates );
		// console.log($scope.thisWeekDates.length);
	};

	$scope.showToday = function( e ) {
		e = e ? e : window.event;

		e.stopPropagation( );

		$scope.today = true;
		$scope.dateIndex = 0;
		$scope.currentMonth = $scope.moment( );

		if( $scope.selected )
			$scope.setSelected( null, $scope.selected, -1 );
		delete $scope.selected;

		$scope.hoursRequest( );

		$scope.$emit( 'hours:showToday' );
	};

	$scope.calculateMonthDates = function( callback ) {
		$scope.displayedMonthDays = [ ];
		$scope.todaysDate = $scope.getTodaysDate( );

		var moment = $scope.moment( $scope.currentMonth );

		var startOfMonth = moment.startOf( 'month' );
		var starOfFirstWeek = startOfMonth.startOf( 'week' );

		var current;
		var day = 0;

		while( day < 35 ) {
			current = $scope.moment( starOfFirstWeek ).add( day, 'days' );
			day += 1;

			$scope.displayedMonthDays.push( current.format( 'YYYY-MM-DD' ) );
		}

		callback( $scope.displayedMonthDays );

	};

	$scope.months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

	$scope.prettyCalendarFormats = function( firstDay, lastDay ) {
		$scope.prettyCalendarDates = {};
		var d1 = new Date( firstDay );
		d1.setDate( d1.getDate( ) + 1 );
		var day1 = d1.getDate( );
		var month1 = $scope.months[                                   d1.getMonth( ) ];
		var month1Short = month1.substring( 0, 3 );
		$scope.prettyCalendarDates.firstDate = month1Short + ' ' + day1;

		var d2 = new Date( lastDay );
		d2.setDate( d2.getDate( ) + 1 );
		var day2 = d2.getDate( );
		var month2 = $scope.months[                                   d2.getMonth( ) ];
		var month2Short = month2.substring( 0, 3 );
		var year = d2.getFullYear( );
		$scope.prettyCalendarDates.lastDate = month2Short + ' ' + day2 + ', ' + year;
		return $scope.prettyCalendarDates;
	};

	$scope.calculateLastBusinessDay = function( cb ) {
		var todayDate = $scope.getTodaysDate( );
		var startOfWeek = $scope.moment( todayDate ).day( 0 );
		var diff = $scope.moment( todayDate ).diff( $scope.moment( startOfWeek ), 'days' );
		var firstBusineesDay;

		if( diff >= 5 )
			firstBusineesDay = $scope.moment( startOfWeek );
		else
			firstBusineesDay = startOfWeek.subtract( ( 5 - diff ) + 1, 'days' );

		firstBusineesDay = firstBusineesDay.format( 'YYYY-MM-DD' );
		HoursService.getHoursRecordsBetweenDates( $scope.getCurrentPerson( ), firstBusineesDay, todayDate ).then( function( result ) {
			firstBusineesDay = '';

			for( var j = result.length - 1; result[ j ] && result[ j ].totalHours == 0 && j >= 0; j-- ) {
				if( result[ j ].totalHours == 0 && $scope.moment( result[ j ].date ).weekday( ) < 6 && $scope.moment( result[ j ].date ).weekday( ) > 0 )
					firstBusineesDay = result[ j ].date;
			}

			if( !firstBusineesDay )
				firstBusineesDay = todayDate;
			cb( firstBusineesDay );
		} );
		/*} else {
		 var weekday = $scope.moment( todayDate ).weekday( );

		 firstBusineesDay = $scope.moment( todayDate ).subtract( weekday - 1, 'days' );

		 firstBusineesDay = firstBusineesDay.format( 'YYYY-MM-DD' );

		 cb( firstBusineesDay );
		 }*/
	};

	$scope.hoursRequest = function( cb ) {
		var numberVal = function( v ) {
			if( !isNaN( parseFloat( v ) ) )
				return  Util.formatFloat( v );

			return 0;

		};
		$scope.hideHoursSpinner = false;

		if( $scope.isDisplayedWeek( ) )
			$scope.showWeekDates( function( result ) {
				HoursService.getHoursRecordsBetweenDates( $scope.getCurrentPerson( ), $scope.thisWeekDates[ 0 ], $scope.thisWeekDates[ 6 ] ).then( function( result ) {
					if( result.length === 0 ) {
						console.error( "getHoursRecordsBetweenDates(" + $scope.thisWeekDates[ 0 ] + "," + $scope.thisWeekDates[ 6 ] + ") gave me no results" );
					} else {
						$scope.showHideWidget( true );

						$scope.displayedHours = result;

						for( var i = 0; i < $scope.displayedHours.length; i++ ) {
							$scope.displayedHours[ i ].totalHours = 0;

							var futureness = $scope.checkForFutureness( $scope.displayedHours[ i ].date );

							$scope.displayedHours[ i ].futureness = futureness;
							$scope.displayedHours[ i ].dayOfMonth = $scope.moment( $scope.displayedHours[ i ].date ).date( );

							for( var j = 0; j < $scope.displayedHours[ i ].hoursEntries.length; j++ ) {
								if( $scope.displayedHours[i].hoursEntries[ j ].hoursRecord ) {
									$scope.displayedHours[ i ].totalHours = numberVal( $scope.displayedHours[ i ].totalHours ) + numberVal( $scope.displayedHours[i].hoursEntries[ j ].hoursRecord.hours );

									if( $scope.displayedHours[i].hoursEntries[ j ].hoursRecord.task ) {
										$scope.displayedHours[i].hoursEntries[ j ].task = $scope.displayedHours[i].hoursEntries[ j ].hoursRecord.task;
										Resources.resolve( $scope.displayedHours[i].hoursEntries[ j ].task );
									}
								}
							}

							if( false && $scope.displayedHours[ i ].totalHours == 0 ) {
								for( var j = 0; false && j < $scope.displayedHours[ i ].hoursEntries.length; j++ ) {
									if( $scope.displayedHours[i].hoursEntries[ j ].hoursRecord )
										$scope.displayedHours[i].hoursEntries[ j ].hoursRecord.isAdded = true;
								}

							}
							//$scope.firstBusinessDay = $scope.firstBusinessDay.add(1, 'days');

							$scope.addNewHoursRecord( $scope.displayedHours[ i ] );

							if( !$scope.selected && $scope.displayedHours[ i ].date == $scope.todaysDate ) {
								// $scope.selected
								// =
								// JSON.parse(JSON.stringify(
								// $scope.displayedHours[i]));
								$scope.setSelected( null, $scope.displayedHours[ i ], i );
								//$scope.selected = $scope.displayedHours[ i ];
							} else if( $scope.selected && $scope.displayedHours[ i ].date == $scope.selected.date ) {
								//$scope.selected = $scope.displayedHours[ i ];
								$scope.selected.dayOfMonth = $scope.displayedHours[ i ].dayOfMonth;
								$scope.setSelected( null, $scope.displayedHours[ i ], i );
							}

						}

						$( '.dashboard-widget.hours .row.hours-logged' ).show( );

						if( cb )
							cb( );

					}

					$scope.hideHoursSpinner = true;
					$scope.$emit( 'hours:loaded' );
				} );
			} );
		else
			$scope.calculateMonthDates( function( monthDays ) {
				HoursService.getHoursRecordsBetweenDates( $scope.getCurrentPerson( ), monthDays[ 0 ], monthDays[ 34 ] ).then( function( result ) {
					if( result.length === 0 ) {
						console.error( "getHoursRecordsBetweenDates(" + $scope.thisWeekDates[ 0 ] + "," + $scope.thisWeekDates[ 34 ] + ") gave me no results" );
					} else {
						$scope.showHideWidget( true );
						$scope.fillWeekDays( $scope.moment( monthDays[ 0 ] ) );

						$scope.displayedMonthDays = result;

						for( var i = 0; i < $scope.displayedMonthDays.length; i++ ) {
							$scope.displayedMonthDays[ i ].totalHours = 0;

							var futureness = $scope.checkForFutureness( $scope.displayedMonthDays[ i ].date );

							$scope.displayedMonthDays[ i ].futureness = futureness;
							$scope.displayedMonthDays[ i ].dayOfMonth = $scope.moment( $scope.displayedMonthDays[ i ].date ).date( );
							$scope.addNewHoursRecord( $scope.displayedMonthDays[ i ] );

							if( $scope.moment( $scope.displayedMonthDays[ i ].date ).month( ) != $scope.moment( $scope.currentMonth ).month( ) )
								$scope.displayedMonthDays[ i ].dayOfMonth = '';

							for( var j = 0; j < $scope.displayedMonthDays[ i ].hoursEntries.length; j++ ) {
								if( $scope.displayedMonthDays[i].hoursEntries[ j ].hoursRecord ) {
									$scope.displayedMonthDays[ i ].totalHours = numberVal( $scope.displayedMonthDays[ i ].totalHours ) + numberVal( $scope.displayedMonthDays[i].hoursEntries[ j ].hoursRecord.hours );

									if( $scope.displayedMonthDays[i].hoursEntries[ j ].hoursRecord.task && $scope.displayedMonthDays[i].hoursEntries[ j ].hoursRecord.task.resource ) {
										$scope.displayedMonthDays[i].hoursEntries[ j ].task = $scope.displayedMonthDays[i].hoursEntries[ j ].hoursRecord.task;
										Resources.resolve( $scope.displayedMonthDays[i].hoursEntries[ j ].task );
									}
								}
							}

							if( !$scope.selected && $scope.displayedMonthDays[ i ].date == $scope.todaysDate ) {

								//$scope.selected = $scope.displayedMonthDays[ i ];
								$scope.setSelected( null, $scope.displayedMonthDays[ i ], i );
							} else if( $scope.selected && $scope.displayedMonthDays[ i ].date == $scope.selected.date ) {
								//$scope.selected = $scope.displayedMonthDays[ i ];
								$scope.selected.dayOfMonth = $scope.displayedMonthDays[ i ].dayOfMonth;
								$scope.setSelected( null, $scope.displayedMonthDays[ i ], i );
							}

						}

						if( cb )
							cb( );
					}

					$scope.hideHoursSpinner = true;
					$scope.$emit( 'hours:loaded' );
				} );
			} );
	};

	$scope.newHoursRecord = {};
	$scope.hoursValidation = [ ];

	$scope.getNewHoursValidationErrors = function( hourEntry ) {

		$scope.hoursValidation = [ ];

		var totalHours = 0;
		var entries = $scope.selected ? $scope.selected.hoursEntries : [ ];

		if( hourEntry.hoursRecord && ( hourEntry.hoursRecord.hours == "" || parseFloat( hourEntry.hoursRecord.hours ) === 0 ) || hourEntry.hoursRecord.hours === undefined ) {
			$scope.hoursValidation.push( "Hours value is empty" );
		} else if( hourEntry.hoursRecord && hourEntry.hoursRecord.hours ) {
			var res = /^\d*(\.\d{1,2})?$/.exec( hourEntry.hoursRecord.hours );

			if( !res )
				$scope.hoursValidation.push( "Incorrect value for hours" );

		}

		if( hourEntry.hoursRecord && hourEntry.selectedItem && hourEntry.selectedItem.startDate ) {
			var selectedDate = new Date( $scope.selected.date );

			if( selectedDate > new Date( hourEntry.selectedItem.endDate ) || selectedDate < new Date( hourEntry.selectedItem.startDate ) )
				$scope.hoursValidation.push( "You are logging hours for project which is already ended or not started" );
		}

		if( hourEntry.hoursRecord && hourEntry.hoursRecord.editMode && !hourEntry.selectedItem )
			$scope.hoursValidation.push( "Project or task hasn't been selected" );

        if( !hourEntry.hoursRecord.description ) {
          $scope.hoursValidation.push( "Hours description is empty" );
        }

		for( var i = 0; i < entries.length; i++ ) {
			if( entries[ i ].hoursRecord && entries[ i ].hoursRecord.hours )
				totalHours += parseFloat( entries[ i ].hoursRecord.hours );

		}

		if( totalHours > 24 )
			$scope.hoursValidation.push( "Hours logged on a given day cannot exceed 24 hours." );

		$scope.hoursValidation = _.uniq( $scope.hoursValidation );

		return $scope.hoursValidation.length > 0;
	};

	$scope.validateAndCalculateTotalHours = function( ) {
		var entries = $scope.selected.hoursEntries;
		var hoursRecords = [ ];
		var totalHours = 0;

		$scope.hoursValidation = [ ];

		for( var i = 0; i < entries.length; i++ ) {
			var entry = entries[ i ];

			if( entry.hoursRecord ) {
				hoursRecords.push( entry.hoursRecord );
				totalHours += !isNaN( parseFloat( entry.hoursRecord.hours ) ) ? Util.formatFloat( entry.hoursRecord.hours ) : 0;
				// if (!entry.hoursRecord.person) {
				entry.hoursRecord.person = {
					resource: $scope.getCurrentPerson( ).about
				};
				// }
				if( !entry.hoursRecord.date ) {
					entry.hoursRecord.date = $scope.selected.date;
				}
			}

			// remove embedded property which leverage
			// to server side error when updating hours
			// record
			if( entry.hoursRecord && entry.hoursRecord.project && entry.hoursRecord.project[ "$fromServer" ] )
				delete entry.hoursRecord.project[ "$fromServer" ];
			else if( entry.hoursRecord && entry.hoursRecord.task && entry.hoursRecord.task[ "$fromServer" ] )
				delete entry.hoursRecord.task[ "$fromServer" ];
		}

		if( totalHours > 24 ) {
			$scope.hoursValidation.push( "Hours logged on a given day cannot exceed 24 hours." );
			return;
		}

		// update total hours value to apropriatly
		// display in hours widget
		$scope.selected.totalHours = totalHours;

		var selectedDisplayedHours;

		if( $scope.isDisplayedWeek( ) )
			selectedDisplayedHours = _.find( $scope.displayedHours, function( dh ) {
				if( $scope.selected.date === dh.date )
					return dh;

			} );
		else
			selectedDisplayedHours = _.find( $scope.displayedMonthDays, function( dh ) {
				if( $scope.selected.date === dh.date )
					return dh;

			} );

		selectedDisplayedHours.totalHours = totalHours;
	};

	$scope.addHours = function( hourEntry, isAdded ) {
		$scope.validateAndCalculateTotalHours( );

		// update only passed hourEntry
		HoursService.updateHours( [ hourEntry.hoursRecord ] ).then( function( updatedRecords ) {
			// update with received
			// values from backend
			if( updatedRecords[ 0 ] )
				_.extend( hourEntry.hoursRecord, {
					_id: updatedRecords[ 0 ]._id,
					_rev: updatedRecords[ 0 ]._rev,
					about: updatedRecords[ 0 ].about,
					resource: updatedRecords[ 0 ].resource,
					base: updatedRecords[ 0 ].base,
					created: updatedRecords[ 0 ].created,
					date: updatedRecords[ 0 ].date,
					etag: updatedRecords[ 0 ].etag,
					description: updatedRecords[ 0 ].description,
					hours:  Util.formatFloat(updatedRecords[ 0 ].hours, true),
					person: updatedRecords[ 0 ].person,
					project: updatedRecords[ 0 ].project,
					task: updatedRecords[ 0 ].task
				} );

			if( isAdded )
				$scope.addNewHoursRecord( $scope.selected );

			$scope.$emit( 'hours:added', $scope.selected );
		} );

	};

	$scope.copyHoursEntry = function( ) {
		$scope.copyHours( );

		for( var i = 0; i < $scope.selected.hoursEntries.length; i++ ) {
			if( $scope.selected.hoursEntries[ i ].hoursRecord && $scope.selected.hoursEntries[ i ].hoursRecord.hours > 0 && $scope.selected.hoursEntries[ i ].hoursRecord.isCopied ) {
				$scope.selected.hoursEntries[ i ].hoursRecord.editMode = true;
			}
		}
	};

	$scope.copyHours = function( ) {
		$scope.hideMessages( );

		var selectedDate = getDate( $scope.selected.date );

		var copyFromEntries = [ ];

		// if it's possible, trying to find hours
		// entries from yesterday
		var tmpD = $scope.selected.date.split( '-' );

		var copyFromDate = new Date( parseInt( tmpD[ 0 ] ), parseInt( tmpD[ 1 ] ) - 1, parseInt( tmpD[ 2 ] ) - 1 );

		var shortDate = getShortDate( copyFromDate );
		var copyFromEntry = _.findWhere( $scope.displayedHours, {
			date: shortDate
		} );
		var copyEntryFound = false;

		if( copyFromEntry ) {
			var prevDayHoursRecords = _.pluck( copyFromEntry.hoursEntries, "hoursRecord" );
			prevDayHoursRecords = _.filter( prevDayHoursRecords, function( p ) {
				if( !isNaN( parseFloat( p.hours ) ) )
					return true;
			} );
			if( prevDayHoursRecords.length > 0 ) {
				copyHoursCallback( copyFromEntry.hoursEntries );
				copyEntryFound = true;
			}
		}
		// if not, get hours for 1 week earlier than
		// selected date, find nearest day with logged
		// hours.
		if( !copyEntryFound ) {
			var fromDate = new Date( parseInt( tmpD[ 0 ] ), parseInt( tmpD[ 1 ] ) - 1, parseInt( tmpD[ 2 ] ) - 7 );
			var from = getShortDate( fromDate );
			HoursService.getHoursRecordsBetweenDates( $scope.getCurrentPerson( ), from, shortDate ).then( function( result ) {
				for( var i = result.length - 1; i >= 0; i-- ) {
					if( result[ i ].hoursEntries.length > 0 ) {
						var houseRecordsInside = _.filter( result[ i ].hoursEntries, function( h ) {
							//if( h.hoursRecord )
							if( !isNaN( parseFloat( h.hoursRecord.hours ) ) )
								return true;
						} );
						if( houseRecordsInside.length > 0 ) {
							copyHoursCallback( result[ i ].hoursEntries );
							copyEntryFound = true;
							return;
						}
					}
				}

				if( !copyEntryFound ) {
					$scope.hoursValidation.push( "No hours to copy found for the last week." );
				}
			} );
		}
	};
	var getDate = function( dateString ) {
		var tmpD = dateString.split( '-' );
		var date = new Date( parseInt( tmpD[ 0 ] ), parseInt( tmpD[ 1 ] ) - 1, parseInt( tmpD[ 2 ] ) );
		return date;
	};
	var copyHoursCallback = function( copyFromEntries ) {
		var hoursRecords = _.pluck( $scope.selected.hoursEntries, "hoursRecord" );

		hoursRecords = _.reject( hoursRecords, function( h ) {
			return ( typeof h ) === 'undefined';
		} );
		// $scope.hoursToDelete = _.pluck(hoursRecords,
		// "resource");
		// $scope.selected.hoursEntries = [];

		// simply add copied hours to current day hours
		// entries
		var displayedHoursEntry = _.findWhere( $scope.displayedHours, {
			date: $scope.selected.date
		} );

		for( var i = 0; i < copyFromEntries.length; i++ ) {
			if( copyFromEntries[ i ].hoursRecord && copyFromEntries[ i ].hoursRecord.hours > 0 ) {
				var newHoursRecord = {
					date: $scope.selected.date,
					description: copyFromEntries[ i ].hoursRecord.description,
					hours: copyFromEntries[ i ].hoursRecord.hours,
					person: {
						resource: $scope.getCurrentPerson( ).about
					}
				};

				newHoursRecord.isCopied = true;

				if( copyFromEntries[ i ].hoursRecord.project ) {
					newHoursRecord.project = copyFromEntries[ i ].hoursRecord.project;
				}

				if( copyFromEntries[ i ].hoursRecord.task ) {
					newHoursRecord.task = copyFromEntries[ i ].hoursRecord.task;
				}

				var hoursEntry = {
					project: copyFromEntries[ i ].project,
					task: copyFromEntries[ i ].task,
					hoursRecord: newHoursRecord
				};

				if( copyFromEntries[ i ].assignment ) {
					hoursEntry.assignment = copyFromEntries[ i ].assignment;
				}

				// displayedHoursEntry.hoursEntries.unshift(hoursEntry);

				$scope.selected.hoursEntries.unshift( $scope.cloneDay( hoursEntry ) );
			}
		}
		/*
		 * // after copying remove all previous day's
		 * hours for (var i = 0; $scope.hoursToDelete &&
		 * i < $scope.hoursToDelete.length; i ++) { if
		 * ($scope.hoursToDelete[i])
		 * Resources.remove($scope.hoursToDelete[i]) }
		 */
	};
	var getShortDate = function( date ) {
		// Get todays date formatted as yyyy-MM-dd
		var dd = date.getDate( );
		var mm = date.getMonth( ) + 1;
		// January is 0!
		var yyyy = date.getFullYear( );
		if( dd < 10 ) {
			dd = '0' + dd;
		}
		if( mm < 10 ) {
			mm = '0' + mm;
		}
		date = yyyy + '-' + mm + '-' + dd;
		return date;
	};

	$scope.hideMessages = function( ) {
		$scope.hoursValidation = [ ];
	};

	$scope.cloneDay = function( day ) {
		return JSON.parse( JSON.stringify( day ) );
	};

	$scope.$watch( 'displayedHours', function( value ) {
		var val = value || null;
		if( val )
			$scope.$emit( 'masonryGo' );
	} );

	var init = function( event ) {
		$scope.calculateLastBusinessDay( function( firstBusinessDay ) {
			$scope.firstBusinessDay = $scope.moment( firstBusinessDay );

			$scope.hoursRequest( function( ) {
				var startOfWeek = $scope.moment( ).day( 0 );
				if( $scope.firstBusinessDay.isBefore( startOfWeek ) ) {
					$rootScope.defaultHoursWeekShiftedBack = true;
				}
			} );
		} );

		$scope.loadAvailableTasks( );
		$scope.bindEventHandlers( );
		$scope.loadProjects( );
	};

	if( $scope.me && $scope.mode == 'week' || $scope.profile && $scope.mode == 'month' )
		init( );
	else if( $scope.mode == 'week' )
		$rootScope.$on( 'me:loaded', init );
	else if( $scope.mode == 'month' )
		$rootScope.$on( 'profile:loaded', init );

	$scope.$on( "$destroy", function( ) {
		$scope.unbindEventHandlers( );
	} );

	$rootScope.$on( "hours:requiredRefresh", function( ) {
		$scope.hoursRequest( );
	} );
} ] );
