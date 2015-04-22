'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module( 'Mastermind.controllers.people' ).controller( 'ProfileCtrl', [ '$scope', '$state', '$stateParams', '$filter', 'Resources', 'People', 'AssignmentService', 'ProjectsService', 'TasksService', 'HoursService', 'ngTableParams', '$rootScope',
function( $scope, $state, $stateParams, $filter, Resources, People, AssignmentService, ProjectsService, TasksService, HoursService, TableParams, $rootScope ) {

	$scope.moment = moment;

	var UNSPECIFIED = CONSTS.UNSPECIFIED;

	$scope.projects = [ ];
	$scope.hoursTasks = [ ];
	$scope.execProjects = [ ];
	$scope.availableProjects = [ ];

	$scope.loadAvailableTasks = function( ) {
		TasksService.refreshTasks( ).then( function( tasks ) {
			_.each( tasks, function( t ) {
				$scope.hoursTasks.push( t );
			} );
		} );
	};

	$scope.loadAvailableTasks( );
	/**
	 * Load Role definitions to display names
	 */
	Resources.get( 'roles' ).then( function( result ) {
		var members = result.members;
		$scope.allRoles = members;

		var rolesMap = {};
		for( var i = 0; i < members.length; i++ ) {
			rolesMap[ members[ i ].resource ] = members[ i ];
		}

		// sorting roles by title
		$scope.allRoles.sort( function( a, b ) {
			var x = a.title ? a.title.toLowerCase( ) : '';
			var y = b.title ? b.title.toLowerCase( ) : '';
			return x < y ? -1 : x > y ? 1 : 0;
		} );

		// add unspecified item to roles dropdown
		$scope.allRoles.unshift( {
			'title': UNSPECIFIED
		} );

		$scope.rolesMap = rolesMap;

		$scope.getRoleName = function( resource ) {
			var ret = UNSPECIFIED;
			if( resource && $scope.rolesMap[ resource ] ) {
				ret = $scope.rolesMap[ resource ].title;
			}
			return ret;
		};

		$scope.getSecondaryRoleName = function (secondaryRole) {
		    if (secondaryRole) {
		        if (secondaryRole.title) {
		            return secondaryRole.title;
		        } else {
		            if (secondaryRole.resource) {
		                return $scope.getRoleName(secondaryRole.resource);
		            }
		        }
		    }
		};
	});

    $scope.getJobTitle = function(resource) {
        var ret = UNSPECIFIED;
        if (resource && $scope.titlesMap && $scope.titlesMap[resource]) {
            ret = $scope.titlesMap[resource].title;
        }
        return ret;
    };

    $scope.filterSecondaryRoles = function(role) {
            return role.resource !== profile.primaryRole.resource;
    };

    $scope.isPrimaryRole = function (role) {
        if ($scope.profile && $scope.profile.primaryRole) {
            return role.resource == $scope.profile.primaryRole.resource;
        } else {
            return false;
        }
    };

	/**
	 * Controls the edit state of teh profile form (an edit URL param can control
	 * this from a URL ref)
	 */
	$scope.editMode = $state.params.edit ? $state.params.edit : false;


	$scope.populateManagers = function( result ) {
		for( var i = 0; i < result.members.length; i++ ) {
            var manager = result.members[ i ];
            $scope.managers.push( {
                name: manager.name,
                resource: manager.resource
            } );
        }

        $scope.getSecurityInformation(function() {
            $scope.managers = _.sortBy( $scope.managers, function( manager ) {
        	   return manager.name;
            } );

        if( $scope.profile.manager ) {
        	$scope.profile.manager = _.findWhere( $scope.managers, {
                resource: $scope.profile.manager.resource
            } );
            $scope.$emit( 'profile:loaded' );
        } else
            $scope.$emit( 'profile:loaded' );
        });
	};

	$scope.getSecurityInformation = function(callback) {
	  $scope.userSecurityGroups = [];

	  if ($scope.canViewSecurityRoles()) {

		  Resources.get('securityRoles', { t: ( new Date( ) ).getMilliseconds( ) }).then(function(result) {
	        $scope.securityGroups = result.members;

	        Resources.get('userRoles', { t: ( new Date( ) ).getMilliseconds( ) }).then(function(userRoles) {
	          $scope.userRoles = userRoles.members;

	          var userRole = _.findWhere($scope.userRoles, { userId: $scope.profile.googleId });

	          if(userRole) {
	              $scope.userRole = userRole;
	              $scope.prepareUserRoles();
	              callback();
	          } else {
	            Resources.create('userroles', {userId: $scope.profile.googleId, roles: []}).then(function(result){
	                $scope.userRole = result;
	                $scope.updateUserRoles();
	                callback();
	            });
	          }
	        });
	      });
	  } else if (callback)
		  callback();

	};

	$scope.prepareUserRoles = function() {
      $scope.userSecurityGroups = _.filter($scope.securityGroups, function(securityGroup) {
        return _.findWhere($scope.userRole.roles, { resource: securityGroup.resource }) ? true : false;
      });

      $scope.initialUserGroups = [];
      _.extend($scope.initialUserGroups, $scope.userSecurityGroups);
	};

	$scope.updateUserRoles = function() {
	  Resources.get('userRoles').then(function(userRoles) {
          $scope.userRoles = userRoles.members;

          $scope.userRole = _.findWhere($scope.userRoles, { userId: $scope.profile.googleId });

          $scope.prepareUserRoles();
      });
	};

	$scope.removeUserRole = function(index) {
	  var removedGroup = $scope.userSecurityGroups[index];
	  var indexInGroups = $scope.securityGroups.indexOf(removedGroup).toString();
	  var selectValue = $('.select-user-groups').selectpicker('val');
	  var indexInSelect = selectValue.indexOf(indexInGroups);
	  selectValue.splice(indexInSelect, 1);
	  $scope.userSecurityGroups.splice(index, 1);
	  $('.select-user-groups').selectpicker('val', selectValue);
	  $('.select-user-groups').selectpicker('refresh');
	  $scope.userSecurityGroupsChanged(this);
	};

	$scope.removeSecondaryRole = function (index) {
	    var removedRole = $scope.profile.secondaryRoles[index];
	    var indexInGroups = $scope.profile.secondaryRoles.indexOf(removedRole).toString();
	    var selectValue = $('.select-secondary-roles').selectpicker('val');
	    var indexInSelect = selectValue.indexOf(indexInGroups);
	    selectValue.splice(indexInSelect, 1);
	    $scope.profile.secondaryRoles.splice(index, 1);
	    $('.select-secondary-roles').selectpicker('val', selectValue);
	    $('.select-secondary-roles').selectpicker('refresh');
	};

    $scope.userSecurityGroupsChanged = function($this) {
    	if($this) {
    		$scope.userSecurityGroups = $this.userSecurityGroups;
    	} else {
    		$scope.userSecurityGroups = this.userSecurityGroups;
    	}
    };

    $scope.setSecondaryRoles = function(isRefresh) {
        $scope.secondaryRoles = _.filter($scope.allRoles, function(role) {
            if ($scope.profile && $scope.profile.primaryRole && $scope.profile.primaryRole.resource == role.resource) {
                return false;
            }

            return true;
        });

        if (isRefresh) {
            $scope.profile.secondaryRoles = _.filter($scope.profile.secondaryRoles, function (secondaryRole) {
                if ($scope.profile && $scope.profile.primaryRole && $scope.profile.primaryRole.resource == secondaryRole.resource) {
                    return false;
                }

                return true;
            });

            setTimeout(function () {
                $(".select-secondary-roles").selectpicker('refresh');
            }, 10);
        }
    };

    $scope.primaryRoleChanged = function() {
        var isRefresh = true;
        $scope.setSecondaryRoles(isRefresh);
    };

	/**
	 * Populate the form with fetch profile information
	 */
	$scope.setProfile = function( person ) {
		$scope.profile = person;
		$scope.managers = [ ];

	    $scope.setSecondaryRoles();

		$scope.isManager = $scope.executivesAccess || $scope.hasManagementRights || $scope.adminAccess;
		var params = {};
		params.group = "Managers";
		Resources.refresh("people/bytypes/byGroups", params).then(
			function (result) {
				$scope.populateManagers(result);
			}
		);

		if(!$scope.profile.partTime) {
			$scope.profile.partTime = false;
		}

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

		    for (var i in $scope.profile.secondaryRoles) {
		        var secondaryRole = $scope.profile.secondaryRoles[i];
		        $scope.profile.secondaryRoles[i] = $scope.rolesMap[secondaryRole.resource];
		    };
		});

		//      $scope.skillsList = person.skills;
		//
		//      //Setup the skills table
		//      if(!$scope.skillsParams){
		//        $scope.initSkillsTable();
		//      }
		//      //Have skill just refresh
		//      else if($scope.skillsList){
		//        $scope.skillsParams.total($scope.skillsList.length);
		//        $scope.skillsParams.reload();
		//      }
		//      //I have no skill
		//      else{
		//        $scope.skillsParams.total(0);
		//        $scope.skillsParams.reload();
		//      }

		//Set checkbox states based on the groups
		var groups = person.groups;

		$scope.isExec = groups && $.inArray( 'Executives', groups ) !== -1;
		$scope.isManagement = groups && $.inArray( 'Management', groups ) !== -1;
		$scope.isSales = groups && $.inArray( 'Sales', groups ) !== -1;
		$scope.isProjectManagement = groups && $.inArray( 'Project Management', groups ) !== -1;

		$scope.canEditCapacity = $scope.executivesAccess || $scope.hasManagementRights || $scope.financeAccess;

		$scope.canSeeCapacity = $scope.canEditCapacity || $scope.profileId == $scope.me._id;

		var url = person.about + '/' + 'gplus';

		Resources.get( url ).then( function( result ) {
			$scope.gplusProfile = result;
			//gapi.person.go();
		} );

		//Check if you can add hours
		if( $scope.adminAccess || $scope.me.about === $scope.profile.about ) {
			$scope.canAddHours = true;
		}
	};

	/**
	 * In edit mode add/removed a group from the profile when the user checked or
	 * unchecked a group
	 *
	 */
	$scope.handleGroupChange = function( ev, group ) {
		//Is the group checked or unchecked
		var elem = ev.currentTarget;
		var checked = elem.checked;

		//If checked add the group to the profile
		if( checked ) {
			if( !$scope.profile.groups ) {
				$scope.profile.groups = [ ];
			}
			$scope.profile.groups.push( group );
		}
		//Remove the group from the profile
		else {
			var arr = $scope.profile.groups ? $scope.profile.groups : [ ], ax;
			while( ( ax = arr.indexOf( group ) ) !== -1 ) {
				arr.splice( ax, 1 );
			}
		}
	};

	/**
	 * Set the profile view in edit mode
	 */
	$scope.edit = function( ) {
		Resources.refresh( 'people/' + $scope.profileId ).then( function( person ) {
			$scope.setProfile( person );
			$scope.editMode = true;
			$(".select-user-groups").selectpicker();
			$(".select-secondary-roles").selectpicker();
			$(".select-secondary-roles").selectpicker('refresh');
		} );
	};

	/**
	 * Set the profile view in edit mode
	 */
	$scope.cancel = function( ) {
		Resources.get( 'people/' + $scope.profileId ).then( function( person ) {
			$scope.setProfile( person );
			$scope.editMode = false;
		} );
	};

    $scope.errors = [];

	/**
	 * Save the user profile changes
	 */
	$scope.save = function( ) {
		var profile = $scope.profile;

		if( !profile.primaryRole || !profile.primaryRole.resource ) {
			profile.primaryRole = null;
		}

		if( profile.manager ) {
			profile.manager = {
				resource: profile.manager.resource,
				name: _.isObject(profile.manager.name) ? profile.manager.name.fullName : profile.manager.name
			};
		};

		// hell with string representation of boolean field
		if( profile.isActive == true || profile.isActive === 'true') {
		  profile.isActive = 'true';
		} else {
		  profile.isActive = 'false';
		}

	    // correct secondary roles
		for(var i in profile.secondaryRoles) {
		    var secondaryRole = profile.secondaryRoles[i];
		    profile.secondaryRoles[i] = { name: secondaryRole.title, resource: secondaryRole.resource };
		}

		// check if security groups needs to be updated
		var rolesNeedsToBeUpdated = false;
		var securityGroups = _.map($scope.userSecurityGroups, function(userSecurityGroup){
		  return { name: userSecurityGroup.name, resource: userSecurityGroup.resource };
		});

		if($scope.initialUserGroups) {
		  if(securityGroups.length != $scope.initialUserGroups.length) {
            rolesNeedsToBeUpdated = true;
          } else {
            for(var i = 0; i < securityGroups.length; i++) {
              if(!_.findWhere($scope.initialUserGroups, {name: securityGroups[i].name})) {
                rolesNeedsToBeUpdated = true;
                break;
              }
            }
          }
		}

		if(rolesNeedsToBeUpdated) {
          $scope.userRole.roles = securityGroups;
          Resources.update($scope.userRole).then(function(result) {
            if(!result.ok) {
              console.log(result);
              $scope.errors.push("While you were working, this document was updated.  Please refresh the page to see the latest changes.");
            }
            $scope.userRole = result;

            $scope.saveProfile(profile);
          });
        } else {
          $scope.saveProfile(profile);
        }
	};


    $scope.saveProfile = function(profile) {
        $scope.hideProfileSpinner = false;
        delete profile.permissionsMap;
      Resources.update( profile ).then( function( person ) {
            var fields = {
                resource: 1,
                name: 1,
                familyName: 1,
                givenName: 1,
                primaryRole: 1,
                thumbnail: 1,
                jobTitle: 1,
                secondaryRoles: 1
            };
            var params = {
                'fields': fields
            };
            var key = 'people?' + JSON.stringify( params );
            delete localStorage[ key ];

            var getBack = localStorage[ key ];

            Resources.refresh( 'people/' + $scope.profileId ).then( function( person ) {
              $scope.setProfile( person );
              $scope.editMode = false;
              $scope.hideProfileSpinner = true;
              //If you updated your self refresh the local copy of me
              if( $scope.me.about === profile.about ) {
            	  $scope.hideProfileSpinner = false;
                Resources.refresh( 'people/me' ).then( function( me ) {
                    $scope.me = me;
                    $scope.hideProfileSpinner = true;
                } );
              }
            } );

      } );
    };

	$scope.monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

	$scope.initHours = function( isReinit, cb ) {
		var projectHours = [ ];
		$scope.projectHours = [ ];
		$scope.hoursPeriods = [ ];
		$scope.selectedHoursPeriod = -1;

		var now = moment( );

		//Query all hours against the project
		var hoursQuery = {
			'person.resource': $scope.profile.about
		};
		//All Fields
		var fields = {};
		var sort = {
			'created': 1
		};

		//Resources.query( 'hours', hoursQuery, fields, function( hoursResult ) {
	    HoursService.query(hoursQuery, fields).then(function( hoursResult ) {
			$scope.hours = hoursResult.members;
			$scope.initHoursPeriods( $scope.hours );
			$scope.hasHours = $scope.hours.length > 0;

			for( var i = 0; i < $scope.hours.length; i++ ) {
				var hour = $scope.hours[ i ];
				if( hour.task && hour.task.resource ) {
					var taskRes = $scope.hours[ i ].task.resource;
					var task = _.findWhere( $scope.hoursTasks, {
						resource: taskRes
					} );

					var taskName = "Unknown";
					if( task ) {
						taskName = task.name;
					}
					$scope.hours[ i ].task.name = taskName;
				}
			}

			var projects = _.pluck( $scope.hours, 'project' );
			projects = _.filter( projects, function( p ) {
				if( p ) {
					return true;
				}
			} );
			projects = _.pluck( projects, 'resource' );
			projects = _.uniq( projects );

			// filter array to avoid empty entries
			projects = _.filter( projects, function( p ) {
				return p ? true : false;
			} );

			var currentMonth = new Date( ).getMonth( );
			var currentYear = new Date( ).getFullYear( );
			var prHours = [];

			$scope.projectHours = [];

			ProjectsService.getProjectsByIds(projects).then(function(resultProjects){
				resultProjects = resultProjects.members || [];

				for( var projCounter = 0; projCounter < resultProjects.length; projCounter++ ) {

					var projectHour = {
						projectURI: resultProjects[projCounter].about,
						project: resultProjects[projCounter],
						hours: [ ],
						collapsed: false,
						icon: $scope.projectStateIcon( resultProjects[projCounter] ),
						totalHours: 0
					};
					var taskHour = null;
					var tasksMap = {};
					var tasksHoursMap = {
						hours: [ ],
						show: true
					};

					for( var hoursCounter = 0; hoursCounter < $scope.hours.length; hoursCounter++ ) {
						taskHour = null;
						var hoursData = $scope.hours[ hoursCounter ];
						var tmpD = hoursData.date.split( '-' );
						var hoursMonth = parseInt( tmpD[ 1 ] ) - 1;
						var hoursYear = parseInt( tmpD[ 0 ] );
						var timeValue = 0;

						if( hoursData.project && hoursData.project.resource == resultProjects[projCounter].about ) {
							timeValue = hoursData.hours;
							projectHour.totalHours += timeValue;
							projectHour.hours.push( {
								hour: hoursData,
								show: ( currentMonth === hoursMonth && currentYear === hoursYear ),
								value: timeValue
							} );
						} else if( hoursData.task ) {
							timeValue = hoursData.hours;
							if( !tasksMap[ hoursData.task.resource ] ) {
								tasksMap[ hoursData.task.resource ] = hoursData.task;
							}
							if( !tasksHoursMap[ hoursData.task.resource ] ) {
								tasksHoursMap[ hoursData.task.resource ] = [ ];
								tasksHoursMap[ hoursData.task.resource ].totalHours = 0;
							}
							tasksHoursMap[ hoursData.task.resource ].totalHours += timeValue;
							tasksHoursMap[ hoursData.task.resource ].push( {
								hour: hoursData,
								show: ( currentMonth == hoursMonth && currentYear == hoursYear )
							} );
						}
					}

					projectHour.hours.sort( function( h1, h2 ) {
						if( new Date( h1.hour.date ) > new Date( h2.hour.date ) ) {
							return -1;
						} else if( new Date( h1.hour.date ) < new Date( h2.hour.date ) ) {
							return 1;
						}
						return 0;
					} );

					prHours.push( projectHour );
					$scope.taskHours = [ ];

					for( var taskResource in tasksMap ) {
						tasksHoursMap[ taskResource ].sort( function( h1, h2 ) {
							if( new Date( h1.hour.date ) > new Date( h2.hour.date ) ) {
								return -1;
							} else if( new Date( h1.hour.date ) < new Date( h2.hour.date ) ) {
								return 1;
							}
							return 0;
						} );
						$scope.taskHours.push( _.extend( {
							hours: tasksHoursMap[ taskResource ],
							totalHours: tasksHoursMap[ taskResource ].totalHours
						}, tasksMap[ taskResource ] ) );
					}


				}


				$scope.projectHours = prHours;

				if( !isReinit ) {
					$scope.currentWeek( );
				} else {
					$scope.showWeek( );
				}

				if( cb )
					cb( );


			});

			/*
			for( var projCounter = 0; projCounter < projects.length; projCounter++ ) {



				var project = ProjectsService.getForEditByURI( projects[ projCounter ] ).then( function( result ) {

					var projectHour = {
						projectURI: result.about,
						project: result,
						hours: [ ],
						collapsed: false,
						icon: $scope.projectStateIcon( result ),
						totalHours: 0
					};
					var taskHour = null;
					var tasksMap = {};
					var tasksHoursMap = {
						hours: [ ],
						show: true
					};

					for( var hoursCounter = 0; hoursCounter < $scope.hours.length; hoursCounter++ ) {
						taskHour = null;
						var hoursData = $scope.hours[ hoursCounter ];
						var tmpD = hoursData.date.split( '-' );
						var hoursMonth = parseInt( tmpD[ 1 ] ) - 1;
						var hoursYear = parseInt( tmpD[ 0 ] );
						var timeValue = 0;

						if( hoursData.project && hoursData.project.resource == result.about ) {
							timeValue = hoursData.hours;
							projectHour.totalHours += timeValue;
							projectHour.hours.push( {
								hour: hoursData,
								show: ( currentMonth === hoursMonth && currentYear === hoursYear ),
								value: timeValue
							} );
						} else if( hoursData.task ) {
							timeValue = hoursData.hours;
							if( !tasksMap[ hoursData.task.resource ] ) {
								tasksMap[ hoursData.task.resource ] = hoursData.task;
							}
							if( !tasksHoursMap[ hoursData.task.resource ] ) {
								tasksHoursMap[ hoursData.task.resource ] = [ ];
								tasksHoursMap[ hoursData.task.resource ].totalHours = 0;
							}
							tasksHoursMap[ hoursData.task.resource ].totalHours += timeValue;
							tasksHoursMap[ hoursData.task.resource ].push( {
								hour: hoursData,
								show: ( currentMonth == hoursMonth && currentYear == hoursYear )
							} );
						}
					}

					projectHour.hours.sort( function( h1, h2 ) {
						if( new Date( h1.hour.date ) > new Date( h2.hour.date ) ) {
							return -1;
						} else if( new Date( h1.hour.date ) < new Date( h2.hour.date ) ) {
							return 1;
						}
						return 0;
					} );

					prHours.push( projectHour );
					$scope.taskHours = [ ];

					for( var taskResource in tasksMap ) {
						tasksHoursMap[ taskResource ].sort( function( h1, h2 ) {
							if( new Date( h1.hour.date ) > new Date( h2.hour.date ) ) {
								return -1;
							} else if( new Date( h1.hour.date ) < new Date( h2.hour.date ) ) {
								return 1;
							}
							return 0;
						} );
						$scope.taskHours.push( _.extend( {
							hours: tasksHoursMap[ taskResource ],
							totalHours: tasksHoursMap[ taskResource ].totalHours
						}, tasksMap[ taskResource ] ) );
					}

					if( !isReinit ) {
						$scope.currentWeek( );
					} else {
						$scope.showWeek( );
					}

					if( cb )
						cb( );
				} );



			}
			$scope.projectHours = prHours;
			*/

		}, sort );
	};

	$scope.initHoursPeriods = function( hours ) {
		$scope.hoursPeriods = [ ];
		$scope.selectedHoursPeriod = $scope.selectedMonth;

		var minDate = null;
		var maxDate = null;

		var currentDate;

		for( var i = 0; i < hours.length; i++ ) {
			var tmpD = hours[ i ].date.split( '-' );

			currentDate = new Date( parseInt( tmpD[ 0 ] ), parseInt( tmpD[ 1 ] ) - 1, parseInt( tmpD[ 2 ] ) );

			if( !minDate || minDate > currentDate ) {
				minDate = new Date( currentDate );
			}
			if( !maxDate || maxDate <= currentDate ) {
				maxDate = new Date( currentDate );
			}
		}

		var ifAddYear = minDate && maxDate && minDate.getFullYear( ) != maxDate.getFullYear( );

		currentDate = new Date( minDate );
		var o = null;
		var hPeriods = [];
		while( currentDate <= maxDate ) {
			o = {
				name: $scope.monthNames[      currentDate.getMonth( ) ],
				value: currentDate.getMonth( )
			};
			hPeriods.push( o );

			if( ifAddYear ) {
				o.name = o.name + ', ' + currentDate.getFullYear( );
				o.value = currentDate.getFullYear( ) + '-' + o.value;
			}
			currentDate = new Date( currentDate );

			currentDate.setDate( 1 );
			currentDate.setMonth( currentDate.getMonth( ) + 1 );
		}
		$scope.hoursPeriods = hPeriods;

	};

	$scope.setCurrentMonth = function( month ) {
		$scope.selectedHoursPeriod = month;
		$scope.handleHoursPeriodChanged( );
	};

	$scope.setCustomPeriod = function( startDate, endDate ) {
		$scope.customHoursStartDate = startDate;
		$scope.customHoursEndDate = endDate;

		$scope.selectedHoursPeriod = -1;
		$scope.handleHoursPeriodChanged( );
	};

	$scope.handleHoursPeriodChanged = function( ) {
		var d;

		for( var i = 0; $scope.projectHours && i < $scope.projectHours.length; i++ ) {
			var projHour = $scope.projectHours[ i ];
			projHour.totalHours = 0;

			for( var j = 0; j < projHour.hours.length; j++ ) {
				var hour = projHour.hours[ j ];
				var hoursMonth = moment( hour.hour.date ).month() ;

				if( $scope.selectedHoursPeriod > -1 )
					hour.show = this.selectedHoursPeriod == hoursMonth;
				else if( $scope.customHoursStartDate && $scope.customHoursEndDate ) {
					d = Util.alignDate( new Date( hour.hour.date ) );

					hour.show = d <= Util.alignDate( new Date( $scope.customHoursEndDate ) ) && d >= Util.alignDate( new Date( $scope.customHoursStartDate ) );
				}
				if( hour.show ) {
					projHour.totalHours += hour.hour.hours;
				}
			}
		}

		for( i = 0; $scope.taskHours && i < $scope.taskHours.length; i++ ) {
			projHour = $scope.taskHours[ i ];
			projHour.totalHours = 0;

			for( j = 0; j < projHour.hours.length; j++ ) {
				hour = projHour.hours[ j ];
				hoursMonth = new Date( hour.hour.date ).getMonth( );

				if( $scope.selectedHoursPeriod > -1 )
					hour.show = this.selectedHoursPeriod == hoursMonth;
				else if( $scope.customHoursStartDate && $scope.customHoursEndDate ) {
					d = Util.alignDate( new Date( hour.hour.date ) );

					hour.show = d < Util.alignDate( new Date( $scope.customHoursEndDate ) ) && d >= Util.alignDate( new Date( $scope.customHoursStartDate ) );
				}

				if( hour.show ) {
					projHour.totalHours += hour.hour.hours;
				}
			}
		}
	};

	$scope.isEmptyForSelectedMonth = function( projectHour ) {
		for( var i = 0; i < projectHour.hours.length; i++ ) {
			if( projectHour.hours[ i ].show ) {
				return false;
			}
		}
		return true;
	};

	// move method to determine hours widget mode from hours widget
	$scope.isDisplayedWeek = function( ) {
		return $scope.mode == 'month' && $scope.subMode == 'weekly' || $scope.mode == 'week';
	};

	$scope.projectIcon = function( projectResource ) {
		var iconObject = _.findWhere( $scope.projectIcons, {
			resource: projectResource
		} );
		return iconObject ? iconObject.icon : '';
	};

	/**
	 * Get the Profile
	 */
	$scope.initProfile = function( ) {
		$scope.profileId = $stateParams.profileId;

		Resources.get( 'people/' + $scope.profileId ).then( function( person ) {
			$scope.setProfile( person );

			ProjectsService.getUnfinishedProjects( function( result ) {
				$scope.ongoingProjects = result.data;
				//console.log("main.js ongoingProjects:", $scope.ongoingProjects);
				$scope.availableProjects = $scope.availableProjects.concat( result.data );

				ProjectsService.getMyCurrentProjects( person ).then( function( myCurrentProjects ) {
					var myProjects = myCurrentProjects.data;

					$scope.availableProjects = $scope.availableProjects.concat( myProjects );

					$scope.activeProjectsCount = 0;
					for( var m = 0; m < myProjects.length; m++ ) {
						var myProj = myProjects[ m ];

						console.log("project state", ProjectsService.getProjectState( myProj ));

						if( ProjectsService.getProjectState( myProj ) == 'Active' ) {
							$scope.activeProjectsCount++;

							console.log("active projects", $scope.activeProjectsCount);
						}

						var found = undefined;
						myProj.title = myProj.customerName + ': ' + myProj.name;
						$scope.projects.push( myProj );

						for( var n = 0; n < $scope.ongoingProjects.length; n++ ) {
							var proj = $scope.ongoingProjects[ n ];
							if( proj.resource === myProj.resource ) {
								$scope.ongoingProjects.splice( n, 1 );
								break;
							}
						}

						//Get project where person is a executive sponsor
						//without duplicates - when the person is a exec and assign to project roles simultaneously.
						if( myProj.executiveSponsor && myProj.executiveSponsor.resource === 'people/' + $scope.profileId &&
							!_.findWhere( $scope.execProjects, {resource : myProj.resource})) {
							$scope.execProjects.push( myProj );
						}
					};

					function compare( a, b ) {
						var titleA = a.customerName + ': ' + a.name;
						var titleB = b.customerName + ': ' + b.name;
						if( titleA < titleB ) {
							return -1;
						}
						if( titleA > titleB ) {
							return 1;
						}
						return 0;
					}


					$scope.ongoingProjects.sort( compare );
					$scope.ongoingProjects.reverse( );
					while( $scope.ongoingProjects.length > 0 ) {
						var nextProj = $scope.ongoingProjects.pop( );
						nextProj.title = nextProj.customerName + ': ' + nextProj.name;
						$scope.projects.push( nextProj );
					}

                    $scope.loadCurrentAssignments(person);

					$scope.initHours( );
				} );
			} );
		} );
	};

	$scope.loadCurrentAssignments = function(person) {
	  AssignmentService.getMyCurrentAssignments( person ).then( function( assignments ) {
                $scope.assignments = assignments;

                console.log("Version: 9/10/2014");
                console.log("getMyCurrentAssignments before cut: assignments.length", assignments.length);

                var k = 0;
                var found = false;

                for( k = $scope.assignments.length - 1; k >= 0; k-- ) {
                    found = false;

                    found = _.find( $scope.availableProjects, function( p ) {
                        return p.resource == $scope.assignments[ k ].project.resource;
                    } );
                    if( !found )
                        $scope.assignments.splice( k, 1 );
                };

                $scope.myAssignments = AssignmentService.getActualAssignmentsForPerson($scope.assignments, $scope.profile);
                $scope.hasAssignments =  $scope.myAssignments.length > 0;

                console.log("getMyCurrentAssignments after cut: assignments.length", assignments.length);

                if( $scope.hasAssignments ) {
                    // Project Params
                    var params = {
                        page: 1, // show first page
                        count: 10, // count per page
                        sorting: {
                            startDate: 'asc' // initial sorting
                        }
                    };
                    $scope.tableParams = new TableParams( params, {
                        counts: [ ],
                        total: $scope.assignments.length, // length of data
                        getData: function( $defer, params ) {
                            var start = ( params.page( ) - 1 ) * params.count( ), end = params.page( ) * params.count( ),

                            // use build-in angular filter
                            orderedData = params.sorting( ) ? $filter('orderBy')( $scope.assignments, params.orderBy( ) ) : $scope.assignments, ret = orderedData.slice( start, end );

                            $defer.resolve( ret );
                        }
                    } );

                    $scope.hoursRateValue = AssignmentService.getAssignmentsHoursRate( $scope.myAssignments );
                    $scope.hoursRateFromProjects = Math.round( 100 * $scope.hoursRateValue / CONSTS.HOURS_PER_WEEK );
                }
            } );
	};

	$scope.initProfile( );

	$scope.isCurrentProject = function( endDate ) {
		var date = new Date( endDate );
		var currentDate = new Date( );
		if( date.getTime( ) < currentDate.getTime( ) ) {
			return false;
		}
		return true;
	};

	// check for permissions
	$scope.canEditPersonnelData = function() {
		return $rootScope.hasPermissions(CONSTS.EDIT_PERSONNEL_DATA);
	};

	// check for permissions
	$scope.canEditOtherPeopleHours = function() {
		return $rootScope.hasPermissions(CONSTS.EDIT_HOURS_PERMISSION);
	};

	$scope.canViewSecurityRoles = function() {
		return $rootScope.hasPermissions(CONSTS.VIEW_SECURITY_ROLES);
	};

    $scope.canViewSecondaryRoles = function() {
        if ($scope.isMe()) {
            return $rootScope.hasPermissions(CONSTS.VIEW_MY_SECONDARY_ROLE);
        } else {
            return $rootScope.hasPermissions(CONSTS.VIEW_OTHERS_SECONDARY_ROLE);
        }
    };

    $scope.canViewPrimaryRole = function() {
        if ($scope.isMe()) {
            return $rootScope.hasPermissions(CONSTS.VIEW_MY_ROLE_TITLE);
        } else {
            return $rootScope.hasPermissions(CONSTS.VIEW_OTHERS_ROLE_TITLE);
        }
    };

    $scope.canEditRolesTitles = function() {
        return $rootScope.hasPermissions(CONSTS.EDIT_ROLES_TITLES);
    };

    $scope.isMe = function() {
        return $scope.profileId == $scope.me._id;
    };

    $scope.canViewPublicPersonnelData = function() {
        if ($scope.isMe()) {
            return $rootScope.hasPermissions(CONSTS.VIEW_MY_PUBLIC_PERSONNELDATA);
        } else {
            return $rootScope.hasPermissions(CONSTS.VIEW_OTHERS_PUBLIC_PERSONNELDATA);
        }
    };

    $scope.canViewPrivatePersonnelData = function () {
        if ($scope.isMe()) {
            return $rootScope.hasPermissions(CONSTS.VIEW_MY_PRIVATE_PERSONNELDATA);
        } else {
            return $rootScope.hasPermissions(CONSTS.VIEW_OTHERS_PRIVATE_PERSONNELDATA);
        }
    };

    $scope.canEditPhoneSkypeJazz = function() {
        if ($scope.isMe()) {
            return $rootScope.hasPermissions(CONSTS.EDIT_MY_PROFILE);
        } else {
            return $rootScope.hasPermissions(CONSTS.EDIT_PROFILE);
        }
    };

    $scope.canViewPermissions = function() {
        if ($scope.isMe()) {
            return $rootScope.hasPermissions(CONSTS.VIEW_MY_SECURITY_ROLES);
        } else {
            return $rootScope.hasPermissions(CONSTS.VIEW_OTHERS_SECURITY_ROLES);
        }
    };

    $scope.canEditSecurityRoles = function() {
        return $rootScope.hasPermissions(CONSTS.EDIT_PROFILE_SECURITY_ROLES);
    };

    $scope.canSeeOnlyBasicProps = function() {
        var can = !$scope.canViewPermissions() &&
            !$scope.canViewSecondaryRoles() &&
            !$scope.canViewPrimaryRole() &&
            !$scope.canViewPublicPersonnelData();

        return can;
    };

    $scope.canEditOnlyBasicProps = function () {
        var can = !$scope.canEditSecurityRoles() &&
            !$scope.canEditRolesTitles() &&
            !$scope.canEditPersonnelData();

        return can;
    };

	///////////Profile Hours/////////
	$scope.newHoursRecord = {};

	/**
	 * Add a new Hours Record to the server
	 */
	$scope.addHours = function( ) {
		//Set the person context
		$scope.newHoursRecord.person = {
			resource: $scope.profile.about
		};

		//if( !$scope.newHoursRecord.description ) {
		//	$scope.newHoursRecord.description = 'No Description Entered';
		//}

		Resources.create( 'hours', $scope.newHoursRecord ).then( function( ) {
			$scope.initHours( );
			$scope.newHoursRecord = {};
		} );
	};

	/**
	 * Delete an hours instance
	 */
	$scope.deleteHours = function( hoursRecord ) {
		Resources.remove( hoursRecord.resource ).then( function( ) {
			var projectRecord = _.findWhere( $scope.projectHours, {
				projectURI: hoursRecord.project.resource
			} );
			for( var i = 0; i < projectRecord.hours.length; i++ ) {
				if( projectRecord.hours[ i ].hour.resource == hoursRecord.resource ) {
					projectRecord.hours.splice( i, 1 );

					if( projectRecord.hours.length == 0 ) {
						for( var j = 0; j < $scope.projectHours.length; j++ ) {
							if( $scope.projectHours[ j ].projectURI == projectRecord.projectURI ) {
								$scope.projectHours.splice( j, 1 );
							}
						}
					}
				}
			}
		} );
	};

	$scope.getPersonName = function(person, isSimply, isFirst) {
		return Util.getPersonName(person, isSimply, isFirst);
	};

	$scope.handleHoursTypeChanged = function( type ) {
		if( type === 'task' && $scope.newHoursRecord.project ) {
			delete $scope.newHoursRecord.project;
		} else if( type === 'project' && $scope.newHoursRecord.task ) {
			delete $scope.newHoursRecord.task;
		}
	};

	$scope.setHoursView = function( view ) {
		$scope.hoursViewType = view;
		if( view === 'weekly' ) {
			$scope.currentWeek( );
		}
	};

	$scope.hoursViewType = 'weekly';
	$scope.selectedWeekIndex = 0;
	$scope.selectedMonth = $scope.moment().month();
	$scope.thisWeekDayLabels = [ 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' ];
	$scope.newHoursRecord = {};

	$scope.startWeekDate = $scope.moment( ).day( 0 ).format( 'YYYY-MM-DD' );
	$scope.endWeekDate = $scope.moment( ).day( 6 ).format( 'YYYY-MM-DD' );

	$scope.dayFormatted = function( yyyymmdd, params ) {
		if( params ) {
			return moment( yyyymmdd ).format( params );
		}
		return moment( yyyymmdd ).format( 'MMM D' );
	};

	$scope.currentWeek = function( ) {
		$scope.selectedWeekIndex = 0;
		if( $rootScope.defaultHoursWeekShiftedBack ) {
			$scope.selectedWeekIndex = -7;
		}
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

	$scope.$on( 'hours:backInTime', function( ) {
		$scope.prevWeek( );
	} );

	$scope.$on( 'hours:forwardInTime', function( ) {
		$scope.nextWeek( );
	} );

	$scope.$on( 'hours:showToday', function( ) {
		$scope.selectedWeekIndex = 0;
		$scope.showWeek( );
	} );

	$scope.$on( 'hours:selectedNew', function( event, day ) {
		// todo: perform a bunch of db requests on each click on UI: disable it
		//$scope.recalculateCircle( day );
	} );

	$scope.weekHoursByProject = [ ];
	$scope.weekHoursByTask = [ ];

	$scope.showWeek = function( ) {
		$scope.totalMonthHours = 0;
		$scope.startWeekDate = $scope.moment( ).day( $scope.selectedWeekIndex ).format( 'YYYY-MM-DD' );
		$scope.endWeekDate = $scope.moment( ).day( $scope.selectedWeekIndex + 6 ).format( 'YYYY-MM-DD' );
		$scope.selectedMonth = moment( $scope.startWeekDate ).day(1).month(); //Get month by the first day of the workweek.

		var profileWeekHours = [ ];

		for( var i = 0; $scope.hours && i < $scope.hours.length; i++ ) {
			var hour = $scope.hours[ i ];
			var date = moment( hour.date );
			var start = moment( $scope.startWeekDate );
			var end = moment( $scope.endWeekDate );
			if( $scope.selectedMonth === date.month() ) {
				$scope.totalMonthHours += hour.hours;
			}

			if( ( date.isAfter( start ) || date.isSame( start ) ) && ( date.isBefore( end ) || date.isSame( end ) ) ) {
				profileWeekHours.push( hour );
			}
		}

		$scope.totalWeekHours = 0;
		_.each( profileWeekHours, function( element ) {
			$scope.totalWeekHours += parseFloat( element.hours );
		} );

		$scope.initPercentageCircle( );

		var weekHoursByProject = [ ];
		var weekHoursByTask = [ ];

		// filtering hours entries by project and task
		for( i = 0; i < profileWeekHours.length; i++ ) {
			var weekHour = profileWeekHours[ i ];
			var filteredHoursByProject = {};
			if( weekHour.project ) {
				filteredHoursByProject = _.filter( weekHoursByProject, function( h ) {
					return h.project.resource == weekHour.project.resource;
				} );
				if( filteredHoursByProject.length == 0 ) {
					var weekHourByProject = {
						project: weekHour.project,
						hours: [ weekHour ]
					};
					Resources.resolve( weekHourByProject.project );
					weekHoursByProject.push( weekHourByProject );
				} else {
					filteredHoursByProject[ 0 ].hours.push( weekHour );
				}
			}

			var filteredHoursByTask = {};
			if( weekHour.task ) {
				filteredHoursByTask = _.filter( weekHoursByTask, function( h ) {
					return h.task.resource == weekHour.task.resource;
				} );
				if( filteredHoursByTask.length == 0 ) {
					var weekHourByTask = {
						task: weekHour.task,
						hours: [ weekHour ]
					};
					weekHoursByTask.push( weekHourByTask );
				} else {
					filteredHoursByTask[ 0 ].hours.push( weekHour );
				}
			}
		}

		$scope.weekHours = weekHoursByProject.concat( weekHoursByTask );

		// filter hours entries by day of week
		for( i = 0; i < $scope.weekHours.length; i++ ) {
			var weekHours = $scope.weekHours[ i ];
			weekHours.hoursByDate = [ ];
			for( var w = 0; w < 7; w++ ) {
				var totalHours = 0;
				var weekHoursEntries = [ ];
				date = $scope.moment( $scope.startWeekDate ).add( 'days', w ).format( 'YYYY-MM-DD' );

				for( var h = 0; h < weekHours.hours.length; h++ ) {
					if( weekHours.hours[ h ].date == date ) {
						weekHoursEntries.push( weekHours.hours[ h ] );
						totalHours += weekHours.hours[ h ].hours;
					}
				}

				weekHours.hoursByDate.push( {
					hours: weekHoursEntries,
					totalHours: totalHours,
					futureness: $scope.checkForFutureness( $scope.moment( $scope.startWeekDate ).add( 'days', w ).format( 'YYYY-MM-DD' ) )
				} );
			}
		}

		$scope.weekHoursByProject = weekHoursByProject;
		$scope.weekHoursByTask = weekHoursByTask;
	};

	var convertDate = function( stringDate ) {
		var tmpDate = stringDate.split( '-' );
		return new Date( tmpDate[ 0 ], parseInt( tmpDate[ 1 ] ) - 1, tmpDate[ 2 ] );
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

	$scope.initPercentageCircle = function( ) {
		var percents = 0;
		var degrees = 0;

		if( $scope.totalWeekHours && $scope.hoursRateValue && $scope.hoursRateValue != 0 ) {
			percents = Math.ceil( $scope.totalWeekHours / $scope.hoursRateValue * 100 );

			// convert to degrees
			degrees = Math.ceil( percents * 360 / 100 );

			if( degrees > 360 )
				degrees = 360;
		}

		var activeBorder = $( "#percentage-activeBorder" );

		if( degrees <= 180 ) {
			activeBorder.css( 'background-image', 'linear-gradient(' + ( 90 + degrees ) + 'deg, transparent 50%, #ececec 50%),linear-gradient(90deg, #ececec 50%, transparent 50%)' );
		} else {
			activeBorder.css( 'background-image', 'linear-gradient(' + ( degrees - 90 ) + 'deg, transparent 50%, #69DBCC 50%),linear-gradient(90deg, #ececec 50%, transparent 50%)' );
		}
	};

	$scope.$on( 'hours:added', function( event, selectedDay ) {
		$scope.recalculateCircle( selectedDay );
	} );

	$scope.$on( 'hours:deleted', function( event, selectedDay ) {
		$scope.recalculateCircle( selectedDay );
	} );

    $scope.$on('profile:loaded', function() {
        $scope.hideProfileSpinner = true;
    });

	$scope.recalculateCircle = function( day ) {
		var selectedMoment = moment( day.date );
		var startOfSelectedWeek = selectedMoment.startOf( 'week' );
		var todaysStartWeek = moment( ).startOf( 'week' );
		$scope.selectedWeekIndex = startOfSelectedWeek.diff( todaysStartWeek, 'days' );
		$scope.initHours( true, function( ) {
			$scope.handleHoursPeriodChanged( );
		} );
	};

} ] );
