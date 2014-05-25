angular.module('Mastermind').controller('HoursCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'HoursService', 'TasksService', 'RolesService',
  function ($scope, $state, $rootScope, Resources, ProjectsService, HoursService, TasksService, RolesService) {

    $scope.checkForFutureness = function (date) {
      //flux capacitor
      /*
    	var a = moment().subtract('days', 1);
      var b = moment(date);
      var diff = a.diff(b);
*/
    	var a = moment();
        var b = moment(date);
      
        
      var futureness;
      
      if (b.year() > a.year() || b.month() > a.month() || b.date() > a.date()) {
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
    	"meetings": "fa-comments-o",
    	"design": "fa-lightbulb-o",
    	"sales": "fa-usd",
    	"pre-sales support": "fa-phone",
    	"training": "fa-bolt",
    	"marketing": "fa-bar-chart-o",
    	"administration": "fa-cogs",
    	"documentation": "fa-folder-o",
    	"sick time":  "fa-ambulance",
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
        	"sick time":  "padding: 3px 6px;",
        };
    
    var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    /**
     * display the month name from a month number (0 - 11)
     */
    $scope.getMonthName = function (monthNum) {
      if (monthNum > 11) {
        monthNum = monthNum - 12;
      }
      return monthNamesShort[monthNum];
    };

    //Get todays date formatted as yyyy-MM-dd
    var dd = $scope.startDate.getDate();
    var mm = $scope.startDate.getMonth() + 1; //January is 0!
    var yyyy = $scope.startDate.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    var rolesPromise = RolesService.getRolesMapByResource();

    /**
     * Set up the projects to be added to the hours entry drop down
     */
    ProjectsService.getOngoingProjects(function (result) {

      $scope.ongoingProjects = result.data;

      ProjectsService.getMyCurrentProjects($scope.me).then(function (myCurrentProjects) {
        $scope.myProjects = myCurrentProjects.data;
        if ($scope.myProjects.length > 0) {
          $scope.hasActiveProjects = true;
        }

        var myProjects = [];
        for (var m = 0; m < $scope.myProjects.length; m++) {
          var myProj = $scope.myProjects[m];
          var found = undefined;
          myProj.title = myProj.customerName + ': ' + myProj.name;
          myProjects.push(myProj);

          //Check if you have an assignment to flag that you have an assignment on the project
          //and not that you are an exec or sales sponsor
          if (myProj && myProj.status && myProj.status.hasAssignment) {
            $scope.hasAssignment = true;
            $rootScope.hasAssignment = true;
          }

          for (var n = 0; n < $scope.ongoingProjects.length; n++) {
            var proj = $scope.ongoingProjects[n];
            if (proj.resource == myProj.resource) {
              $scope.ongoingProjects.splice(n, 1);
              break;
            }
          }
        }

        myProjects.sort(function (item1, item2) {
          if (item1.title < item2.title)
            return -1;
          if (item1.title > item2.title)
            return 1;
          return 0;
        });

        var otherProjects = [];
        while ($scope.ongoingProjects.length > 0) {
          var myProj = $scope.ongoingProjects.pop();
          myProj.title = myProj.customerName + ': ' + myProj.name;
          otherProjects.push(myProj);
        }

        otherProjects.sort(function (item1, item2) {
          if (item1.title < item2.title)
            return -1;
          if (item1.title > item2.title)
            return 1;
          return 0;
        });

        $scope.hoursProjects = myProjects.concat(otherProjects);
        
        $scope.projectTasksList =  $scope.projectTasksList.concat( myProjects.concat(otherProjects) )
      });
    });


    ProjectsService.getOngoingProjects(function (result) {
      $scope.ongoingProjects = result.data;

      ProjectsService.getMyCurrentProjects($scope.me).then(function (myCurrentProjects) {
        $scope.myProjects = myCurrentProjects.data;
        if ($scope.myProjects.length > 0) {
          $scope.hasActiveProjects = true;
        }

        var myProjects = [];
        for (var m = 0; m < $scope.myProjects.length; m++) {
          var myProj = $scope.myProjects[m];
          var found = undefined;
          myProj.title = myProj.customerName + ': ' + myProj.name;
          myProjects.push(myProj);

          //Check if you have an assignment to flag that you have an assignment on the project
          //and not that you are an exec or sales sponsor
          if (myProj && myProj.status && myProj.status.hasAssignment) {
            $scope.hasAssignment = true;
            $rootScope.hasAssignment = true;
          }

          for (var n = 0; n < $scope.ongoingProjects.length; n++) {
            var proj = $scope.ongoingProjects[n];
            if (proj.resource == myProj.resource) {
              $scope.ongoingProjects.splice(n, 1);
              break;
            }
          }
        }

        myProjects.sort(function (item1, item2) {
          if (item1.title < item2.title)
            return -1;
          if (item1.title > item2.title)
            return 1;
          return 0;
        });

        var otherProjects = [];
        while ($scope.ongoingProjects.length > 0) {
          var myProj = $scope.ongoingProjects.pop();
          myProj.title = myProj.customerName + ': ' + myProj.name;
          otherProjects.push(myProj);
        }

        otherProjects.sort(function (item1, item2) {
          if (item1.title < item2.title)
            return -1;
          if (item1.title > item2.title)
            return 1;
          return 0;
        });

        $scope.hoursProjects = myProjects.concat(otherProjects);

      });
    })

    $scope.newHoursRecord;
    //default open status of hours entry form
    $scope.entryFormOpen = false;
    $scope.lastSelectedDay = {};
    $scope.hoursToDelete = [];
    $scope.openHoursEntry = function (day) {

      $scope.hoursToDelete = [];
      //console.log($scope.selected)

      if ($scope.entryFormOpen && day === $scope.selected) {
        $scope.entryFormOpen = false
        delete $scope.selected;
      } else {
            	// use deep cloning to prevent from errors when some entries were removed and then canceled
                $scope.selected = $scope.cloneDay(day);
        //$('#editHours').modal('show');
                $scope.entryFormOpen = true;
                $scope.showHideHoursDialog(true)
        
      }
    };
    
    $scope.editHoursEntry = function(e, hourEntry, tagetInput) {
    	hourEntry.hoursRecord.editMode = true;
    	
    	hourEntry.hoursRecord.hoursEdited = hourEntry.hoursRecord.hours;
    	hourEntry.hoursRecord.descriptionEdited = hourEntry.hoursRecord.description;
    	
    	if (!hourEntry.hoursRecord.isAdded){
    		hourEntry.selectedItem = hourEntry.hoursRecord.project ? hourEntry.project : hourEntry.hoursRecord.task;
    	}
    	
    	e = e ? e: window.event;
    	tagetInput = tagetInput ? tagetInput: $(e.target).closest('.hours-logged-entry').find('[name="project-task-select"]')
    	
    	var autocomplete = $('.dashboard-widget.hours ul.dropdown-menu.ddProjectsTasksMenu');
    	
    	$scope.bindAutocompleteHandlers(tagetInput);
    	
    	autocomplete.insertAfter(tagetInput);
    	tagetInput.data('_autocomplete', autocomplete);
    }
    
    
    $scope.removeOrCloseHourEntry = function(e, hourEntry, index) {
    	if (hourEntry.hoursRecord.editMode) {
    		hourEntry.hoursRecord.editMode = false;
    		$scope.clearAutocompleteHandlers($(e.target).closest('.hours-logged-entry').find('[name="project-task-select"]'));
    	} else {
    		//$scope.deleteHoursRecord(index)
    		$scope.selected.hoursEntries.splice(index, 1);
    		
    		if (hourEntry.hoursRecord)
    			Resources.remove(hourEntry.hoursRecord.resource).then(function() {
    				$scope.hoursRequest();
    			});
	      
			
    		 //Resources.remove(hourEntry);
    	}
    	
    }
    
    $scope.saveHoursEntry = function(e, hourEntry, isAdded) {
    	hourEntry.hoursRecord.hours = hourEntry.hoursRecord.hoursEdited;
    	hourEntry.hoursRecord.description = hourEntry.hoursRecord.descriptionEdited;

    	if ($scope.getNewHoursValidationErrors())
    		return;
    	/*
    	if (hourEntry.hoursRecord.isAdded && (hourEntry.hoursRecord.hours == "" || (!(hourEntry.hoursRecord.project 
    				&& hourEntry.hoursRecord.project.resource) && !(hourEntry.hoursRecord.task 
    	    				&& hourEntry.hoursRecord.task.resource))  ))
    		return;
    	*/
    	if (hourEntry.hoursRecord.isAdded && (hourEntry.hoursRecord.hours == "" || !hourEntry.selectedItem))
    		return;
    	
    	$('ul.dropdown-menu.ddProjectsTasksMenu').appendTo($('.dashboard-widget.hours .panel-body'))
    	delete hourEntry.hoursRecord.hoursEdited;
    	delete hourEntry.hoursRecord.descriptionEdited;
  
    	delete hourEntry.hoursRecord.editMode;
    	delete hourEntry.hoursRecord.isAdded;
    	
    	if (hourEntry.selectedItem) {
    		delete hourEntry.hoursRecord.project;
        	delete hourEntry.hoursRecord.task;
        	delete hourEntry.project;
        	delete hourEntry.task;
        	
        	if (hourEntry.selectedItem.resource.indexOf('projects') > -1) {
        		hourEntry.project = hourEntry.selectedItem
        		
        		hourEntry.hoursRecord.project = {
        				resource: hourEntry.selectedItem.resource,
        				name: hourEntry.selectedItem.name
        		}
        	} else if (hourEntry.selectedItem.resource.indexOf('tasks') > -1) {
        		hourEntry.task = hourEntry.selectedItem
        		
        		hourEntry.hoursRecord.task = {
        				resource: hourEntry.selectedItem.resource,
        				name: hourEntry.selectedItem.name
        		}
        	}
        	
        	delete hourEntry.selectedItem;
    	}
    	hourEntry.hoursRecord.editMode = false;
    	
    	$scope.addHours()
    }
    
    $scope.setSelected = function(day) {
    	if ($scope.selected)
    		delete $scope.selected;
    	
    	$scope.selected = $scope.cloneDay(day);
    }
    
    $scope.clearSelectedItem = function(e, hourEntry) {
    	delete hourEntry.selectedItem;
    }
    $scope.bindAutocompleteHandlers = function(input){
    	input.bind('click');
    	
    	
    	input.bind('dblclick', function(){
    		var autocomplete = $(this).data('_autocomplete');
    		
    		autocomplete.find('li').css('display', '')
    		autocomplete.show();
    	});
    	
    	input.next('.search-icon').bind('click', function(){
    		var autocomplete = input.data('_autocomplete');
    		
    		autocomplete.find('li').css('display', '')
    		autocomplete.show();
    	});
    	
    	
    	$(document).bind('click', $scope.handleDocClick);
    	
    	input.bind('keyup', function(e){
    		e = e ? e: window.event;
    		
    		var input = $(e.target).closest('input');
    		
    		
    		var val = input.val();
    		var autocomplete = input.data('_autocomplete');
    		
    		autocomplete.find('li').each(function(ind, el){
    			var taskName = $(el).find('.task-name').text().toLowerCase();
    			var projectName = $(el).find('.project-name').text().toLowerCase();
    			var projectCustomerName = $(el).find('.project-customer-name').text().toLowerCase();
    			
    			var result = taskName && taskName.indexOf(val) > -1;
    			
    			result = result || projectName && projectName.indexOf(val) > -1;
    			result = result || projectCustomerName && projectCustomerName.indexOf(val) > -1;
    			
    			if (result)
    				$(el).css('display', '')
    			else
    				$(el).css('display', 'none')
    		})
    		autocomplete.show();
    	})
    }
    
    $scope.clearAutocompleteHandlers = function(input){
    	input.unbind('click');
    	input.unbind('dblclick');
    	input.next('.search-icon').unbind('click');
    	
    	input.unbind('keydown');
    	
    	$(document).unbind('click', $scope.handleDocClick)
    }
    
    $scope.menuItemSelected = function(menuItem) {
    	var id = menuItem.attr('_id');
		
		var item = _.find($scope.projectTasksList, function(tp) {
			return tp.resource == id;
		})
		
		var ul = menuItem.closest('ul');
		
		//ul.prev('input').val(item.name);
		
		var entry = ul.closest('.hours-logged-entry');
		var currentInd = entry.attr('_hourentryindex');
		
		var hourEntry = $scope.selected.hoursEntries[currentInd];
		
		$scope.$apply(function() {
			hourEntry.selectedItem = item;
		});
		
    };
    
    $scope.handleDocClick = function(e) {
    	e = e ? e: window.event;
    	
    	var menuItem = $(e.target).closest('a.menu-item');
    	
    	if (menuItem.length == 1) 
    		$scope.menuItemSelected(menuItem)
    	
    	if ($(e.target).closest('input[name="project-task-select"]').length > 0)
    		return
    		
		if ($(e.target).closest('.search-icon').length > 0)
    		return
    		
    	$('ul.dropdown-menu.ddProjectsTasksMenu').hide();
    	
    }

    $scope.initNewHoursEntry = function(hourEntry) {
    	if (hourEntry.hoursRecord && hourEntry.hoursRecord.isAdded) {
    		// use timeout to perform code after init 
    		window.setTimeout(function(){
    			$scope.editHoursEntry(null, hourEntry, 
    				$('.dashboard-widget.hours .row.hours-logged .hours-logged-entry input[name="project-task-select"]').eq(0))
			}, 0)
    	}
    }
    $scope.hideHoursEntry = function (day) {
      $scope.entryFormOpen = false
      //delete $scope.selected;
      
      //$('#editHours').modal('hide');
      $scope.showHideHoursDialog(false)
    };

    $scope.addHoursEntry = function(){
    	$scope.addNewHours();
    }
    
   
    //MOVE THIS TO FORM CONTROLLER WHEN READY
    $scope.addNewHours = function (isTask) {
      //match date with current hours
      var displayedHoursLength = $scope.displayedHours.length;
      
      for (var i = 0; i < displayedHoursLength; i++) {
        if ($scope.selected.date === $scope.displayedHours[i].date) {
          // $scope.activeAddition = $scope.displayedHours[i];
          $scope.newHoursRecord = {
            date: $scope.selected.date,
            description: "",
            hours: "",
            person: $scope.me,
            editMode: true,
            isAdded: true

          };

          if (!isTask)
            $scope.newHoursRecord.project = {};
          else
            $scope.newHoursRecord.task = {};
          /*
          //push the new hours record to the appropriate hoursEntries array
          //this will cause the UI to update and show a blank field
          if ($scope.displayedHours[i].hoursEntries) {
            $scope.displayedHours[i].hoursEntries.unshift({hoursRecord: $scope.newHoursRecord});
          } else {
            var hoursEntries = []
            $scope.displayedHours[i].hoursEntries = hoursEntries;
            //console.log($scope.displayedHours[i])
            $scope.displayedHours[i].hoursEntries.unshift({hoursRecord: $scope.newHoursRecord});
          }
          */

          
          // sync selected object with displayedHours collection
          if ($scope.selected.hoursEntries) {
	          $scope.selected.hoursEntries.unshift({hoursRecord: $scope.newHoursRecord});
	        } else {
	          $scope.selected.hoursEntries = [];
	          $scope.selected.hoursEntries.unshift({hoursRecord: $scope.newHoursRecord});
	        }
          
          
          // $scope.displayedHours[i].hoursEntries.unshift($scope.newHoursRecord);
        }
      }
    };
    
    $scope.anyAdded = function() {
    	var result = false;
    	
    	for (var i = 0; i < $scope.selected.hoursEntries.length; i++) {
            var entry = $scope.selected.hoursEntries[i];
            
            if (entry.hoursRecord && entry.hoursRecord.isAdded)
            	result = true;
    	}
    	
    	return result;
    }

    $scope.addNewTaskHours = function () {
      $scope.addNewHours(true)
    };

    $scope.loadAvailableTasks = function () {
      TasksService.refreshTasks().then(function (tasks) {
        _.each(tasks, function (t) {
          $scope.hoursTasks.push(t)
          $scope.projectTasksList.push(t);
          
          t.icon = taskIconsMap[t.name.toLowerCase()];
          t.iconCss = taskIconStylseMap[t.name.toLowerCase()]
        })


      })
    }

    $scope.deleteHoursRecord = function (index) {
		if ($scope.selected.hoursEntries[index] ) {
			if ($scope.selected.hoursEntries[index].hoursRecord)
				$scope.hoursToDelete.push($scope.selected.hoursEntries[index].hoursRecord.resource);
	      
			$scope.selected.hoursEntries.splice(index, 1);
	    }
    }

    //date formatter helper
    $scope.formatTheDate = function (d) {
      var dd = d.getDate();
      var mm = d.getMonth() + 1;
      var yyyy = d.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      $scope.theDayFormatted = yyyy + '-' + mm + '-' + dd;

      var dayFormat = yyyy + '-' + mm + '-' + dd;
      return dayFormat

    }

    $scope.moment = moment;
    var me = $scope.me ? $scope.me.about : '';


    //Doc Brown - time travel.
    $scope.dateIndex = 0;
    $scope.backInTime = function () {
      $scope.dateIndex = $scope.dateIndex + 7;
      $scope.entryFormOpen = false;
      delete $scope.selected;
      $scope.hoursRequest();

    }
    $scope.forwardInTime = function () {
      $scope.dateIndex = $scope.dateIndex - 7;
      $scope.entryFormOpen = false;
      // console.log($scope.dateIndex);

      delete $scope.selected;
      $scope.hoursRequest();

    }
    $scope.thisWeek = function () {
      $scope.dateIndex = 0;
      $scope.entryFormOpen = false;
      delete $scope.selected;
      $scope.hoursRequest();
    }


    //TODO task: get this week of dates
    $scope.showWeekDates = function (callback) {
      $scope.todaysDate = $scope.moment().format('YYYY-MM-DD');
      var moment = $scope.moment().subtract($scope.dateIndex, 'days');
      var startOfWeek = moment.day(0);


      //array to hold the dates
      $scope.thisWeekDates = [];
      $scope.thisWeekDayLables = [];

      //run through and build out the array of the week's dates
      for (var i = 0; i < 7; i++) {
        var moment = $scope.moment(startOfWeek).add(i, 'days');
        var dateFormatted = moment.format('YYYY-MM-DD');
        $scope.thisWeekDates.push(dateFormatted);
        $scope.thisWeekDayLables[i] = moment.format('ddd');
      }
      $scope.prettyCalendarFormats($scope.thisWeekDates[0], $scope.thisWeekDates[6]);
      callback($scope.thisWeekDates);
      //console.log($scope.thisWeekDates.length);
    }

    $scope.months = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    $scope.prettyCalendarFormats = function (firstDay, lastDay) {
      $scope.prettyCalendarDates = {}
      var d1 = new Date(firstDay);
      d1.setDate(d1.getDate() + 1);
      var day1 = d1.getDate();
      var month1 = $scope.months[d1.getMonth()]
      var month1Short = month1.substring(0, 3)
      $scope.prettyCalendarDates.firstDate = month1Short + ' ' + day1;

      var d2 = new Date(lastDay);
      d2.setDate(d2.getDate() + 1);
      var day2 = d2.getDate();
      var month2 = $scope.months[d2.getMonth()]
      var month2Short = month2.substring(0, 3)
      var year = d2.getFullYear();
      $scope.prettyCalendarDates.lastDate = month2Short + ' ' + day2 + ', ' + year;
      return $scope.prettyCalendarDates;
    }

    $scope.hoursRequest = function () {
      $scope.showWeekDates(function (result) {
        HoursService.getHoursRecordsBetweenDates($scope.me, $scope.thisWeekDates[0], $scope.thisWeekDates[6]).then(function (result) {
          if (result.length === 0) {
            console.error("getHoursRecordsBetweenDates(" + $scope.thisWeekDates[0] + "," + $scope.thisWeekDates[6] + ") gave me no results");
          } else {
            $scope.displayedHours = result;
            
            for (var i = 0; i < $scope.displayedHours.length; i++) {
              $scope.displayedHours[i].totalHours = 0;

              var futureness = $scope.checkForFutureness($scope.displayedHours[i].date);
              
              $scope.displayedHours[i].futureness = futureness;
              
              for (var j = 0; j < $scope.displayedHours[i].hoursEntries.length; j++) {
                if ($scope.displayedHours[i].hoursEntries[j].hoursRecord) {
                  $scope.displayedHours[i].totalHours = $scope.displayedHours[i].totalHours + $scope.displayedHours[i].hoursEntries[j].hoursRecord.hours
                  
                  if ($scope.displayedHours[i].hoursEntries[j].hoursRecord.task) {
                	  $scope.displayedHours[i].hoursEntries[j].task  = $scope.displayedHours[i].hoursEntries[j].hoursRecord.task;
                	  Resources.resolve($scope.displayedHours[i].hoursEntries[j].task)
                  }
                }
              }
              
              if (!$scope.selected && $scope.displayedHours[i].date == $scope.todaysDate){
            	  //$scope.selected = JSON.parse(JSON.stringify( $scope.displayedHours[i]));
            	  $scope.selected = $scope.displayedHours[i];
              } else if ($scope.selected && $scope.displayedHours[i].date == $scope.selected.date){
            	  $scope.selected = $scope.displayedHours[i];
              }
            }
          }
        });
      });
    }

    $scope.newHoursRecord = {};
    $scope.hoursValidation = [];

    $scope.getNewHoursValidationErrors = function () {

      $scope.hoursValidation = [];

      var totalHours = 0;

      /*
       for (var i = 0; hoursForm["hours" + i]; i++) {
       if ( hoursForm["hours" + i].$dirty &&  hoursForm["hours" + i].$invalid){
       $scope.hoursValidation.push("Incorrect value for hours")

       }

       }
       */

      var entries = $scope.selected ? $scope.selected.hoursEntries : [];


      for (var i = 0; i < entries.length; i++) {
        if (entries[i].innerHoursForm && entries[i].innerHoursForm["hours"] && entries[i].innerHoursForm["hours"].$dirty && entries[i].innerHoursForm["hours"].$invalid) {
          $scope.hoursValidation.push("Incorrect value for hours")

        } else if (entries[i].hoursRecord && entries[i].hoursRecord.hours)
          totalHours += parseFloat(entries[i].hoursRecord.hours);
      }

      if (totalHours > 24)
        $scope.hoursValidation.push("Hours logged on a given day cannot exceed 24 hours.");

      $scope.hoursValidation = _.uniq($scope.hoursValidation)

      return  $scope.hoursValidation.length > 0;
    }

    $scope.addHours = function () {
      var entries = $scope.selected.hoursEntries;
      var hoursRecords = [];
      var totalHours = 0;
      $scope.hoursValidation = [];

      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        
        if (entry.hoursRecord) {
          hoursRecords.push(entry.hoursRecord);
          totalHours += !isNaN(parseInt(entry.hoursRecord.hours)) ? parseInt(entry.hoursRecord.hours) : 0;
          //if (!entry.hoursRecord.person) {
          entry.hoursRecord.person = {resource: $scope.me.about};
          //}
          if (!entry.hoursRecord.date) {
            entry.hoursRecord.date = $scope.selected.date;
          }
        }
        
        // remove embedded property which leverage to server side error when updating hours record
        if (entry.hoursRecord && entry.hoursRecord.project && entry.hoursRecord.project["$fromServer"])
        	delete entry.hoursRecord.project["$fromServer"]
        else  if (entry.hoursRecord && entry.hoursRecord.task && entry.hoursRecord.task["$fromServer"])
        	delete entry.hoursRecord.task["$fromServer"]
      }

      if (totalHours > 24) {
        $scope.hoursValidation.push("Hours logged on a given day cannot exceed 24 hours.");
        return;
      }

      // update total hours value to apropriatly display in hours widget
      $scope.selected.totalHours = totalHours;
      /*
      if ($scope.hoursToDelete) {
        for (var i = 0; i < $scope.hoursToDelete.length; i++) {
          if ($scope.hoursToDelete[i]) {
            Resources.remove($scope.hoursToDelete[i]);
          }
        }
      }
*/
      HoursService.updateHours(hoursRecords).then(function () {
        //$('#editHours').modal('hide');
    	  //$scope.showHideHoursDialog(false)
        //$scope.entryFormOpen = false;
       // delete $scope.selected;

        $scope.hoursRequest();
      });

    };

    $scope.copyHours = function (index) {
      $scope.hideMessages();
      var selectedDate = getDate($scope.selected.date);

      var copyFromEntries = [];

      // if it's possible, trying to find hours entries from yesterday
      var tmpD = $scope.selected.date.split('-');

      var copyFromDate = new Date(parseInt(tmpD[0]), parseInt(tmpD[1]) - 1, parseInt(tmpD[2]) - 1);

      var shortDate = getShortDate(copyFromDate);
      var copyFromEntry = _.findWhere($scope.displayedHours, { date: shortDate });
      var copyEntryFound = false;

      if (copyFromEntry) {
        var prevDayHoursRecords = _.pluck(copyFromEntry.hoursEntries, "hoursRecord");
        prevDayHoursRecords = _.filter(prevDayHoursRecords, function (p) {
          if (p) return true;
        });
        if (prevDayHoursRecords.length > 0) {
          copyHoursCallback(copyFromEntry.hoursEntries);
          copyEntryFound = true;
        }
      }
      // if not, get hours for 1 week earlier than selected date, find nearest day with logged hours.
      if (!copyEntryFound) {
        var fromDate = new Date(parseInt(tmpD[0]), parseInt(tmpD[1]) - 1, parseInt(tmpD[2]) - 7);
        var from = getShortDate(fromDate);
        HoursService.getHoursRecordsBetweenDates($scope.me, from, shortDate).then(function (result) {
          for (var i = result.length - 1; i >= 0; i--) {
            if (result[i].hoursEntries.length > 0) {
              var houseRecordsInside = _.filter(result[i].hoursEntries, function (h) {
                if (h.hoursRecord) return true;
              });
              if (houseRecordsInside.length > 0) {
                copyHoursCallback(result[i].hoursEntries);
                copyEntryFound = true;
                return;
              }
            }
          }

          if (!copyEntryFound) {
            $scope.hoursValidation.push("No hours to copy found for the last week.");
          }
        });
      }
    }

    var getDate = function (dateString) {
      var tmpD = dateString.split('-');
      var date = new Date(parseInt(tmpD[0]), parseInt(tmpD[1]), parseInt(tmpD[2]));
      return date;
    }

    var copyHoursCallback = function (copyFromEntries) {
      var hoursRecords = _.pluck($scope.selected.hoursEntries, "hoursRecord");
      hoursRecords = _.reject(hoursRecords, function (h) {
        return (typeof h) === 'undefined';
      });
      $scope.hoursToDelete = _.pluck(hoursRecords, "resource");
      $scope.selected.hoursEntries = [];

      var displayedHoursEntry = _.findWhere($scope.displayedHours, { date: $scope.selected.date });
      for (var i = 0; i < copyFromEntries.length; i++) {
        if (copyFromEntries[i].hoursRecord) {
          var newHoursRecord = {
            date: $scope.selected.date,
            description: copyFromEntries[i].hoursRecord.description,
            hours: copyFromEntries[i].hoursRecord.hours,
            person: { resource: $scope.me.about }
          }

          if (copyFromEntries[i].hoursRecord.project) {
            newHoursRecord.project = copyFromEntries[i].hoursRecord.project;
          }

          if (copyFromEntries[i].hoursRecord.task) {
            newHoursRecord.task = copyFromEntries[i].hoursRecord.task;
          }

          var hoursEntry = {
            project: copyFromEntries[i].project,
            hoursRecord: newHoursRecord
          }

          if (copyFromEntries[i].assignment) {
            hoursEntry.assignment = copyFromEntries[i].assignment;
          }

          //displayedHoursEntry.hoursEntries.unshift(hoursEntry);

          $scope.selected.hoursEntries.unshift( $scope.cloneDay(hoursEntry) );
        }
      }
    }

    var getShortDate = function (date) {
      //Get todays date formatted as yyyy-MM-dd
      var dd = date.getDate();
      var mm = date.getMonth() + 1; //January is 0!
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

    $scope.hideMessages = function () {
      $scope.hoursValidation = [];
    };

    $scope.showHideHoursDialog = function(show) {
    	$('#editHours').modal(show ? 'show': 'hide');
    	//$('#editHours').css('display', show ? 'block !important': 'none !important')
    }
    
    $scope.cloneDay = function(day) {
    	return JSON.parse(JSON.stringify(day));
    }

    $scope.$watch('displayedHours', function (value) {
      var val = value || null;
      if (val)  $scope.$emit('masonryGo');
    });

    var init = function (event) {
      $scope.hoursRequest();
      $scope.loadAvailableTasks();
    };

    if ($scope.me)
      init()
    else
      $rootScope.$on('me:loaded', init)

  }
]);
