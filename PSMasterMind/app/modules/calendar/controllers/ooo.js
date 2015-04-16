'use strict';

/*
 * Controller for ooo widget
 */

angular.module('Mastermind').controller('OOOCtrl', [
    '$scope', '$state', '$filter', '$q', '$rootScope', 'VacationsService',
    'Resources', 'ngTableParams', 'NotificationsService',
    function($scope, $state, $filter, $q, $rootScope, VacationsService, Resources, TableParams, NotificationsService) {
        $scope.START_TIME_DEFAULT = "09:00";

        $scope.END_TIME_DEFAULT = "17:00";

        $scope.START_DATE_DEFAULT = moment().format("YYYY-MM-DD");

        $scope.loading = true;

        var el = $("<div>").addClass("hidden-sm hidden-md").appendTo($("body"));

        $scope.isMobile = el.is(":hidden");

        el.remove();

        $scope.initOOO = function () {
            $scope.submitting = false;
            $scope.cancelEdit();
            $scope.loading = true;
            Resources.refresh("vacations/my").then(function(result) {
                if (result) {
                    $scope.loading = false;
                    $scope.oooPeriods = result.periods;
                    $scope.oooDaysLeft = result.daysLeft;
                    $scope.myVacations = result.vacations;

                    // Better to do this transformation on the server side. But we have what we have.
                    if ($scope.isMobile)
                        for (var i = 0, count = $scope.oooPeriods.length; i < count; i++)
                        {
                            var names = $scope.oooPeriods[i].name.split(" - ");

                            names[0] = names[0].substr(0, 3);
                            names[1] = names[1].substr(0, 3);

                            $scope.oooPeriods[i].name = names.join(" - ");
                        }

                    if ($rootScope.hasPermissions(CONSTS.VIEW_VACATIONS)) {
                        $scope.showRequests();
                    }
                }
            });
            var params = {};
		    params.group = "Managers";
		    Resources.refresh("people/bytypes/byGroups", params).then(
		        function(result) {
		            $scope.managers = result.members;

		            if ($scope.me.manager) {
		                $scope.vacationManager = _.findWhere($scope.managers, { resource: $scope.me.manager.resource });
		            }
		            if ($scope.vacationManager) {
		                $scope.editManager = false;
		            } else {
		                $scope.editManager = true;
		            }

		            $('.select-vacation-type').selectpicker();
		            $('.select-vacation-type').selectpicker('render');
		        }
		    );
        };

        $scope.cancelEdit = function () {
            $scope.editableVacation = null;
            $scope.newVacationCreation = false;
            $scope.vacationStartDate = null;
            $scope.vacationStartTime = null;
            $scope.vacationEndDate = null;
            $scope.vacationEndTime = null;
            $('.select-vacation-type').selectpicker('val', "");
        };

        $scope.initOOO();

        $scope.editableVacation = null;
        $scope.collapsedPeriodIndex = 1;

        $scope.collapsePeriod = function(index) {
            if ($scope.collapsedPeriodIndex == index) {
                $scope.collapsedPeriodIndex = -1;
            } else {
                $scope.collapsedPeriodIndex = index;
            }
        };

        $scope.getShortDate = function(date) {
            return moment(date).format("MMM DD");
        };

        $scope.getDays = function(vacation) {
            return VacationsService.getDays(vacation.startDate, vacation.endDate);
        };

        $scope.getStatusText = function(status) {
            return VacationsService.getStatusText(status);
        };

        $scope.getTotalDays = function(period) {
            var hours = 0;
            _.each(period.vacations, function (vacation) {
                if (vacation.status == "Approved" || vacation.status == "Pending") {
                    hours += VacationsService.getHoursLost(vacation);
                }
            });

            return (hours / 8).toFixed(1);
        };

        $scope.getDaysLost = function(vacation) {
            return (VacationsService.getHoursLost(vacation) / 8).toFixed(1);
        };

        $scope.editableVacation = null;
        $scope.newVacationCreation = false;

        $scope.requestNewVacation = function() {
            var now = moment();
            $scope.newVacationCreation = true;
            $scope.editableVacation = {

            };
            $scope.setDate("#vacationFromDate", now.format("YYYY-MM-DD"));
            $scope.vacationStartTime = $scope.START_TIME_DEFAULT;
            $scope.setDate("#vacationEndDate", now.format("YYYY-MM-DD"));
            $scope.vacationEndTime = $scope.END_TIME_DEFAULT;
        };

        $scope.editManager = false;

        $scope.editManagerCallback = function() {
            $scope.editManager = true;
            setTimeout(function() {
                $(".select-vacation-manager").selectpicker();
            }, 5);
        };

        $scope.managerSelected = function() {
            $scope.vacationManager = this.vacationManager;
            $scope.editManager = false;
        };

        $scope.vacationTypes = VacationsService.VACATION_TYPES;

        $scope.getPersonName = function (person, isSimply, isFirst) {
            return Util.getPersonName(person, isSimply, isFirst);
        };

        $scope.getNewVacationDuration = function () {
            if (this.vacationStartDate && this.vacationStartTime && this.vacationEndDate && this.vacationEndTime) {
                return VacationsService.getDays(this.vacationStartDate + " " + this.vacationStartTime, this.vacationEndDate + " " + this.vacationEndTime);
            }
        };

        $scope.editVacation = function (vacation) {
            $scope.clean();
            //if ($scope.newVacationCreation) {
            //    return;
            //}
            $('.select-vacation-type').selectpicker('val', vacation.type);
            $scope.editableVacation = vacation;
            $scope.vacationManager = _.findWhere($scope.managers, { resource: vacation.vacationManager.resource });
            if (!$scope.vacationManager) {
                Resources.resolve(vacation.vacationManager).then(function(result) {
                    $scope.vacationManager = vacation.vacationManager;
                });
            }
            var vacStart = moment(vacation.startDate);
            var vacEnd = moment(vacation.endDate);
            $scope.setDate("#vacationFromDate", vacStart.format("YYYY-MM-DD"));
            $scope.vacationStartTime = vacStart.format("HH:mm");
            $scope.setDate("#vacationEndDate", vacEnd.format("YYYY-MM-DD"));
            $scope.vacationEndTime = vacEnd.format("HH:mm");
        };

        $scope.setDate = function(id, date) {
            $(id).datepicker('setDate', new Date(date));
        };

        $scope.getSubmitText = function() {
            if ($scope.editableVacation && $scope.editableVacation._id) {
                return "RE-SUBMIT";
            } else {
                return "SUBMIT";
            }
        };

        $scope.messages = [];

        $scope.submit = function() {
            $scope.clean();
            $scope.submitting = true;

            // validate dates
            if (this.vacationStartDate && this.vacationEndDate && this.vacationStartTime && this.vacationEndTime) {
                $scope.editableVacation.startDate = this.vacationStartDate + " " + this.vacationStartTime;
                $scope.editableVacation.endDate = this.vacationEndDate + " " + this.vacationEndTime;
            } else {
                $scope.errors.push("Dates validation failed.");
                $scope.submitting = false;
                return;
            }

            // validate manager
            if ($scope.vacationManager) {
                $scope.editableVacation.vacationManager = { resource: $scope.vacationManager.resource, name: $scope.getPersonName($scope.vacationManager) };
            } else {
                $scope.errors.push("Please select manager.");
            }

            // validate your vacation conflicts
            var conflicts = VacationsService.checkForConflictDates(this.vacationStartDate, this.vacationEndDate, this.vacationStartTime, this.vacationEndTime, $scope.editableVacation, $scope.myVacations);
            if (conflicts.length > 0) {
                $scope.errors.push(conflicts);
                $scope.submitting = false;
                return;
            }

            // description
            $scope.editableVacation.description = $scope.editableVacation.description ? $scope.editableVacation.description : "";

            // person
            if (!$scope.editableVacation.person) {
                $scope.editableVacation.person = {
                    resource: $scope.me.about,
                    name: $scope.getPersonName($scope.me)
                }
            }

            if ($scope.isApproved($scope.editableVacation)) {
                $scope.editableVacation.status = VacationsService.STATUS.Approved;

                // commit hours if vacation entry approved instantly
                VacationsService.commitHours($scope.editableVacation, function () {
                    $rootScope.$emit("hours:requiredRefresh");
                });
            } else {
                $scope.editableVacation.status = VacationsService.STATUS.Pending;
            }

            if ($scope.editableVacation._id) {
                // update
                Resources.update($scope.editableVacation).then(function (result) {
                    $scope.initOOO();
                    $scope.$emit('required-notifications-update');
                    $scope.messages.push("Re-submit of edited out of office request was successfull!");
                });
            } else {
                // create
                VacationsService.addNewVacation($scope.editableVacation).then(function (result) {
                    $scope.initOOO();
                    $scope.$emit('required-notifications-update');
                    $scope.messages.push("Out of office request created successfully!");
                });
            }
        };

        $scope.isApproved = function (vacation) {
            return VacationsService.isApproved(vacation);
        };

        $scope.clean = function() {
            $scope.errors = [];
            $scope.messages = [];
        };

        $scope.startDateChanged = function () {
            var startDate = moment(this.vacationStartDate);
            $scope.setDate("#vacationEndDate", startDate.format("YYYY-MM-DD"));
        };

        $scope.deleteVacation = function () {
            $scope.cancelValidation = "";

            if (!this.cancellationReason) {
                $scope.cancelValidation = "Please enter a reason.";
                return;
            }

            var vacation = $scope.editableVacation;

            $("#vacCancelModal").modal('hide');
            $scope.submitting = true;

            vacation.status = "Cancelled";
            vacation.reason = this.cancellationReason;
            vacation.vacationManager = { resource: vacation.vacationManager.resource, name: Util.getPersonName(vacation.vacationManager) };
            vacation.person = { resource: vacation.person.resource, name: Util.getPersonName(vacation.person) }
            Resources.update(vacation).then(function (result) {
                $scope.initOOO();
                $rootScope.$emit('calendar:update');
                $scope.messages.push("Out of office request cancelled.");
                $scope.$emit('request-processed', request);
            });
        };

        $scope.loadingRequests = false;
        $scope.showRequests = function () {
            $scope.loadingRequests = true;
            VacationsService.getMyRequests().then(function (result) {
                $scope.requestsData = result;

                for (var i = 0; i < $scope.requestsData.length; i++) {
                    var request = $scope.requestsData[i].request;

                    request.days = VacationsService.getDays(request.startDate, request.endDate);

                    $scope.cachedProjects = [];
                    for (var j = 0; j < $scope.requestsData[i].projects.length; j++) {
                        var projResource = $scope.requestsData[i].projects[j].resource;
                        var project = _.findWhere($scope.cachedProjects, { resource: projResource });
                        if (!project) {
                            Resources.resolve($scope.requestsData[i].projects[j]).then(function (result) {
                                if (!result.message && result.message !== "deleted") {
                                    if (!_.findWhere($scope.cachedProjects, { _id: result._id })) {
                                        $scope.cachedProjects.push(result);
                                    }
                                }
                            });
                        }
                    }
                }

                $scope.loadingRequests = false;

                if ($scope.requestsData.length == 0) {
                    $scope.showRequestsTab = false;
                }
            });
        };

        $scope.getSwitchButtonText = function () {
            if ($scope.showRequestsTab) {
                return "Request OOO";
            }
            return "View requests";
        };

        $scope.showRequestsTab = false;
        $scope.switchView = function() {
            $scope.showRequestsTab = !$scope.showRequestsTab;
        };

        $scope.selectedRequest = null;
        $scope.collapseRequest = function (data) {
            if ($scope.selectedRequest && $scope.selectedRequest._id == data.request._id) {
                $scope.selectedRequest = null;
                $scope.personsProjects = null;
            } else {
                $scope.selectedRequest = data.request;
                $scope.personsProjects = data.projects;
            }
        };

        $scope.formatDate = function(date, format) {
            return moment(date).format(format);
        };

        $scope.decide = function(request, isApproved) {
            var status;
            if (isApproved) {
                status = VacationsService.STATUS.Approved;
            } else {
                status = VacationsService.STATUS.Denied;
            }

            request.status = status;
            request.person = { resource: request.person.resource, name: $scope.getPersonName(request.person) };

            $scope.selectedRequest = null;
            $scope.loadingRequests = true;

            Resources.update(request).then(function(result) {
                if ($rootScope.hasPermissions(CONSTS.VIEW_VACATIONS)) {
                    $scope.showRequests();
                }

                if (isApproved) {
                    VacationsService.commitHours(request);
                }
            });

            $scope.$emit('request-processed', request);
        };

        $scope.pointSourcePolicy = "PointSource provides a paid vacation benefit to regular full-time employees who regularly work a minimum of thirty (30) hours per week. Vacation time is allotted per calendar year and is accrued each pay period (i.e. 1/24th of allotted vacation time per pay period).";

        $scope.getResourceFinderLink = function (request) {
            var startDate = moment(request.startDate).format('YYYY-MM-DD');
            var endDate = moment(request.endDate).format('YYYY-MM-DD');
            $state.go('staffing', { tab: 'resourcefinder', startDate: startDate, endDate: endDate });
        };

        $scope.$on("ooo-needs-update", function() {
            $scope.initOOO();
        });

        $scope.$emit('required-notifications-update');
    }
]);
