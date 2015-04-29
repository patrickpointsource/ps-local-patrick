/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects').controller('AssignmentsCtrl', ['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'AssignmentService', '$location', 'ngTableParams', 'People',
    function ($scope, $rootScope, $filter, Resources, $state, $stateParams, AssignmentService, $location, TableParams, People) {

        // Table Parameters
        var params = {
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                type: 'asc' // initial sorting
            }
        };

        $scope.assignmentsFilters = [{
            name: "Current Assignments",
            value: "current"
        }, {
            name: "Future Assignments",
            value: "future"
        }, {
            name: "Past Assignments",
            value: "past"
        }, {
            name: "All Assignments",
            value: "all"
        }];

        $scope.roleAssigneesMap = [];
        $scope.originalAssigneesMap = [];

        $scope.selectedAssignmentsFilter = "all";

        $scope.currentTabStates = [{
            tabId: $state.params.tabId,
            edit: $state.params.edit
            /*,filter:  $state.params.filter*/
        }];

        $scope.pushState = function (state) {
            if ($scope.currentTabStates.length > 5)
                $scope.currentTabStates.splice($scope.currentTabStates.length - 1, 1);

            $scope.currentTabStates.unshift(state);

        };

        $scope.getDefaultRoleHoursPerWeek = function (info) {

            return info.hoursNeededToCover;
        };

        $scope.addNewAssignmentToRole = function (index, role) {
            var coverageInfo = AssignmentService.calculateSingleRoleCoverage(
                role,
                $scope.roleAssigneesMap[role._id] ? $scope.roleAssigneesMap[role._id] : []
            );

            var assignment = AssignmentService.create({
                startDate: role.startDate,
                endDate: role.endDate,
                //percentage: $scope.getDefaultRolePercentage(role)
                hoursPerWeek: $scope.getDefaultRoleHoursPerWeek(coverageInfo)
            });

            if ($scope.roleAssigneesMap.hasOwnProperty(role._id)) {
                $scope.roleAssigneesMap[role._id].push(assignment);
            } else {
                $scope.roleAssigneesMap[role._id] = [assignment];
            }

            $scope.projectAssignment.members = _.values($scope.roleAssigneesMap);
        };

        $scope.removeAssignmentFromRole = function (index, role, parent) {

            if ($scope.roleAssigneesMap.hasOwnProperty(role._id)) {
                if ($scope.roleAssigneesMap[role._id].length > 1)
                    $scope.roleAssigneesMap[role._id].splice(index, 1);
                else {
                    $scope.roleAssigneesMap[role._id] = [];
                }
            }

            $scope.projectAssignment.members = _.values($scope.roleAssigneesMap);

            $("#roleAssignmentDelete" + parent + index).collapse('hide');
        };

        $scope.cancelAssignment = function () {

            if ($rootScope.formDirty) {

                $rootScope.modalDialog = {
                    title: "Save Changes",
                    text: "Would you like to save your changes before leaving?",
                    ok: "Yes",
                    no: "No",
                    cancel: "Cancel",
                    okHandler: function () {
                        $(".modalYesNoCancel").modal('hide');
                        $scope.saveAssignment();
                    },
                    noHandler: function () {
                        $(".modalYesNoCancel").modal('hide');
                        $scope.cancelButtonHandler();
                    },
                    cancelHandler: function () {
                        $(".modalYesNoCancel").modal('hide');
                    }
                };

                $(".modalYesNoCancel").modal('show');
            } else {
                $scope.cancelButtonHandler();
            }
        };

        $scope.cancelButtonHandler = function () {
            $scope.assignmentsErrorMessages = [];

            var role;
            //var assignments = [];

            for (var i = 0; i < $scope.project.roles.length; i++) {
                role = $scope.project.roles[i];
                $scope.roleAssigneesMap[role._id] = _.toArray($scope.originalAssigneesMap[role._id]);

                //assignments = assignments.concat(role.assignees);

                delete $scope.originalAssigneesMap[role._id];
            }

            //AssignmentService.calculateRolesCoverage($scope.project.roles, assignments)

            //$scope.editMode = false;

            $rootScope.formDirty = false;

            var params = {
                tabId: $scope.projectTabId,
                edit: null
                //filter: $scope.selectedAssignmentsFilter
                //filter: "all"
            };

            $scope.selectedAssignmentsFilter = "all";
            $scope.handleAssignmentsFilterChanged();

            $state.go('projects.show', params);
            $scope.pushState(params);
        };

        $scope.validateAssignments = function (assignments) {
            return AssignmentService.validateAssignments($scope.project, assignments);
        };

        $scope.edit = function (avoidStateSwitch) {

            AssignmentService.getAssignmentsByPeriod("all", {
                project: {
                    resource: $scope.project.about
                }
            }).then(function (data) {
                $scope.refreshAssignmentsData(data);
                //$scope.editMode = true;

                if (!avoidStateSwitch) {
                    var params = {
                        tabId: $scope.projectTabId,
                        //filter: null,
                        edit: 'edit'
                    };

                    $state.go('projects.show', params);

                    $scope.pushState(params);
                }
            });
            // $scope.fillOriginalAssignees();
        };

        $scope.stopWatchingAssignmentChanges = function () {
            var sentinel = $scope.assignmentsSentinel;
            if (sentinel) {
                sentinel();
                //kill sentinel
            }
        };

        $scope.refreshAssignmentSentinel = function () {
            //Watch for model changes
            if ($scope.editMode) {
                $scope.stopWatchingAssignmentChanges();

                //Create a new watch
                $scope.assignmentsSentinel = $scope.$watch('projectAssignment.members', function (newValue, oldValue) {
                    if (!$rootScope.formDirty && $scope.editMode && newValue && oldValue) {
                        //Do not include anthing in the $meta property in the comparison
                        if (oldValue.hasOwnProperty('$meta')) {
                            var oldClone = Resources.deepCopy(oldValue);
                            delete oldClone['$meta'];
                            oldValue = oldClone;
                        }
                        if (newValue.hasOwnProperty('$meta')) {
                            var newClone = Resources.deepCopy(newValue);
                            delete newClone['$meta'];
                            newValue = newClone;
                        }

                        //Text Angular seems to add non white space characters for some reason
                        if (newValue.description) {
                            newValue.description = newValue.description.trim();
                        }
                        if (oldValue.description) {
                            oldValue.description = oldValue.description.trim();
                        }

                        var oldStr = JSON.stringify(oldValue);
                        var newStr = JSON.stringify(newValue);

                        if (oldStr != newStr) {
                            console.debug('assignment is now dirty');
                            $rootScope.formDirty = true;
                            $rootScope.dirtySaveHandler = function () {
                                return $scope.saveAssignment(true);
                            };
                        }
                    }

                }, true);
            }
        };

        $scope.getPersonName = function (personId, role) {
            var result = undefined;
            var assignable = $scope.roleGroups[role.type.resource].assiganble;

            if (assignable)
                for (var i = 0; i < assignable.length; i++) {
                    if (assignable[i].resource == personId) {
                        result = Util.getPersonName(assignable[i], false, false);
                        break;
                    }
                }

            return result;
        };

        $scope.sortAssignees = function (role, personResource) {
            var assignees = $scope.roleGroups[role.type.resource].assiganble.slice();
            var theAssignee = _.find(assignees, function (a) {
                return a.resource == personResource;
            });

            if (theAssignee) {
                assignees.splice(assignees.indexOf(theAssignee), 1);
            }

            assignees = _.map(assignees, function (a) {
                var order = 2;

                if (a.primaryRole && a.primaryRole.resource == role.type.resource) {
                    a.roleSign = "P";
                    order = 0;
                } else if (a.secondaryRoles) {
                    var secondaryRoleResources = _.map(a.secondaryRoles, function (s) {
                        return s.resource;
                    });

                    if (secondaryRoleResources.indexOf(role.type.resource) > -1) {
                        a.roleSign = "S";
                        order = 1;
                    }
                } else {
                    delete a.roleSign;
                }

                return {order: order, assignee: a};
            });

            assignees = _.filter(assignees, function (a) {
                return a.assignee.roleSign;
            });
            assignees = _.sortBy(assignees, function (a) {
                return a.order + a.assignee.title;
            });
            assignees = _.map(assignees, function (a) {
                return a.assignee;
            });

            if (theAssignee) {
                assignees.unshift(theAssignee);
            }

            return assignees;
        };
        $scope.getAvailability = function (personResource) {
            if (!$scope.availabilityPercentage[personResource] && $scope.availabilityPercentage[personResource] != 0) {
                return 100;
            } else {
                return $scope.availabilityPercentage[personResource];
            }
        };

        $scope.isPrimaryRole = function (roleResource, person) {
            return person.primaryRole && person.primaryRole.resource == roleResource;
        };

        $scope.isSecondaryRole = function (roleResource, person) {
            if (person.secondaryRoles) {
                var secondaryRoleResources = _.map(person.secondaryRoles, function (s) {
                    return s.resource;
                });

                if (secondaryRoleResources.indexOf(role.type.resource) > -1) {
                    return true;
                }
            }

            return false;
        };

        $scope.getPerson = function (personId, role) {
            var result = undefined;
            var assignable = $scope.roleGroups[role.type.resource].assiganble;

            if (assignable)
                for (var i = 0; i < assignable.length; i++) {
                    if (assignable[i].resource == personId) {
                        result = assignable[i];
                        break;
                    }
                }

            return result;
        };

        var saveInProgress = false;

        /**
         * Save role assignements
         */
        $scope.saveAssignment = function (navigateOut) {

            if (saveInProgress)
                return;

            //Validate new role
            var errors = [];

            for (var i = 0; i < $scope.project.roles.length; i++)
                errors = errors.concat($scope.validateAssignments($scope.roleAssigneesMap[$scope.project.roles[i]._id]));

            if (errors.length > 0)
                $scope.assignmentsErrorMessages = _.uniq(errors);
            else {
                saveInProgress = true;

                var assignments = [];
                var role;
                for (var i = 0; i < $scope.project.roles.length; i++) {
                    role = $scope.project.roles[i];
                    if ($scope.roleAssigneesMap[role._id]) {
                        // remove empty assignments
                        assignments = assignments.concat(_.filter($scope.roleAssigneesMap[role._id], function (assign) {
                            delete assign.project;
                            assign.project = {resource: $scope.project.about};
                            assign.role = {
                                resource: $scope.project.about + '/roles/' + role._id
                            };
                            if (!( assign.person && assign.person.resource ))
                                return false;

                            return true;
                        }));
                    }
                }

                // concatenate hided assignee members
                $scope.projectAssignment.members = assignments.concat($scope.projectAssignment.excludedMembers ? $scope.projectAssignment.excludedMembers : []);

                //Remove from saved objects unnecessary properties
                //$scope.cleanupAssignmentsExtraInfo( );

                //Clear any messages
                $scope.assignmentsErrorMessages = [];

                if (!$scope.projectAssignment.about ||
                    $scope.projectAssignment.about.indexOf('/assignments') == -1 ||
                    $scope.projectAssignment.about.indexOf('undefined') > -1) {
                    $scope.projectAssignment.about = $scope.project.about + '/assignments';
                    $scope.projectAssignment.resource = $scope.projectAssignment.about;
                    $scope.projectAssignment.project = {
                        resource: $scope.project.about
                    };
                }

                if (!$scope.projectAssignment.project) {
                    $scope.projectAssignment.project = {resource: $scope.project.about};
                }

                return AssignmentService.save($scope.project, $scope.projectAssignment).then(function (result) {

                    //$scope.showInfo(['Assignments successfully saved']);
                    //TODO removing dirty handler
                    //$rootScope.formDirty = false;

                    //window.setTimeout(function(){
                    //  $scope.hideMessages();
                    //}, 7 * 1000);

                    // update rev value
                    $scope.projectAssignment._rev = result.rev;

                    $scope.refreshAssignmentsData(AssignmentService.filterAssignmentsByPeriod($scope.projectAssignment, $scope.selectedAssignmentsFilter));

                    var params = {
                        tabId: $scope.projectTabId,
                        //filter: $scope.selectedAssignmentsFilter
                        filter: null
                    };

                    if (!navigateOut) {
                        $scope.stopWatchingAssignmentChanges();
                        $rootScope.formDirty = false;
                        //$scope.editMode = true;
                        if ($scope.editDone && $scope.editDone == true) {
                            $state.go('projects.show', params);
                        }
                    }

                    $scope.pushState(params);
                    saveInProgress = false;
                    $scope.refreshAssignmentSentinel();
                });
                // Reset the form to being pristine.
                for (var i = 0; i < 10 && $scope["newPersonToRoleForm" + i]; i++)
                    $scope["newPersonToRoleForm" + i].$setPristine();
            }
        };

        /*
         * Remove from saved objects unnecessary properties
         */
//	$scope.cleanupAssignmentsExtraInfo = function( ) {
//		var role;
//
//		for( var i = 0; i < $scope.project.roles.length; i++ ) {
//			role = $scope.project.roles[ i ];
//
//			if ( $scope.roleAssigneesMap[ role._id ] ) {
//				for( var j = 0; j < $scope.roleAssigneesMap[ role._id ].length; j++ ) {
//					for( var propP in $scope.roleAssigneesMap[ role._id ][ j ].person )
//						if( propP != "resource" )
//							delete $scope.roleAssigneesMap[ role._id ][j].person[ propP ];
//				}
//			}
//
//			if( $scope.originalAssigneesMap[ role._id ]  )
//				delete $scope.originalAssigneesMap[ role._id ];
//
//			if( role.about )
//				delete role.about;
//
//		}
//
//		if( $scope.projectAssignment.excludedMembers )
//			delete $scope.projectAssignment.excludedMembers;
//	};

        $scope.handleAssignmentsFilterChanged = function () {
            $scope.hideAssignmentsSpinner = false;
            AssignmentService.getAssignmentsByPeriod("all", {
                project: {
                    resource: $scope.project.about
                }
            }).then(function (data) {
                $scope.refreshAssignmentsData(data);
                $scope.setSentinel();
                $rootScope.formDirty = false;
                $scope.hideAssignmentsSpinner = true;
            });
            if ($scope.projectTabId == "assignments" && !$state.is("projects.show.edit")) {
                // in case when we simply converting url "assignments" to
                // "assignments?filter=current" we must replace latest history entry
                var filter = $scope.projectTabId == "assignments" ? $scope.selectedAssignmentsFilter : null;
                var options = {
                    location: $state.params.filter != null ? true : "replace"
                };

                if ($scope.currentTabStates[0].edit)
                    filter = null;
                // for some reasons $state.go do not recognize "replace" value

                var params = {
                    //filter: filter,
                    tabId: $scope.projectTabId,
                    edit: $scope.currentTabStates[0].edit
                };
                var updatedUrl = $state.href('projects.show', params).replace('#', '');

                $scope.pushState(params);

                if (options.location == "replace")
                    $location.url(updatedUrl).replace();
                else
                    $location.url(updatedUrl);
            }

        };

        //$scope.assigneeChanged = function(item, model, role, index) {
        //  $scope.$emit('roles:change', index, role);
        //};

        $scope.fillOriginalAssignees = function () {
            var role;

            // to support cancel functionality
            for (var i = 0; i < $scope.project.roles.length; i++) {
                role = $scope.project.roles[i];

                if (!$scope.originalAssigneesMap) {
                    $scope.originalAssigneesMap = [];

                    var assignees = $scope.roleAssigneesMap[role._id];
                    for (var j = 0; assignees && assignees.length && j < assignees.length; j++) {
                        var assignment = AssignmentService.create(assignees[j]);
                        if ($scope.originalAssigneesMap.hasOwnProperty(role._id)) {
                            $scope.originalAssigneesMap[role._id].push(assignment);
                        } else {
                            $scope.originalAssigneesMap[role._id] = [assignment];
                        }
                    }
                }
            }
        };

        $scope.getActualProjectAssignmentMembers = function () {
            var result = [];
            var role = null;

            for (var i = 0; i < $scope.project.roles.length; i++) {
                role = $scope.project.roles[i];

                if ($scope.roleAssigneesMap[role._id])
                    result = result.concat($scope.roleAssigneesMap[role._id]);
            }

            return result;
        };

        $scope.isPastAssignment = function (currentAssignee) {
            if (!currentAssignee.endDate) {
                return false;
            }

            var now = moment();
            var assignmentEndMoment = moment(currentAssignee.endDate);

            return assignmentEndMoment.isBefore(now);
        };

        $scope.peopleList = [];

        $scope.refreshAssignmentsData = function (result) {
            $scope.roleAssigneesMap = [];

            People.getPeopleCurrentAssignments().then(function (activeAssignments) {
                //Sum the percentages for all of the active assignments
                var availabilityPercentage = {};
                for (var person in activeAssignments) {
                    var assignments = activeAssignments[person];
                    if (assignments) {
                        var hoursRateValue = AssignmentService.getAssignmentsHoursRate(assignments);
                        availabilityPercentage[person] = 100 - Math.round(100 * hoursRateValue / CONSTS.HOURS_PER_WEEK);
                        if (availabilityPercentage[person] < 0) {
                            availabilityPercentage[person] = 0;
                        }
                    }
                }

                $scope.availabilityPercentage = availabilityPercentage;
            });

            if (result && result.members) {
                $scope.projectAssignment = result;

                var assignments = result.members ? result.members : [];

                var findRole = function (roleResource) {
                    return _.find($scope.project.roles, function (r) {
                        return roleResource.indexOf(r._id) > -1;
                    });
                };
                var findPerson = function (personId) {
                    return _.find($scope.peopleList, function (p) {
                        return personId == p.resource;
                    });
                };
                // fill people list

                if ($scope.peopleList.length == 0) {
                    var people = [];

                    for (var prop in $scope.roleGroups)
                        people = people.concat($scope.roleGroups[prop].assiganble);

                    $scope.peopleList = _.uniq(people, function (p) {
                        return p.resource;
                    });
                }

                var role = null;
                var person = null;

                for (var i = 0; i < assignments.length; i++) {
                    if (assignments[i].role && assignments[i].role.resource)
                        role = findRole(assignments[i].role.resource);
                    else
                        role = null;

                    person = assignments[i].person && assignments[i].person.resource ? findPerson(assignments[i].person.resource) : null;

                    if (person) {
                        assignments[i].person.thumbnail = person.thumbnail;
                        assignments[i].person.name = person.familyName + ', ' + person.givenName;
                    }

                    if (role) {
                        if ($scope.roleAssigneesMap.hasOwnProperty(role._id)) {
                            $scope.roleAssigneesMap[role._id].push(assignments[i]);
                        } else {
                            $scope.roleAssigneesMap[role._id] = [assignments[i]];
                        }
                    }

                }

                for (var i = 0; i < $scope.project.roles.length; i++) {
                    var assignees = $scope.roleAssigneesMap[$scope.project.roles[i]._id];
                    if (assignees && assignees.length > 1) {
                        _.sortBy(assignees, function (assignment) {
                            return new Date(assignment.endDate);
                        });
                    }
                }

                $scope.fillOriginalAssignees();

            } else {
                $scope.projectAssignment = {
                    about: $scope.project.about + '/assignments'
                };
            }

            AssignmentService.calculateRolesCoverage($scope.project.roles, $scope.getActualProjectAssignmentMembers());

            var today = new Date();

            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            for (var i = 0; i < $scope.project.roles.length; i++) {
                role = $scope.project.roles[i];
                var assignees = $scope.roleAssigneesMap[role._id];
                if (!assignees || assignees.length == 0) {
                    assignees = [];

                    var props = {
                        startDate: role.startDate,
                        endDate: role.endDate,
                        //percentage: $scope.getDefaultRolePercentage(role),
                        hoursPerWeek: $scope.getDefaultRoleHoursPerWeek(role)
                    };

                    var newAssignee = AssignmentService.create(props);

                    assignees.push(newAssignee);
                } else {
                    _.each(assignees, function (a) {
                        a.isCurrent = a.isFuture = a.isPast = false;
                        if (new Date(a.startDate) <= today && ( !a.endDate || new Date(a.endDate) > today ))
                            a.isCurrent = true;
                        else if (new Date(a.startDate) >= today && ( !a.endDate || new Date(a.endDate) > today ))
                            a.isFuture = true;
                        else if (new Date(a.startDate) < today && ( !a.endDate || new Date(a.endDate) < today ))
                            a.isPast = true;
                    });
                    assignees.sort(function (a1, a2) {
                        if (!a1.isCurrent && a2.isCurrent)
                            return 1;
                        else if (a1.isCurrent && !a2.isCurrent)
                            return -1;
                        else if (a1.endDate && a2.endDate && new Date(a1.endDate) < new Date(a2.endDate))
                            return 1;
                        else if (a1.endDate && a2.endDate && new Date(a1.endDate) > new Date(a2.endDate))
                            return -1;
                        else if (!a1.endDate && a2.endDate)
                            return -1;
                        else if (a1.endDate && !a2.endDate)
                            return 1;
                        else if (( !a1.endDate && !a2.endDate || a1.endDate == a2.endDate ) && new Date(a1.startDate) < new Date(a2.startDate))
                            return -1;
                        else if (( !a1.endDate && !a2.endDate || a1.endDate == a2.endDate ) && new Date(a1.startDate) > new Date(a2.startDate))
                            return 1;

                        return 0;
                    });
                }
            }

            $scope.refreshAssignmentSentinel();
            $scope.$emit('roles:assignments:change', $scope.roleAssigneesMap);
        };

        var initAssignments = function () {
            if ($scope.project && $scope.project.roles) {
                $scope.roleAssigneesMap = [];

                $scope.roleTableParams = new TableParams(params, {
                    counts: [], // hide page counts control
                    total: $scope.project.roles.length, // length of data
                    getData: function ($defer, params) {
                        var data = $scope.project.roles;
                        var ret = data.slice(( params.page() - 1 ) * params.count(), params.page() * params.count());
                        $defer.resolve(ret);
                    }
                });

                $scope.handleAssignmentsFilterChanged();

                /*
                 // switch to edit mode if needed
                 if (($scope.editMode || $state.params.edit)  && $scope.projectManagementAccess){
                 $scope.edit(true);
                 }
                 */
            }
        };

        // it is important to unbind project load because handler uses properties like $scope.project, and in case of calling not unbinded handler
        // it will be used value from previous context! according to js closures
        var unbindProjectLoad = null;

        if (!$scope.project)
            unbindProjectLoad = $rootScope.$on("project:loaded", initAssignments);
        else
            initAssignments();

        var unbindSave = $rootScope.$on("project:save", function () {
            $scope.saveAssignment();
        });
        var unbindCancel = $rootScope.$on("project:cancel", function () {
            $scope.cancelAssignment();
        });

        $scope.$on("$destroy", function () {
            unbindSave();
            unbindCancel();

            if (unbindProjectLoad)
                unbindProjectLoad();
        });

    }]);
