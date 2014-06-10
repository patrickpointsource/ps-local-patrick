'use strict';

/**
 * Controller for Reports.
 */
angular.module('Mastermind').controller('ReportsCtrl', ['$scope',
                                                           '$q',
                                                           '$state',
                                                           '$stateParams',
                                                           '$filter',
                                                           'Resources',
                                                           'AssignmentService',
                                                           'ProjectsService',
                                                           'TasksService',
                                                           'RolesService',
                                                           'ngTableParams',
    function ($scope, $q, $state, $stateParams, $filter, Resources,
        AssignmentService, ProjectsService, TasksService, RolesService, TableParams) {

        var UNSPECIFIED = 'Unspecified';
        $scope.projects = [];
        $scope.hoursTasks = [];
        $scope.data = [];  

        $scope.reportClick = function (item) {
            alert(item.name);
        };

        $scope.getRoles = function () {
            Resources.refresh('roles').then(function (result) {
                var members = result.members;
                $scope.allRoles = members;
                var rolesMap = {};
                for (var i = 0; i < members.length; i++) {
                    rolesMap[members[i].resource] = members[i];
                }

                // sorting roles by title
                $scope.allRoles.sort(function (a, b) {
                    var x = a.title.toLowerCase();
                    var y = b.title.toLowerCase();
                    return x < y ? -1 : x > y ? 1 : 0;
                });

                // add unspecified item to roles dropdown
                $scope.allRoles.unshift({
                    'title': UNSPECIFIED
                });

                $scope.rolesMap = rolesMap;

                $scope.getRoleName = function (resource) {
                    var ret = UNSPECIFIED;
                    if (resource && $scope.rolesMap[resource]) {
                        ret = $scope.rolesMap[resource].title;
                    }
                    return ret;
                };
            });
        };


        $scope.monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

        $scope.initHours = function () {
            var projectHours = [];
            $scope.projectHours = [];
            $scope.hoursPeriods = [];
            $scope.selectedHoursPeriod = -1;

            //Query all hours
            var hoursQuery = {};
            //All Fields
            var fields = {};
            var sort = {
                'created': 1
            };
            Resources.get('hours').then(function (hoursResult) {
                //console.log(hoursResult);
                $scope.hours = hoursResult.members;
                $scope.initHoursPeriods($scope.hours);
                $scope.hasHours = $scope.hours.length > 0;

                for (var i = 0; i < $scope.hours.length; i++) {
                    var hour = $scope.hours[i];
                    if (hour.task && hour.task.resource) {
                        var taskRes = $scope.hours[i].task.resource;
                        var task = _.findWhere($scope.hoursTasks, {
                            resource: taskRes
                        });
                        $scope.hours[i].task.name = task.name;
                    }
                }

                var projects = _.pluck($scope.hours, 'project');
                projects = _.filter(projects, function (p) {
                    if (p) {
                        return true;
                    }
                });
                projects = _.pluck(projects, 'resource');
                projects = _.uniq(projects);

                // filter array to avoid empty entries
                projects = _.filter(projects, function (p) {
                    return p ? true : false;
                });
                var currentMonth = new Date().getMonth();
                var currentYear = new Date().getFullYear();

                for (var projCounter = 0; projCounter < projects.length; projCounter++) {
                    var project = ProjectsService.getForEditByURI(projects[projCounter]).then(function (result) {

                        var projectHour = {
                            projectURI: result.about,
                            project: result,
                            hours: [],
                            collapsed: false,
                            icon: $scope.projectStateIcon(result)
                        };
                        var taskHour = null;
                        var tasksMap = {};
                        var tasksHoursMap = {};

                        for (var hoursCounter = 0; hoursCounter < $scope.hours.length; hoursCounter++) {
                            taskHour = null;

                            var hoursData = $scope.hours[hoursCounter];
                            var tmpD = hoursData.date.split('-');
                            var hoursMonth = parseInt(tmpD[1]) - 1;
                            var hoursYear = parseInt(tmpD[0]);
                            var timeValue = 0;

                            if (hoursData.project && hoursData.project.resource == result.about) {
                                timeValue = hoursData.hours;
                                projectHour.totalHours += timeValue;
                                projectHour.hours.push({
                                    hour: hoursData,
                                    show: (currentMonth === hoursMonth && currentYear === hoursYear),
                                    value: timeValue
                                });
                            } else if (hoursData.task) {
                                timeValue = hoursData.hours;
                                if (!tasksMap[hoursData.task.resource]) {
                                    tasksMap[hoursData.task.resource] = hoursData.task;
                                }
                                if (!tasksHoursMap[hoursData.task.resource]) {
                                    tasksHoursMap[hoursData.task.resource] = [];
                                }
                                //tasksHoursMap[hoursData.task.resource].totalHours += timeValue;
                                tasksHoursMap[hoursData.task.resource]
                                    .push({
                                        hour: hoursData,
                                        show: (currentMonth == hoursMonth && currentYear == hoursYear)
                                    });
                            }
                        }

                        projectHour.hours.sort(function (h1, h2) {
                            if (new Date(h1.hour.date) > new Date(h2.hour.date)) {
                                return -1;
                            } else if (new Date(h1.hour.date) < new Date(h2.hour.date)) {
                                return 1;
                            }
                            return 0;
                        });

                        $scope.projectHours.push(projectHour);
                        $scope.taskHours = [];

                        for (var taskResource in tasksMap) {
                            tasksHoursMap[taskResource].sort(function (h1, h2) {
                                if (new Date(h1.hour.date) > new Date(h2.hour.date)) {
                                    return -1;
                                } else if (new Date(h1.hour.date) < new Date(h2.hour.date)) {
                                    return 1;
                                }
                                return 0;
                            });
                            $scope.taskHours.push(_.extend({
                                hours: tasksHoursMap[taskResource]
                            }, tasksMap[taskResource]));
                        }
                        var taskData = [];
                        $scope.taskHours.forEach(function (d) {
                            //d.date = parseDate(d.date);
                            var hourData = [];
                            var totalHours = 0;
                            d.hours.forEach(function (h) {
                                hourData.push({date: h.hour.date, 
                                			   value: h.hour.hours, 
                                			   description: h.hour.description, 
                                			   task: h.hour.task.name});
                                totalHours += h.hour.hours;
                            });
                            taskData.push({name: d.name, items: hourData, totalHours: totalHours});
                        });
                        setData(taskData);
                        getTaskData();
                    });
                }
                
            });
        };
        
        function getTaskData() {
        	var taskData = [];
        	var dateRange = $scope.getDateRange();
        	var dates = {};
        	dateRange.forEach(function(o){
        	    dates[o.date] = [];
        	})
        	var testData = [];
            
        	// Before totaling the tasks        	
        	$scope.taskHours.forEach(function (d) {
                d.hours.forEach(function (h) {
                	if(dates[h.hour.date]) {
                		var ds = dates[h.hour.date];
                		ds.push({date: h.hour.date,
                				 value: h.hour.hours,
                                 person: h.hour.person,
                                 description: h.hour.description,
                    			 task: h.hour.task.name});
                		testData.push({date: h.hour.date,
           				 value: h.hour.hours,
        				 description: h.hour.description,
            			 task: h.hour.task.name});
                	}
                		
                });
            });
            setData(dates);
        }
        
        function setData(data) {
            //var newArray = []
            //for (var key in data) {
            //    newArray.push(data);
            //}
        	$scope.data = data;
        }        

        TasksService.refreshTasks().then(
            function (tasks) {
                _.each(tasks, function (t) {
                    $scope.hoursTasks.push(t);
                });
                return $scope.getRoles();
        }).then(
            function (data) {
                setInitialDates(); 
                return $scope.initHours();
            }
        );
        
        function setInitialDates() {
       	 var x = new Date();
       	 x.setDate(1);
       	 x.setHours(0, 0, 0, 0);
       	 x.setMonth(x.getMonth()-1);
       	 $scope.startDateModel = $filter('date')(x, "yyyy-MM-dd");
       	 var y = new Date();
       	 y.setDate(1);
       	 y.setHours(0, 0, 0, 0);
       	 y.setHours(y.getHours()-24);
       	 $scope.endDateModel = $filter('date')(y, "yyyy-MM-dd");    
       }   
               
        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf())
            dat.setDate(dat.getDate() + days);
            return dat;
        }

        $scope.getDateRange = function () {
            var dateArray = [];
            var currentDate = convertDate($scope.startDateModel);
            while (currentDate <=  convertDate($scope.endDateModel)) {
                dateArray.push( {date: $filter('date')(new Date(currentDate), "yyyy-MM-dd")});
                currentDate = currentDate.addDays(1);
            }
            return dateArray;
        }

        $scope.initHoursPeriods = function (hours) {
            $scope.hoursPeriods = [];

            var now = new Date();

            $scope.selectedHoursPeriod = now.getMonth();
            var minDate = null;
            var maxDate = null;

            var currentDate;

            for (var i = 0; i < hours.length; i++) {
                var tmpD = hours[i].date.split('-');
                currentDate = new Date(parseInt(tmpD[0]), parseInt(tmpD[1]) - 1, parseInt(tmpD[2]));
                if (!minDate || minDate > currentDate) {
                    minDate = new Date(currentDate);
                }
                if (!maxDate || maxDate <= currentDate) {
                    maxDate = new Date(currentDate);
                }
            }

            var ifAddYear = minDate && maxDate && minDate.getFullYear() !== maxDate.getFullYear();

            currentDate = new Date(minDate);
            var o = null;

            while (currentDate <= maxDate) {
                o = {
                    name: $scope.monthNames[currentDate.getMonth()],
                    value: currentDate.getMonth()
                };
                $scope.hoursPeriods.push(o);

                if (ifAddYear) {
                    o.name = o.name + ', ' + currentDate.getFullYear();
                    o.value = currentDate.getFullYear() + '-' + o.value;
                }
                currentDate = new Date(currentDate);

                currentDate.setDate(1);
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        };

        $scope.handleHoursPeriodChanged = function () {
            for (var i = 0; i < $scope.projectHours.length; i++) {
                var projHour = $scope.projectHours[i];
                for (var j = 0; j < projHour.hours.length; j++) {
                    var hour = projHour.hours[j];
                    var hoursMonth = new Date(hour.hour.date).getMonth();
                    hour.show = this.selectedHoursPeriod === hoursMonth;
                }
            }

            for (i = 0; i < $scope.taskHours.length; i++) {
                projHour = $scope.taskHours[i];
                for (j = 0; j < projHour.hours.length; j++) {
                    hour = projHour.hours[j];
                    hoursMonth = new Date(hour.hour.date).getMonth();
                    hour.show = this.selectedHoursPeriod === hoursMonth;
                }
            }
        };

        $scope.isEmptyForSelectedMonth = function (projectHour) {
            for (var i = 0; i < projectHour.hours.length; i++) {
                if (projectHour.hours[i].show) {
                    return false;
                }
            }
            return true;
        };

        $scope.projectIcon = function (projectResource) {
            var iconObject = _.findWhere($scope.projectIcons, {
                resource: projectResource
            });
            return iconObject ? iconObject.icon : '';
        };


        $scope.isCurrentProject = function (endDate) {
            var date = new Date(endDate);
            var currentDate = new Date();
            if (date.getTime() < currentDate.getTime()) {
                return false;
            }
            return true;
        };

       

        $scope.setHoursView = function (view) {
            $scope.hoursViewType = view;
            if (view === 'weekly') {
                $scope.currentWeek();
            }
        };

        $scope.hoursViewType = 'monthly';
        $scope.selectedWeekIndex = 0;
        $scope.thisWeekDayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        $scope.newHoursRecord = {};
        $scope.moment = moment;

        $scope.startWeekDate = $scope.moment().day(0).format('YYYY-MM-DD');
        $scope.endWeekDate = $scope.moment().day(6).format('YYYY-MM-DD');

        $scope.dayFormatted = function (yyyymmdd, params) {
            if (params) {
                return moment(yyyymmdd).format(params);
            }
            return moment(yyyymmdd).format('MMM D');
        };


        $scope.weekHoursByProject = [];
        $scope.weekHoursByTask = [];

        $scope.showWeek = function () {
            $scope.startWeekDate = $scope.moment().day($scope.selectedWeekIndex).format('YYYY-MM-DD');
            $scope.endWeekDate = $scope.moment().day($scope.selectedWeekIndex + 6).format('YYYY-MM-DD');

            var profileWeekHours = [];
            for (var i = 0; i < $scope.hours.length; i++) {
                var hour = $scope.hours[i];
                var date = convertDate(hour.date);
                var start = convertDate($scope.startWeekDate);
                var end = convertDate($scope.endWeekDate);
                if (date >= start && date <= end) {
                    profileWeekHours.push(hour);
                }
            }

            var weekHoursByProject = [];
            var weekHoursByTask = [];

            // filtering hours entries by project and task
            for (i = 0; i < profileWeekHours.length; i++) {
                var weekHour = profileWeekHours[i];

                var filteredHoursByProject = {};
                if (weekHour.project) {
                    filteredHoursByProject = _.filter(weekHoursByProject,
                        function (h) {
                            return h.project.resource === weekHour.project.resource;
                        });
                    if (filteredHoursByProject.length === 0) {
                        var weekHourByProject = {
                            project: weekHour.project,
                            hours: [weekHour]
                        };
                        Resources.resolve(weekHourByProject.project);
                        weekHoursByProject.push(weekHourByProject);
                    } else {
                        filteredHoursByProject[0].hours.push(weekHour);
                    }
                }

                var filteredHoursByTask = {};
                if (weekHour.task) {
                    filteredHoursByTask = _.filter(weekHoursByTask, function (h) {
                        return h.task.resource === weekHour.task.resource;
                    });
                    if (filteredHoursByTask.length === 0) {
                        var weekHourByTask = {
                            task: weekHour.task,
                            hours: [weekHour]
                        };
                        weekHoursByTask.push(weekHourByTask);
                    } else {
                        filteredHoursByTask[0].hours.push(weekHour);
                    }
                }
            }

            $scope.weekHours = weekHoursByProject.concat(weekHoursByTask);

            // filter hours entries by day of week
            for (i = 0; i < $scope.weekHours.length; i++) {
                var weekHours = $scope.weekHours[i];
                weekHours.hoursByDate = [];
                for (var w = 0; w < 7; w++) {
                    var totalHours = 0;
                    var weekHoursEntries = [];
                    date = $scope.moment($scope.startWeekDate).add('days', w).format('YYYY-MM-DD');

                    for (var h = 0; h < weekHours.hours.length; h++) {
                        if (weekHours.hours[h].date === date) {
                            weekHoursEntries.push(weekHours.hours[h]);
                            totalHours += weekHours.hours[h].hours;
                        }
                    }

                    weekHours.hoursByDate.push({
                        hours: weekHoursEntries,
                        totalHours: totalHours,
                        futureness: $scope.checkForFutureness($scope.moment($scope.startWeekDate).add('days', w).format('YYYY-MM-DD'))
                    });
                }
            }

            $scope.weekHoursByProject = weekHoursByProject;
            $scope.weekHoursByTask = weekHoursByTask;

        };

        var convertDate = function (stringDate) {
            var tmpDate = stringDate.split('-');
            return new Date(tmpDate[0], parseInt(tmpDate[1]) - 1, tmpDate[2]);
        };

        $scope.checkForFutureness = function (date) {
            //flux capacitor
            var a = moment().subtract('days', 1);
            var b = moment(date);
            var diff = a.diff(b);

            var futureness;
            if (diff < 0) {
                futureness = true;
            } else {
                futureness = false;
            }
            return futureness;
        };

}]);