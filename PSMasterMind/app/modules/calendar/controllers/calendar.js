'use strict';

/*
 * Controller for calendar area
 */

angular.module('Mastermind').controller('CalendarCtrl', [
    '$scope', '$state', '$filter', '$q', '$rootScope', '$modal', 'VacationsService', 'People', 'Resources', 'ProjectsService', 'AssignmentService', 'RolesService', 'People',
    function ($scope, $state, $filter, $q, $rootScope, $modal, VacationsService, People, Resources, ProjectsService, AssignmentService, RolesService, PeopleService)
    {
        $scope.VIEW_MODE_MONTH = 0;
        $scope.VIEW_MODE_2WEEK = 1;
        $scope.VIEW_MODE_1WEEK = 2;

        $scope.viewMode = $scope.VIEW_MODE_MONTH;

        $scope.startDate = '';
        $scope.endDate = "";
        $scope.months = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        $scope.weekDayLables = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        $scope.weekDayLablesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        $scope.displayedMonthDays = [];
        $scope.hidePendingVacations = false;

        $scope.managersList = [];
        $scope.selectedManager = null;

        $scope.rolesList = [];
        $scope.selectedRole = null;

        $scope.filterVacationsBy = [{
            label: 'All employees',
            value: 'all'
        }, {
            label: "Manager name",
            value: 'manager_name'
        }, {
            label: "Project name",
            value: 'project_name'
        }, {
            label: "Role name",
            value: 'role_name'
        }, {
            label: "Direct Reports",
            value: 'direct_reports'
        }];

        $scope.filterVacationsByCurrent = 'all';

        $scope.moment = window.moment ? window.moment : moment;
        $scope.currentMonth = $scope.moment();

        $scope.currentVacations = [];

        var el = $("<div>").addClass("hidden-sm hidden-md").appendTo($("body"));

        $scope.itemCount = el.is(":hidden") ? 3 : 5;
 	    $scope.isMobileDevice = el.is(":hidden");

        el.remove();

        $scope.goToPrevious = function ()
        {
            switch ($scope.viewMode)
            {
                case $scope.VIEW_MODE_1WEEK:

                    $scope.currentMonth = $scope.moment($scope.currentMonth).subtract(1, "week");
                    break;

                case $scope.VIEW_MODE_2WEEK:

                    $scope.currentMonth = $scope.moment($scope.currentMonth).subtract(2, "week");
                    break;

                case $scope.VIEW_MODE_MONTH:

                    $scope.currentMonth = $scope.moment($scope.currentMonth).subtract(1, "month");
                    break;
            }

            $scope.initCalendar();
        };

        $scope.goToNext = function ()
        {
            switch ($scope.viewMode)
            {
                case $scope.VIEW_MODE_1WEEK:

                    $scope.currentMonth = $scope.moment($scope.currentMonth).add(1, "week");
                    break;

                case $scope.VIEW_MODE_2WEEK:

                    $scope.currentMonth = $scope.moment($scope.currentMonth).add(2, "week");
                    break;

                case $scope.VIEW_MODE_MONTH:

                    $scope.currentMonth = $scope.moment($scope.currentMonth).add(1, "month");
                    break;
            }

            $scope.initCalendar();
        };

        $scope.getVacationPeriod = function (vac)
        {
            //return 'test'
            if ($scope.moment(vac.startDate).date() != $scope.moment(vac.endDate).date())
                return ($scope.moment(vac.startDate).format('MMM D') + '-' + $scope.moment(vac.endDate).format('MMM D'));

            return $scope.moment(vac.startDate).format('MMM D');
        };

        $scope.onVacationMouseOver = function (e, vac, ind, vacIndex)
        {
            if ($scope.itemCount == 3)
                return;

            e = e ? e : window.event;
            var entry = $(e.target).closest('.vacation-day-entry');

            //e.preventDefault();
            e.stopPropagation();

            //logger.log('onVacationClicked:' + ind + ':person.name=' + vac.person.name + ':'  + entry.size() + ':shown=' + entry.data('popover_shown'));

            if (entry.data('popover_shown'))
                return;

            var popover;

            if (!entry.data('bs.popover'))
            {
                var out = (vac.startDate.split(/\s+/g)[0] != vac.endDate.split(/\s+/g)[0])
                    ? ($scope.moment(vac.startDate).format('M/D') + ' - ' + $scope.moment(vac.endDate).format('M/D'))
                    : $scope.moment(vac.startDate).format('M/D');
                var placement = ind % 7 == 6 ? 'auto top' : 'auto left';

                popover = entry.popover({
                    content: '<div class="vacation-entry-popup"><div class="name"><a href="index.html#/' + vac.person.resource + '">' + vac.person.name + '</a></div><div><b>Out:</b> ' + out + '</div><div><b>Category:</b> ' + vac.type + '</div>' + '<div>',
                    html: true,
                    placement: placement,
                    container: '.vacation-day-entry.entry_' + ind + '_' + vacIndex
                });

                entry.data('popover_shown', true);
                entry.popover('show');

                entry.on('hidden.bs.popover', _.bind(function ()
                {
                    this.context.popover('destroy');
                    this.context.data('popover', false);
                }, { context: entry }));
            } else
            {
                entry.data('popover_shown', true);
                entry.popover('show');
            }
        };

        $scope.onVacationClick = function (e, vac)
        {
            if ($scope.itemCount != 3)
                return;

            var out = (vac.startDate.split(/\s+/g)[0] != vac.endDate.split(/\s+/g)[0])
                ? ($scope.moment(vac.startDate).format('M/D') + ' - ' + $scope.moment(vac.endDate).format('M/D'))
                : $scope.moment(vac.startDate).format('M/D');

            $modal.open({
                controller: "OOOModalInstanceCtrl",
                templateUrl: "oooDetails.html",
                resolve: {
                    details: function ()
                    {
                        return {
                            vac: vac,
                            out: out,
                            isMobileDevice: $scope.isMobileDevice
                        };
                    }
                }
            });
        };

        $scope.onVacationHide = function (e, vac, ind, vacIndex)
        {
            if ($scope.itemCount == 3)
                return;

            e = e ? e : window.event;
            var entry = $(e.target).closest('.vacation-day-entry');

            //e.preventDefault();
            e.stopPropagation();

            //logger.log('onVacationHide:' + ind + ':person.name=' + vac.person.name + ':shown=' + entry.data('popover_shown'));

            var popover;

            if (entry.data('bs.popover'))
            {
                entry.popover('hide');

            }

            entry.data('popover_shown', false);

        };

        $scope.getCountNotEmptyVacations = function (vacations)
        {
            return (_.filter(vacations, function (v) { return !v.isEmpty; })).length;
        };

        $scope.onShowMoreClicked = function (e, vacations, ind, vacInd)
        {
            e = e ? e : window.event;
            var entry = $(e.target).closest('.vacation-day-entry');

            //e.preventDefault();
            e.stopPropagation();

            logger.log('onShowMoreClicked:' + ind + ':target.size=' + entry.size());

            for (var k = 0; k < vacations.length; k++)
            {
                var vac = vacations[k];
                if (!vac.isEmpty)
                {
                    if (vac.startDate.split(/\s+/g)[0] != vac.endDate.split(/\s+/g)[0])
                        var out = $scope.moment(vac.startDate).format('M/D') + '-' + $scope.moment(vac.endDate).format('M/D');
                    else
                        var out = $scope.moment(vac.startDate).format('M/D');
                    vac.out = out;
                }
            }

            if ($scope.isMobileDevice) {
            	$scope.onShowMoreModal(vacations); // show Modal dialog for mobile devices
            } else {
            	$scope.onShowMorePopup(vacations, entry, ind, vacInd);
            }
        };

        $scope.onShowMoreModal = function(vacations){
        	$modal.open({
                controller: "OOOModalInstanceCtrl",
                templateUrl: "oooMoreVacations.html",
                resolve: {
                    details: function ()
                    {
                        return {
                            vacations: vacations,
                            isMobileDevice: $scope.isMobileDevice
                        };
                    }
                }
            });
        };

        $scope.onShowMorePopup = function(vacations, entry, ind, vacInd){
        	var popover;
            if (!entry.data('popover'))
            {
                var html = '<div class="vacation-entry-popup"><div class="vacation-popup-body">';
                for (var k = 0; k < vacations.length; k++)
                {
                    var vac = vacations[k];
                    if (!vac.isEmpty)
                    {
                        html += '<div class="vacation-person-name"><a href="index.html#/' + vac.person.resource + '">' + vac.person.name + '</a></div><div><b>Out:</b> ' + vac.out + '</div><div class="vacation-person-type"><b>Type:</b> ' + vac.type + '</div>';
                    }
                }

                html += '</div></div>';

                popover = entry.popover({
                    content: html,
                    title: 'Out of Office',
                    html: true,
                    placement: 'auto left',
                    container: '.vacation-day-entry.entry_' +
                        '' + ind + '_' + vacInd
                });

                entry.data('popover', popover);
                entry.popover('show');

                entry.on('hidden.bs.popover', _.bind(function ()
                {
                    this.context.popover('destroy');
                    this.context.data('popover', false);
                }, { context: entry }));
            } else
                entry.popover('toggle');
        };

        $scope.getRandomBackground = function ()
        {
            var colors = ['#A4D49C', '#EA959D', '#9FCFEF', '#BD8C8F', '#E8EC99', '#F69679'];

            function getRandom(max)
            {
                var result = Math.random();

                return Math.round(result * max);
            }

            return colors[getRandom(colors.length - 1)];
        };

        $scope.showHidePending = function ()
        {
            if ($scope.hidePendingVacations)
                $scope.initCalendar('Approved');
            else
                $scope.initCalendar();
        };

        $scope.filterVacationsByChanged = function (e)
        {
            if ($scope.filterVacationsByCurrent == 'manager_name')
            {

                if ($scope.managersList.length == 0)
                    Resources.refresh("people/bytypes/byGroups", { group: "Managers" }).then(
                        function (result)
                        {
                            for (var i = 0; result && result.members && i < result.members.length; i++)
                            {
                                var manager = result.members[i];

                                $scope.managersList.push({
                                    label: Util.getPersonName(manager, true),
                                    value: manager.resource
                                });

                                $scope.managersList.sort(function (m1, m2)
                                {
                                    if (m1.label.toLowerCase() < m2.label.toLowerCase())
                                        return -1;
                                    else if (m1.label.toLowerCase() > m2.label.toLowerCase())
                                        return 1;

                                });
                            }
                        }
                    );
            } else if ($scope.filterVacationsByCurrent == 'project_name')
            {
                if (!$scope.projectList || $scope.projectList.length == 0)
                    ProjectsService.getAllProjects(function (result)
                    {
                        $scope.projectList = result.data;
                    });
            } else if ($scope.filterVacationsByCurrent == 'role_name')
            {
                if (!$scope.roleList || $scope.roleList.length == 0)
                    RolesService.getRolesMapByResource().then(function (result)
                    {
                        var roleMap = result;

                        $scope.rolesList = [];

                        for (var roleResource in roleMap)
                        {
                            $scope.rolesList.push({
                                value: roleResource,
                                label: roleMap[roleResource].abbreviation
                            });
                        }

                    });
            } else
                $scope.initCalendar();
        };

        $scope.filterVacationsByManagerChanged = function (e, passedScope)
        {
            $scope.selectedManager = passedScope.selectedManager;
            $scope.initCalendar();
        };

        $scope.filterVacationsByRoleChanged = function (e, passedScope)
        {
            $scope.selectedRole = passedScope.selectedRole;
            $scope.initCalendar();
        };

        $scope.filterVacationsByProjectChanged = function (e, selected)
        {
            $scope.selectedProject = selected;
            $scope.initCalendar();
        };

        $scope.fillCalendarDays = function (currentVacations)
        {

            var moment = $scope.moment($scope.currentMonth);
            var origLength = currentVacations.length;

            // align start/end dates and filter vacations if needed
            currentVacations = _.filter(currentVacations, function (v)
            {
                if (v.startDate && !_.isString(v.startDate))
                    v.startDate = $scope.moment(v.startDate).format('YYYY-MM-DD');

                if (v.endDate && !_.isString(v.endDate))
                    v.endDate = $scope.moment(v.endDate).format('YYYY-MM-DD');

                return v.startDate && v.endDate;
            });

            currentVacations = _.uniq(currentVacations, function (v)
            {
                if (v.person)
                    return v.person.resource + '-' + v.startDate + '-' + v.endDate;

                return v.startDate + '-' + v.endDate;
            });

            if (origLength != currentVacations.length)
                logger.log('!!!vacation duplicates or empty dates loaded');

            var startOfMonth = moment.startOf('month');
            var starOfFirstWeek = startOfMonth.startOf('week');

            var persons = _.map(currentVacations, function (v) { if (v && v.person) return v.person.resource });

            persons = _.uniq(persons);

            var lightColors = randomColor({ luminosity: 'light', count: persons.length });

            var t = 0;

            // go throug colors and remove similar, and then add newly generated
            while (t < 20)
            {
                var sim = 0;

                for (var k = lightColors.length - 1; k >= 0; k--)
                {
                    for (var j = k - 1; j >= 0; j--)
                    {
                        sim = Util.getColorDistance(lightColors[k], lightColors[j]) / 256;

                        if (sim < 0.2)
                        {
                            lightColors.splice(k, 1);
                            break;
                        }

                    }
                }

                if (lightColors.length < persons.length)
                    lightColors = lightColors.concat(randomColor({ luminosity: 'light', count: (persons.length - lightColors.length) }));

                t++;
            };

            var colorsMap = {};

            for (var k = 0; k < persons.length; k++)
                colorsMap[persons[k]] = lightColors[k];

            var dColor;
            var c;

            for (var k = 0; k < currentVacations.length; k++)
            {
                c = colorsMap[currentVacations[k].person.resource];

                if (currentVacations[k].status && currentVacations[k].status.toLowerCase() != 'pending')
                    //currentVacations[k].background = $scope.getRandomBackground();
                    currentVacations[k].background = c;
                else
                {
                    dColor = Util.darkColorFrom(c, 0.4);
                    currentVacations[k].background = 'repeating-linear-gradient( -45deg, ' + dColor + ', ' + dColor +
                        ' 3px, ' + c + ' 3px, ' + c + ' 15px)';
                }

                if (currentVacations[k].person && _.isObject(currentVacations[k].person.name))
                    currentVacations[k].person.name = Util.getPersonName(currentVacations[k].person, true);
            }

            var current;
            var day = 0;
            var currentDay;
            var currentDate;

            while (day < 35)
            {
                current = $scope.moment(starOfFirstWeek).add(day, 'days');
                day += 1;

                currentDate = current.format('YYYY-MM-DD');

                currentDay = {
                    date: currentDate,
                    dayOfMonth: current.format('D'),
                    vacations: []
                };

                var tmpStart;
                var tmpEnd;

                // from all vacation list exctract vacations which are needed to be displayed on current day
                currentDay.vacations = _.filter(currentVacations, function (v, ind)
                {
                    var res = false;

                    tmpStart = v.startDate.split(/\s+/gi)[0];
                    tmpEnd = v.endDate.split(/\s+/gi)[0];

                    if (currentDate >= tmpStart && currentDate <= tmpEnd)
                        res = true;

                    if (currentDate == tmpStart)
                    {
                        //currentDay.startOnDateVacations.push(v);
                        v.startDateOfMultidays = currentDate;
                        //v.order = ind;
                    }

                    v.countDays = parseInt($scope.moment(v.endDate).diff($scope.moment(v.startDate)) / (24 * 60 * 60 * 1000));

                    return res;
                });

                // sort those vacations according to countofdays
                currentDay.vacations.sort(function (v1, v2)
                {
                    if (v1.countDays > v2.countDays)
                        return -1;
                    else
                        return 1;

                });
                
                // before setting mutlidays order for current vacations check if ther are vacation with visual "order" from
                // previous days and set them on correct positions
                var tmpVac;

                for (var k = currentDay.vacations.length - 1; k >= 0; k--)
                {
                    if (!isNaN(parseInt(currentDay.vacations[k].order)) && k != currentDay.vacations[k].order)
                    {
                        tmpVac = currentDay.vacations[currentDay.vacations[k].order];

                        currentDay.vacations[currentDay.vacations[k].order] = currentDay.vacations[k];

                        currentDay.vacations[k] = tmpVac;
                    }
                }

                // for all multidays vacations set it's "visual" order
                for (var k = currentDay.vacations.length - 1; k >= 0; k--)
                {
                    if (currentDay.vacations[k] && currentDate.indexOf(currentDay.vacations[k].startDateOfMultidays) > -1 && currentDate.indexOf(currentDay.vacations[k].endDate) == -1)
                        currentDay.vacations[k].order = k;
                }


                // after setting order value make reordering
                for (var k = currentDay.vacations.length - 1; k >= 0; k--)
                {
                    if (currentDay.vacations[k] && !isNaN(parseInt(currentDay.vacations[k].order)) && k != currentDay.vacations[k].order)
                    {
                        tmpVac = currentDay.vacations[currentDay.vacations[k].order];

                        currentDay.vacations[currentDay.vacations[k].order] = currentDay.vacations[k];

                        currentDay.vacations[k] = tmpVac;
                        
                        // if we move vacation to another position fix it "order" value
                        if (!isNaN(parseInt(tmpVac.order)))
                        	tmpVac.order = k;
                    }
                }

                for (var k = currentDay.vacations.length - 1; k >= 0; k--)
                {
                    if (!currentDay.vacations[k])
                        currentDay.vacations[k] = {
                            isEmpty: true
                        };
                }

                if (currentDay.vacations.length > 4)
                    currentDay.moreBackground = $scope.getRandomBackground();

                $scope.displayedMonthDays.push(currentDay);
            }
        };

        $scope.initCalendar = function (status)
        {
            $scope.hideCalendarSpinner = false;

            $scope.displayedMonthDays = [];

            if ($scope.viewMode === $scope.VIEW_MODE_MONTH)
            {
                $scope.startDate = $scope.moment($scope.currentMonth).startOf('month');
                $scope.endDate = $scope.moment($scope.currentMonth).endOf('month');
            }
            else if ($scope.viewMode === $scope.VIEW_MODE_1WEEK)
            {
                $scope.startDate = $scope.moment($scope.currentMonth).startOf("week");
                $scope.endDate = $scope.moment($scope.currentMonth).endOf("week");
            }

            var starOfFirstWeek = $scope.moment($scope.currentMonth).startOf('month').startOf('week');
            var endOfLastWeek = $scope.moment(starOfFirstWeek).add(34, 'days');

            var currentVacations = [];
            var loadPromise;

            if ($scope.filterVacationsByCurrent == 'manager_name' && $scope.selectedManager)
            {
                var p = {
                    //startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
                    //endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
                    startDate: starOfFirstWeek.format('YYYY-MM-DD'),
                    endDate: endOfLastWeek.format('YYYY-MM-DD'),
                    includeApproved: true,
                    showSubordinateManagerRequests: true
                };

                if (!$scope.hidePendingVacations)
                    p.includePending = true;

                loadPromise = VacationsService.getRequestsByManager({ about: $scope.selectedManager }, p);
            } else if ($scope.filterVacationsByCurrent == 'project_name' && $scope.selectedProject)
            {
                loadPromise = AssignmentService.getAssignmentsByPeriod('all', { project: { resource: $scope.selectedProject.resource } });

                loadPromise = loadPromise.then(function (result)
                {
                    var assignments = result && result.members ? result.members : [];
                    var persons = [];
                    //var start = $scope.startDate.format( 'YYYY-MM-DD' );
                    //var end = $scope.endDate.format( 'YYYY-MM-DD' );
                    var start = starOfFirstWeek.format('YYYY-MM-DD');
                    var endDate = endOfLastWeek.format('YYYY-MM-DD');

                    for (var k = 0; k < assignments.length; k++)
                    {
                        if (!assignments[k].endDate && assignments[k].startDate <= end)
                            persons.push(assignments[k].person.resource);
                        else if (assignments[k].endDate && assignments[k].startDate <= end && assignments[k].endDate >= start)
                            persons.push(assignments[k].person.resource);

                    }

                    return persons;

                });

                loadPromise = loadPromise.then(function (persons)
                {
                    if (persons.length > 0)
                        return Resources.refresh("vacations/all", {
                            //startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
                            //endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
                            startDate: starOfFirstWeek.format('YYYY-MM-DD'),
                            endDate: endOfLastWeek.format('YYYY-MM-DD'),
                            status: status ? status : '',
                            persons: persons.join(',')
                        });
                });
            } else if ($scope.filterVacationsByCurrent == 'role_name' && $scope.selectedRole)
            {
                loadPromise = PeopleService.getPeoplePerRole($scope.selectedRole);

                loadPromise = loadPromise.then(function (result)
                {
                    var persons = result.members ? result.members : [];

                    persons = _.map(persons, function (p) { return p.resource });

                    return persons;

                });

                loadPromise = loadPromise.then(function (persons)
                {
                    if (persons.length > 0)
                        return Resources.refresh("vacations/all", {
                            //startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
                            //endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
                            startDate: starOfFirstWeek.format('YYYY-MM-DD'),
                            endDate: endOfLastWeek.format('YYYY-MM-DD'),
                            status: status ? status : '',
                            persons: persons.join(',')
                        });
                });
            } else if ($scope.filterVacationsByCurrent == 'direct_reports' && $scope.me)
            {
                var p = {
                    //startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
                    //endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
                    startDate: starOfFirstWeek.format('YYYY-MM-DD'),
                    endDate: endOfLastWeek.format('YYYY-MM-DD'),
                    includeApproved: true,
                    showSubordinateManagerRequests: true
                };

                if (!$scope.hidePendingVacations)
                    p.includePending = true;

                loadPromise = VacationsService.getRequestsByManager({ about: $scope.me.about }, p);
            } else
                loadPromise = Resources.refresh("vacations/all", {
                    //startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
                    //endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
                    startDate: starOfFirstWeek.format('YYYY-MM-DD'),
                    endDate: endOfLastWeek.format('YYYY-MM-DD'),
                    status: status ? status : ''
                });


            loadPromise.then(function (result)
            {
                $scope.hideCalendarSpinner = true;

                if (result && (result.members || _.isArray(result)))
                {

                    $scope.fillCalendarDays(_.isArray(result) ? result : result.members);
                }

                return (_.isArray(result) ? result : result.members);
            }).then(function (currentVacations)
            {

                //setTimeout(function() {
                People.getAllActivePeople().then(function (result)
                {
                    var tmpPerson;

                    for (var k = 0; k < currentVacations.length; k++)
                    {
                        tmpPerson = _.find(result.members, function (p)
                        {
                            return p.resource == currentVacations[k].person.resource;

                        });

                        if (tmpPerson)
                        {
                            currentVacations[k].person.name = Util.getPersonName(tmpPerson, true);
                            currentVacations[k].person.lastName = tmpPerson.name.familyName;
                        }
                    }

                });
                //}, 10000);

            }).catch(function ()
            {
                // show empty calendar, in case when something wrong happens
                $scope.hideCalendarSpinner = true;
                $scope.fillCalendarDays([]);
            });

        };

        $scope.changeViewMode = function (viewMode)
        {
            $scope.viewMode = viewMode;

            $scope.initCalendar();
        };

        $rootScope.$on('calendar:update', function ()
        {
            $scope.initCalendar();
        });

        //if (!$scope.initialized) {
        $scope.initCalendar();
        $scope.initialized = true;
        //}
    }
]);

angular.module('Mastermind').controller('OOOModalInstanceCtrl', ['$scope', '$modalInstance', 'details', 'ProjectsService', function ($scope, $modalInstance, details, ProjectsService)
{
    // This is required to request projects assigned to the specisifed person.
    //details.vac.person._id = details.vac.person.resource.substring(details.vac.person.resource.indexOf("/") + 1);

    $scope.details = details;

    //ProjectsService.getMyCurrentProjects(details.vac.person).then(function (projects)
    //{
    //    if (!projects || !projects.data)
    //        return;

    //    $scope.projects = _.pluck(projects.data, "name");
    //});

    $scope.close = function ()
    {
        $modalInstance.dismiss("cancel");
    };
}]);
