'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module( 'Mastermind' ).controller( 'ProjectCtrl', [ '$q', '$rootScope', '$scope', '$state', '$stateParams', '$location', '$filter', '$controller', 'ProjectsService', 'Resources', 'People', 'RoleTypes', 'Rates', 'ngTableParams', 'editMode', 'AssignmentService', 'HoursService', 'VacationsService', 
function( $q, $rootScope, $scope, $state, $stateParams, $location, $filter, $controller, ProjectsService, Resources, People, RoleTypes, Rates, TableParams, editMode, AssignmentService, HoursService, VacationsService ) {
	var detailsValid = false, rolesValid = false;

	$scope.stopWatchingProjectChanges = function( ) {
		var sentinel = $scope.sentinel;
		if( sentinel ) {
			sentinel( );
			//kill sentinel
		}
	};

	$scope.stopWatchingProjectChanges( );

	//Set our currently viewed project to the one resolved by the service.
	if( $stateParams.projectId ) {
		$scope.projectId = $stateParams.projectId;
	}
	$scope.projectLoaded = false;
	$scope.projectEstimate = 0;
	//$scope.servicesEstimate = 0;
	$scope.shiftDatesChecked = false;
	$scope.Math = window.Math;
	/**
	 * Set the profile view in edit mode
	 */
	$scope.edit = function( ) {
		if( $scope.canEdit( ) ) {
			$state.go( 'projects.edit', {
				projectId: $scope.projectId
			} );
		}
	};

	$scope.canEdit = function( ) {
		return ( $scope.project && ( $scope.projectManagementAccess || !$scope.project.created || ( $scope.project.created.resource == $scope.me.about ) ) );
	};

	//Load the members of the executive Group
	var execQuery = {
		groups: 'Executives'
	};
	var salesQuery = {
		groups: 'Sales'
	};
	var fields = {
		name: 1,
		resource: 1,
		familyName: 1,
		givenName: 1,
		mBox: 1
	};

	$scope.close = function( ) {
		$scope.stopWatchingProjectChanges( );
		$rootScope.formDirty = false;
		$rootScope.dirtySaveHandler = false;
		$scope.editMode = false;
		$scope.submitAttempted = false;

		$scope.$emit( 'project:close' );
		//Throw it away if it is a new project
		if( $scope.isTransient ) {
			$state.go( 'projects.index' );
		}
		//Fetch the old version of the project and show the read only mode
		else {
			Resources.get( 'projects/' + $scope.projectId ).then( function( ) {
				$scope.projectEstimate = 0;
				$state.go( 'projects.show', {
					projectId: $scope.projectId,
					edit: null
				} );
			} );
		}
	};

	/**
	 * Set the profile view in edit mode
	 */
	/*$scope.cancel = function(){
	 //If the model is dirty ask if they would like to save the changes
	 if($rootScope.formDirty){

	 $rootScope.modalDialog = {
	 title: "Save Changes",
	 text: "Would you like to save your changes before leaving?",
	 ok: "Yes",
	 no: "No",
	 cancel: "Cancel",
	 okHandler: function() {
	 $(".modalYesNoCancel").modal('hide');
	 $scope.checkShiftDates();
	 //$rootScope.dirtySaveHandler().then(function(project) {//Unset dirty flag
	 //	$scope.close();
	 //});
	 //		  			$scope.save().then(function(project) {//Unset dirty flag
	 //			  			$scope.close();
	 //			  		});
	 },
	 noHandler: function() {
	 $(".modalYesNoCancel").modal('hide');
	 $scope.close();
	 },
	 cancelHandler: function() {
	 $(".modalYesNoCancel").modal('hide');
	 }
	 };

	 $(".modalYesNoCancel").modal('show');
	 }
	 else{
	 $scope.close();
	 }
	 };*/

	$scope.getExecutiveSponsor = function( ) {
		if( $scope.project && $scope.project.executiveSponsor && $scope.execs && $scope.execs.members ) {
			var resource = $scope.project.executiveSponsor.resource;
			var name = _.findWhere( $scope.execs.members, {
				resource: resource
			} ).name;
			if( typeof name === 'undefined' ) {
				name = '';
			}

            if (_.isString(name))
			     $scope.executiveSponsor = name;
			else if (_.isObject(name) && name.fullName)
                 $scope.executiveSponsor = name.fullName;
			
			return name;
		}
	};

	$scope.getExecutiveSponsorEmail = function( ) {
		if( $scope.project && $scope.project.executiveSponsor && $scope.execs && $scope.execs.members ) {
			var resource = $scope.project.executiveSponsor.resource;
			var name = _.findWhere( $scope.execs.members, {
				resource: resource
			} ).mBox;
			if( typeof name === 'undefined' ) {
				name = '';
			}

			$scope.executiveSponsorEmail = name;
			return name;
		}
	};

	$scope.getSalesSponsor = function( ) {
		var name = '';
		if( $scope.project && $scope.project.salesSponsor && $scope.sales && $scope.sales.members ) {
			var resource = $scope.project.salesSponsor.resource;
			var member = _.findWhere( $scope.sales.members, {
				resource: resource
			} );

			if( member && member.name ) {
				name = member.name;
			}
		} else {
			name = '';
		}

        if (_.isString(name))
             $scope.salesSponsor = name;
        else if (_.isObject(name) && name.fullName)
             $scope.salesSponsor = name.fullName;
                 
		//$scope.salesSponsor = name;

		return name;
	};

	$scope.getSalesSponsorEmail = function( ) {
		var mBox = '';
		if( $scope.project && $scope.project.salesSponsor ) {
			var resource = $scope.project.salesSponsor.resource;
			var member = _.findWhere( $scope.sales.members, {
				resource: resource
			} );

			if( member && member.mBox ) {
				mBox = member.mBox;
			}
		} else {
			mBox = '';
		}

		$scope.salesSponsorEmail = mBox;

		return mBox;
	};

	/**
	 * Get the date short format
	 */
	var getShortDate = function( date ) {
		//Get todays date formatted as yyyy-MM-dd
		var dd = date.getDate( );
		var mm = date.getMonth( ) + 1;
		//January is 0!
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

	$scope.editDone = true;

	$scope.checkShiftDates = function( editDone ) {
		var deferred = $q.defer( );
		$( '.modalYesNo' ).modal( 'hide' );
		$scope.editDone = editDone;

		var project = $scope.project;

		var startDateShifted = project.initStartDate && project.startDate && project.startDate != project.initStartDate;
		var endDateShifted = ( ( typeof project.initEndDate === 'undefined' ) && project.endDate ) || ( project.initEndDate && project.endDate != project.initEndDate );

		var result = ( startDateShifted || endDateShifted ) && $scope.projectId;
		deferred.resolve( result );
		if( result ) {
			$( "#dateShiftConfirm" ).modal( 'show' );
		} else {
			$scope.save( false );
		}

		return deferred.promise;
	};
	/**
	 * On project save ask if the user would like to shift the start and and dates
	 * for the
	 * roles in the project
	 */
	$scope.handleProjectStartDateShifts = function( callback ) {

		var project = $scope.project;

		var startDateShifted = project.initStartDate && project.startDate && project.startDate != project.initStartDate;
		var endDateShifted = ( ( typeof project.initEndDate === 'undefined' ) && project.endDate ) || ( project.initEndDate && project.endDate != project.initEndDate );

		AssignmentService.getAssignmentsByPeriod( "all", {
			project: {
				resource: $scope.project.about
			}
		} ).then( function( data ) {
			$scope.projectAssignments = data;

			var startDate = new Date( project.startDate );
			var initStartDate = new Date( project.initStartDate );
			var endDate;
			var initEndDate;
			if( project.endDate ) {
				endDate = new Date( project.endDate );
			}
			if( project.initEndDate ) {
				initEndDate = new Date( project.initEndDate );
			}
			var roles = project.roles;

			//Check if the START date has been updated.
			if( startDateShifted ) {
				var delta = startDate - initStartDate;
				for( var i = 0; i < roles.length; i++ ) {
					var role = roles[ i ];
					//Shift the start date
					if( role.startDate ) {
						//If the role date == the original start date keep them the same
						if( role.startDate == project.initStartDate ) {
							role.startDate = project.startDate;
						} else {
							var tmpDate = new Date( role.startDate );
							tmpDate = new Date( tmpDate.getTime( ) + delta );
							tmpDate = $scope.validateShiftDates( startDate, endDate, tmpDate );
							role.startDate = getShortDate( tmpDate );
						}
					}
					//Shift the end date
					/*if(role.endDate){
					 var tmpDate = new Date(role.endDate);
					 tmpDate = new Date(tmpDate.getTime() + delta);
					 tmpDate = $scope.validateShiftDates(startDate, endDate, tmpDate);
					 role.endDate = getShortDate(tmpDate);
					 }*/

					$scope.shiftAssignments( role, delta, 0 );
				}
			}

			//Check if the END date has been updated.
			if( endDateShifted ) {
				// end date just shifted
				if( initEndDate ) {
					var delta = endDate - initEndDate;
					for( var i = 0; i < roles.length; i++ ) {
						var role = roles[ i ];
						//Shift the end date
						if( role.endDate ) {
							if( role.endDate == project.initEndDate ) {
								role.endDate = project.endDate;
							} else {
								var tmpDate = new Date( role.endDate );
								tmpDate = new Date( tmpDate.getTime( ) + delta );
								tmpDate = $scope.validateShiftDates( startDate, endDate, tmpDate );
								role.endDate = getShortDate( tmpDate );
							}
						} else {
							role.endDate = project.endDate;
						}
						//Shift the start date
						/*if(role.start){
						 var tmpDate = new Date(role.startDate);
						 tmpDate = new Date(tmpDate.getTime() + delta);
						 tmpDate = $scope.validateShiftDates(startDate, endDate, tmpDate);
						 role.startDate = getShortDate(tmpDate);
						 }*/

						$scope.shiftAssignments( role, 0, delta );
					}
				}
				// end date initialized
				else {
					project.initEndDate = project.endDate;
					for( var i = 0; i < roles.length; i++ ) {
						var role = roles[ i ];

						role.endDate = project.endDate;
					}

					$scope.shiftAssignments( role, 0, 0 );
				}
			}

			// save assignments after project
			//if ($scope.projectAssignments)
			//	AssignmentService.save($scope.project, $scope.projectAssignments);

			callback( );
		} );
	};

	$scope.validateShiftDates = function( projectStartDate, projectEndDate, tmpDate ) {
		if( projectEndDate ) {
			if( tmpDate > projectEndDate ) {
				tmpDate = projectEndDate;
			}
		}
		if( tmpDate < projectStartDate ) {
			tmpDate = projectStartDate;
		}

		return tmpDate;
	};

	$scope.shiftAssignments = function( role, startDelta, endDelta ) {
		for( var i = 0; i < $scope.project.roles.length; i++ ) {
			for( var j = 0; j < $scope.project.roles[ i ].assignees.length; j++ ) {
				var assignment = $scope.project.roles[i].assignees[ j ];
				if( assignment.role && assignment.role.resource.indexOf( role._id ) > -1 ) {
					// if start date changed
					if( startDelta != 0 ) {
						// shift start
						var tmpDate = new Date( assignment.startDate );
						tmpDate = new Date( tmpDate.getTime( ) + startDelta );
						tmpDate = $scope.validateShiftDates( new Date( role.startDate ), new Date( role.endDate ), tmpDate );
						assignment.startDate = getShortDate( tmpDate );
					}

					// if end date changed
					if( endDelta != 0 ) {
						//shift end
						var tmpDate = new Date( assignment.endDate );
						tmpDate = new Date( tmpDate.getTime( ) + endDelta );
						tmpDate = $scope.validateShiftDates( new Date( role.startDate ), new Date( role.endDate ), tmpDate );
						assignment.startDate = getShortDate( tmpDate );
					}

					// if endDate was set or removed, change assignment endDate
					if( ( role.endDate && !assignment.endDate ) || ( !role.endDate && assignment.endDate ) ) {
						assignment.endDate = role.endDate;
					}
				}
			}
		}

		for( var i = 0; $scope.projectAssignments && i < $scope.projectAssignments.members.length; i++ ) {
			var assignment = $scope.projectAssignments.members[ i ];
			if( assignment.role.resource.indexOf( role._id ) > -1 ) {
				// if start date changed
				if( startDelta != 0 ) {
					// shift start
					var tmpDate = new Date( assignment.startDate );
					tmpDate = new Date( tmpDate.getTime( ) + startDelta );
					tmpDate = $scope.validateShiftDates( new Date( role.startDate ), new Date( role.endDate ), tmpDate );
					assignment.startDate = getShortDate( tmpDate );
				}

				// if end date changed
				if( endDelta != 0 ) {
					//shift end
					var tmpDate = new Date( assignment.endDate );
					tmpDate = new Date( tmpDate.getTime( ) + endDelta );
					tmpDate = $scope.validateShiftDates( new Date( role.startDate ), new Date( role.endDate ), tmpDate );
					assignment.startDate = getShortDate( tmpDate );
				}

				// if endDate was set or removed, change assignment endDate
				if( ( role.endDate && !assignment.endDate ) || ( !role.endDate && assignment.endDate ) ) {
					assignment.endDate = role.endDate;
				}
			}
		}
	};
	/**
	 * Hide the messages dialog
	 */
	$scope.hideMessages = function( ) {
		$scope.messages = null;
		$( '#messages' ).hide( );
	};

	/**
	 * Show a page level info message
	 */
	$scope.showInfo = function( messages ) {
		$( '#messages' ).removeClass( 'alert-danger' );
		$( '#messages' ).addClass( 'alert-info' );
		$scope.messages = messages;
		$( '#messages' ).show( );
	};
	/**
	 * Show a page level error message
	 */
	$scope.showErrors = function( messages ) {
		$( '#messages' ).removeClass( 'alert-info' );
		$( '#messages' ).addClass( 'alert-danger' );
		$scope.messages = messages;
		$( '#messages' ).show( );
	};
	/**
	 * Method which provides apropriate css for the assignments panels
	 */
	$scope.getCoverageClass = function( role ) {
		var result = '';

		if( role.isPastRole )
			result = 'panel-default';
		
else if( role.percentageCovered == 0 )
			result = 'panel-danger';
		else if( role.percentageCovered < 100 )
			result = 'panel-warning';
		else if( role.percentageCovered != undefined )
			result = 'panel-success';

		return result;
	};

	$scope.getCoverageValue = function( role ) {
		var result = '';

		if( role.percentageCovered == 0 )
			result = 'UNASSIGNED';
		else if( role.percentageCovered < 100 ) {
			if( role.daysGap )
				result = 'Gaps';

			if( role.coveredKMin > 0 && role.coveredKMin < 1 ) {
				result += result ? '/' : '';

				result += 'NEEDS ATTENTION';
			}

		} else if( role.percentageCovered == 100 )
			result = 'OKAY';

		return result;
	};

	$scope.getCoverageIcon = function( role ) {
		var value = $scope.getCoverageValue( role );

		if( value == "OKAY" ) {
			return "fa fa-check assignment-icon-okay";
		}

		if( value == "NEEDS ATTENTIONS" || value == "Gaps" ) {
			return "fa fa-exclamation assignment-icon-warning";
		}

		if( value == "UNASSIGNED" ) {
			return "fa fa-times assignment-icon-danger";
		}
	};

	$scope.getRoleCSSClass = function( role ) {
		var result = 'panel ';

		result += $scope.getCoverageClass( role );

		return result;
	};

	$scope.showSeparator = function( role, index, skipFirst ) {
		var result = '';

		if( $scope.project.roles[ index ].isPastRole && ( !$scope.project.roles[ index - 1 ] || !$scope.project.roles[ index - 1 ].isPastRole ) )
			result = 'past';
		else if( $scope.project.roles[ index ].isFutureRole && ( !$scope.project.roles[ index - 1 ] || !$scope.project.roles[ index - 1 ].isFutureRole ) )
			result = 'future';
		else if( $scope.project.roles[ index ].isCurrentRole && ( !$scope.project.roles[ index - 1 ] || !$scope.project.roles[ index - 1 ].isCurrentRole ) )
			result = 'current';

		if( skipFirst && result && index == 0 )
			result = '';

		return result;
	};
	/**
	 * Save the loaded project.
	 */
	$scope.save = function( dateShiftNeeded ) {
		$( "#dateShiftConfirm" ).modal( 'hide' );
		var deferred = $q.defer( );

		var savingCallback = function( ) {
			var wasCreated = $scope.projectId ? false : true;

			// set the project creator and created time
			//TODO - Do we need this refresh why would it be out of date with the area
			// controller?

			Resources.refresh( 'people/me' ).then( function( me ) {
				if( $scope.project.created === undefined ) {
					//TODO Created and Modified should be set on the server side not here.
					$scope.project.created = {
						date: new Date( ).toString( ),
						resource: me.about
					};
				}

				$scope.project.modified = {
					date: new Date( ).toString( ),
					resource: me.about
				};

				ProjectsService.save( $scope.project ).then( function( result ) {
					$rootScope.hideModals( );
					if( $rootScope.projectEdit && $rootScope.needsTonavigateOut && $scope.editDone ) {
						$rootScope.navigateOutFunc( );
						return;
					}

					//On Create the project ID will be null.  Pull it from the about.
					if( !$scope.projectId ) {
						//Set our currently viewed project to the one resolved by the service.
						if(result.ok) {
						  $scope.projectId = result.id;
						  $scope.project.about = 'projects/' + $scope.projectId;
						}

                        $scope.$emit( 'project:save' );
                        
						// after creating a project, if clicked Done, go to projects list
						// if clicked Save, make project editable (redirect to Edit page)
						if( $scope.editDone ) {
							$rootScope.formDirty = false;
							$state.go( 'projects.index', {
								filter: 'all'
							} );
							return;
						} else {
							$rootScope.formDirty = false;
							$state.go( 'projects.edit', {
								projectId: $scope.projectId
							} );
						}
					} else 
					   $scope.$emit( 'project:save' );

					$scope.showInfo( [ 'Project successfully saved' ] );

					

					ProjectsService.getForEdit( $scope.projectId ).then( function( project ) {
						$scope.project = project;
						$scope.handleProjectSelected( );
						$rootScope.formDirty = false;
						$rootScope.dirtySaveHandler = null;

						deferred.resolve( $scope.project );

						

						$scope.loadExecAndPeople( function() {
						    $scope.$emit( 'project:loaded' );
						});
					} );
				}, function( response ) {
					if( response.data.reasons ) {
						$scope.showErrors( response.data.reasons );
					} else if( response.status && response.data && response.data.message ) {
						var error = response.status + ": " + response.data.message;
						$scope.showErrors( [ error ] );
					} else if( response.status && response.data ) {
						var error = response.status + ": " + JSON.stringify( response.data );
						$scope.showErrors( [ error ] );
					}

					//Decode the description
					$scope.project.description = decodeURIComponent( $scope.project.description );

					deferred.reject( $scope.project );

				} );

			} );
		};

		$scope.submitAttempted = true;

		if( !$scope.validateFields( ) ) {
			return deferred.promise;
		}

		if( dateShiftNeeded ) {
			$scope.handleProjectStartDateShifts( savingCallback );

			$( "#dateShiftConfirm" ).modal( 'hide' );
		} else {
			savingCallback( );
		}

		return deferred.promise;
	};

	$scope.validateFields = function( ) {
		$scope.messages = [ ];

		if( !$scope.project.name || $scope.project.name === "" ) {
			$scope.messages.push( "Project name is required." );
		}

		if( !$scope.project.customerName || $scope.project.customerName === "" ) {
			$scope.messages.push( "Customer name is required." );
		}

		return $scope.messages.length == 0;
	}
	var SYMBOLS_FOR_DESCRIPTION = 400;

	var cutDescription = function( description ) {
		var result = "";

		var splittedDesc = description.split( '<div>' );

		$scope.splittedDescription = [ ];

		$scope.splittedDescription.push( splittedDesc[ 0 ] );

		if( splittedDesc[ 1 ] ) {
			$scope.splittedDescription.push( '<div>' + splittedDesc[ 1 ] );
		}

		if( splittedDesc[ 2 ] ) {
			$scope.splittedDescription.push( '<div>' + splittedDesc[ 2 ] );
		}

		if( $scope.splittedDescription[ 0 ].length > SYMBOLS_FOR_DESCRIPTION ) {
			$scope.splittedDescription[ 0 ] = $scope.splittedDescription[ 0 ].substring( 0, SYMBOLS_FOR_DESCRIPTION );
		}

		$( '#desc-1' ).html( $scope.splittedDescription[ 0 ] );
		$( '#desc-2' ).html( $scope.splittedDescription[ 1 ] );
		$( '#desc-3' ).html( $scope.splittedDescription[ 2 ] );
	};
	/**
	 * Delete the loaded project
	 */
	$scope.deleteProject = function( ) {
		Resources.remove( $scope.project.about ).then( function( ) {
			$state.go( 'projects.index' );
		} );
	};

	/**
	 * Expected margin on a project
	 */
	$scope.projectMargin = function( ) {
		var servicesEst = $scope.getServicesEstimate( );
		var softwareEst = $scope.project.terms.softwareEstimate;

		//Cannot be null
		servicesEst = servicesEst ? servicesEst : 0;
		softwareEst = softwareEst ? softwareEst : 0;

		var revenue = servicesEst;
		var cost = $scope.servicesLoadedTotal;

		var margin = null;

		if( revenue ) {
			margin = ( revenue - cost ) * 100 / revenue;
		}

		return margin;
	};

	/**
	 * Return servicesEstimate
	 */
	$scope.getServicesEstimate = function( ) {
		if( $scope.project && $scope.project.terms ) {

			var svcsEst = 0;
			if( $scope.isFixedBid( ) ) {
				svcsEst = $scope.project.terms.fixedBidServicesRevenue;
			} else {
				//if(!$scope.servicesEstimate || $scope.servicesEstimate ==0) {
				for( var i = 0; i < $scope.project.roles.length; i++ ) {
					var ithRole = $scope.project.roles[ i ];
					var roleEstimate = 0;
					if( ithRole.startDate && ithRole.endDate ) {
						roleEstimate = ithRole.rate.getEstimatedTotal( ithRole.startDate, ithRole.endDate );
					} else if( ithRole.startDate ) {
						/*
						 * Use the project endDate if the role doesn't have an endDate.
						 */
						roleEstimate = ithRole.rate.getEstimatedTotal( $scope.project.endDate );
					}
					svcsEst += roleEstimate;

				}
				$scope.servicesEstimate = svcsEst;
				/*}
				 else {
				 svcsEst = $scope.servicesEstimate;
				 }*/
			}

			return svcsEst;
		}
	};

	$scope.getTotalEstimate = function( ) {
		var srvEstimate = parseInt( $scope.getServicesEstimate( ) );

		if( !srvEstimate )
			srvEstimate = 0;

		var sftwEstimate = parseInt( $scope.project.terms.softwareEstimate );

		if( !sftwEstimate )
			sftwEstimate = 0;

		return srvEstimate + sftwEstimate;
	};
	/**
	 * Display the expected hours a role should work
	 */
	$scope.displayRate = function( role ) {
		var ret = null;
		if( role ) {
			if( role.rate.type === Rates.MONTHLY ) {
				ret = '$' + role.rate.amount + '/m';
			} else {
				ret = '$' + role.rate.amount + '/hr';
			}
		}
		return ret;
	};

	/**
	 * Display the expected hours a role should work
	 */
	$scope.displayHours = function( role ) {
		var ret = '';
		if( role.rate.fullyUtilized ) {
			if( role.rate.type === Rates.WEEKLY ) {
				ret = '100% Weekly';
			} else if( role.rate.type === Rates.HOURLY ) {
				ret = '100% Hourly';
			} else if( role.rate.type === Rates.MONTHLY ) {
				ret = '100% Monthly';
			}
		} else if( role.rate.type === Rates.WEEKLY ) {
			ret = role.rate.hoursPerWeek + ' per week';
		} else if( role.rate.type === Rates.HOURLY ) {
			ret = role.rate.hoursPerMth + ' per month';
		}
		return ret;
	};

	/**
	 * Calculate total services cost in plan
	 */
	$scope.servicesTotal = function( ) {
		return $scope.getServicesEstimate( );
	};

	/**
	 * Number of months between 2 dates
	 */
	$scope.monthDif = function( d1, d2 ) {
		//      var months;
		//      months = (d2.getFullYear() - d1.getFullYear()) * 12;
		//      months -= d1.getMonth() + 1;
		//      months += d2.getMonth() + 1;
		//      return months <= 0 ? 0 : months;

		return Math.ceil( ( d2.getTime( ) - d1.getTime( ) ) / ( 1000 * 60 * 60 * 24 * 30 ) );
	};

	/**
	 * Number of weeks between 2 dates
	 */
	$scope.weeksDif = function( d1, d2 ) {
		//      // The number of milliseconds in one week
		//      var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
		//      // Convert both dates to milliseconds
		//      var date1Ms = d1.getTime();
		//      var date2Ms = d2.getTime();
		//      // Calculate the difference in milliseconds
		//      var differenceMs = Math.abs(date1Ms - date2Ms);
		//      // Convert back to weeks and return hole weeks
		//      return Math.floor(differenceMs / ONE_WEEK);

		return Math.ceil( ( d2.getTime( ) - d1.getTime( ) ) / ( 1000 * 60 * 60 * 24 * 7 ) );
	};

	/**
	 * Whenever the roles:add event is fired from a child controller,
	 * handle it by adding the supplied role to our project.
	 */
	$scope.$on( 'roles:add', function( event, role ) {
		$scope.project.addRole( role );
		//$scope.summaryRolesTableParams.total($scope.project.roles.length);
		//$scope.summaryRolesTableParams.reload();

		/*
		 * as sow table isn't available in edit mode
		 $scope.sowRolesTableParams.total($scope.project.roles.length);
		 $scope.sowRolesTableParams.reload();
		 */
	} );

	/**
	 * Whenever the roles:change event is fired from a child controller,
	 * handle it by updating the supplied role in our project.
	 */
	$scope.$on( 'roles:change', function( event, index, role ) {
		$scope.project.changeRole( index, role );
		//$scope.summaryRolesTableParams.total($scope.project.roles.length);
		//$scope.summaryRolesTableParams.reload();

		/*
		 * as sow table isn't available in edit mode
		 $scope.sowRolesTableParams.total($scope.project.roles.length);
		 $scope.sowRolesTableParams.reload();
		 */
	} );

	/**
	 * Whenever the roles:remove event is fired from a child controller,
	 * handle it by removing the supplied role from our project.
	 */
	$scope.$on( 'roles:remove', function( event, role ) {
		$scope.project.removeRole( role );
		//$scope.summaryRolesTableParams.total($scope.project.roles.length);
		//$scope.summaryRolesTableParams.reload();
		/*
		 * as sow table isn't available in edit mode
		 $scope.sowRolesTableParams.total($scope.project.roles.length);
		 $scope.sowRolesTableParams.reload();
		 */
	} );

	/**
	 * Whenever the details form's state changes, update the watchers in this view.
	 */
	$scope.$on( 'detailsForm:valid:change', function( event, validity ) {
		detailsValid = validity;
	} );

	/**
	 * Whenever the roles form's state changes, update the watchers in this view.
	 */
	$scope.$on( 'roles:valid:change', function( event, validity ) {
		rolesValid = validity;
	} );

	/**
	 * Whenever the roles:assignments:change event is fired from a child controller,
	 * handle it by updating the supplied role's assignments in our project.
	 */
	$scope.$on( 'roles:assignments:change', function( event, index, role ) {
		$scope.updateHoursPersons( );

	} );

	/**
	 * Must have the details filled out before the user can view the roles tab.
	 *
	 * @returns {boolean}
	 */
	$scope.isRolesTabDisabled = function( ) {
		return !detailsValid;
	};

	/**
	 * Must have the details filled out and at least one role assigned before the
	 * user
	 * can view the assignments tab.
	 *
	 * @returns {boolean}
	 */
	$scope.isAssignmentsTabDisabled = function( ) {
		return !detailsValid || !rolesValid;
	};

	/**
	 * Must have the details filled out and at least one role assigned before the
	 * user
	 * can view the summary tab.
	 *
	 * @returns {boolean}
	 */
	$scope.isSummaryTabDisabled = function( ) {
		return !detailsValid || !rolesValid;
	};

	/**
	 * Check to see if this is a fixed bid project or not.
	 *
	 * @returns {boolean}
	 */
	$scope.isFixedBid = function( ) {
		return $scope.project.terms.type == "fixed";
	};

	/**
	 * Check to see if this is t&m client project.
	 *
	 * @returns {boolean}
	 */
	$scope.isTandM_clientProject = function( ) {

		return $scope.project && $scope.project.type == "paid" && $scope.project.terms.type == "timeAndMaterials";
	};

	/**
	 * Check to see if this is a paid client project.
	 *
	 * @returns {boolean}
	 */
	$scope.isPaidClientProject = function( ) {

		return $scope.project && $scope.project.type == "paid";
	};

	$scope.activeTab = {
		"/assignments": $state.params.tabId == "/assignments",
		"/summary": $state.params.tabId == "/summary",
		"/hours": $state.params.tabId == "/hours",
		"/links": $state.params.tabId == "/links"
	};

	$scope.getDefaultAssignmentsFilter = function( ) {
		var result = "current";
		var now = new Date( );

		var todayDate = new Date( now.getFullYear( ), now.getMonth( ), now.getDate( ) );

		if( new Date( $scope.project.startDate ) >= todayDate && ( !$scope.project.endDate || new Date( $scope.project.endDate ) > todayDate ) )
			result = "future";
		else if( new Date( $scope.project.startDate ) < todayDate && ( $scope.project.endDate && new Date( $scope.project.endDate ) < todayDate ) )
			result = "past";

		return result;
	};

	$scope.tabSelected = function( selectedTabId ) {
		if( $scope.projectTabId != '/edit' && $scope.projectTabId != selectedTabId ) {

			selectedTabId = selectedTabId && selectedTabId.indexOf( '/' ) != 0 ? ( '/' + selectedTabId ) : selectedTabId;

			if( !$scope.projectTabId ) {

				var updatedUrl = $state.href( 'projects.show', {
					tabId: selectedTabId,
					edit: $stateParams.edit ? 'edit' : '',
//					filter: null,
					projectId: $stateParams.projectId
				} ).replace( '#', '' );

				$location.url( updatedUrl ).replace( );
			} else
				$state.go( 'projects.show', {
					tabId: selectedTabId,
					edit: $stateParams.edit ? 'edit' : '',
//					filter: null,
					projectId: $stateParams.projectId
				} );

			$scope.projectTabId = selectedTabId;
		}
	};

	$scope.editAssignments = function( ) {
		$state.transitionTo( 'projects.show.tabEdit', {
			tabId: '/assignments',
			filter: null,
			edit: 'edit',
			projectId: $stateParams.projectId
		}, {
			reload: true,
			inherit: false,
			notify: true
		} );
	};
	/**
	 * Get All the Role Types
	 */
	$scope.getAllRoleTypes = function( rolesCb ) {

		Resources.get( 'roles' ).then( function( result ) {
			var resources = [ ];
			var roleGroups = {};
			//Save the list of role types in the scope
			$scope.roleTypes = result.members;
			//Get list of roles to query members
			for( var i = 0; i < result.members.length; i++ ) {
				var role = result.members[ i ];
				var resource = role.resource;
				roleGroups[ resource ] = role;
				resources.push( resource );
				//create a members array for each roles group

				role.assiganble = [ ];
			}

			$scope.roleGroups = roleGroups;

			//Query all people with a primary role
			var roleQuery = {
				'primaryRole.resource': {
					$exists: 1
				}
			};
			var fields = {
				resource: 1,
				name: 1,
				familyName: 1,
				givenName: 1,
				primaryRole: 1,
				thumbnail: 1,
				isActive: 1
			};
			var sort = {
				'primaryRole.resource': 1,
				'familyName': 1,
				'givenName': 1
			};

			//Resources.query( 'people', roleQuery, fields, function( peopleResults ) {
	      People.query(roleQuery, fields).then( function( peopleResults ) {
				var people = peopleResults.members;
				//Set up lists of people in roles
				for( var i = 0; i < people.length; i++ ) {
					var person = people[ i ];
					var personsRole = roleGroups[ person.primaryRole.resource ];
					person.title = ( personsRole ? ( personsRole.abbreviation + ': ' ) : '' ) + person.familyName + ', ' + person.givenName;

					for( var j = 0; j < result.members.length; j++ ) {
						var roleJ = result.members[ j ];

						//Primary role match place it at the front of the array in sort order
						if( roleJ.resource === person.primaryRole.resource ) {
							//assignable list was empty add it to the front
							if( roleGroups[ roleJ.resource ].assiganble.length === 0 ) {
								roleGroups[roleJ.resource].assiganble[ 0 ] = person;
							}
							//First match just add it to the font
							else if( roleGroups[roleJ.resource].assiganble[ 0 ].primaryRole.resource !== roleJ.resource ) {
								roleGroups[ roleJ.resource ].assiganble.unshift( person );
							}
							//Add it after the last match
							else {
								var index = 0;
								while( roleGroups[ roleJ.resource ].assiganble.length > index && roleGroups[roleJ.resource].assiganble[ index ].primaryRole.resource === roleJ.resource ) {
									index++;
								}
								roleGroups[ roleJ.resource ].assiganble.splice( index, 0, person );
							}
						}
						//Not the primary role leave it in sort order
						else {
							roleGroups[ roleJ.resource ].assiganble.push( person );
						}
					}
				}

				//Set a map of role types to members
				$scope.roleGroups = roleGroups;

				if( rolesCb )
					rolesCb( );
			}, sort );
		} );
	};

	$scope.hoursValidation = [ ];

	$scope.getNewHoursValidationErrors = function( newHoursForm ) {

		$scope.hoursValidation = [ ];

		if( newHoursForm && newHoursForm.hours.$dirty && newHoursForm.hours.$invalid ) {
			$scope.hoursValidation.push( "Incorrect value for hours" );

		}

		if( newHoursForm && newHoursForm.hoursDescription.$dirty && newHoursForm.hoursDescription.$invalid ) {
			$scope.hoursValidation.push( "Hours description is empty" );

		}

		return $scope.hoursValidation.length > 0;
	};
	/**
	 * Add a new Hours Record to the server
	 */
	$scope.addHours = function( ) {
		var form = this.newHoursForm;
		//Set the project context
		$scope.newHoursRecord.project = {
			resource: $scope.project.about
		};
		//Set the person context
		$scope.newHoursRecord.person = {
			resource: $scope.me.about
		};

		if( !$scope.newHoursRecord.description )
			$scope.newHoursRecord.description = "No Description Entered";

		Resources.create( 'hours', $scope.newHoursRecord ).then( function( ) {
			$scope.initHours( );
			$scope.newHoursRecord = {};
			form.setPristine( true );
		} );
	};

	/**
	 * Delete a role
	 */
	$scope.deleteHours = function( hoursURL ) {
		Resources.remove( hoursURL ).then( function( ) {
			$scope.initHours( );
		} );
	};

	/**
	 * Format Money
	 *
	 */
	$scope.formatMoney = function( num, c, d, t ) {
		var n = num, c = isNaN( c = Math.abs( c ) ) ? 2 : c, d = d == undefined ? "." : d, t = t == undefined ? "," : t, s = n < 0 ? "-" : "", i = parseInt( n = Math.abs( +n || 0 ).toFixed( c ) ) + "", j = ( j = i.length ) > 3 ? j % 3 : 0;
		return '$' + s + ( j ? i.substr( 0, j ) + t : "" ) + i.substr( j ).replace( /(\d{3})(?=\d)/g, "$1" + t ) + ( c ? d + Math.abs( n - i ).toFixed( c ).slice( 2 ) : "" );
	};

	$scope.hoursPeriods = [ ];
	$scope.monthPeriods = [ ];
	$scope.selectedHoursPeriod = "";
	$scope.currentMonth = "";
	$scope.currentDisplayedHours = [ ];
	$scope.vacationHours = [ ];

	$scope.handleHoursPeriodChanged = function( propName ) {
		var period = propName ? this[ propName ] : "";

		if( period && $scope.monthNames[ period ] )
			$scope.currentMonth = period;
		else if( period )
			$scope.selectedHoursPeriod = period;

		for( var i = 0; $scope.currentDisplayedHours && i < $scope.currentDisplayedHours.length; i++ ) {
			$scope.currentDisplayedHours[ i ] = $scope.getProjectHours( $scope.organizedHours[ i ].hoursEntries );
		}

		if( $scope.organizedHours ) {
			for( var i = 0; $scope.organizedHours.length && i < $scope.organizedHours.length; i++ )
				$scope.organizedHours[ i ].collapsed = false;
		}
	};

	$scope.applyCustomHoursPeriod = function( ) {
		$scope.selectedHoursPeriod = this.selectedHoursStartDate + ':' + this.selectedHoursEndDate;

		for( var i = 0; i < $scope.currentDisplayedHours.length; i++ ) {
			$scope.currentDisplayedHours[ i ] = $scope.getProjectHours( $scope.organizedHours[ i ].hoursEntries );
		}

		for( var i = 0; i < $scope.organizedHours.length; i++ )
			$scope.organizedHours[ i ].collapsed = false;
			
		$scope.initVacationHours(this.selectedHoursStartDate, this.selectedHoursEndDate);
	};

	$scope.monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

	$scope.initHoursPeriods = function( hours ) {
		$scope.hoursPeriods = [ ];

		var now = new Date( );

		var minDate = null;
		var maxDate = null;

		var currentDate;

		for( var i = 0; i < hours.length; i++ ) {
			var tmpD = hours[ i ].date.split( '-' );

			currentDate = new Date( parseInt( tmpD[ 0 ] ), parseInt( tmpD[ 1 ] ) - 1, parseInt( tmpD[ 2 ] ) );

			if( !minDate || minDate > currentDate )
				minDate = new Date( currentDate );

			if( !maxDate || maxDate <= currentDate )
				maxDate = new Date( currentDate );
		}

		var ifAddYear = minDate && maxDate && minDate.getFullYear( ) != maxDate.getFullYear( );

		if( $scope.hoursViewType == "monthly" && $scope.monthPeriods.length == 0 ) {
			//$scope.monthPeriods = [];

			currentDate = new Date( minDate );

			var o = null;

			while( currentDate <= maxDate ) {
				o = {
					name: $scope.monthNames[               currentDate.getMonth( ) ],
					value: currentDate.getMonth( )
				};
				$scope.monthPeriods.push( o );

				if( ifAddYear ) {
					o.name = o.name + ', ' + currentDate.getFullYear( );
					o.value = currentDate.getFullYear( ) + '-' + o.value;
				}
				currentDate = new Date( currentDate );

				currentDate.setDate( 1 );
				currentDate.setMonth( currentDate.getMonth( ) + 1 );

			}

			if( !$scope.currentMonth )
				$scope.currentMonth = now.getMonth( );
		} else if( $scope.hoursViewType == "billings" && $scope.hoursPeriods.length == 0 ) {
			//$scope.hoursPeriods = [];
			//$scope.selectedHoursPeriod = null;

			var step = '';

			if( $scope.project.terms.billingFrequency == 'weekly' )
				step = '7d';
			else if( $scope.project.terms.billingFrequency == 'biweekly' )
				step = '14d';
			else if( $scope.project.terms.billingFrequency == 'monthly' )
				step = '1m';
			else if( $scope.project.terms.billingFrequency == 'quarterly' )
				step = '3m';

			currentDate = new Date( $scope.project.terms.billingDate );
			/*
			 if (step.indexOf('d') > -1)
			 currentDate.setDate(nextDate.getDate() + parseInt(step))
			 else if(step.indexOf('m') > -1)
			 currentDate.setMonth(nextDate.getMonth() + parseInt(step))
			 */
			var align = function( k ) {
				if( k.toString( ).length == 1 )
					return '0' + k;

				return k;
			};
			var o = null;
			var nextDate = new Date( currentDate );
			var viewPeriod = '';

			while( currentDate <= maxDate ) {

				if( step.indexOf( 'd' ) > -1 )
					nextDate.setDate( nextDate.getDate( ) + parseInt( step ) );
				else if( step.indexOf( 'm' ) > -1 )
					nextDate.setMonth( nextDate.getMonth( ) + parseInt( step ) );
				else
					nextDate = new Date( maxDate );

				o = {
					name: ( currentDate.getMonth( ) + 1 ) + '/' + currentDate.getDate( ) + ' - ' + ( nextDate.getMonth( ) + 1 ) + '/' + nextDate.getDate( ),
					value: currentDate.getFullYear( ) + '-' + align( currentDate.getMonth( ) + 1 ) + '-' + align( currentDate.getDate( ) ) + ':' + nextDate.getFullYear( ) + '-' + align( nextDate.getMonth( ) + 1 ) + '-' + align( nextDate.getDate( ) )
				};

				$scope.hoursPeriods.push( o );

				currentDate = new Date( nextDate );
			}

			if( !$scope.selectedHoursPeriod && $scope.hoursPeriods.length > 0 )
				$scope.selectedHoursPeriod = $scope.hoursPeriods[ 0 ].value;
		}
	};

	$scope.organizeHours = function( hours ) {
		var data = $scope.hours;
		var projectRoles = $scope.project.roles;

		var ret = data;
		//Resolve all the people
		var defers = [ ];
		var $defer = $q.defer( );

		for( var i = 0; i < ret.length; i++ ) {
			var ithHoursRecord = ret[ i ];
			defers.push( Resources.resolve( ithHoursRecord.person ) );

			//See if the user had a role in the project at the time of the record
			for( var j = 0; j < projectRoles.length; j++ ) {
				var role = projectRoles[ j ];
				//Found a role for this person
				if( role.assignee && ithHoursRecord.person.resource === role.assignee.resource ) {
					var roleStartDate = new Date( role.startDate );
					var hoursDate = new Date( ithHoursRecord.date );
					//record was after role start date
					if( hoursDate >= roleStartDate ) {
						var roleEndDate = role.endDate ? new Date( role.endDate ) : null;
						//Record was before the end of role date
						if( !roleEndDate || roleEndDate >= hoursDate ) {
							ithHoursRecord.role = Resources.deepCopy( role );
							defers.push( Resources.resolve( ithHoursRecord.role.type ) );
						}
					}
				}
			}

		}

		var cb = function( ) {
			$scope.organizedHours = [ ];

			var tmpHoursMap = {};
			var tmpPersonMap = {};

			for( var i = 0; i < hours.length; i++ ) {
				if( !tmpPersonMap[ hours[ i ].person.resource ] ) {
					tmpPersonMap[ hours[ i ].person.resource ] = _.extend( {}, hours[ i ].person );
					tmpHoursMap[ hours[ i ].person.resource ] = [ ];
				}

				tmpHoursMap[ hours[ i ].person.resource ].push( hours[ i ] );
			}

			$scope.organizedHours = _.map( tmpPersonMap, function( val, key ) {
				return val;
			} );
			for( var i = 0; i < $scope.organizedHours.length; i++ ) {
				$scope.organizedHours[ i ].hoursEntries = tmpHoursMap[ $scope.organizedHours[ i ].resource ];
				$scope.currentDisplayedHours[ i ] = $scope.getProjectHours( tmpHoursMap[ $scope.organizedHours[ i ].resource ] );

			}

			// merge all other persons from assignees
			$scope.updateHoursPersons( );
			$scope.updateOrganizedHours( );
		};
		// use simply callback logic to wait until everyone will load
		var counter = 0;
		var thenFn = function( ) {
			counter++;

			if( counter == defers.length ) {
				cb( );
			}
		};
		for( var i = 0; i < defers.length; i++ ) {
			defers[ i ].then( thenFn );
		}
		/*
		 $.when.apply(window, defers).done(function(r){
		 $defer.resolve(ret);

		 cb();
		 });*/

	};

	$scope.updateOrganizedHours = function( ) {
		// wait until $scope.projectAssignments and $scope.organizedHours will be
		// initialized
		if( $scope.projectAssignments && $scope.organizedHours ) {
			var assignments = $scope.projectAssignments;
			var person = null;
			var startD = null;
			var endD = null;
			var additionalPersons = [ ];

			var monthDate = new Date( );

			monthDate.setMonth( $scope.currentMonth );

			var startOfMonthDate = moment( monthDate ).startOf( 'month' ).format( 'YYYY-MM-DD' );
			var endOfMonthDate = moment( monthDate ).endOf( 'month' ).format( 'YYYY-MM-DD' );
			;

			var i;

			for( i = 0; i < assignments.members.length; i++ ) {
				person = _.find( $scope.organizedHours, function( o ) {
					return assignments.members[ i ].person.resource == o.resource;
				} );

				if (!person)
					continue;
				
				startD = new Date( assignments.members[ i ].startDate );
				endD = new Date( assignments.members[ i ].endDate );

				if( !person.hoursPerWeek && !person.endDate && !person.startDate ) {
					person.hoursPerWeek = assignments.members[ i ].hoursPerWeek;
					person.endDate = assignments.members[ i ].endDate;
					person.startDate = assignments.members[ i ].startDate;
				} else {
					person.hoursPerWeek = assignments.members[ i ].hoursPerWeek > person.hoursPerWeek ? assignments.members[ i ].hoursPerWeek : person.hoursPerWeek;
					person.endDate = assignments.members[ i ].endDate > person.endDate ? assignments.members[ i ].endDate : person.endDate;
					person.startDate = assignments.members[ i ].startDate < person.startDate ? assignments.members[ i ].startDate : person.startDate;
				}

				if( person.endDate > endOfMonthDate )
					person.endDate = endOfMonthDate;

				if( person.startDate < startOfMonthDate )
					person.startDate = startOfMonthDate;

				if( !person && endD.getMonth( ) >= $scope.currentMonth && startD.getMonth( ) <= $scope.currentMonth )
					additionalPersons.push( assignments.members[ i ].person.resource );
			}

			additionalPersons = _.uniq( additionalPersons );

			for( i = 0; i < additionalPersons.length; i++ ) {
				person = {
					resource: additionalPersons[ i ],
					hours: [ ]
				};

				$scope.organizedHours.push( person );
				Resources.resolve( person.resource );
			};
		}
	};
	/*
	 * Includes assignees to project hours
	 * */
	$scope.updateHoursPersons = function( ) {
		if( $scope.organizedHours ) {
			var assignees = [ ];

			for( var i = 0; i < $scope.project.roles.length; i++ ) {
				assignees = assignees.concat( _.map( $scope.project.roles[ i ].assignees, function( a ) {
					return a.person;
				} ) );
			}

			assignees = _.filter( assignees, function( a ) {
				return a && a.resource;
			} );
			var tmpP;

			_.each( assignees, function( a ) {
				tmpP = _.find( $scope.organizedHours, function( p ) {
					return p.resource == a.resource;
				} );
				if( !tmpP ) {
					$scope.organizedHours.push( _.extend( {
						hoursEntries: [ ]
					}, a ) );

				}
			} );
		}

	};

	$scope.getExpectedHoursForWeek = function( personHours ) {
		var loggedHours = 0;
		var i = 0;

		for( i = 0; i < personHours.hours.length; i++ )
			loggedHours += personHours.hours[ i ].totalHours;

		var result = personHours.hoursPerWeek - loggedHours;

		if( result < 0 )
			result = 0;

		return result;
	};

	$scope.getLoggedHoursForWeek = function( personHours ) {
		var loggedHours = 0;
		var i = 0;

		for( i = 0; i < personHours.hours.length; i++ )
			loggedHours += personHours.hours[ i ].totalHours;

		var result = loggedHours;

		if( result < 0 )
			result = 0;

		return result;
	};

	$scope.getExpectedHoursForMonth = function( person, ind ) {
		var result = person.hoursPerWeek * 4 - $scope.getPersonTotalHours( ind );

		if( result < 0 )
			result = 0;

		return result;
	};

	$scope.getLoggedHoursForMonth = function( person, ind ) {
		var result = $scope.getPersonTotalHours( ind );

		if( result < 0 )
			result = 0;

		return result;
	};

	$scope.getPersonTotalHours = function( index ) {
		var result = 0;
		//var personHours = [];

		//for (var i = 0; i < $scope.organizedHours.length; i ++)
		//	if (person.resource == $scope.organizedHours[i].resource)
		//		personHours = $scope.organizedHours[i].hoursEntries;

		//_.each($scope.getProjectHours(personHours), function(o) {
		_.each( $scope.currentDisplayedHours[ index ], function( o ) {
			result += o.hours;
		} );

		return result;
	};

	$scope.getPersonProjectRoles = function( person ) {
		var result = [ ];
		var assignees;
		var entry;

		for( var i = 0; i < $scope.project.roles.length; i++ ) {
			assignees = $scope.project.roles[ i ].assignees;
			entry = _.find( assignees, function( a ) {
				if( a.person && a.person.resource == person.resource )
					return true;
			} );
			if( entry )
				result.push( $scope.roleGroups[ $scope.project.roles[ i ].type.resource ].abbreviation );
		}

		return result.join( ', ' );

	};
	
	$scope.getPersonProjectRolesFull = function( person ) {
        var result = [ ];
        var assignees;
        var entry;

        for( var i = 0; i < $scope.project.roles.length; i++ ) {
            assignees = $scope.project.roles[ i ].assignees;
            entry = _.find( assignees, function( a ) {
                if( a.person && a.person.resource == person.resource )
                    return true;
            } );
            if( entry )
                result.push( $scope.roleGroups[ $scope.project.roles[ i ].type.resource ].title );
        }

        return result.join( ', ' );

    };

	$scope.getProjectHours = function( currentHours, month ) {
		var now = new Date( );
		var selectedYear;
		var selectedMonth;

		var startDate = null;
		var endDate = null;

		var tmp;

		if( ( $scope.hoursViewType == "billings" || $scope.hoursViewType == "customDates" ) && $scope.selectedHoursPeriod.toString( ).indexOf( ':' ) > -1 ) {
			tmp = $scope.selectedHoursPeriod.split( ':' );

			startDate = tmp[ 0 ];
			endDate = tmp[ 1 ];
		} else if( !month && month != 0 ) {
			tmp = $scope.currentMonth.toString( ).split( '-' );
		} else if( month || month == 0 ) {
			tmp = month.toString( ).split( '-' );
		}

		if( tmp.length == 1 ) {
			//selected.setMonth(tmp[0])
			selectedMonth = tmp[ 0 ];
			selectedYear = now.getFullYear( );
		} else if( tmp.length == 2 ) {
			selectedMonth = tmp[ 1 ];
			selectedYear = tmp[ 0 ];
		}

		var retHours = _.filter( currentHours, function( h ) {

			var tmpD = h.date.split( '-' );
			var y = parseInt( tmpD[ 0 ] );
			var m = parseInt( tmpD[ 1 ] ) - 1;

			if( !startDate && !endDate )
				return ( y == selectedYear && m == selectedMonth );

			return h.date >= startDate && h.date < endDate;
		} );

		retHours.sort( function( h1, h2 ) {
			if( new Date( h1.date ) > new Date( h2.date ) )
				return -1;
			else if( new Date( h1.date ) < new Date( h2.date ) )
				return 1;

			return 0;
		} );
		return retHours;
	};

	$scope.initHours = function( ) {
		//Query all hours against the project
		var hoursQuery = {
			'project.resource': $scope.project.about
		};
		//All Fields
		var fields = {};
		var sort = {
			'created': 1
		};
		
		HoursService.query(hoursQuery, fields).then(function( hoursResult ) {
			$scope.hours = hoursResult.members;

			$scope.organizeHours( $scope.hours );
			$scope.initHoursPeriods( $scope.hours );
			$scope.currentWeek( );
			$scope.currentMonth();

			if( $scope.hoursTableParams ) {
				$scope.hoursTableParams.total( $scope.hours.length );
				$scope.hoursTableParams.reload( );

			} else {
				// Table Parameters
				var params = {
					page: 1, // show first page
					count: 25, // count per page
					sorting: {
						created: 'des' // initial sorting
					}
				};

			}

		}, sort );
	};
    
    $scope.vacationPeople = [ ];
    
    $scope.initVacationHours = function(periodStart, periodEnd) {
      // this code grabs hours entries for vacations for project assignees
      /*if($scope.projectPeopleResources.length > 0) {
        // get or create tasks for vacations (Vacation and Appointment)
        var tasks = [ ];
        
        VacationsService.getTaskForVacation(VacationsService.VACATION_TYPES.Vacation).then(function(vacTaskResult) {
          tasks.push({resource: vacTaskResult.resource, name: vacTaskResult.name});
          VacationsService.getTaskForVacation(VacationsService.VACATION_TYPES.Appointment).then(function(appointmentTaskResult) {
            tasks.push({resource: appointmentTaskResult.resource, name: appointmentTaskResult.name});
            
            var vacHoursQuery = {
              $and: [
                { person: { $in: $scope.projectPeopleResources} },
                { task: { $in: tasks } }
              ]
            };
            
            // query hours for vacation
            Resources.query('hours', vacHoursQuery, {}, function(result) {
              $scope.vacationPeople = result.members;
            });
            
          });
        });
      }*/
     $scope.showVacationsStartPeriod = moment(periodStart).format("MMM D");
     $scope.showVacationsEndPeriod = moment(periodEnd).format("MMM D");
     
      if($scope.projectPeopleResources.length > 0) {
        var vacationsQuery = {
          $and: [
            { person: { $in: $scope.projectPeopleResources } },
            { $or: [
              { $and: [
                { startDate: { $gte: periodStart }},
                { startDate: { $lte: periodEnd }},
              ]},
              { $and: [
                { endDate: { $gte: periodStart }},
                { endDate: { $lte: periodEnd }},
              ]},
            ] }
          ]
        };
        
        Resources.query('vacations', vacationsQuery, {}, function(result) {
          $scope.projectVacations = result.members;
          
          for(var k = 0; k < $scope.projectVacations.length; k++) {
            var projVac = $scope.projectVacations[k];
            /*var peopleFound = _.filter($scope.organizedHours, function(person) {
              return person.resource == projVac.person.resource;
            });*/
            Resources.resolve(projVac.person);
            //projVac.person = peopleFound[0];
          }
        })
      }
    }
    
    $scope.getHoursLost = function(vacation) {
      return VacationsService.getHoursLost(vacation);
    }
    
	$scope.hoursMode = "filtered";

	$scope.handleProjectSelected = function( ) {
		var project = $scope.project;

		//TODO - Do we need this refresh why would it be out of date with the area
		// controller?
		Resources.refresh( 'people/me' ).then( function( me ) {
			$scope.me = me;

			if( $scope.me.groups && ( ( $scope.me.groups.indexOf( 'Management' ) !== -1 ) || ( $scope.me.groups.indexOf( 'Executives' ) !== -1 ) || ( $scope.project.creator && $scope.project.creator.resource === $scope.me.about ) ) ) {

				$scope.canDeleteProject = true;
			}

			if( !$scope.projectId ) {
				$scope.canDeleteProject = false;
			}
		} );

		$scope.isTransient = ProjectsService.isTransient( project );
		/**
		 * Controls the edit state of the project form (an edit URL param can control
		 * this from a URL ref)
		 */
		if( $scope.canEdit( ) ) {
			$scope.editMode = editMode;
		} else {
			$scope.editMode = false;
			$state.go( 'projects.show', {
				projectId: $scope.projectId,
				edit: null
			} );
		}

		$scope.projectLoaded = true;
		$scope.submitAttempted = false;

		// The title of the page is the project's name or 'New Project' if transient.
		$scope.title = $scope.isTransient ? 'New Project' : project.name;

		// Table Parameters
		var params = {
			page: 1, // show first page
			count: 50, // count per page
			sorting: {
				type: 'asc' // initial sorting
			}
		};
		/*
		 $scope.summaryRolesTableParams = new TableParams(params, {
		 total: $scope.project.roles.length,
		 getData: function ($defer, params) {
		 var start = (params.page() - 1) * params.count();
		 var end = params.page() * params.count();

		 var orderedData = params.sorting() ?
		 $filter('orderBy')($scope.project.roles, params.orderBy()) :
		 $scope.project.roles;

		 //use build-in angular filter
		 var result = orderedData.slice(start, end);

		 var defers = [];
		 var ret = [];
		 for(var i = 0; i < result.length; i++){
		 var ithRole = Resources.deepCopy(result[i]);
		 if(ithRole.assignee && ithRole.assignee.resource){
		 defers.push(Resources.resolve(ithRole.assignee));
		 //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
		 }

		 if(ithRole.type && ithRole.type.resource){
		 defers.push(Resources.resolve(ithRole.type));
		 //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
		 }

		 ret[i] = ithRole;
		 }

		 $.when.apply(window, defers).done(function(){
		 $defer.resolve(ret);
		 });
		 }
		 });
		 */
		$scope.sowRolesTableParams = new TableParams( params, {
			total: $scope.project.roles.length,
			getData: function( $defer, params ) {
				//if ($scope.financeAccess && !$scope.isFixedBid()) {
				var start = ( params.page( ) - 1 ) * params.count( );
				var end = params.page( ) * params.count( );
				//$scope.servicesEstimate = 0;
				var svcsEst = 0;

				var orderedData = params.sorting( ) ? $filter('orderBy')( $scope.project.roles, params.orderBy( ) ) : $scope.project.roles;

				//use build-in angular filter
				var result = orderedData.slice( start, end );

				var defers = [ ];
				var ret = [ ];
				for( var i = 0; i < result.length; i++ ) {
					var ithRole = Resources.deepCopy( result[ i ] );
					var roleEstimate = 0;
					if( ithRole.startDate && ithRole.endDate ) {
						roleEstimate = ithRole.rate.getEstimatedTotal( ithRole.startDate, ithRole.endDate );
					} else if( ithRole.startDate ) {
						/*
						 * Use the project endDate if the role doesn't have an endDate.
						 */
						roleEstimate = ithRole.rate.getEstimatedTotal( $scope.project.endDate );
					}
					svcsEst += roleEstimate;
					if( ithRole.assignee && ithRole.assignee.resource ) {
						defers.push( Resources.resolve( ithRole.assignee ) );
						//ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
					}

					if( ithRole.type && ithRole.type.resource ) {
						defers.push( Resources.resolve( ithRole.type ) );
						//ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
					}

					ret[ i ] = ithRole;
				}
				$scope.servicesEstimate = svcsEst;

				$.when.apply( window, defers ).done( function( ) {
					$defer.resolve( ret );
				} );
				//}
			}
		} );

		if( !editMode ) {
			$scope.initHours( );
		}

		/**
		 * Calculate total loaded cost in plan
		 */
		var HOURS_PER_WEEK = CONSTS.HOURS_PER_WEEK;
		var roles = $scope.project.roles;
		var runningTotal = 0;
		
		$scope.projectPeopleResources = [ ];
		for( var i = 0; roles && i < roles.length; i++ ) {
			var role = roles[ i ];
			
			for(var j = 0; j < role.assignees.length; j++) {
			  $scope.projectPeopleResources.push(role.assignees[j].person);
			}
			
			var roleType = $scope.roleGroups[ role.type.resource ];
			var rate = role.rate;
			var numMonths;
			var roleTotal;
			if( roleType === null ) {
				console.warn( 'Roles has and unknown type: ' + JSON.stringify( role ) );
			} else {
				var type = rate.type;
				var startDate = new Date( role.startDate );
				var endDate = new Date( role.endDate );
				var amount;

				if( startDate && endDate ) {
					//Hourly Charge rate
					if( type && type === 'monthly' ) {
						amount = role.rate.loadedAmount;
						if( amount === null ) {
							console.warn( 'Role Type has no monthly loaded rate: ' + roleType.title );
						} else {
							numMonths = $scope.monthDif( startDate, endDate );
							roleTotal = numMonths * amount;
							runningTotal += roleTotal;
						}
					}
					//Weekly Charge rate
					else if( type && type === 'weekly' ) {
						amount = role.rate.loadedAmount;
						if( amount === null ) {
							console.warn( 'Role Type has no hourly loaded rate: ' + roleType.title );
						} else {
							var numWeeks = $scope.weeksDif( startDate, endDate );
							var hoursPerWeek = rate.fullyUtilized ? HOURS_PER_WEEK : rate.hoursPerWeek;
							roleTotal = numWeeks * hoursPerWeek * amount;
							runningTotal += roleTotal;
						}
					}
					//Hourly Charge rate
					else if( type && type === 'hourly' ) {
						amount = role.rate.loadedAmount;
						if( amount === null ) {
							console.warn( 'Role Type has no hourly loaded rate: ' + roleType.title );
						} else {
							numMonths = $scope.monthDif( startDate, endDate );
							var hoursPerMonth = rate.fullyUtilized ? 180 : rate.hoursPerMth;
							roleTotal = numMonths * hoursPerMonth * amount;
							runningTotal += roleTotal;
						}
					}
				}
			}
			$scope.servicesLoadedTotal = runningTotal;
		}
        
        $scope.initVacationHours(moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD'));
		// sort roles inside project
		var today = new Date( );

		var dd = today.getDate( );
		var mm = today.getMonth( );
		var yyyy = today.getFullYear( );

		today = new Date( yyyy, mm, dd );

		for( var i = 0; i < $scope.project.roles.length; i++ ) {
			$scope.project.roles[ i ].isPastRole = false;
			$scope.project.roles[ i ].isFutureRole = false;
			$scope.project.roles[ i ].isCurrentRole = false;

			if( new Date( $scope.project.roles[ i ].startDate ) < today && ( $scope.project.roles[ i ].endDate && new Date( $scope.project.roles[ i ].endDate ) < today ) )
				$scope.project.roles[ i ].isPastRole = true;
			else if( new Date( $scope.project.roles[ i ].startDate ) >= today && ( !$scope.project.roles[ i ].endDate || new Date( $scope.project.roles[ i ].endDate ) > today ) )
				$scope.project.roles[ i ].isFutureRole = true;
			else
				$scope.project.roles[ i ].isCurrentRole = true;

		}

		$scope.project.roles.sort( function( r1, r2 ) {

			if( r1.isFutureRole && r2.isFutureRole || r1.isPastRole && r2.isPastRole || r1.isCurrentRole && r2.isCurrentRole ) {
				if( r1.endDate && r2.endDate && new Date( r1.endDate ) < new Date( r2.endDate ) )
					return 1;
				else if( r1.endDate && !r2.endDate )
					return 1;
				else if( !r1.endDate && !r2.endDate && new Date( r1.startDate ) > new Date( r2.startDate ) )
					return 1;
				else if( r1.endDate == r2.endDate && new Date( r1.startDate ) > new Date( r2.startDate ) )
					return 1;
				else if( r1.endDate && r2.endDate && new Date( r1.endDate ) > new Date( r2.endDate ) )
					return -1;
				else if( !r1.endDate && r2.endDate )
					return -1;
				else if( !r1.endDate && !r2.endDate && new Date( r1.startDate ) < new Date( r2.startDate ) )
					return -1;
				else if( r1.endDate == r2.endDate && new Date( r1.startDate ) < new Date( r2.startDate ) )
					return -1;

				var abr1 = $scope.roleGroups[ r1.type.resource ] ? $scope.roleGroups[ r1.type.resource ].abbreviation : '';
				var abr2 = $scope.roleGroups[ r2.type.resource ] ? $scope.roleGroups[ r2.type.resource ].abbreviation : '';

				if( r1.endDate == r2.endDate && r1.startDate == r2.startDate ) {
					if( abr1 > abr2 )
						return 1;
					else if( abr2 > abr1 )
						return -1;
				}
			} else if( r1.isPastRole && ( r2.isFutureRole || r2.isCurrentRole ) )
				return 1;
			else if( r2.isPastRole && ( r1.isFutureRole || r1.isCurrentRole ) )
				return -1;
			else if( r1.isFutureRole && r2.isCurrentRole )
				return 1;
			else if( r2.isFutureRole && r1.isCurrentRole )
				return -1;
			else if( r1.isCurrentRole && ( r2.isFutureRole || r2.isPastRole ) )
				return -1;

			return 0;
		} );
	};

	$scope.billingFrequencyOptions = [ {
		label: "Weekly",
		value: "weekly"
	}, {
		label: "Biweekly",
		value: "biweekly"
	}, {
		label: "Monthly",
		value: "monthly"
	}, {
		label: "Quarterly",
		value: "quarterly"
	} ];
	$scope.getFormatedBillingDate = function( ) {
		var result = $scope.project.terms.billingDate;

		return result;
	};
	
	$scope.getFormatedLastBillingDate = function( ) {
        var result = $scope.project.terms.lastBillingDate;

        return result;
    };

	$scope.getFormatedBillingFrequency = function( ) {
		var result = "";

		var entry = _.find( $scope.billingFrequencyOptions, function( o ) {
			if( o.value == $scope.project.terms.billingFrequency )
				return true;
			return false;
		} );
		result = entry ? entry.label : '';

		return result;
	};

	$scope.setHoursView = function( view ) {
		$scope.hoursViewType = view;

		$scope.initHoursPeriods( $scope.hours );
		$scope.handleHoursPeriodChanged( );
		if($scope.hoursViewType == 'weekly') {
		  $scope.initVacationHours($scope.startWeekDate, $scope.endWeekDate);
		}
		if($scope.hoursViewType == 'monthly') {
		  $scope.initVacationHours(moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD'));
		}
	};

	$scope.hoursViewType = 'monthly';
	$scope.selectedWeek = 0;
	$scope.thisWeekDayLabels = [ "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT", "Actual Hours", "Expected Hours", "Projected Hours" ];
	$scope.newHoursRecord = {};

	$scope.moment = moment;

	$scope.selectedMonthIndex = $scope.moment().month();
	$scope.selectedWeekIndex = 0;
	$scope.startWeekDate = $scope.moment( ).day( 0 ).format( 'YYYY-MM-DD' );
	$scope.endWeekDate = $scope.moment( ).day( 6 ).format( 'YYYY-MM-DD' );

	$scope.showWeek = function( ) {
		$scope.startWeekDate = $scope.moment( ).day( $scope.selectedWeekIndex ).format( 'YYYY-MM-DD' );
		$scope.endWeekDate = $scope.moment( ).day( $scope.selectedWeekIndex + 6 ).format( 'YYYY-MM-DD' );
		
		if($scope.hoursViewType === 'weekly') {
		  $scope.initVacationHours($scope.startWeekDate, $scope.endWeekDate);
		}

		var hoursQuery = {
			'project.resource': $scope.project.about,

			$and: [ {
				date: {
					$lte: $scope.endWeekDate
				}
			}, {
				date: {
					$gte: $scope.startWeekDate
				}
			} ]

		};

		AssignmentService.getAssignmentsByPeriod( "all", {
			project: {
				resource: $scope.project.about
			}
		} ).then( function( data ) {
			$scope.projectAssignments = data;
			$scope.updateOrganizedHours( );

			//Resources.query( 'hours', hoursQuery, {} ).then( function( result ) {
		    HoursService.query( hoursQuery, {} ).then( function( result ) {
				$scope.weekPersonHours = [ ];
				$scope.weekHours = [ ];
				$scope.weekPersonHours2 = [];

				if( result.count > 0 ) {
					$scope.thisWeekHours = result.members;
					//_.sortBy($scope.thisWeekHours, function(h) { return new Date(h.date); });

					// resolve persons to fill csv fields
					for( var i = 0; i < $scope.thisWeekHours.length; i++ ) {
						Resources.resolve( $scope.thisWeekHours[ i ].person );
					}

					var distinctRoles = [];
					var uniqPersons = _.pluck( _.pluck( $scope.thisWeekHours, 'person' ), 'resource' );
					var hoursStartEndDatesMap = {};

					for( var i = 0; i < $scope.projectAssignments.members.length; i++ ) {
						if( $scope.projectAssignments.members[ i ].endDate >= $scope.startWeekDate && $scope.projectAssignments.members[ i ].startDate < $scope.endWeekDate ) {
							uniqPersons.push( $scope.projectAssignments.members[ i ].person.resource );
							
							if (distinctRoles.indexOf($scope.projectAssignments.members[ i ].role.resource) == -1)
								distinctRoles.push($scope.projectAssignments.members[ i ].role.resource);
							
							if( !hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ] )
								hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ] = {
									role: $scope.projectAssignments.members[ i ].role ? $scope.projectAssignments.members[ i ].role.resource : null,
									hoursPerWeek: $scope.projectAssignments.members[ i ].hoursPerWeek,
									startDate: $scope.projectAssignments.members[ i ].startDate,
									endDate: $scope.projectAssignments.members[ i ].endDate
								};
							else {
								if( $scope.projectAssignments.members[ i ].startDate < hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].startDate )
									hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].startDate = $scope.projectAssignments.members[ i ].startDate;

								if( $scope.projectAssignments.members[ i ].endDate > hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].endDate )
									hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].endDate = $scope.projectAssignments.members[ i ].endDate;

								if( $scope.projectAssignments.members[ i ].hoursPerWeek > hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].hoursPerWeek )
									hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].hoursPerWeek = $scope.projectAssignments.members[ i ].hoursPerWeek;
							}
						}
					}

					uniqPersons = _.uniq( uniqPersons );

					for( var i = 0; i < uniqPersons.length; i++ ) {
						$scope.weekPersonHours.push( {
							person: {
								resource: uniqPersons[ i ]
							},
							role: hoursStartEndDatesMap[ uniqPersons[ i ] ] ? hoursStartEndDatesMap[ uniqPersons[ i ] ].role : null,
							hours: [ ],
							startDate: hoursStartEndDatesMap[ uniqPersons[ i ] ] ? hoursStartEndDatesMap[ uniqPersons[ i ] ].startDate : null,
							endDate: hoursStartEndDatesMap[ uniqPersons[ i ] ] ? hoursStartEndDatesMap[ uniqPersons[ i ] ].endDate : null,
							hoursPerWeek: hoursStartEndDatesMap[ uniqPersons[ i ] ] ? hoursStartEndDatesMap[ uniqPersons[ i ] ].hoursPerWeek : 0
						} );

						Resources.resolve( $scope.weekPersonHours[ i ].person );

						var personRecord = $scope.weekPersonHours[ i ];
						var roleIndex = distinctRoles.indexOf(personRecord.role);
						
						if ($scope.weekPersonHours2[roleIndex] == null)
							$scope.weekPersonHours2[roleIndex] = {
								role: { resource: $scope.weekPersonHours[i].role },
								hours: [ { totalHours: 0 }, { totalHours: 0 }, { totalHours: 0 }, { totalHours: 0 }, { totalHours: 0 }, { totalHours: 0 }, { totalHours: 0 } ],
								actualHours: 0,
								expectedHours: 0,
								projectedHours: 0,
								collapsed: true,
								persons: []
							};
						
						var roleInfo = $scope.weekPersonHours2[roleIndex];
						var role = _.find($scope.project.roles, function (role)
						{
							return roleInfo.role.resource && role._id == roleInfo.role.resource.substring(roleInfo.role.resource.lastIndexOf("/") + 1);
						});
						
						if (!role)
							continue;
						
						roleInfo.persons.push(personRecord);
						
						personRecord.actualHours = 0;
						personRecord.expectedHours = personRecord.hoursPerWeek;
						
						if (role.rate.type == "monthly")
							roleInfo.expectedHours = 180;
						else if (role.rate.type == "weekly")
							roleInfo.expectedHours = role.rate.fullyUtilized ? 45 : role.rate.hoursPerWeek;
						else if (role.rate.type == "hourly")
							roleInfo.expectedHours = role.rate.fullyUtilized ? 45 : role.rate.hoursPerMth * .25; // .25 == 12 / 48
						
						for( var k = 0; k < 7; k++ ) {
							personRecord.hours.push( {} );
							personRecord.hours[ k ].totalHours = 0;
							personRecord.hours[ k ].hoursEntries = [ ];

							var futureness = $scope.checkForFutureness( $scope.moment( $scope.startWeekDate ).add( 'days', k ).format( 'YYYY-MM-DD' ) );
							personRecord.hours[ k ].futureness = futureness;
							for( var j = 0; j < $scope.thisWeekHours.length; j++ ) {
								if( ( $scope.thisWeekHours[ j ].date == $scope.moment( $scope.startWeekDate ).day( k ).format( 'YYYY-MM-DD' ) ) && ( $scope.thisWeekHours[ j ].person.resource == uniqPersons[ i ] ) ) {
									personRecord.hours[ k ].hoursEntries.push( $scope.thisWeekHours[ j ] );
									personRecord.hours[ k ].totalHours += $scope.thisWeekHours[ j ].hours;
								}
							}
							
							personRecord.actualHours += personRecord.hours[k].totalHours;
							
							roleInfo.lastPersonInfo = personRecord;
							roleInfo.hours[k].totalHours += personRecord.hours[k].totalHours;
							roleInfo.actualHours += personRecord.hours[k].totalHours;
						}
						
						var remainingWorkdays = 0;
						var eDate = moment(personRecord.endDate);
						
						for (var d = moment(new Date()); d.weekday() < 6; d.add("1", "day"))
						{
							if (personRecord.endDate && eDate.diff(d, "days") < 0)
								break;
							
							remainingWorkdays++;
						}
							
						
						personRecord.projectedHours = personRecord.actualHours + personRecord.hoursPerWeek / 5 * remainingWorkdays;
						personRecord.capacity = personRecord.expectedHours - personRecord.actualHours <= remainingWorkdays * 9;
						
						roleInfo.projectedHours += personRecord.projectedHours;
						roleInfo.capacity = roleInfo.expectedHours - roleInfo.actualHours <= remainingWorkdays * 9;
					}
				}
			} );
		} );
	};
	
	$scope.showMonth = function( ) {
		var mmm = "";//$scope.moment.monthsShort($scope.selectedMonthIndex);
		var selectedDate = $scope.moment().month($scope.selectedMonthIndex);
		var daysInMonth = selectedDate.daysInMonth();
		$scope.thisMonthDayLabels = [ mmm + " 1-7", mmm + " 8-14", mmm + " 15-21", mmm + " 22-28" ];
		
		if (daysInMonth > 28)
			$scope.thisMonthDayLabels.push(mmm + " 29" + (daysInMonth > 29 ? "-" + daysInMonth : ""));
		
		$scope.thisMonthDayLabels.push("Actual Hours", "Expected Hours", "Projected Hours");
		
		$scope.startMonthDate = selectedDate.startOf("month").format( 'YYYY-MM-DD' );
		$scope.endMonthDate = selectedDate.endOf("month").format( 'YYYY-MM-DD' );
		
		if($scope.hoursViewType === 'monthly') {
		  $scope.initVacationHours($scope.startMonthDate, $scope.endMonthDate);
		}

		var hoursQuery = {
			'project.resource': $scope.project.about,

			$and: [ {
				date: {
					$lte: $scope.endMonthDate
				}
			}, {
				date: {
					$gte: $scope.startMonthDate
				}
			} ]

		};

		AssignmentService.getAssignmentsByPeriod( "all", {
			project: {
				resource: $scope.project.about
			}
		} ).then( function( data ) {
			$scope.projectAssignments = data;
			$scope.updateOrganizedHours( );

			HoursService.query(hoursQuery, {} ).then( function( result ) {
				$scope.monthPersonHours = [ ];
				$scope.weekHours = [ ];
				$scope.monthPersonHours2 = [];

				if( result.count > 0 ) {
					$scope.thisWeekHours = result.members;
					//_.sortBy($scope.thisWeekHours, function(h) { return new Date(h.date); });

					// resolve persons to fill csv fields
					for( var i = 0; i < $scope.thisWeekHours.length; i++ ) {
						Resources.resolve( $scope.thisWeekHours[ i ].person );
					}

					var distinctRoles = [];
					var uniqPersons = _.pluck( _.pluck( $scope.thisWeekHours, 'person' ), 'resource' );
					var hoursStartEndDatesMap = {};

					for( var i = 0; i < $scope.projectAssignments.members.length; i++ ) {
						if( $scope.projectAssignments.members[ i ].endDate >= $scope.startMonthDate && $scope.projectAssignments.members[ i ].startDate < $scope.endMonthDate ) {
							uniqPersons.push( $scope.projectAssignments.members[ i ].person.resource );
							
							if (distinctRoles.indexOf($scope.projectAssignments.members[ i ].role.resource) == -1)
								distinctRoles.push($scope.projectAssignments.members[ i ].role.resource);
							
							if( !hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ] )
								hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ] = {
									role: $scope.projectAssignments.members[ i ].role ? $scope.projectAssignments.members[ i ].role.resource : null,
									hoursPerWeek: $scope.projectAssignments.members[ i ].hoursPerWeek,
									startDate: $scope.projectAssignments.members[ i ].startDate,
									endDate: $scope.projectAssignments.members[ i ].endDate
								};
							else {
								if( $scope.projectAssignments.members[ i ].startDate < hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].startDate )
									hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].startDate = $scope.projectAssignments.members[ i ].startDate;

								if( $scope.projectAssignments.members[ i ].endDate > hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].endDate )
									hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].endDate = $scope.projectAssignments.members[ i ].endDate;

								if( $scope.projectAssignments.members[ i ].hoursPerWeek > hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].hoursPerWeek )
									hoursStartEndDatesMap[ $scope.projectAssignments.members[ i ].person.resource ].hoursPerWeek = $scope.projectAssignments.members[ i ].hoursPerWeek;
							}
						}
					}

					uniqPersons = _.uniq( uniqPersons );

					for( var i = 0; i < uniqPersons.length; i++ ) {
						$scope.monthPersonHours.push( {
							person: {
								resource: uniqPersons[ i ]
							},
							role: hoursStartEndDatesMap[ uniqPersons[ i ] ] ? hoursStartEndDatesMap[ uniqPersons[ i ] ].role : null,
							hours: [ ],
							startDate: hoursStartEndDatesMap[ uniqPersons[ i ] ] ? hoursStartEndDatesMap[ uniqPersons[ i ] ].startDate : null,
							endDate: hoursStartEndDatesMap[ uniqPersons[ i ] ] ? hoursStartEndDatesMap[ uniqPersons[ i ] ].endDate : null,
							hoursPerWeek: hoursStartEndDatesMap[ uniqPersons[ i ] ] ? hoursStartEndDatesMap[ uniqPersons[ i ] ].hoursPerWeek : 0
						} );

						var personRecord = $scope.monthPersonHours[ i ];
						var roleIndex = distinctRoles.indexOf(personRecord.role);
						
						if ($scope.monthPersonHours2[roleIndex] == null)
						{
							var hours = [ { totalHours: 0 }, { totalHours: 0 }, { totalHours: 0 }, { totalHours: 0 } ];
							
							if (daysInMonth > 28)
								hours.push({ totalHours: 0 })
							
							$scope.monthPersonHours2[roleIndex] = {
								role: { resource: $scope.monthPersonHours[i].role },
								hours: hours,
								actualHours: 0,
								expectedHours: 0,
								projectedHours: 0,
								collapsed: true,
								persons: []
							};
						}
						
						var roleInfo = $scope.monthPersonHours2[roleIndex];
						var role = _.find($scope.project.roles, function (role)
						{
							return roleInfo.role.resource && role._id == roleInfo.role.resource.substring(roleInfo.role.resource.lastIndexOf("/") + 1);
						});
						
						if (!role)
							continue;
						
						Resources.resolve( $scope.monthPersonHours[ i ].person );
						
						roleInfo.persons.push(personRecord);
						
						personRecord.actualHours = 0;
						personRecord.expectedHours = personRecord.hoursPerWeek * 4; // 4 == 48 / 12
						
						if (role.rate.type == "monthly")
							roleInfo.expectedHours = 180;
						else if (role.rate.type == "weekly")
							roleInfo.expectedHours = role.rate.fullyUtilized ? 180 : role.rate.hoursPerWeek * 4; // 4 == 48 / 12
						else if (role.rate.type == "hourly")
							roleInfo.expectedHours = role.rate.fullyUtilized ? 180 : role.rate.hoursPerMth;
						
						for( var k = 0; k < $scope.thisMonthDayLabels.length - 3; k++ ) { // 3 is the number of non-days columns
							personRecord.hours.push( {} );
							personRecord.hours[ k ].totalHours = 0;
							personRecord.hours[ k ].hoursEntries = [ ];

//							var futureness = $scope.checkForFutureness( $scope.moment( $scope.startMonthDate ).add( 'days', k ).format( 'YYYY-MM-DD' ) );
//							personRecord.hours[ k ].futureness = futureness;
							for( var j = 0; j < $scope.thisWeekHours.length; j++ ) {
								var date = new Date(Date.parse($scope.thisWeekHours[j].date));
								
								if ((date.getUTCDate() >= 1 + 7 * k && date.getUTCDate() <= 7 + 7 * k)
									&& ($scope.thisWeekHours[j].person.resource == uniqPersons[i])) {
									personRecord.hours[ k ].hoursEntries.push( $scope.thisWeekHours[ j ] );
									personRecord.hours[ k ].totalHours += $scope.thisWeekHours[ j ].hours;
								}
							}
							
							personRecord.actualHours += personRecord.hours[k].totalHours;
							
							roleInfo.lastPersonInfo = personRecord;
							roleInfo.hours[k].totalHours += personRecord.hours[k].totalHours;
							roleInfo.actualHours += personRecord.hours[k].totalHours;
						}
						
						var remainingWorkdays = 0;
						var eDate = moment.min(personRecord.endDate, moment($scope.endMonthDate));
						
						if (personRecord.endDate && eDate.diff(new Date(), "days") >= 0)
							for (var d = moment(new Date()); d.month() == eDate.month(); d.add("1", "day"))
								if (d.weekday() < 6)
									remainingWorkdays++;
						
						personRecord.projectedHours = personRecord.actualHours + personRecord.hoursPerWeek / 5 * remainingWorkdays;
						personRecord.capacity = personRecord.expectedHours - personRecord.actualHours <= remainingWorkdays * 9;
						
						roleInfo.projectedHours += personRecord.projectedHours;
						roleInfo.capacity = roleInfo.expectedHours - roleInfo.actualHours <= remainingWorkdays * 9;
					}
				}
			} );
		} );
	};

	
	$scope.checkForFutureness = function( date ) {
		//flux capacitor
		var a = moment( ).subtract( 'days', 1 );
		var b = moment( date );
		var diff = a.diff( b );

		var futureness;
		if( diff < 0 ) {
			futureness = true;
		} else {
			futureness = false;
		}
		return futureness;
	};

	$scope.loadExecAndPeople = function( cb ) {
	    var execLoaded = false;
	    var salesLoaded = false;
	    
	    var fields = {};
	    
		//Resources.query( 'people', execQuery, fields, function( result ) {
		People.query(execQuery, fields).then( function( result ) {
			$scope.execs = result;

			$scope.getExecutiveSponsor( );
			$scope.getExecutiveSponsorEmail( );
			
			execLoaded = true;
			
			if (execLoaded && salesLoaded && cb)
                 cb();
		} );
		//Resources.query( 'people', salesQuery, fields, function( result ) {
	   People.query(salesQuery, fields).then( function( result ) {
			$scope.sales = result;

			
			$scope.getSalesSponsor( );
			$scope.getSalesSponsorEmail( );
			
			salesLoaded = true;
			
			if (execLoaded && salesLoaded && cb)
			     cb();
			
		} );

	};
	$scope.dayFormatted = function( yyyymmdd, params ) {
		if( params ) {
			return moment( yyyymmdd ).format( params );
		}

		return moment( yyyymmdd ).format( "MMM D" );
	};

	$scope.currentWeek = function( ) {
		$scope.selectedWeekIndex = 0;
		$scope.showWeek( );
	};

	$scope.nextWeek = function( ) {
		$scope.selectedWeekIndex += 7;
		$scope.showWeek( );
	};

	$scope.prevWeek = function( ) {
		$scope.selectedWeekIndex -= 7;
		$scope.showWeek( );
	};
	
	$scope.currentMonth = function( ) {
		$scope.selectedMonthIndex = $scope.moment().month();
		$scope.showMonth();
	};
	
	$scope.nextMonth = function( ) {
		$scope.selectedMonthIndex++;
		$scope.showMonth();
	};

	$scope.prevMonth = function( ) {
		$scope.selectedMonthIndex--;
		$scope.showMonth();
	};
	/**
	 * Get Existing Project
	 */
	if( $scope.projectId ) {
		ProjectsService.getForEdit( $scope.projectId ).then( function( project ) {

			$scope.getAllRoleTypes( function( ) {
				$scope.project = project;
				cutDescription( $scope.project.description );
				$scope.handleProjectSelected( );
				$scope.updateHoursPersons( );
				$scope.initMonths( );

				if( $scope.projectTabId == '' ) {
					$scope.tabSelected( '/summary' );
				}

				reloadShortDesc( );
				
				$scope.loadExecAndPeople( function() {
				    $scope.$emit( 'project:loaded' );
				});
			} );
		} );
	}
	/**
	 * Default create a new project
	 */
	else {
		$scope.getAllRoleTypes( function( ) {
			$scope.project = ProjectsService.create( );
			$scope.handleProjectSelected( );

			$scope.loadExecAndPeople( function() {
			    $scope.$emit( 'project:loaded' );
			});
		} );
	}

	var reloadShortDesc = function( ) {
		$( '#desc-1' ).html( $scope.splittedDescription[ 0 ] );
		if( $scope.splittedDescription[ 1 ] ) {
			$( '#desc-2' ).html( $scope.splittedDescription[ 1 ] );
		}
		if( $scope.splittedDescription[ 2 ] ) {
			$( '#desc-3' ).html( $scope.splittedDescription[ 2 ] );
		}
		$( '#desc-3 div' ).css( 'display', 'inline' );
	};

	$scope.canDeleteProject = false;

	$scope.projectTabId = $state.params.tabId;

	if( $state.params && $state.params.tabId != '/edit' && $state.params.tabId && !$scope.activeTab[ $state.params.tabId ] ) {
		for( var tab in $scope.activeTab )
		$scope.activeTab[ tab ] = false;

		$scope.activeTab[ $state.params.tabId ] = true;
	}

	$scope.showDescription = false;

	$scope.switchDescription = function( value ) {
		$scope.showDescription = value;
		reloadShortDesc( );
	};

	$scope.showFullTerms = false;

	$scope.showTerms = function( value ) {
		$scope.showFullTerms = value;
	};

	$scope.csvData = null;
	$scope.hoursToCSV = {
		stringify: function( str ) {
			return '"' + str.replace( /^\s\s*/, '' ).replace( /\s*\s$/, '' )// trim spaces
			.replace( /"/g, '""' ) + // replace quotes with double quotes
			'"';
		},

		generate: function( ) {
			var project = $scope.project;
			var hours = [ ];

			if( $scope.hoursViewType == 'monthly' || $scope.hoursViewType == 'billings' || $scope.hoursViewType == 'customDates' ) {
				if( $scope.currentDisplayedHours ) {
					for( var i = 0; i < $scope.currentDisplayedHours.length; i++ ) {
						hours = hours.concat( $scope.currentDisplayedHours[ i ] );
					}
				}
			}

			if( $scope.hoursViewType == 'weekly' ) {
				if( $scope.weekPersonHours ) {
					hours = $scope.thisWeekHours;
				}
			}

			$scope.csvData = $scope.JSON2CSV( project, hours );
		},
		link: function( ) {
			return 'data:text/csv;charset=UTF-8,' + encodeURIComponent( $scope.csvData );
		}
	};

	$scope.inMonth = function( month, year ) {
		var nextMonth = month === 11 ? 0 : ( month + 1 ), nextYear = month === 11 ? ( year + 1 ) : year, startDay = new Date( year, month, 1 ), endDay = new Date( nextYear, nextMonth, 0 );

		// If the project start day is before the last day of this month
		// and its end date is after the first day of this month.
		var projectStarted = new Date( $scope.project.startDate ) <= endDay;
		var projectEnded = $scope.project.endDate && new Date( $scope.project.endDate ) <= startDay;
		var returnValue = projectStarted && !projectEnded;
		return returnValue;
	};

	$scope.getTimelineStartDate = function( offset ) {
		var result = new Date( );

		if( $scope.project ) {
			var today = new Date( );
			var projStart = new Date( $scope.project.startDate );
			// done or active
			if( projStart <= today ) {
				if( $scope.project.endDate ) {
					var projEnd = new Date( $scope.project.endDate );
					//done proj
					if( projEnd < today ) {
						result.setMonth( projEnd.getMonth( ) - 11 + offset );
					}
					// active proj
					else {
						result.setMonth( today.getMonth( ) - 5 + offset );
					}
				}
				// active proj
				else {
					result.setMonth( today.getMonth( ) - 5 + offset );
				}
			}
			// future proj
			else {
				result.setMonth( projStart.getMonth( ) + offset );
			}

			return result;
		}
	};

	$scope.getAbbreviation = function( role ) {
		if( $scope.roleGroups && role && role.type && $scope.roleGroups[ role.type.resource ] )
			return $scope.roleGroups[ role.type.resource ].abbreviation;

		return "";
	};

	$scope.getPersonTitle = function( role ) {
		if( $scope.roleGroups && role && role.type )
			return $scope.roleGroups[ role.type.resource ].title;

		return "";
	};
	$scope.isActiveMonth = function( offset ) {
		if( $scope.project ) {
			var startDate = $scope.getTimelineStartDate( offset );
			return $scope.inMonth( startDate.getMonth( ), startDate.getFullYear( ) );
		}
	};

	$scope.isCurrentMonth = function( offset ) {
		if( $scope.project ) {
			var startDate = $scope.getTimelineStartDate( offset );
			var today = new Date( );

			return startDate.getMonth( ) == today.getMonth( ) && startDate.getFullYear( ) == today.getFullYear( );
		}
	};

	$scope.isFutureActiveMonth = function( offset ) {
		if( $scope.project ) {
			var startDate = $scope.getTimelineStartDate( offset );

			var today = new Date( );

			return today < startDate;
		}
	};
	var monthNamesShort = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

	$scope.getMonthName = function( offset ) {
		if( $scope.project ) {
			var firstMonthDate = $scope.getTimelineStartDate( offset );
			var startDateMonth = firstMonthDate.getMonth( );
			if( startDateMonth > 11 ) {
				startDateMonth = startDateMonth - 12;
			}
			return monthNamesShort[ startDateMonth ];
		}
	};

	$scope.months = [ ];
	$scope.roleGroups = {};

	$scope.initMonths = function( ) {
		for( var i = 0; i < 12; i++ ) {
			var month = {
				name: $scope.getMonthName( i )
			};

			if( $scope.isCurrentMonth( i ) ) {
				month.current = true;
			} else {
				if( $scope.isActiveMonth( i ) ) {
					if( $scope.isFutureActiveMonth( i ) ) {
						month.future = true;
					} else {
						month.active = true;
					}
				}

			}

			if( month.current || month.future || month.active ) {
				$scope.months.push( month );
			}
		}
	};

    $scope.$on('project:loaded', function() {
        $scope.hideSpinner = true;
    });
    
	$scope.JSON2CSV = function( project, hours ) {
		var str = '';
		var line = '';

		console.log( 'hours:' + hours );

		//Print the header
		var head = [ 'Person', 'Role', 'Date', 'Hours', 'Description' ];
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

			line += $scope.hoursToCSV.stringify( record.person.name ) + ',';
			line += $scope.hoursToCSV.stringify( $scope.getPersonProjectRoles( record.person ) ) + ',';
			line += record.date + ',';
			line += record.hours + ',';

			line += $scope.hoursToCSV.stringify( record.description ) + ',';
			str += line + '\r\n';
		}
		return str;
	};

	$scope.setSentinel = function( ) {
		//Watch for model changes
		if( editMode ) {
			$scope.stopWatchingProjectChanges( );

			//Create a new watch
			$scope.sentinel = $scope.$watch( 'project', function( newValue, oldValue ) {
				//console.debug(JSON.stringify(oldValue) + ' changed to ' +
				// JSON.stringify(newValue));
				if( !$rootScope.formDirty && $scope.editMode ) {
					//Do not include anthing in the $meta property in the comparison
					if( oldValue.hasOwnProperty( '$meta' ) ) {
						var oldClone = Resources.deepCopy( oldValue );
						delete oldClone[ '$meta' ];
						oldValue = oldClone;
					}
					if( newValue.hasOwnProperty( '$meta' ) ) {
						var newClone = Resources.deepCopy( newValue );
						delete newClone[ '$meta' ];
						newValue = newClone;
					}

					//Text Angular seems to add non white space characters for some reason
					if( newValue.description ) {
						newValue.description = newValue.description.trim( );
					}
					if( oldValue.description ) {
						oldValue.description = oldValue.description.trim( );
					}

					var oldStr = JSON.stringify( oldValue );
					var newStr = JSON.stringify( newValue );

					if( oldStr != newStr ) {
						console.debug( 'project is now dirty' );
						$rootScope.formDirty = true;
						$rootScope.projectEdit = true;
						$rootScope.dirtySaveHandler = function( ) {
							return $scope.checkShiftDates( true );
						};
					}
				}

			}, true );
		}
	};
} ] );
