/* global moment, _, async */
(function(){
    angular
        .module('app.dashboard.widgets.hours', [
            'app.services'
        ])
        .directive('hoursEntry', HoursEntry);

    function HoursEntry() {

        var directive = {
            name: 'hoursEntry',
            scope: true,
            controller: HoursCtrl,
            restrict: 'EA',
            templateUrl: 'app/modules/dashboard/widgets/hours/hoursEntry.html',
            replace: true,
            link: function ($scope, iElm, iAttrs, controller) {
                if (angular.isDefined(iAttrs['mode'])) {
                    $scope.mode = iAttrs['mode'];
                }
            }
        };

        HoursCtrl.$inject = [
            'psafLogger',
            '$scope',
            '$rootScope',
            '$q',
            'UserService',
            'ProjectsService',
            'HoursService',
            'TasksService',
            'RolesService',
            'AssignmentsService',
            'HoursEntryService'
        ];

        return directive;

        function HoursCtrl(psafLogger,
                           $scope,
                           $rootScope,
                           $q,
                           UserService,
                           ProjectsService,
                           HoursService,
                           TasksService,
                           RolesService,
                           AssignmentsService,
                           HoursEntryService) {

            var logger = psafLogger.getInstance('mastermind');

            $scope.isInFuture = function (date) {
                return moment(date).isAfter(moment(), 'day');
            };

            $scope.moment = moment;

            $scope.currentMonth = moment();
            $scope.startDate = moment();
            $scope.projectTasksList = [];
            $scope.hoursValidation = [];

            var thisWeekDates = [];

            // Since we're using SASS, this stuff could really all go in CSS!!
            // TODO: When working on styling, this stuff should all go away and be in CSS instead!!!
            var taskIconsMap = {
                'meetings': 'fa-comments-o',
                'design': 'fa-lightbulb-o',
                'sales': 'fa-usd',
                'pre-sales support': 'fa-phone',
                'training': 'fa-bolt',
                'marketing': 'fa-bar-chart-o',
                'administration': 'fa-cogs',
                'documentation': 'fa-folder-o',
                'sick time': 'fa-ambulance'
            };

            // TODO: When working on styling, this stuff should all go away and be in CSS instead!!!
            var taskIconStylseMap = {
                'meetings': 'padding: 3px 7px;',
                'design': 'padding: 3px 10px;',
                'sales': 'padding: 3px 10px;',
                'pre-sales support': 'padding: 3px 8px;',
                'training': 'padding: 3px 10px;',
                'marketing': 'padding: 3px 6px;',
                'administration': 'padding: 3px 6px;',
                'documentation': 'padding: 4px 7.5px;',
                'sick time': 'padding: 3px 6px;'
            };

            $scope.loadAvailableTasks = function () {
                var deferred = $q.defer();
                $scope.tasksMap = {};
                TasksService.getTasks().then(function (tasks) {
                    _.each(tasks, function (t) {
                        $scope.tasksMap[t.id] = t;
                        $scope.projectTasksList.push(t);

                        t.isTask = true;
                        t.originalName = t.name;
                        t.icon = taskIconsMap[t.name.toLowerCase()];
                        t.iconCss = taskIconStylseMap[t.name.toLowerCase()];
                        t.visible = t.name !== 'Vacation' && t.name !== 'Appointment';
                    });

                    sortProjectTaskList();
                    deferred.resolve();
                }, deferred.reject);
                return deferred.promise;
            };

            /**
             * Set up the projects to be added to the hours
             * entry drop down
             */
            $scope.loadProjects = function () {
                var deferred = $q.defer();
                var myAndOngoingProjects = {};

                // Pull from assignments in case the person's assignment isn't in ongoing projects
                AssignmentsService.getCurrentAssignments($scope.me.id).then(function(myCurrentAssignments){
                    $scope.myAssignments = myCurrentAssignments;

                    async.each(myCurrentAssignments, function(assignment, callback){
                        ProjectsService.getProject(assignment.project).then(function(project){
                            myAndOngoingProjects[project.id] = project;
                            callback();
                        }, callback);
                    }, function(err){
                        if(err){
                            return deferred.reject(err);
                        }
                        ProjectsService.getOngoingProjects().then(function (projects) {
                            _.each(projects, function(project){
                                if(!myAndOngoingProjects[project.id]){
                                    myAndOngoingProjects[project.id] = project;
                                    myAndOngoingProjects[project.id].isOtherProj = true;
                                }
                            });
                            _.each(myAndOngoingProjects, function(project){
                                project.originalName = project.name;
                                project.originalCustomerName = project.customerName;
                            });
                            $scope.projectsMap = myAndOngoingProjects;
                            $scope.projectTasksList = $scope.projectTasksList.concat(_.values(myAndOngoingProjects));

                            sortProjectTaskList();
                            logger.debug('done loading projects!', $scope.projectsMap);
                            deferred.resolve();
                        }, deferred.reject);
                    });
                });

                return deferred.promise;
            };

            var sortProjectTaskList = function () {
                $scope.projectTasksList = _.uniq($scope.projectTasksList, function (tp) {
                    return tp.id;
                });

                $scope.projectTasksList.sort(function (item1, item2) {
                    if (item1.isOtherProj && !item2.isOtherProj) {
                        return 1;
                    } else if (!item1.isOtherProj && item2.isOtherProj) {
                        return -1;
                    } else if (item1.isTask && !item2.isTask) {
                        return 1;
                    } else if (!item1.isTask && item2.isTask) {
                        return -1;
                    } else if (item1.title < item2.title) {
                        return -1;
                    } else if (item1.title > item2.title) {
                        return 1;
                    }
                    return 0;
                });
            };

            UserService.checkForPermission(UserService.PERMISSIONS.DELETE_MY_HOURS_PERMISSION).then(function(result){
                $scope.canDeleteMyHours = result;
            });
            UserService.checkForPermission(UserService.PERMISSIONS.EDIT_HOURS_PERMISSION).then(function(result){
                $scope.canEditHours = result;
            });

            var currentSelection = -1;
            $scope.haveHoursEntries = false;
            var setSelected = function (index) {
                if(index < -1 && index > 6){
                    // invalid index
                    return;
                }

                for(var i=0; i<$scope.daysOfTheWeek.length; i++){
                    $scope.daysOfTheWeek[i].selected = false;
                }
                if(index === -1){
                    // Deselecting all, so hide the Hours Rows
                    currentSelection = index;
                    $scope.showHoursRows = false;
                    return;
                }
                if(index === currentSelection){
                    currentSelection = -1;
                    $scope.showHoursRows = false;
                    return;
                }

                currentSelection = index;
                $scope.daysOfTheWeek[index].selected = true;
                $scope.showHoursRows = true;
                $scope.hoursEntries = $scope.daysOfTheWeek[index].hoursEntries;
                $scope.haveHoursEntries = $scope.hoursEntries.length > 0;
            };

            $scope.getSelectedDate = function(){
                if(currentSelection < 0 || currentSelection > 6){
                    return;
                }
                return $scope.daysOfTheWeek[currentSelection].dateFormatted;
            };

            $scope.removeHourEntryRow = function(theEntry){
                if(currentSelection < 0 || currentSelection > 6){
                    return;
                }
                var index = -1;
                _.find($scope.daysOfTheWeek[currentSelection].hoursEntries, function(entry, idx){
                    if(theEntry === entry){
                        index = idx;
                        return true;
                    }
                });
                if(index > -1){
                    $scope.daysOfTheWeek[currentSelection].hoursEntries.splice(index, 1);
                    if($scope.daysOfTheWeek[currentSelection].hoursEntries.length === 0){
                        $scope.haveHoursEntries = false;
                    }
                    $scope.updateTotalHours();
                }
            };

            $scope.addHourEntryRow = function (hourEntry) {
                if(hourEntry.project){
                    hourEntry.projectName = $scope.projectsMap[hourEntry.project].originalName;
                }
                if(hourEntry.task){
                    hourEntry.taskName = $scope.tasksMap[hourEntry.task].originalName;
                }
                $scope.daysOfTheWeek[currentSelection].hoursEntries.unshift(hourEntry);
                $scope.haveHoursEntries = true;
                $scope.updateTotalHours();
            };

            $scope.checkForExistingRowForProject = function(projectID, entryIDToIgnore){
                return _.find($scope.daysOfTheWeek[currentSelection].hoursEntries, function(entry){
                    return entry.id !== entryIDToIgnore && entry.project === projectID;
                });
            };

            var me = $scope.me ? $scope.me.about : '';
            var firstDayOfWeek = moment().day(0);

            $scope.moveSelectionBackInTime = function(){
                if(currentSelection < 0 || currentSelection > 6){
                    return;
                }
                var index = currentSelection - 1;
                if(index < 0){
                    index = 6;
                    $scope.backInTime();
                }
                setSelected(index);
            };
            $scope.backInTime = function () {
                firstDayOfWeek.subtract(7, 'days');
                $scope.hoursRequest();

                $scope.$emit('hours:backInTime');
            };
            $scope.forwardInTime = function () {
                firstDayOfWeek.add(7, 'days');
                $scope.hoursRequest();

                $scope.$emit('hours:forwardInTime');
            };
            $scope.moveSelectionForwardInTime = function(){
                if(currentSelection < 0 || currentSelection > 6){
                    return;
                }
                var index = currentSelection + 1;
                if(index > 6){
                    index = 0;
                    $scope.forwardInTime();
                }
                setSelected(index);
            };

            $scope.fillWeekDays = function () {
                // run through and build out the array of the
                // week's dates
                var dayMoment = moment(firstDayOfWeek);
                var dateFormatted;
                for (var i = 0; i < 7; i++) {
                    dayMoment.day(i);
                    dateFormatted = dayMoment.format('YYYY-MM-DD');

                    thisWeekDates[i] = dateFormatted;

                    $scope.daysOfTheWeek[i].futureness = $scope.isInFuture(dayMoment);
                    $scope.daysOfTheWeek[i].selected = false;
                    $scope.daysOfTheWeek[i].totalHours = 0;
                    $scope.daysOfTheWeek[i].moment = dayMoment;
                    $scope.daysOfTheWeek[i].dateFormatted = dateFormatted;
                    $scope.daysOfTheWeek[i].dayOfWeek = dayMoment.format('dddd');
                    $scope.daysOfTheWeek[i].dayOfMonth = dayMoment.format('D');
                    $scope.daysOfTheWeek[i].hoursEntries = [];
                }
            };

            $scope.showWeekDates = function () {
                $scope.fillWeekDays();
                $scope.prettyCalendarFormats(thisWeekDates[0], thisWeekDates[6]);
            };

            $scope.showToday = function () {
                var today = moment(),
                    todayIndex = today.day();
                if(today.day(0).isSame(firstDayOfWeek)){
                    // We're on the week that contains today, so simply setSelected
                    if(todayIndex !== currentSelection){
                        setSelected(todayIndex);
                    }
                }else{
                    firstDayOfWeek = today.day(0);
                    $scope.hoursRequest(todayIndex);
                }
            };

            $scope.prettyCalendarFormats = function (firstDay, lastDay) {
                $scope.prettyCalendarDates = {};
                $scope.prettyCalendarDates.firstDate = moment(firstDay).format('MMM D');
                $scope.prettyCalendarDates.lastDate = moment(lastDay).format('MMM D, YYYY');
                return $scope.prettyCalendarDates;
            };

            $scope.hoursRequest = function (setSelectedIndex) {
                $scope.resetMessages();
                setSelected(-1);
                $scope.hideHoursSpinner = false;

                $scope.showWeekDates();
                HoursService
                    .getHoursRecordsForPersonAndBetweenDates(
                        $scope.me.id,
                        thisWeekDates[0],
                        thisWeekDates[6])
                    .then(function (result) {
                        var i, futureness;
                        if (result.length === 0) {
                            logger.error('getHoursRecordsForPersonAndBetweenDates(' + thisWeekDates[0] +
                                          ',' + thisWeekDates[6] + ') gave me no results');
                        } else {

                            _.each(result, function(entry){
                                var date = moment(entry.date),
                                    index = -1;
                                _.find(thisWeekDates, function(thisWeekDate, i){
                                    if(date.format('YYYY-MM-DD') === thisWeekDate){
                                        index = i;
                                        return true;
                                    }
                                });
                                if(index !== -1){
                                    $scope.daysOfTheWeek[index].totalHours += entry.hours;
                                    $scope.daysOfTheWeek[index].hoursEntries.push(entry);
                                    if(entry.project){
                                        if($scope.projectsMap[entry.project]){
                                            entry.projectName = $scope.projectsMap[entry.project].name;
                                        }else{
                                            ProjectsService.getProject(entry.project).then(function(project){
                                                $scope.projectsMap[project.id] = project;
                                                entry.projectName = project.name;
                                            });
                                        }
                                    }else if(entry.task){
                                        if($scope.tasksMap[entry.task]){
                                            entry.taskName = $scope.tasksMap[entry.task].name;
                                        }else{
                                            TasksService.getTask(entry.task).then(function(task){
                                                $scope.tasksMap[task.id] = task;
                                                entry.taskName = task.name;
                                            });
                                        }
                                    }
                                }
                            });
                        }

                        _.each(thisWeekDates, function(date, index){
                            // Check for assignments on this date and, if we have one, add a hourEntry row
                            AssignmentsService
                                .getAssignmentsImpactingDate($scope.me.id, date)
                                .then(function(assignments){
                                    _.each(assignments, function(assignment){
                                        // Only add the new row if there's not already one for the given project
                                        var found = _.find($scope.daysOfTheWeek[index].hoursEntries, function(entry){
                                            return entry.project === assignment.project;
                                        });
                                        if(!found){
                                            var entry = {
                                                editMode: true,
                                                isNew: true,
                                                isACopy: true,
                                                project: assignment.project
                                            };
                                            if($scope.projectsMap[entry.project]){
                                                entry.projectName = $scope.projectsMap[entry.project].name;
                                            }else{
                                                ProjectsService.getProject(entry.project).then(function(project){
                                                    $scope.projectsMap[project.id] = project;
                                                    entry.projectName = project.name;
                                                });
                                            }
                                            $scope.daysOfTheWeek[index].hoursEntries.unshift(entry);
                                            if(index === currentSelection){
                                                $scope.haveHoursEntries = true;
                                            }
                                        }
                                    });
                                });
                        });

                        if(setSelectedIndex){
                            setSelected(setSelectedIndex);
                        }
                        $scope.hideHoursSpinner = true;
                    });
            };

            $scope.getTotalHoursWithHoursForEntryWithID = function(numHours, entryID){
                if(currentSelection < 0 || currentSelection > 6){
                    return numHours;
                }
                var theDay = $scope.daysOfTheWeek[currentSelection];
                var sum = 0;
                _.each(theDay.hoursEntries, function(entry){
                    if(entry.isNew){
                        return;
                    }
                    if(entry.id === entryID){
                        sum += numHours;
                    }else{
                        sum += entry.hours;
                    }
                });
                return sum;
            };

            $scope.updateTotalHours = function(){
                if(currentSelection < 0 || currentSelection > 6){
                    return;
                }
                var total = $scope.getTotalHoursWithHoursForEntryWithID(0, -1);
                $scope.daysOfTheWeek[currentSelection].totalHours = total;
            };

            $scope.copyHoursEntry = function () {
                $scope.resetMessages();
                HoursService.getMostRecent($scope.daysOfTheWeek[currentSelection].dateFormatted).then(function(entries){
                    _.each(entries, function(entry){
                        delete entry.id;
                        delete entry.created;
                        delete entry.date;
                        entry.editMode = true;
                        entry.isNew = true;
                        entry.isACopy = true;
                        $scope.daysOfTheWeek[currentSelection].hoursEntries.push(entry);
                        if(entry.project){
                            if($scope.projectsMap[entry.project]){
                                entry.projectName = $scope.projectsMap[entry.project].name;
                            }else{
                                ProjectsService.getProject(entry.project).then(function(project){
                                    $scope.projectsMap[project.id] = project;
                                    entry.projectName = project.name;
                                });
                            }
                        }else if(entry.task){
                            if($scope.tasksMap[entry.task]){
                                entry.taskName = $scope.tasksMap[entry.task].name;
                            }else{
                                TasksService.getTask(entry.task).then(function(task){
                                    $scope.tasksMap[task.id] = task;
                                    entry.taskName = task.name;
                                });
                            }
                        }
                    });
                    if(entries.length){
                        $scope.haveHoursEntries = true;
                    }
                });
            };

            $scope.addValidationMessage = function(message){
                $scope.hoursValidation.push(message);
            };
            $scope.resetMessages = function () {
                $scope.hoursValidation = [];
            };

            $scope.cloneDay = function (day) {
                return JSON.parse(JSON.stringify(day));
            };

            $scope.dayClick = function(index){
                setSelected(index);
            };

            var init = function (profile) {
                $scope.me = profile;

                $scope.hoursEntries = [];
                $scope.daysOfTheWeek = [];
                for(var i=0; i<7; i++){
                    $scope.daysOfTheWeek.push({
                        futureness: false,
                        selected: false,
                        totalHours: 0,
                        moment: moment(),
                        dayOfWeek: '',
                        dayOfMonth: 0,
                        hoursEntries: []
                    });
                }

                $scope
                    .loadAvailableTasks()
                    .then($scope.loadProjects)
                    .then(function(){
                        $scope.hoursRequest(moment().day());
                    });
            };

            UserService.getUser().then(init);

            $rootScope.$on('hours:requiredRefresh', function () {
                $scope.hoursRequest();
            });
        }
    }
})();
