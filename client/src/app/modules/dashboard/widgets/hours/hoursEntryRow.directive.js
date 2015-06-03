/* global moment, _ */
(function(){
    angular
        .module('app.dashboard.widgets.hours')
        .filter('transformHighlightNotation', transformHighlightNotation)
        .directive('hoursEntryRow', HoursEntryRow);

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

    function transformHighlightNotation($sce){
        return function(input){
            input = input.replace(/\[\[/g, '<span class="highlight">');
            input = input.replace(/\]\]/g, '</span>');
            return $sce.trustAsHtml(input);
        };
    }
    function HoursEntryRow() {

        var directive = {
            name: 'totalHours',
            scope: true,
            controller: HoursEntryRowCtrl,
            restrict: 'EA',
            templateUrl: 'app/modules/dashboard/widgets/hours/hoursEntryRow.html',
            replace: true
        };

        HoursEntryRowCtrl.$inject = [
            'psafLogger',
            '$scope',
            '$state',
            '$rootScope',
            '$timeout',
            '$sce',
            // 'Resources',
            'PeopleService',
            'ProjectsService',
            'HoursService',
            'TasksService',
            'RolesService',
            'AssignmentsService'
        ];

        return directive;

        function HoursEntryRowCtrl(psafLogger,
                           $scope,
                           $state,
                           $rootScope,
                           $timeout,
                           $sce,
                        //    Resources,
                           PeopleService,
                           ProjectsService,
                           HoursService,
                           TasksService,
                           RolesService,
                           AssignmentsService) {

            $scope.editMode = false;
            if(!$scope.hourEntry){
                $scope.isNew = true;
                $scope.editMode = true;
                $scope.hourEntry = {};
            }

            // Get the expectedHours for this project (e.g. Assignment of 45 hours/week = 9 hours/day)
            var setExpectedHoursPrompt = function(selectedProject) {
                $scope.hourEntry.expectedHours = null;

                if (selectedProject) {
                    for (var i = 0, assignmentCount = $scope.myAssignments.length; i < assignmentCount; i++) {
                        var assignment = $scope.myAssignments[i];

                        if (assignment.project && assignment.project === selectedProject.id) {
                            for (var j = 0, memberCount = assignment.members.length; j < memberCount; j++) {
                                var member = assignment.members[j];

                                if (member.person && member.person === $scope.me.id) {
                                    $scope.hourEntry.expectedHours = Math.round((member.hoursPerWeek / 5) * 10) / 10;
                                    return;
                                }
                            }
                        }
                    }
                }
            };

            $scope.clearSelectedItem = function () {
                $scope.hourEntry.project = null;
                $scope.hourEntry.projectName = null;
                $scope.hourEntry.task = null;
                $scope.hourEntry.taskName = null;
            };

            $scope.editHoursEntry = function (e, hourEntry, tagetInput) {
                e = e ? e : window.event;

                if (e) {
                    var hoursLoggedEntry = $(e.target).closest('.hours-logged-entry');

                    hoursLoggedEntry.find('.mobile-visible').removeClass('mobile-visible');
                    hoursLoggedEntry.find('.fa-chevron-up').removeClass('fa-chevron-up').addClass('fa-chevron-down');

                    tagetInput = tagetInput ? tagetInput : hoursLoggedEntry.find('[name="project-task-select"]');
                }

                $scope.editMode = true;

                $scope.hourEntry.hoursEdited = $scope.hourEntry.hours;
                $scope.hourEntry.descriptionEdited = $scope.hourEntry.description;

                setExpectedHoursPrompt(
                    $scope.hourEntry.project ? $scope.hourEntry.project : $scope.hourEntry.task
                );
            };

            $scope.closeEditHoursEntry = function () {
                $scope.editMode = false;
            };

            $scope.saveHoursEntry = function (isAdded) {
                var tmpHours = $scope.hourEntry.hours;
                var tmpDesc = $scope.hourEntry.description;

                $scope.hourEntry.hours = Number($scope.hourEntry.hoursEdited);
                $scope.hourEntry.description = $scope.hourEntry.descriptionEdited;

                $scope.getNewHoursValidationErrors($scope.hourEntry);

                if ($scope.hoursValidation.length > 0) {
                    $scope.hourEntry.hours = tmpHours;
                    $scope.hourEntry.description = tmpDesc;

                    return;
                }

                if (isAdded &&
                    (
                        $scope.hourEntry.hours === '' ||
                        (!$scope.hourEntry.project && !$scope.hourEntry.task)
                    )
                ) {
                    console.error('shouldn\'t see this?');
                    return;
                }

                var obj = {};
                _.each(['id', 'date', 'description', 'hours', 'person', 'created', 'task', 'project'], function(key){
                    if($scope.hourEntry[key]){
                        obj[key] = $scope.hourEntry[key];
                    }
                });

                $scope.editMode = false;
                $scope.saveHoursToBackend(obj, isAdded);
            };

            $scope.getNewHoursValidationErrors = function () {

                $scope.hoursValidation = [];

                var entries = $scope.selected ? $scope.selected.hoursEntries : [];

                if ($scope.hourEntry &&
                    (
                        $scope.hourEntry.hours === '' ||
                        parseFloat($scope.hourEntry.hours) === 0
                    ) ||
                    $scope.hourEntry.hours === undefined) {
                    $scope.hoursValidation.push('Hours value is empty');
                } else if ($scope.hourEntry && $scope.hourEntry.hours) {
                    var res = /^\d*(\.\d{1,2})?$/.exec($scope.hourEntry.hours);

                    if (!res) {
                        $scope.hoursValidation.push('Incorrect value for hours');
                    }

                }

                if ($scope.hourEntry && $scope.hourEntry.selectedItem && $scope.hourEntry.selectedItem.startDate) {
                    var selectedDate = new Date($scope.selected.date);

                    if (selectedDate > new Date($scope.hourEntry.selectedItem.endDate) ||
                        selectedDate < new Date($scope.hourEntry.selectedItem.startDate)) {
                        $scope.hoursValidation.push('You are logging hours for project which is already ended or ' +
                                                    'not started');
                    }
                }

                if ($scope.hourEntry &&
                    $scope.editMode &&
                    !$scope.hourEntry.project &&
                    !$scope.hourEntry.task) {
                    $scope.hoursValidation.push('Project or task hasn\'t been selected');
                }

                if (!$scope.hourEntry.description) {
                    $scope.hoursValidation.push('Hours description is empty');
                }

                var totalHours = $scope.getTotalHoursWithHoursForEntryWithID(
                    $scope.hourEntry.hours,
                    $scope.hourEntry.id
                );

                if (totalHours > 24) {
                    $scope.hoursValidation.push('Hours logged on a given day cannot exceed 24 hours.');
                }

                $scope.hoursValidation = _.uniq($scope.hoursValidation);

                return $scope.hoursValidation.length > 0;
            };

            $scope.saveHoursToBackend = function (entry, isAdded) {
                $scope.updateTotalHours();

                HoursService.updateHours(entry.id, entry).then(function (updatedHoursEntry) {
                    if ($scope.isNew) {
                        $scope.addNewHoursRecord(updatedHoursEntry);
                        $scope.clearEditHoursEntry();
                    }else if (updatedHoursEntry) {
                        _.extend($scope.hourEntry, {
                            id: updatedHoursEntry.id,
                            created: updatedHoursEntry.created,
                            date: updatedHoursEntry.date,
                            description: updatedHoursEntry.description,
                            hours: updatedHoursEntry.hours,
                            person: updatedHoursEntry.person,
                            project: updatedHoursEntry.project,
                            task: updatedHoursEntry.task
                        });
                    }

                    //$scope.hideHoursSpinner = true;
                    $scope.$emit('hours:added', $scope.selected);
                });

            };

            $scope.dropdownOpen = false;
            $scope.toggleDropdown = function(){
                $scope.dropdownOpen = !$scope.dropdownOpen;
            };
            $scope.openDropdown = function(){
                $scope.dropdownOpen = true;
            };
            $scope.closeDropdown = function(){
                $scope.dropdownOpen = false;
            };

            var filter = function (txt, substr) {
                if (substr) {
                    txt = txt.replace(new RegExp(substr, 'gi'), function (s) {
                        return '[[' + s + ']]';
                    });
                }
                return txt;
            };

            $scope.updateAutocomplete = function($event){
                var val = $scope.hourEntry.searchInput;
                if(!val || !val.length){
                    return;
                }
                val = val.toLowerCase();
                _.each($scope.projectTasksList, function(item){
                    var name = item.originalName.toLowerCase();
                    var customerName = item.originalCustomerName ? item.originalCustomerName.toLowerCase() : '';

                    if(name.indexOf(val) !== -1){
                        item.hidden = false;
                        item.name = filter(item.originalName, val);
                        item.customerName = item.originalCustomerName;
                    }else if(customerName.indexOf(val) !== -1){
                        item.hidden = false;
                        item.name = item.originalName;
                        item.customerName = filter(item.originalCustomerName, val);
                    }else{
                        item.hidden = true;
                        item.name = item.originalName;
                        item.customerName = item.originalCustomerName;
                    }
                });
            };

            // This should be part of an autocomplete directive I think - RCM 2015-05-01 18:39
            $scope.menuItemSelected = function (id, name, isTask) {
                if(!isTask){
                    $scope.hourEntry.project = id;
                    $scope.hourEntry.projectName = name;
                    setExpectedHoursPrompt(id);
                }else{
                    $scope.hourEntry.task = id;
                    $scope.hourEntry.taskName = name;
                }
                $scope.dropdownOpen = false;
            };

            $scope.isDescriptionExpandedOnMobile = false;
            $scope.chevronIcon = function(){
                if($scope.isDescriptionExpandedOnMobile){
                    return $sce.trustAsHtml('<i class="fa fa-chevron-up"></i>');
                }
                return $sce.trustAsHtml('<i class="fa fa-chevron-down"></i>');
            };
            $scope.toggleDescription = function(){
                $scope.isDescriptionExpandedOnMobile = !$scope.isDescriptionExpandedOnMobile;
            };
        }
    }
})();
