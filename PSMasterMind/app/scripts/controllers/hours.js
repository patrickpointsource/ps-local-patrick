/**
 * Created by kenhoes on 4/1/14.
 */
angular.module('Mastermind').controller('HoursCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'HoursService', 'TasksService',
    function ($scope, $state, $rootScope, Resources, ProjectsService, HoursService, TasksService) {

        $scope.checkForFutureness = function(date) {
            //flux capacitor
            var a = moment().subtract('days',1);
            var b = moment(date);
            var diff = a.diff(b);

            var futureness;
            if (diff < 0) {
                futureness = true
            } else {
                futureness = false
            }
            return futureness;
        }


        /**
         * TODO THIS SECTION REQUIRES CLEANUP AND MODULARIZATION
         * TODO set up hour submission
         * TODO make the calendar scroll left/right
         * TODO save to MongoDB
         */
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
                $scope.selected = day;
                $('#editHours').modal('show');
                $scope.entryFormOpen = true;
            }
        };
        
        $scope.hideHoursEntry = function (day) {
        	$scope.entryFormOpen = false
            delete $scope.selected;
        	$('#editHours').modal('hide');

        };


        //MOVE THIS TO FORM CONTROLLER WHEN READY
        $scope.addNewHours = function (isTask) {
            //console.log('clicked addNewHours');
            //console.log($scope.selected);


            //match date with current hours
            var displayedHoursLength = $scope.displayedHours.length;
            for (var i = 0; i < displayedHoursLength; i++) {
                if ($scope.selected.date === $scope.displayedHours[i].date) {
                    // $scope.activeAddition = $scope.displayedHours[i];
                    $scope.newHoursRecord = {
                        date: $scope.selected.date,
                        description: "",
                        hours: "",
                        person: $scope.me
                        
                    };
                    
                    if (!isTask)
                    	$scope.newHoursRecord.project = {};
                    else
                    	$scope.newHoursRecord.task = {};
                    //push the new hours record to the appropriate hoursEntries array
                    //this will cause the UI to update and show a blank field
                    if($scope.displayedHours[i].hoursEntries) {
                        $scope.displayedHours[i].hoursEntries.unshift($scope.newHoursRecord);
                    } else {
                        var hoursEntries = []
                        $scope.displayedHours[i].hoursEntries = hoursEntries;
                        //console.log($scope.displayedHours[i])
                        $scope.displayedHours[i].hoursEntries.unshift($scope.newHoursRecord);
                    }
                   // $scope.displayedHours[i].hoursEntries.unshift($scope.newHoursRecord);
                }
            }
        };
        
        $scope.addNewTaskHours = function () {
            $scope.addNewHours(true)
        };
        
        $scope.loadAvailableTasks = function() {
        	TasksService.refreshTasks().then(function(tasks) {
        		_.each(tasks, function(t){
        			$scope.hoursTasks.push(t)
        		})
        		
        		
        	})
        }
        
        $scope.deleteHoursRecord = function(index) {
        	$scope.hoursToDelete.push($scope.selected.hoursEntries[index].hoursRecord.resource);
        	$scope.selected.hoursEntries.splice(index, 1);
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
        var me = $scope.me.about;


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
                    if(result.length === 0) {
                    	console.error("getHoursRecordsBetweenDates("+$scope.thisWeekDates[0]+","+$scope.thisWeekDates[6]+") gave me no results");
                    } else {
                        $scope.displayedHours = result;
                        for (var i = 0; i < $scope.displayedHours.length; i++) {
                            $scope.displayedHours[i].totalHours = 0;

                            var futureness = $scope.checkForFutureness($scope.displayedHours[i].date);
                            $scope.displayedHours[i].futureness = futureness;
                            for (var j = 0; j < $scope.displayedHours[i].hoursEntries.length; j++) {
                                if ($scope.displayedHours[i].hoursEntries[j].hoursRecord) {
                                    $scope.displayedHours[i].totalHours = $scope.displayedHours[i].totalHours + $scope.displayedHours[i].hoursEntries[j].hoursRecord.hours
                                }
                            }
                        }
                    }
                });
            });
        }

        $scope.hoursRequest();
        $scope.newHoursRecord = {};
        $scope.hoursValidation = [];

        $scope.addHours = function () {
            var entries = $scope.selected.hoursEntries;
            var hoursRecords = [];
            var totalHours = 0;
            $scope.hoursValidation = [];
            
            for (var i = 0; i < entries.length; i++) {
                //console.log(entries[i].hoursRecord);

                var entry = entries[i];
                if (entry.hoursRecord) {
                    hoursRecords.push(entry.hoursRecord);
                    totalHours += parseInt(entry.hoursRecord.hours);
                    if (!entry.hoursRecord.person) {
                        entry.hoursRecord.person = {resource: $scope.me.about};
                    }
                    if (!entry.hoursRecord.date) {
                        entry.hoursRecord.date = $scope.selected.date;
                    }
                }
            }
            
            if(totalHours > 24) {
            	$scope.hoursValidation.push("Hours logged on a given day cannot exceed 24 hours.");
            	return;
            }
            
            if($scope.hoursToDelete) {
            	for(var i = 0; i < $scope.hoursToDelete.length; i++) {
            		if($scope.hoursToDelete[i]) {
            			Resources.remove($scope.hoursToDelete[i]);
            		}
            	}
            }
            
            HoursService.updateHours(hoursRecords).then(function () {
            	 $('#editHours').modal('hide');
                $scope.entryFormOpen = false;
                delete $scope.selected;

                $scope.hoursRequest();
            });
           
        };
        
        $scope.copyHours = function(index) {
        	var today = new Date($scope.selected.date);
        	var copyFromDate = new Date();
        	var copyFromEntries = [];
        	
        	// if monday, copy from last friday
        	if(today.getDay() == 1) {
        		copyFromDate.setDate(today.getDate() - 3);
        		
        		var date = getShortDate(copyFromDate);
        		
        		var friydayHours = HoursService.getHoursRecordsBetweenDates($scope.me, date, date).then(function(result) {
        			if(result.length > 0) {
        				copyHoursCallback(result[0].hoursEntries);
        			}
        		});
        	}
        	else {
        		copyFromDate.setDate(today.getDate() - 1);
            	
            	var shortDate = getShortDate(copyFromDate);
            	var copyFromEntry = _.findWhere($scope.displayedHours, { date: shortDate });
            	
            	copyHoursCallback(copyFromEntry.hoursEntries);
        	}
        }
        
        var copyHoursCallback = function(copyFromEntries) {
    		var hoursRecords = _.pluck($scope.selected.hoursEntries, "hoursRecord");
    		hoursRecords = _.reject(hoursRecords, function(h) { return (typeof h) === 'undefined'; });
    		$scope.hoursToDelete = _.pluck(hoursRecords, "resource");
    		$scope.selected.hoursEntries = [];
    		
    		var displayedHoursEntry = _.findWhere($scope.displayedHours, { date: $scope.selected.date });
    		for(var i = 0; i < copyFromEntries.length; i++) {
    			if(copyFromEntries[i].hoursRecord) {
    				var newHoursRecord = {
        					date: $scope.selected.date,
                            description: copyFromEntries[i].hoursRecord.description,
                            hours: copyFromEntries[i].hoursRecord.hours,
                            person: { resource: $scope.me.about }
        				}
    				
    				if(copyFromEntries[i].hoursRecord.project) {
    					newHoursRecord.project = copyFromEntries[i].hoursRecord.project;
    				}
    				
    				if(copyFromEntries[i].hoursRecord.task) {
    					newHoursRecord.task = copyFromEntries[i].hoursRecord.task;
    				}
    				
    				var hoursEntry = {
    					project: copyFromEntries[i].project,
    					hoursRecord: newHoursRecord
    				}
    				
    				if(copyFromEntries[i].assignment) {
    					hoursEntry.assignment = copyFromEntries[i].assignment;
    				}
    				
    				displayedHoursEntry.hoursEntries.unshift(hoursEntry);
    			}
    		}
    	}
        
        var getShortDate = function(date){
         	 //Get todays date formatted as yyyy-MM-dd
            var dd = date.getDate();
             var mm = date.getMonth()+1; //January is 0!
             var yyyy = date.getFullYear();
             if (dd<10){
               dd='0'+dd;
             }
             if (mm<10){
               mm='0'+mm;
             }
             date = yyyy+'-'+mm+'-'+dd;
             return date;
         }
        
        $scope.hideMessages = function(){
        	$scope.hoursValidation = [];
        };

        $scope.loadAvailableTasks();
        
        $scope.$watch('displayedHours', function(value) { 
            var val = value || null;            
            if (val)  $scope.$emit('masonryGo');
        });
    }
]);
