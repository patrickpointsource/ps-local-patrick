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
            '$sce',
            '$q',
            'HoursService',
            'UserService',
            'ProjectsService'
        ];

        return directive;

        function HoursEntryRowCtrl(psafLogger,
                           $scope,
                           $sce,
                           $q,
                           HoursService,
                           UserService,
                           ProjectsService) {

            if(!$scope.hourEntry){
                $scope.hourEntry = {
                    isNew: true,
                    editMode: true
                };
            }
            $scope.hourEntry.hoursEdited = $scope.hourEntry.hours;
            $scope.hourEntry.descriptionEdited = $scope.hourEntry.description;

            // Get the expectedHours for this project (e.g. Assignment of 45 hours/week = 9 hours/day)
            var setExpectedHoursPrompt = function() {
                $scope.hourEntry.expectedHours = null;
                var selectedProject = $scope.hourEntry.project || $scope.hourEntry.task;
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
            setExpectedHoursPrompt();

            $scope.clearSelectedItem = function () {
                $scope.hourEntry.project = null;
                $scope.hourEntry.projectName = null;
                $scope.hourEntry.task = null;
                $scope.hourEntry.taskName = null;
            };

            $scope.editHoursEntry = function () {
                $scope.hourEntry.editMode = true;
            };

            $scope.closeEditHoursEntry = function () {
                $scope.hourEntry.editMode = false;
            };

            $scope.clearEditHoursEntry = function(){
                $scope.hourEntry = {};
            };

            $scope.removeHourEntry = function () {
                $scope.removeHourEntryRow($scope.hourEntry);
                if($scope.hourEntry.id){
                    HoursService.deleteHours($scope.hourEntry.id);
                }
            };

            $scope.saveHoursEntry = function () {
                var tmpHours = $scope.hourEntry.hours;
                var tmpDesc = $scope.hourEntry.description;

                $scope.hourEntry.hours = Number($scope.hourEntry.hoursEdited);
                $scope.hourEntry.description = $scope.hourEntry.descriptionEdited;

                $scope.getNewHoursValidationErrors($scope.hourEntry).then(function(numErrors){
                    if(numErrors > 0){
                        $scope.hourEntry.hours = tmpHours;
                        $scope.hourEntry.description = tmpDesc;

                        return;
                    }

                    var obj = {};
                    _.each(['id', 'date', 'description', 'hours', 'person', 'created', 'task', 'project'], function(key){
                        if($scope.hourEntry[key]){
                            obj[key] = $scope.hourEntry[key];
                        }
                    });

                    if($scope.hourEntry.isNew && !$scope.hourEntry.isACopy){
                        $scope.clearEditHoursEntry();
                    }else{
                        $scope.hourEntry.editMode = false;
                    }
                    $scope.saveHoursToBackend(obj);
                });
            };

            $scope.getNewHoursValidationErrors = function () {
                var deferred = $q.defer();

                $scope.resetMessages();

                var entries = $scope.selected ? $scope.selected.hoursEntries : [];

                var hours = Number($scope.hourEntry.hours);
                if(isNaN(hours) || hours === 0){
                    $scope.addValidationMessage('Hours value is empty');
                }else if(hours < 0 || hours > 24){
                    $scope.addValidationMessage('Incorrect value for hours');
                }

                if ($scope.hourEntry &&
                    $scope.hourEntry.editMode &&
                    !$scope.hourEntry.project &&
                    !$scope.hourEntry.task) {
                    $scope.addValidationMessage('Project or task hasn\'t been selected');
                }

                if (!$scope.hourEntry.description) {
                    $scope.addValidationMessage('Hours description is empty');
                }

                var totalHours = $scope.getTotalHoursWithHoursForEntryWithID(
                    $scope.hourEntry.hours,
                    $scope.hourEntry.id
                );

                if (totalHours > 24) {
                    $scope.addValidationMessage('Hours logged on a given day cannot exceed 24 hours.');
                }

                if ($scope.hourEntry.project) {
                    if($scope.hourEntry.isNew &&
                       $scope.checkForExistingRowForProject($scope.hourEntry.project, $scope.hourEntry.id)){
                        $scope.addValidationMessage('Use one entry per day for a given project.');
                    }

                    // Get the start and end dates for the project
                    // Ensure that the selected date is between them.
                    ProjectsService.getProject($scope.hourEntry.project).then(function(project){
                        var selectedDate = moment($scope.getSelectedDate());
                        var projectStartDate = moment(project.startDate);
                        var projectEndDate = project.endDate ? moment(project.endDate) : null;

                        if (selectedDate.isBefore(projectStartDate) ||
                            (projectEndDate && selectedDate.isAfter(projectEndDate))){
                            $scope.addValidationMessage('You are logging hours for project which is already ended or ' +
                                                        'not started');
                        }
                        deferred.resolve($scope.hoursValidation.length);
                    }, deferred.reject);
                }else{
                    deferred.resolve($scope.hoursValidation.length);
                }
                return deferred.promise;
            };

            $scope.saveHoursToBackend = function (entry) {

                var finish = function (updatedHoursEntry) {
                    if ($scope.hourEntry.isNew && !$scope.hourEntry.isACopy) {
                        $scope.addHourEntryRow(updatedHoursEntry);
                    }else if (updatedHoursEntry) {
                        $scope.hourEntry.isNew = false;
                        $scope.hourEntry.isACopy = false;
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
                    $scope.updateTotalHours();
                };
                if($scope.hourEntry.isNew){
                    UserService.getUser().then(function(user){
                        entry.person = user.id;
                        entry.date = $scope.getSelectedDate();
                        HoursService.createHours(entry).then(finish);
                    });
                }else{
                    HoursService.updateHours(entry.id, entry).then(finish);
                }

            };

            $scope.projectTaskDropdownOpen = false;
            $scope.toggleProjectTaskDropdown = function(){
                $scope.projectTaskDropdownOpen = !$scope.projectTaskDropdownOpen;
            };
            $scope.openProjectTaskDropdown = function(){
                $scope.projectTaskDropdownOpen = true;
            };
            $scope.closeProjectTaskDropdown = function(){
                $scope.projectTaskDropdownOpen = false;
            };

            var filter = function (txt, substr) {
                if (substr) {
                    txt = txt.replace(new RegExp(substr, 'gi'), function (s) {
                        return '[[' + s + ']]';
                    });
                }
                return txt;
            };

            $scope.emphasizeMatchingNamesInDropdown = function($event){
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

            $scope.selectTaskOrProject = function (id, name, isTask) {
                if(!isTask){
                    $scope.hourEntry.project = id;
                    $scope.hourEntry.projectName = name;
                    setExpectedHoursPrompt(id);
                }else{
                    $scope.hourEntry.task = id;
                    $scope.hourEntry.taskName = name;
                }
                $scope.projectTaskDropdownOpen = false;
                setExpectedHoursPrompt();
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
