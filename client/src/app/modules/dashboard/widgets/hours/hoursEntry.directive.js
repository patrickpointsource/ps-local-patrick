/* global moment, _, async */
(function(){
    angular
        .module('app.dashboard.widgets.hours', [
            'app.services'
        ])
        .directive('hoursEntry', HoursEntry);

    var CONSTS = {
            DELETE_MY_HOURS_PERMISSION: 'FIXME'
        },
        // TODO: FIXME
        Util = {
            formatFloat: _.noop
        },
        // TODO: FIXME
        Resources = {
            remove: _.noop,
            resolve: _.noop
        };

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
            '$state',
            '$rootScope',
            '$timeout',
            '$q',
            // 'Resources',
            'UserService',
            'PeopleService',
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
                           $state,
                           $rootScope,
                           $timeout,
                           $q,
                        //    Resources,
                           UserService,
                           PeopleService,
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

            $scope.displayedMonthDays = [];
            // TODO: Remove date
            $scope.currentMonth = $scope.moment('2015-05-15');
            $scope.startDate = moment('2015-05-15');
            $scope.ongoingProjects = [];

            $scope.hoursProjects = [];
            // fill it in hours controller
            $scope.hoursTasks = [];

            $scope.projectTasksList = [];

            $scope.hasAssignment = false;
            $rootScope.hasAssignment = false;

            $scope.newHoursRecord = {};
            $scope.lastSelectedDay = {};
            // $scope.hoursToDelete = [];

            $scope.newHoursRecord = {};
            $scope.hoursValidation = [];

            var thisWeekDates = [];

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

            $scope.showHideWidget = function (show) {
                $scope.hasAssignment = show;
                $rootScope.hasAssignment = show;
            };

            // Gets the task listing and then sets up some inline styles for proper display - RCM 2015-05-01 14:56
            $scope.loadAvailableTasks = function () {
                var deferred = $q.defer();
                $scope.tasksMap = {};
                TasksService.getTasks().then(function (tasks) {
                    _.each(tasks, function (t) {
                        $scope.tasksMap[t.id] = t;
                        $scope.hoursTasks.push(t);
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
                            $scope.hoursProjects = _.values(myAndOngoingProjects);
                            $scope.projectTasksList = $scope.projectTasksList.concat($scope.hoursProjects);

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

            $scope.showNewHoursEntry = function (e) {
                $('.dashboard-widget.hours .row.hours-logged .hours-logged-entry').each(function (ind, el) {

                    if ($(el).scope().hourEntry &&
                        $(el).scope().hourEntry.hoursRecord.isAdded &&
                        (
                            $(el).scope().hourEntry.hoursRecord.hours === 0 ||
                            $(el).scope().hourEntry.hoursRecord.hours === '' ||
                            $(el).scope().hourEntry.hoursRecord.hours === undefined
                        )
                    ) {
                        $(el).addClass('view-entry');
                    }

                });

                e = e ? e : window.event;

                $(e.target).closest('.hours-logged-entry').find('.close-new').show();
                $(e.target).closest('.hours-logged-entry').find('.add').hide();
            };

            $scope.closeNewHoursEntry = function (e) {
                $('.dashboard-widget.hours .row.hours-logged .hours-logged-entry').each(function (ind, el) {

                    if (
                        $(el).scope().hourEntry &&
                        $(el).scope().hourEntry.hoursRecord.isAdded &&
                        (
                            $(el).scope().hourEntry.hoursRecord.hours === 0 ||
                            $(el).scope().hourEntry.hoursRecord.hours === '' ||
                            $(el).scope().hourEntry.hoursRecord.hours === undefined
                        )
                    ) {
                        $(el).removeClass('view-entry');
                    }

                    /*
                     $scope.$apply( function( ) {
                     $scope.editHoursEntry( null, $( el ).scope( ).hourEntry, $( el ).find(
                     'input[name="project-task-select"]' ).eq( 0 ) );
                     } );
                     */
                });

                e = e ? e : window.event;

                $(e.target).closest('.hours-logged-entry').find('.close-new').hide();
                $(e.target).closest('.hours-logged-entry').find('.add').show();

                e.stopPropagation();
            };



            $scope.removeOrCloseHourEntry = function (e, hourEntry, index) {
                e = e ? e : window.event;

                if (hourEntry.hoursRecord.isAdded) {
                    return;
                }

                //if( hourEntry.hoursRecord.editMode ) {

                // if (!hourEntry.hoursRecord.isCopied) {
                hourEntry.hoursRecord.editMode = false;
                $scope.clearAutocompleteHandlers(
                    $(e.target)
                        .closest('.hours-logged-entry')
                        .find('[name="project-task-select"]')
                );
                // }

                //delete hourEntry.hoursRecord.isCopied;

                //$scope.validateAndCalculateTotalHours( );

                //} else {
                // $scope.deleteHoursRecord(index)
                $scope.selected.hoursEntries.splice(index, 1);

                if (hourEntry.hoursRecord && $scope.canDeleteMyHours) {
                    Resources.remove(hourEntry.hoursRecord.resource, hourEntry.hoursRecord).then(function () {
                        // $scope.hoursRequest();
                        $scope.validateAndCalculateTotalHours();
                        $scope.$emit('hours:deleted', $scope.selected);
                    });
                }
            };

            UserService.checkForPermission(UserService.PERMISSIONS.DELETE_MY_HOURS_PERMISSION).then(function(result){
                $scope.canDeleteMyHours = result;
            });
            UserService.checkForPermission(UserService.PERMISSIONS.EDIT_HOURS_PERMISSION).then(function(result){
                $scope.canEditHours = result;
            });

            var currentSelection = -1;
            var setSelected = function (index) {
                if(index < -1 && index > 6){
                    // invalid index
                    return;
                }

                for(var i=0; i<$scope.daysOfTheWeek.length; i++){
                    $scope.daysOfTheWeek[i].selected = false;
                }
                if(index === -1 || index === currentSelection){
                    // Deselecting all, so hide the Hours Rows
                    $scope.showHoursRows = false;
                    return;
                }

                currentSelection = index;
                $scope.daysOfTheWeek[index].selected = true;
                $scope.showHoursRows = true;
                $scope.hoursEntries = $scope.daysOfTheWeek[index].hoursEntries;
            };

            /*
             $scope.addHoursEntry = function( ) {
             $scope.addNewHours( );
             };*/
            // MOVE THIS TO FORM CONTROLLER WHEN READY
            $scope.addNewHours = function (isTask) {
                // match date with current hours
                var displayedHoursLength = $scope.displayedHours.length;

                for (var i = 0; i < displayedHoursLength; i++) {
                    if ($scope.selected.date === $scope.displayedHours[i].date) {
                        // $scope.activeAddition =
                        // $scope.displayedHours[i];

                        if ($scope.selected.totalHours > 0 ||
                            $scope.anyCopied() ||
                            (
                                $scope.selected.hoursEntries &&
                                $scope.selected.hoursEntries.length === 0
                            )
                        ) {
                            $scope.newHoursRecord = {
                                date: $scope.selected.date,
                                description: '',
                                hours: '',
                                person: $scope.me,
                                editMode: true,
                                isAdded: true

                            };

                            if (!isTask) {
                                $scope.newHoursRecord.project = {};
                            } else {
                                $scope.newHoursRecord.task = {};
                            }

                            // sync selected object with
                            // displayedHours collection
                            if ($scope.selected.hoursEntries) {
                                $scope.selected.hoursEntries.unshift({
                                    hoursRecord: $scope.newHoursRecord
                                });
                            } else {
                                $scope.selected.hoursEntries = [];
                                $scope.selected.hoursEntries.unshift({
                                    hoursRecord: $scope.newHoursRecord
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

            // This sounds like the two previous functions - RCM 2015-05-01 19:36
            $scope.addNewHoursRecord = function (day) {
                var newHoursRecord = {
                    date: day.date,
                    description: '',
                    hours: '',
                    project: {},
                    person: $scope.me,
                    editMode: true,
                    isAdded: true

                };

                // sync selected object with
                // displayedHours collection
                if (day.hoursEntries) {
                    day.hoursEntries.unshift({
                        hoursRecord: newHoursRecord
                    });
                } else {
                    day.hoursEntries = [];
                    day.hoursEntries.unshift({
                        hoursRecord: newHoursRecord
                    });
                }
            };

            // Not sure what this does or why - RCM 2015-05-01 18:45
            $scope.anyAdded = function () {
                var result = false;

                for (var i = 0; i < $scope.selected.hoursEntries.length; i++) {
                    var entry = $scope.selected.hoursEntries[i];

                    if (entry.hoursRecord &&
                        entry.hoursRecord.isAdded ||
                        entry.hoursRecord.isCopied) {
                        result = true;
                    }
                }

                return result;
            };

            // Not sure what this does or why - RCM 2015-05-01 18:46
            $scope.anyCopied = function () {
                var result = false;

                for (var i = 0; i < $scope.selected.hoursEntries.length; i++) {
                    var entry = $scope.selected.hoursEntries[i];

                    if (entry.hoursRecord &&
                        entry.hoursRecord.editMode &&
                        entry.hoursRecord.isCopied) {
                        result = true;
                    }
                }

                return result;
            };

            var me = $scope.me ? $scope.me.about : '';
            // TODO: Remove Date
            var firstDayOfWeek = moment('2015-05-15').day(0);

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

            $scope.fillWeekDays = function () {
                // run through and build out the array of the
                // week's dates
                var moment = $scope.moment(firstDayOfWeek);
                var dateFormatted;
                for (var i = 0; i < 7; i++) {
                    moment.day(i);
                    dateFormatted = moment.format('YYYY-MM-DD');

                    thisWeekDates[i] = dateFormatted;

                    $scope.daysOfTheWeek[i].futureness = $scope.isInFuture(moment);
                    $scope.daysOfTheWeek[i].selected = false;
                    $scope.daysOfTheWeek[i].totalHours = 0;
                    $scope.daysOfTheWeek[i].moment = moment;
                    $scope.daysOfTheWeek[i].dayOfWeek = moment.format('dddd');
                    $scope.daysOfTheWeek[i].dayOfMonth = moment.format('D');
                }
            };

            $scope.showWeekDates = function (callback) {
                $scope.fillWeekDays();

                $scope.prettyCalendarFormats(thisWeekDates[0], thisWeekDates[6]);

                callback(thisWeekDates);
            };

            $scope.showToday = function () {
                // TODO: Remove date
                firstDayOfWeek = moment('2015-05-15').day(0);
                $scope.hoursRequest();

                $scope.$emit('hours:showToday');
            };

            $scope.prettyCalendarFormats = function (firstDay, lastDay) {
                $scope.prettyCalendarDates = {};
                $scope.prettyCalendarDates.firstDate = moment(firstDay).format('MMM D');
                $scope.prettyCalendarDates.lastDate = moment(lastDay).format('MMM D, YYYY');
                return $scope.prettyCalendarDates;
            };

            // Thsi function is doing too much so we need to figure out how to
            // break it down into smaller pieces. - RCM 2015-05-01 19:33
            $scope.hoursRequest = function (cb, setSelectedIndex) {
                setSelected(-1);
                $scope.hideHoursSpinner = false;

                $scope.showWeekDates(function (result) {
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
                                $scope.showHideWidget(true);

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
                                                })
                                            }
                                        }else if(entry.task){
                                            if($scope.tasksMap[entry.task]){
                                                entry.taskName = $scope.tasksMap[entry.task].name;
                                            }else{
                                                TasksService.getTask(entry.task).then(function(task){
                                                    $scope.tasksMap[task.id] = task;
                                                    entry.taskName = task.name;
                                                })
                                            }
                                        }
                                    }
                                });
                            }

                            if(setSelectedIndex){
                                setSelected(setSelectedIndex);
                            }

                            if (cb) {
                                cb();
                            }

                            $scope.hideHoursSpinner = true;
                            $scope.$emit('hours:loaded');
                        });
                });
            };

            $scope.getTotalHoursWithHoursForEntryWithID = function(numHours, entryID){
                if(currentSelection < 0 || currentSelection > 6){
                    return numHours;
                }
                var theDay = $scope.daysOfTheWeek[currentSelection];
                var sum = 0;
                _.each(theDay.hoursEntries, function(entry){
                    if(entry.id === entryID){
                        sum += numHours;
                    }else{
                        sum += entry.hours;
                    }
                });
                return sum;
            }

            $scope.updateTotalHours = function(){
                if(currentSelection < 0 || currentSelection > 6){
                    return numHours;
                }
                var total = $scope.getTotalHoursWithHoursForEntryWithID(0, -1);
                $scope.daysOfTheWeek[currentSelection].totalHours = total;
            }

            // The next few methods all do something for copying hours...lot of code. - RCM 2015-05-01 19:40
            $scope.copyHoursEntry = function () {
                $scope.copyHours();

                for (var i = 0; i < $scope.selected.hoursEntries.length; i++) {
                    if ($scope.selected.hoursEntries[i].hoursRecord &&
                        $scope.selected.hoursEntries[i].hoursRecord.hours > 0 &&
                        $scope.selected.hoursEntries[i].hoursRecord.isCopied) {
                        $scope.selected.hoursEntries[i].hoursRecord.editMode = true;
                    }
                }
            };

            $scope.copyHours = function () {
                $scope.hideMessages();

                var selectedDate = $scope.moment($scope.selected.date).toDate();

                var copyFromEntries = [];

                // if it's possible, trying to find hours
                // entries from yesterday
                var tmpD = $scope.selected.date.split('-');

                var copyFromDate = new Date(parseInt(tmpD[0]), parseInt(tmpD[1]) - 1, parseInt(tmpD[2]) - 1);

                var shortDate = moment(copyFromDate).format('YYYY-MM-DD');
                var copyFromEntry = _.findWhere($scope.displayedHours, {
                    date: shortDate
                });
                var copyEntryFound = false;

                if (copyFromEntry) {
                    var prevDayHoursRecords = _.pluck(copyFromEntry.hoursEntries, 'hoursRecord');
                    prevDayHoursRecords = _.filter(prevDayHoursRecords, function (p) {
                        if (!isNaN(parseFloat(p.hours))) {
                            return true;
                        }
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
                    var fromDate = new Date(parseInt(tmpD[0]), parseInt(tmpD[1]) - 1, parseInt(tmpD[2]) - 7);
                    var from = moment(fromDate).format('YYYY-MM-DD');
                    HoursService
                        .getHoursRecordsForPersonAndBetweenDates($scope.me.id, from, shortDate)
                        .then(function (result) {
                            for (var i = result.length - 1; i >= 0; i--) {
                                if (result[i].hoursEntries.length > 0) {
                                    var houseRecordsInside = _.filter(result[i].hoursEntries, function (h) {
                                        //if( h.hoursRecord )
                                        if (!isNaN(parseFloat(h.hoursRecord.hours))) {
                                            return true;
                                        }
                                    });
                                    if (houseRecordsInside.length > 0) {
                                        copyHoursCallback(result[i].hoursEntries);
                                        copyEntryFound = true;
                                        return;
                                    }
                                }
                            }

                            if (!copyEntryFound) {
                                $scope.hoursValidation.push('No hours to copy found for the last week.');
                            }
                        });
                }
            };
            var copyHoursCallback = function (copyFromEntries) {
                var hoursRecords = _.pluck($scope.selected.hoursEntries, 'hoursRecord');

                hoursRecords = _.reject(hoursRecords, function (h) {
                    return (typeof h) === 'undefined';
                });
                // $scope.hoursToDelete = _.pluck(hoursRecords,
                // "resource");
                // $scope.selected.hoursEntries = [];

                // simply add copied hours to current day hours
                // entries
                var displayedHoursEntry = _.findWhere($scope.displayedHours, {
                    date: $scope.selected.date
                });

                for (var i = 0; i < copyFromEntries.length; i++) {
                    if (copyFromEntries[i].hoursRecord && copyFromEntries[i].hoursRecord.hours > 0) {
                        var newHoursRecord = {
                            date: $scope.selected.date,
                            description: copyFromEntries[i].hoursRecord.description,
                            hours: copyFromEntries[i].hoursRecord.hours,
                            person: {
                                resource: $scope.me.about
                            }
                        };

                        newHoursRecord.isCopied = true;

                        if (copyFromEntries[i].hoursRecord.project) {
                            newHoursRecord.project = copyFromEntries[i].hoursRecord.project;
                        }

                        if (copyFromEntries[i].hoursRecord.task) {
                            newHoursRecord.task = copyFromEntries[i].hoursRecord.task;
                        }

                        var hoursEntry = {
                            project: copyFromEntries[i].project,
                            task: copyFromEntries[i].task,
                            hoursRecord: newHoursRecord
                        };

                        if (copyFromEntries[i].assignment) {
                            hoursEntry.assignment = copyFromEntries[i].assignment;
                        }

                        // displayedHoursEntry.hoursEntries.unshift(hoursEntry);

                        $scope.selected.hoursEntries.unshift($scope.cloneDay(hoursEntry));
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

            $scope.hideMessages = function () {
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

                // TODO: Remove date
                $scope
                    .loadAvailableTasks()
                    .then($scope.loadProjects)
                    .then(function(){ $scope.hoursRequest(null, $scope.moment('2015-05-15').day()) });
            };

            // TODO: Get me from People and then call init
            PeopleService.getProfile().then(init);

            $scope.$on('$destroy', function () {
                $scope.unbindEventHandlers();
            });

            $rootScope.$on('hours:requiredRefresh', function () {
                $scope.hoursRequest();
            });
        }
    }
})();
