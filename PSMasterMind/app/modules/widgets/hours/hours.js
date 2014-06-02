angular.module('Mastermind').controller('HoursCtrl',
				['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'HoursService', 'TasksService', 'RolesService', 
		 function($scope, $state, $rootScope, Resources, ProjectsService, HoursService, TasksService, RolesService) {

	$scope.checkForFutureness = function(date) {
		// flux capacitor
		/*
		 * var a = moment().subtract('days', 1); var b =
		 * moment(date); var diff = a.diff(b);
		 */
		var a = moment();
		var b = moment(date);

		var futureness;

		if (b.year() > a.year()
				|| b.month() > a.month()
				|| b.date() > a.date()) {
			futureness = true
		} else {
			futureness = false
		}

		return futureness;
	}

	$scope.startDate = new Date();
	$scope.ongoingProjects = [];

	$scope.hoursProjects = [];
	// fill it in hours controller
	$scope.hoursTasks = [];

	$scope.projectTasksList = [];

	$scope.hasAssignment = false;
	$rootScope.hasAssignment = false;

	var taskIconsMap = {
		"meetings" : "fa-comments-o",
		"design" : "fa-lightbulb-o",
		"sales" : "fa-usd",
		"pre-sales support" : "fa-phone",
		"training" : "fa-bolt",
		"marketing" : "fa-bar-chart-o",
		"administration" : "fa-cogs",
		"documentation" : "fa-folder-o",
		"sick time" : "fa-ambulance",
	};

	var taskIconStylseMap = {
		"meetings" : "padding: 3px 7px;",
		"design" : "padding: 3px 10px;",
		"sales" : "padding: 3px 10px;",
		"pre-sales support" : "padding: 3px 8px;",
		"training" : "padding: 3px 10px;",
		"marketing" : "padding: 3px 6px;",
		"administration" : "padding: 3px 6px;",
		"documentation" : "padding: 4px 7.5px;",
		"sick time" : "padding: 3px 6px;",
	};

	var monthNamesShort = [ 'Jan', 'Feb', 'Mar', 'Apr',
			'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct',
			'Nov', 'Dec' ];
	/**
	 * display the month name from a month number (0 -
	 * 11)
	 */
	$scope.getMonthName = function(monthNum) {
		if (monthNum > 11) {
			monthNum = monthNum - 12;
		}
		return monthNamesShort[monthNum];
	};

	// Get todays date formatted as yyyy-MM-dd
	var dd = $scope.startDate.getDate();
	var mm = $scope.startDate.getMonth() + 1; // January
												// is 0!
	var yyyy = $scope.startDate.getFullYear();
	if (dd < 10) {
		dd = '0' + dd;
	}
	if (mm < 10) {
		mm = '0' + mm;
	}
	// var rolesPromise =
	// RolesService.getRolesMapByResource();

	/**
	 * Set up the projects to be added to the hours
	 * entry drop down
	 */

	$scope.loadProjects = function() {
		ProjectsService.getOngoingProjects(function(result) {

					$scope.ongoingProjects = result.data;

					ProjectsService.getMyCurrentProjects($scope.me)
							.then(
									function(
											myCurrentProjects) {
										$scope.myProjects = myCurrentProjects.data;
										if ($scope.myProjects.length > 0) {
											$scope.hasActiveProjects = true;
										}

										var myProjects = [];
										for (var m = 0; m < $scope.myProjects.length; m++) {
											var myProj = $scope.myProjects[m];

											myProj.title = myProj.customerName
													+ ': '
													+ myProj.name;
											myProjects
													.push(myProj);
											
											if (myProj
													&& myProj.status
													&& myProj.status.hasAssignment) {
												$scope.hasAssignment = true;
												$rootScope.hasAssignment = true;
											}

										}

										var otherProjects = [];

										for (var n = $scope.ongoingProjects.length - 1; n >= 0; n--) {
											var proj = _
													.find(
															myProjects,
															function(
																	mp) {
																return mp.resource == $scope.ongoingProjects[n].resource
															});

											if (!proj) {
												var myProj = $scope.ongoingProjects[n];

												otherProjects
														.push(myProj);

												myProj.isOtherProj = true;
											}
										}

										
										$scope.hoursProjects = myProjects
												.concat(otherProjects);

										$scope.projectTasksList = $scope.projectTasksList
												.concat(myProjects
														.concat(otherProjects));

										// load projects on which current person have at least one assignment in past/present/future
										HoursService.getCurrentPersonProjects($scope.me).then(function(projectsWithMyAssignments) {
											
											var found;
											
											for (var i = 0; i < projectsWithMyAssignments.length; i ++) {
												found = _.find($scope.projectTasksList, function(tp) {
													return tp.resource == projectsWithMyAssignments[i].resource
												})
												
												if (found)
													delete found.isOtherProj
											}
											
											$scope.projectTasksList = $scope.projectTasksList.concat(projectsWithMyAssignments);

											$scope.sortProjectTaskList();
										})
									});
					
					
				});
	}

	$scope.newHoursRecord;
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
	$scope.sortProjectTaskList = function() {
		$scope.projectTasksList = _.uniq($scope.projectTasksList, function(tp) {
			return tp.resource
		});
		
		$scope.projectTasksList
				.sort(function(item1, item2) {
					if (item1.isOtherProj
							&& !item2.isOtherProj)
						return 1;
					else if (!item1.isOtherProj
							&& item2.isOtherProj)
						return -1;
					else if (item1.isTask
							&& !item2.isTask)
						return 1;
					else if (!item1.isTask
							&& item2.isTask)
						return -1;
					else if (item1.title < item2.title)
						return -1;
					if (item1.title > item2.title)
						return 1;
					return 0;
				});
	}

	$scope.editHoursEntry = function(e, hourEntry,
			tagetInput) {
		hourEntry.hoursRecord.editMode = true;

		hourEntry.hoursRecord.hoursEdited = hourEntry.hoursRecord.hours;
		hourEntry.hoursRecord.descriptionEdited = hourEntry.hoursRecord.description;

		// if (!hourEntry.hoursRecord.isAdded){
		hourEntry.selectedItem = hourEntry.hoursRecord.project ? hourEntry.project
				: hourEntry.hoursRecord.task;
		// }

		e = e ? e : window.event;
		tagetInput = tagetInput ? tagetInput : $(
				e.target)
				.closest('.hours-logged-entry').find(
						'[name="project-task-select"]')

		$scope.bindAutocompleteHandlers(tagetInput);
	}

	$scope.removeOrCloseHourEntry = function(e,
			hourEntry, index) {
		if (hourEntry.hoursRecord.editMode) {

			// if (!hourEntry.hoursRecord.isCopied) {
			hourEntry.hoursRecord.editMode = false;
			$scope
					.clearAutocompleteHandlers($(
							e.target)
							.closest(
									'.hours-logged-entry')
							.find(
									'[name="project-task-select"]'));
			// }

			if (hourEntry.hoursRecord.isAdded)
				$scope.selected.hoursEntries.splice(
						index, 1);

			delete hourEntry.hoursRecord.isCopied;

			$scope.validateAndCalculateTotalHours();

		} else {
			// $scope.deleteHoursRecord(index)
			$scope.selected.hoursEntries.splice(index,
					1);

			if (hourEntry.hoursRecord)
				Resources
						.remove(
								hourEntry.hoursRecord.resource)
						.then(
								function() {
									// $scope.hoursRequest();
									$scope
											.validateAndCalculateTotalHours();
								});
		}

	}

	$scope.saveHoursEntry = function(e, hourEntry,
			isAdded) {
		var tmpHours = hourEntry.hoursRecord.hours;
		var tmpDesc = hourEntry.hoursRecord.description;
		
		hourEntry.hoursRecord.hours = hourEntry.hoursRecord.hoursEdited;
		hourEntry.hoursRecord.description = hourEntry.hoursRecord.descriptionEdited;

		$scope.getNewHoursValidationErrors(hourEntry)

		if ($scope.hoursValidation.length > 0) {
			hourEntry.hoursRecord.hours = tmpHours;
			hourEntry.hoursRecord.description = tmpDesc;
			
			return;
		}

		if (hourEntry.hoursRecord.isAdded
				&& (hourEntry.hoursRecord.hours == "" || !hourEntry.selectedItem))
			return;

		// $('ul.dropdown-menu.ddProjectsTasksMenu').appendTo($('.dashboard-widget.hours
		// .panel-body'))
		delete hourEntry.hoursRecord.hoursEdited;
		delete hourEntry.hoursRecord.descriptionEdited;

		delete hourEntry.hoursRecord.editMode;
		delete hourEntry.hoursRecord.isAdded;
		delete hourEntry.hoursRecord.isCopied;

		if (hourEntry.selectedItem) {
			delete hourEntry.hoursRecord.project;
			delete hourEntry.hoursRecord.task;
			delete hourEntry.project;
			delete hourEntry.task;

			if (hourEntry.selectedItem.resource
					.indexOf('projects') > -1) {
				hourEntry.project = hourEntry.selectedItem

				hourEntry.hoursRecord.project = {
					resource : hourEntry.selectedItem.resource,
					name : hourEntry.selectedItem.name
				}
			} else if (hourEntry.selectedItem.resource
					.indexOf('tasks') > -1) {
				hourEntry.task = hourEntry.selectedItem

				hourEntry.hoursRecord.task = {
					resource : hourEntry.selectedItem.resource,
					name : hourEntry.selectedItem.name
				}
			}

			delete hourEntry.selectedItem;
		}

		hourEntry.hoursRecord.editMode = false;

		$scope.addHours(hourEntry)
	}

	$scope.setSelected = function(day) {
		if ($scope.selected) {
			for (var i = 0; i < $scope.displayedHours.length; i++) {
				if ($scope.selected.date === $scope.displayedHours[i].date) {
					$scope.displayedHours[i] = $scope.selected;
				}
			}
		}

		if ($scope.selected)
			delete $scope.selected;

		$scope.selected = $scope.cloneDay(day);
	}

	$scope.clearSelectedItem = function(e, hourEntry) {
		delete hourEntry.selectedItem;
	}

	$scope.bindEventHandlers = function() {
		$(document)
				.bind('click', $scope.handleDocClick);
	}
	$scope.unbindEventHandlers = function() {
		$(document).unbind('click',
				$scope.handleDocClick)
	}

	$scope.bindAutocompleteHandlers = function(input) {
		input.bind('dblclick', function() {
			var autocomplete = $(this).parent().find(
					'ul.dropdown-menu');

			autocomplete.find('li').css('display', '')
			autocomplete.show();
		});

		input.next('.search-icon').bind(
				'click',
				function() {
					var autocomplete = input.parent()
							.find('ul.dropdown-menu');

					autocomplete.find('li').css(
							'display', '')
					autocomplete.show();
				});

		input
				.bind(
						'keyup',
						function(e) {
							e = e ? e : window.event;

							var input = $(e.target)
									.closest('input');
							var val = input.val()
									.toLowerCase();
							var autocomplete = input
									.parent()
									.find(
											'ul.dropdown-menu');

							autocomplete
									.find('li')
									.each(
											function(
													ind,
													el) {
												var taskName = $(
														el)
														.find(
																'.task-name')
														.text()
														.toLowerCase();
												var projectName = $(
														el)
														.find(
																'.project-name')
														.text()
														.toLowerCase();
												var projectCustomerName = $(
														el)
														.find(
																'.project-customer-name')
														.text()
														.toLowerCase();

												var result = taskName
														&& taskName
																.indexOf(val) > -1;

												result = result
														|| projectName
														&& projectName
																.indexOf(val) > -1;
												result = result
														|| projectCustomerName
														&& projectCustomerName
																.indexOf(val) > -1;

												if (result)
													$(
															el)
															.css(
																	'display',
																	'')
												else
													$(
															el)
															.css(
																	'display',
																	'none')
											});

							autocomplete.show();
						})
	}

	$scope.clearAutocompleteHandlers = function(input) {
		input.unbind('click');
		input.unbind('dblclick');
		input.next('.search-icon').unbind('click');

		input.unbind('keydown');
	}

	$scope.menuItemSelected = function(menuItem) {
		var id = menuItem.attr('_id');

		var item = _.find($scope.projectTasksList,
				function(tp) {
					return tp.resource == id;
				})

		var ul = menuItem.closest('ul');

		// ul.prev('input').val(item.name);

		var entry = ul.closest('.hours-logged-entry');
		var currentInd = entry.attr('_hourentryindex');

		var hourEntry = $scope.selected.hoursEntries[currentInd];

		$scope.$apply(function() {
			hourEntry.selectedItem = item;
		});

	};

	$scope.handleDocClick = function(e) {
		e = e ? e : window.event;

		var menuItem = $(e.target).closest(
				'a.menu-item');
		var activeMenu = null;

		if (menuItem.length == 1)
			$scope.menuItemSelected(menuItem)

		if ($(e.target).closest(
				'input[name="project-task-select"]').length > 0) {
			activeMenu = $(e.target)
					.closest(
							'input[name="project-task-select"]')
					.parent().find('ul.dropdown-menu');
			// return
		}

		if ($(e.target).closest('.search-icon').length > 0) {
			activeMenu = $(e.target).closest(
					'.search-icon').parent().find(
					'ul.dropdown-menu');
			// return
		}

		$('ul.dropdown-menu.ddProjectsTasksMenu').each(
				function(ind, el) {
					if (!activeMenu || activeMenu
							&& el != activeMenu.get(0))
						$(el).hide();
				})

	}

	$scope.initNewHoursEntry = function(hourEntry) {
		if (hourEntry.hoursRecord
				&& hourEntry.hoursRecord.isAdded
				|| hourEntry.hoursRecord
				&& hourEntry.hoursRecord.isCopied) {
			// use timeout to perform code after init
			window
					.setTimeout(
							function() {

								$(
										'.dashboard-widget.hours .row.hours-logged .hours-logged-entry')
										.each(
												function(
														ind,
														el) {
													// in
													// case
													// of
													// newly
													// added
													// entry
													// correctly
													// switch
													// it
													// to
													// edit
													// mode
													if (hourEntry == $(
															el)
															.scope().hourEntry
															&& ($(
																	el)
																	.scope().hourEntry.hoursRecord.hours == ""
																	|| $(
																			el)
																			.scope().hourEntry.hoursRecord.hours == undefined || $(
																	el)
																	.scope().hourEntry.hoursRecord.isCopied))
														$scope
																.$apply(function() {
																	$scope
																			.editHoursEntry(
																					null,
																					$(
																							el)
																							.scope().hourEntry,
																					$(
																							el)
																							.find(
																									'input[name="project-task-select"]')
																							.eq(
																									0))
																})

												})

							}, 0)
		}
	};

	$scope.addHoursEntry = function() {
		$scope.addNewHours();
	}

	// MOVE THIS TO FORM CONTROLLER WHEN READY
	$scope.addNewHours = function(isTask) {
		// match date with current hours
		var displayedHoursLength = $scope.displayedHours.length;

		for (var i = 0; i < displayedHoursLength; i++) {
			if ($scope.selected.date === $scope.displayedHours[i].date) {
				// $scope.activeAddition =
				// $scope.displayedHours[i];

				if ($scope.selected.totalHours > 0
						|| $scope.anyCopied()
						|| ($scope.selected.hoursEntries && $scope.selected.hoursEntries.length == 0)) {
					$scope.newHoursRecord = {
						date : $scope.selected.date,
						description : "",
						hours : "",
						person : $scope.me,
						editMode : true,
						isAdded : true

					};

					if (!isTask)
						$scope.newHoursRecord.project = {};
					else
						$scope.newHoursRecord.task = {};

					// sync selected object with
					// displayedHours collection
					if ($scope.selected.hoursEntries) {
						$scope.selected.hoursEntries
								.unshift({
									hoursRecord : $scope.newHoursRecord
								});
					} else {
						$scope.selected.hoursEntries = [];
						$scope.selected.hoursEntries
								.unshift({
									hoursRecord : $scope.newHoursRecord
								});
					}
				} else {
					// switch to edit mode predefined
					// entries
					for (var j = 0; j < $scope.selected.hoursEntries.length; j++) {
						if ($scope.selected.hoursEntries[j].hoursRecord) {
							$scope.selected.hoursEntries[j].hoursRecord.editMode = true;
							$scope.selected.hoursEntries[j].hoursRecord.isAdded = true;
						}
					}
				}

			}
		}
	};

	$scope.anyAdded = function() {
		var result = false;

		for (var i = 0; i < $scope.selected.hoursEntries.length; i++) {
			var entry = $scope.selected.hoursEntries[i];

			if (entry.hoursRecord
					&& entry.hoursRecord.isAdded
					|| entry.hoursRecord
					&& entry.hoursRecord.isCopied)
				result = true;
		}

		return result;
	}

	$scope.anyCopied = function() {
		var result = false;

		for (var i = 0; i < $scope.selected.hoursEntries.length; i++) {
			var entry = $scope.selected.hoursEntries[i];

			if (entry.hoursRecord
					&& entry.hoursRecord.editMode
					&& entry.hoursRecord
					&& entry.hoursRecord.isCopied)
				result = true;
		}

		return result;
	}

	$scope.addNewTaskHours = function() {
		$scope.addNewHours(true)
	};

	$scope.loadAvailableTasks = function() {
		TasksService
				.refreshTasks()
				.then(
						function(tasks) {
							_
									.each(
											tasks,
											function(t) {
												$scope.hoursTasks
														.push(t)
												$scope.projectTasksList
														.push(t);

												t.isTask = true;
												t.icon = taskIconsMap[t.name
														.toLowerCase()];
												t.iconCss = taskIconStylseMap[t.name
														.toLowerCase()]
											})

							$scope
									.sortProjectTaskList();
						})
	}

	// date formatter helper
	$scope.formatTheDate = function(d) {
		var dd = d.getDate();
		var mm = d.getMonth() + 1;
		var yyyy = d.getFullYear();
		if (dd < 10) {
			dd = '0' + dd;
		}
		if (mm < 10) {
			mm = '0' + mm;
		}
		$scope.theDayFormatted = yyyy + '-' + mm + '-'
				+ dd;

		var dayFormat = yyyy + '-' + mm + '-' + dd;
		return dayFormat

	}

	$scope.moment = moment;
	var me = $scope.me ? $scope.me.about : '';

	// Doc Brown - time travel.
	$scope.dateIndex = 0;

	$scope.backInTime = function() {
		$scope.dateIndex = $scope.dateIndex + 7;
		$scope.entryFormOpen = false;
		delete $scope.selected;
		$scope.hoursRequest();

	}
	$scope.forwardInTime = function() {
		$scope.dateIndex = $scope.dateIndex - 7;
		$scope.entryFormOpen = false;
		// console.log($scope.dateIndex);

		delete $scope.selected;
		$scope.hoursRequest();

	}

	$scope.backDay = function() {

		var foundInd;

		for (var i = 0; i < $scope.displayedHours.length; i++) {
			if ($scope.selected.date === $scope.displayedHours[i].date) {
				foundInd = i;
			}
		}

		if (foundInd > 0)
			$scope.selected = $scope.displayedHours[foundInd - 1];
		else {
			$scope.dateIndex = $scope.dateIndex + 7;

			$scope
					.hoursRequest(function() {
						$scope.selected = $scope.displayedHours[$scope.displayedHours.length - 1];
					});
		}

	}
	$scope.nextDay = function() {
		var foundInd;

		for (var i = 0; i < $scope.displayedHours.length; i++) {
			if ($scope.selected.date === $scope.displayedHours[i].date) {
				foundInd = i;
			}
		}

		if (foundInd < $scope.displayedHours.length - 1)
			$scope.selected = $scope.displayedHours[foundInd + 1]
		else {
			$scope.dateIndex = $scope.dateIndex - 7;
			$scope
					.hoursRequest(function() {
						$scope.selected = $scope.displayedHours[0];
					});
		}

		// $scope.hoursRequest();

	}

	$scope.thisWeek = function() {
		$scope.dateIndex = 0;
		$scope.entryFormOpen = false;
		delete $scope.selected;
		$scope.hoursRequest();
	}

	// TODO task: get this week of dates
	$scope.showWeekDates = function(callback) {
		$scope.todaysDate = $scope.moment().format(
				'YYYY-MM-DD');
		var moment = $scope.moment().subtract(
				$scope.dateIndex, 'days');
		var startOfWeek = moment.day(0);

		// array to hold the dates
		$scope.thisWeekDates = [];
		$scope.thisWeekDayLables = [];

		// run through and build out the array of the
		// week's dates
		for (var i = 0; i < 7; i++) {
			var moment = $scope.moment(startOfWeek)
					.add(i, 'days');
			var dateFormatted = moment
					.format('YYYY-MM-DD');
			$scope.thisWeekDates.push(dateFormatted);
			$scope.thisWeekDayLables[i] = moment
					.format('ddd');
		}
		$scope.prettyCalendarFormats(
				$scope.thisWeekDates[0],
				$scope.thisWeekDates[6]);
		callback($scope.thisWeekDates);
		// console.log($scope.thisWeekDates.length);
	}

	$scope.months = [ 'Janurary', 'February', 'March',
			'April', 'May', 'June', 'July', 'August',
			'September', 'October', 'November',
			'December' ]
	$scope.prettyCalendarFormats = function(firstDay,
			lastDay) {
		$scope.prettyCalendarDates = {}
		var d1 = new Date(firstDay);
		d1.setDate(d1.getDate() + 1);
		var day1 = d1.getDate();
		var month1 = $scope.months[d1.getMonth()]
		var month1Short = month1.substring(0, 3)
		$scope.prettyCalendarDates.firstDate = month1Short
				+ ' ' + day1;

		var d2 = new Date(lastDay);
		d2.setDate(d2.getDate() + 1);
		var day2 = d2.getDate();
		var month2 = $scope.months[d2.getMonth()]
		var month2Short = month2.substring(0, 3)
		var year = d2.getFullYear();
		$scope.prettyCalendarDates.lastDate = month2Short
				+ ' ' + day2 + ', ' + year;
		return $scope.prettyCalendarDates;
	}

	$scope.hoursRequest = function(cb) {
		$scope
				.showWeekDates(function(result) {
					HoursService
							.getHoursRecordsBetweenDates(
									$scope.me,
									$scope.thisWeekDates[0],
									$scope.thisWeekDates[6])
							.then(
									function(result) {
										if (result.length === 0) {
											console
													.error("getHoursRecordsBetweenDates("
															+ $scope.thisWeekDates[0]
															+ ","
															+ $scope.thisWeekDates[6]
															+ ") gave me no results");
										} else {
											$scope.displayedHours = result;

											for (var i = 0; i < $scope.displayedHours.length; i++) {
												$scope.displayedHours[i].totalHours = 0;

												var futureness = $scope
														.checkForFutureness($scope.displayedHours[i].date);

												$scope.displayedHours[i].futureness = futureness;

												for (var j = 0; j < $scope.displayedHours[i].hoursEntries.length; j++) {
													if ($scope.displayedHours[i].hoursEntries[j].hoursRecord) {
														$scope.displayedHours[i].totalHours = $scope.displayedHours[i].totalHours
																+ $scope.displayedHours[i].hoursEntries[j].hoursRecord.hours

														if ($scope.displayedHours[i].hoursEntries[j].hoursRecord.task) {
															$scope.displayedHours[i].hoursEntries[j].task = $scope.displayedHours[i].hoursEntries[j].hoursRecord.task;
															Resources
																	.resolve($scope.displayedHours[i].hoursEntries[j].task)
														}
													}
												}

												if (!$scope.selected
														&& $scope.displayedHours[i].date == $scope.todaysDate) {
													// $scope.selected
													// =
													// JSON.parse(JSON.stringify(
													// $scope.displayedHours[i]));
													$scope.selected = $scope.displayedHours[i];
												} else if ($scope.selected
														&& $scope.displayedHours[i].date == $scope.selected.date) {
													$scope.selected = $scope.displayedHours[i];
												}

												if (cb)
													cb()
											}
										}
									});
				});
	}

	$scope.newHoursRecord = {};
	$scope.hoursValidation = [];

	$scope.getNewHoursValidationErrors = function(
			hourEntry) {

		$scope.hoursValidation = [];

		var totalHours = 0;
		var entries = $scope.selected ? $scope.selected.hoursEntries
				: [];

		if (hourEntry.hoursRecord
				&& (hourEntry.hoursRecord.hours == "" || parseFloat(hourEntry.hoursRecord.hours) === 0)
				|| hourEntry.hoursRecord.hours === undefined) {
			$scope.hoursValidation
					.push("Hours value is empty")
		} else if (hourEntry.hoursRecord
				&& hourEntry.hoursRecord.hours) {
			var res = /^\d+(\.\d{1,2})?$/
					.exec(hourEntry.hoursRecord.hours)

			if (!res)
				$scope.hoursValidation
						.push("Incorrect value for hours")

		}
		
		if (hourEntry.hoursRecord && hourEntry.selectedItem && hourEntry.selectedItem.startDate) {
			var selectedDate = new Date($scope.selected.date);
			
			if (selectedDate > new Date(hourEntry.selectedItem.endDate) || selectedDate < new Date(hourEntry.selectedItem.endDate))
				$scope.hoursValidation.push("You are logging hours for project which is already ended or not started")
		}
		
		if (hourEntry.hoursRecord
				&& hourEntry.hoursRecord.editMode
				&& !hourEntry.selectedItem)
			$scope.hoursValidation
					.push("Project or task hasn't been selected")

		for (var i = 0; i < entries.length; i++) {
			if (entries[i].hoursRecord
					&& entries[i].hoursRecord.hours)
				totalHours += parseFloat(entries[i].hoursRecord.hours);

		}

		if (totalHours > 24)
			$scope.hoursValidation
					.push("Hours logged on a given day cannot exceed 24 hours.");

		$scope.hoursValidation = _
				.uniq($scope.hoursValidation)

		return $scope.hoursValidation.length > 0;
	}

	$scope.validateAndCalculateTotalHours = function() {
		var entries = $scope.selected.hoursEntries;
		var hoursRecords = [];
		var totalHours = 0;

		$scope.hoursValidation = [];

		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i];

			if (entry.hoursRecord) {
				hoursRecords.push(entry.hoursRecord);
				totalHours += !isNaN(parseFloat(entry.hoursRecord.hours)) ? parseFloat(entry.hoursRecord.hours)
						: 0;
				// if (!entry.hoursRecord.person) {
				entry.hoursRecord.person = {
					resource : $scope.me.about
				};
				// }
				if (!entry.hoursRecord.date) {
					entry.hoursRecord.date = $scope.selected.date;
				}
			}

			// remove embedded property which leverage
			// to server side error when updating hours
			// record
			if (entry.hoursRecord
					&& entry.hoursRecord.project
					&& entry.hoursRecord.project["$fromServer"])
				delete entry.hoursRecord.project["$fromServer"]
			else if (entry.hoursRecord
					&& entry.hoursRecord.task
					&& entry.hoursRecord.task["$fromServer"])
				delete entry.hoursRecord.task["$fromServer"]
		}

		if (totalHours > 24) {
			$scope.hoursValidation
					.push("Hours logged on a given day cannot exceed 24 hours.");
			return;
		}

		// update total hours value to apropriatly
		// display in hours widget
		$scope.selected.totalHours = totalHours;

		var selectedDisplayedHours = _
				.find(
						$scope.displayedHours,
						function(dh) {
							if ($scope.selected.date === dh.date)
								return dh;

						})

		selectedDisplayedHours.totalHours = totalHours;
	};

	$scope.addHours = function(hourEntry) {
		$scope.validateAndCalculateTotalHours();

		// update only passed hourEntry
		HoursService
				.updateHours([ hourEntry.hoursRecord ])
				.then(
						function(updatedRecords) {
							// update with received
							// values from backend

							if (updatedRecords[0])
								_
										.extend(
												hourEntry.hoursRecord,
												{
													_id : updatedRecords[0]._id,
													about : updatedRecords[0].about,
													resource : updatedRecords[0].resource,
													base : updatedRecords[0].base,
													created : updatedRecords[0].created,
													date : updatedRecords[0].date,
													etag : updatedRecords[0].etag,
													description : updatedRecords[0].description,
													hours : updatedRecords[0].hours,
													person : updatedRecords[0].person,
													project : updatedRecords[0].project,
													task : updatedRecords[0].task
												})

						});

	};

	$scope.copyHoursEntry = function() {
		$scope.copyHours();

		for (var i = 0; i < $scope.selected.hoursEntries.length; i++) {
			if ($scope.selected.hoursEntries[i].hoursRecord
					&& $scope.selected.hoursEntries[i].hoursRecord.hours > 0
					&& $scope.selected.hoursEntries[i].hoursRecord.isCopied) {
				$scope.selected.hoursEntries[i].hoursRecord.editMode = true;
			}
		}
	}

	$scope.copyHours = function() {
		$scope.hideMessages();

		var selectedDate = getDate($scope.selected.date);

		var copyFromEntries = [];

		// if it's possible, trying to find hours
		// entries from yesterday
		var tmpD = $scope.selected.date.split('-');

		var copyFromDate = new Date(parseInt(tmpD[0]),
				parseInt(tmpD[1]) - 1,
				parseInt(tmpD[2]) - 1);

		var shortDate = getShortDate(copyFromDate);
		var copyFromEntry = _.findWhere(
				$scope.displayedHours, {
					date : shortDate
				});
		var copyEntryFound = false;

		if (copyFromEntry) {
			var prevDayHoursRecords = _.pluck(
					copyFromEntry.hoursEntries,
					"hoursRecord");
			prevDayHoursRecords = _.filter(
					prevDayHoursRecords, function(p) {
						if (p)
							return true;
					});
			if (prevDayHoursRecords.length > 0) {
				copyHoursCallback(copyFromEntry.hoursEntries);
				copyEntryFound = true;
			}
		}
		// if not, get hours for 1 week earlier than
		// selected date, find nearest day with logged
		// hours.
		if (!copyEntryFound) {
			var fromDate = new Date(parseInt(tmpD[0]),
					parseInt(tmpD[1]) - 1,
					parseInt(tmpD[2]) - 7);
			var from = getShortDate(fromDate);
			HoursService
					.getHoursRecordsBetweenDates(
							$scope.me, from, shortDate)
					.then(
							function(result) {
								for (var i = result.length - 1; i >= 0; i--) {
									if (result[i].hoursEntries.length > 0) {
										var houseRecordsInside = _
												.filter(
														result[i].hoursEntries,
														function(
																h) {
															if (h.hoursRecord)
																return true;
														});
										if (houseRecordsInside.length > 0) {
											copyHoursCallback(result[i].hoursEntries);
											copyEntryFound = true;
											return;
										}
									}
								}

								if (!copyEntryFound) {
									$scope.hoursValidation
											.push("No hours to copy found for the last week.");
								}
							});
		}
	}

	var getDate = function(dateString) {
		var tmpD = dateString.split('-');
		var date = new Date(parseInt(tmpD[0]),
				parseInt(tmpD[1]), parseInt(tmpD[2]));
		return date;
	}

	var copyHoursCallback = function(copyFromEntries) {
		var hoursRecords = _.pluck(
				$scope.selected.hoursEntries,
				"hoursRecord");

		hoursRecords = _.reject(hoursRecords, function(
				h) {
			return (typeof h) === 'undefined';
		});
		// $scope.hoursToDelete = _.pluck(hoursRecords,
		// "resource");
		// $scope.selected.hoursEntries = [];

		// simply add copied hours to current day hours
		// entries
		var displayedHoursEntry = _.findWhere(
				$scope.displayedHours, {
					date : $scope.selected.date
				});

		for (var i = 0; i < copyFromEntries.length; i++) {
			if (copyFromEntries[i].hoursRecord
					&& copyFromEntries[i].hoursRecord.hours > 0) {
				var newHoursRecord = {
					date : $scope.selected.date,
					description : copyFromEntries[i].hoursRecord.description,
					hours : copyFromEntries[i].hoursRecord.hours,
					person : {
						resource : $scope.me.about
					}
				}

				newHoursRecord.isCopied = true;

				if (copyFromEntries[i].hoursRecord.project) {
					newHoursRecord.project = copyFromEntries[i].hoursRecord.project;
				}

				if (copyFromEntries[i].hoursRecord.task) {
					newHoursRecord.task = copyFromEntries[i].hoursRecord.task;
				}

				var hoursEntry = {
					project : copyFromEntries[i].project,
					task : copyFromEntries[i].task,
					hoursRecord : newHoursRecord
				}

				if (copyFromEntries[i].assignment) {
					hoursEntry.assignment = copyFromEntries[i].assignment;
				}

				// displayedHoursEntry.hoursEntries.unshift(hoursEntry);

				$scope.selected.hoursEntries
						.unshift($scope
								.cloneDay(hoursEntry));
			}
		}
		/*
		 * // after copying remove all previous day's
		 * hours for (var i = 0; $scope.hoursToDelete &&
		 * i < $scope.hoursToDelete.length; i ++) { if
		 * ($scope.hoursToDelete[i])
		 * Resources.remove($scope.hoursToDelete[i]) }
		 */
	}

	var getShortDate = function(date) {
		// Get todays date formatted as yyyy-MM-dd
		var dd = date.getDate();
		var mm = date.getMonth() + 1; // January is 0!
		var yyyy = date.getFullYear();
		if (dd < 10) {
			dd = '0' + dd;
		}
		if (mm < 10) {
			mm = '0' + mm;
		}
		date = yyyy + '-' + mm + '-' + dd;
		return date;
	}

	$scope.hideMessages = function() {
		$scope.hoursValidation = [];
	};

	$scope.cloneDay = function(day) {
		return JSON.parse(JSON.stringify(day));
	}

	$scope.$watch('displayedHours', function(value) {
		var val = value || null;
		if (val)
			$scope.$emit('masonryGo');
	});

	var init = function(event) {
		$scope.hoursRequest();
		$scope.loadAvailableTasks();
		$scope.bindEventHandlers();
		$scope.loadProjects();
	};

	if ($scope.me)
		init()
	else
		$rootScope.$on('me:loaded', init)

	$scope.$on("$destroy", function() {
		$scope.unbindEventHandlers();
	})
} ]);
