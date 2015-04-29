angular.module('Mastermind').controller('VacationsCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'VacationsService', 'TasksService', 'RolesService', 'NotificationsService', '$timeout',
    function ($scope, $state, $rootScope, Resources, ProjectsService, VacationsService, TasksService, RolesService, NotificationsService, $timeout) {

        var STATUS = VacationsService.STATUS;

        var VACATION_TYPES = VacationsService.VACATION_TYPES;

        $scope.START_TIME_DEFAULT = "09:00";

        $scope.END_TIME_DEFAULT = "17:00";

        $scope.vacationTypes = [VACATION_TYPES.Appointment, VACATION_TYPES.Vacation, VACATION_TYPES.Travel, VACATION_TYPES.Training];

        var VACATION_CAPACITY = 15;

        var VACATIONS_PER_PAGE = 3;

        $scope.vacations = [];

        $scope.vacationsPage = 1;

        $scope.getVacations = function () {
            $scope.profileLoaded = true;

            if ($scope.canViewOtherVacations() || $scope.canViewMyVacations() && $scope.profileId == $scope.me._id)
                VacationsService.getVacations($scope.profileId).then(function (result) {
                    $scope.vacations = _.filter(result, function (vacation) {
                        return vacation.status != "Cancelled";
                    });
                    $scope.vacations = _.sortBy($scope.vacations, function (vacation) {
                        return new Date(vacation.startDate);
                    });

                    for (var i = 0; i < $scope.vacations.length; i++) {
                        Resources.resolve($scope.vacations[i].vacationManager);
                    }

                    $scope.showVacations();
                });
            else {

                $scope.vacations = [];
                $scope.showVacations();
            }
        };


        $scope.prevPage = function () {
            $scope.vacationsPage--;
            $scope.showVacations();
        };

        $scope.nextPage = function () {
            $scope.vacationsPage++;
            $scope.showVacations();
        };

        $scope.getPersonName = function (person, isSimply, isFirst) {
            return Util.getPersonName(person, isSimply, isFirst);
        };

        $scope.canViewOtherVacations = function () {
            return $rootScope.hasPermissions(CONSTS.VIEW_VACATIONS);
        };

        $scope.canViewMyVacations = function () {
            return $rootScope.hasPermissions(CONSTS.VIEW_MY_VACATIONS);
        };


        $scope.showVacations = function () {
            $scope.submitting = false;
            if ($scope.vacations.length > VACATIONS_PER_PAGE) {
                var startIndex = ($scope.vacationsPage - 1) * VACATIONS_PER_PAGE;
                $scope.allPages = Math.ceil($scope.vacations.length / VACATIONS_PER_PAGE);
                $scope.displayedVacations = [];
                for (var i = 0; i < VACATIONS_PER_PAGE; i++) {
                    if ($scope.vacations[startIndex + i]) {
                        $scope.displayedVacations.push($scope.vacations[startIndex + i]);
                    }
                }
            } else {
                $scope.displayedVacations = $scope.vacations;
                $scope.vacationsPage = 1;
            }
        };

        $scope.getDays = function (start, end) {
            return VacationsService.getDays(start, end);
        };

        $scope.getNewVacationDuration = function () {
            if ($scope.vacationStartDate && $scope.vacationStartTime && this.vacationEndDate && this.vacationEndTime) {
                return $scope.getDays($scope.vacationStartDate + " " + $scope.vacationStartTime, this.vacationEndDate + " " + this.vacationEndTime);
            }
        };

        $scope.getEditVacationDuration = function () {
            if (this.vacationEditStartDate && this.vacationEditStartTime && this.vacationEditEndDate && this.vacationEditEndTime) {
                return $scope.getDays(this.vacationEditStartDate + " " + this.vacationEditStartTime, this.vacationEditEndDate + " " + this.vacationEditEndTime);
            }
        };

        $scope.getActualDays = function (startDate, endDate) {
            return VacationsService.getActualDays(startDate, endDate);
        };

        $scope.requestHours = function () {
            $scope.errors = [];
            if ($scope.requestNew) {
                // clean new vacation form
                $scope.requestNew = false;
                $scope.vacationStartDate = "";
                $scope.vacationEndDate = "";
                $scope.newDescription = "";
                $scope.vacationType = "";
            } else {
                // fill new vacation form with default values (today)
                var today = moment().format("YYYY-MM-DD");
                $scope.vacationStartTime = $scope.START_TIME_DEFAULT;
                $scope.vacationEndTime = $scope.END_TIME_DEFAULT;
                $scope.vacationStartDate = today;
                $scope.vacationEndDate = today;
                $scope.requestNew = true;
                Resources.refresh("people/manager/" + $scope.me._id).then(function (result) {
                    if (result) {
                        $scope.vacationManager = _.findWhere($scope.managers, {resource: result.resource});
                    }

                    if ($scope.vacationManager) {
                        $scope.editManager = false;
                    } else {
                        $scope.editManager = true;
                    }

                    $('.select-vacation-manager').selectpicker();
                });
            }
            ;

            $('.select-vacation-start-date').selectpicker();
            $('.select-vacation-start-date').selectpicker('render');
        };

        $scope.addVacation = function () {
            if ($scope.validateNewVacation()) {
                return;
            }

            var vacStartTime = $scope.START_TIME_DEFAULT;
            var vacEndTime = $scope.END_TIME_DEFAULT;

            if ($scope.vacationStartTime && $scope.vacationEndTime) {
                vacStartTime = $scope.vacationStartTime;
                vacEndTime = $scope.vacationEndTime;
            }

            var vacation = {
                startDate: $scope.vacationStartDate + " " + vacStartTime,
                endDate: $scope.vacationEndDate + " " + vacEndTime,
                description: $scope.newDescription ? $scope.newDescription : "",
                person: {resource: $scope.profile.about},
                type: $scope.vacationType,
                vacationManager: {resource: $scope.vacationManager.resource}
            };

            if ($scope.isApproved(vacation)) {
                vacation.status = STATUS.Approved;

                // commit hours if vacation entry approved instantly
                VacationsService.commitHours(vacation, function () {
                    $rootScope.$emit("hours:requiredRefresh");
                });
            } else {
                vacation.status = STATUS.Pending;
                /*var title = ( vacation.type == "Customer Travel" ) ? "Paid " + vacation.type + " hours logged" : "Pending " + vacation.type + " Request";
                 var personName = $scope.profile.name.fullName;
                 var userName = $scope.vacationManager.name.givenName;
                 var message = SmtpHelper.getOutOfOfficeRequestMessage( userName, personName, vacation.type, vacation.startDate, vacation.endDate, vacation.description );

                 var notification = {
                 type: "Vacation",
                 header: title,
                 text: message,
                 icon: "fa fa-clock-o",
                 person: { resource: $scope.vacationManager.resource }
                 };

                 NotificationsService.add(notification).then(function(result) {
                 });*/
            }

            $scope.vacations.push(vacation);
            $scope.showVacations();
            $scope.requestNew = false;
            $scope.submitting = true;

            VacationsService.addNewVacation(vacation).then(function (result) {
                $scope.getVacations();
            });
        };

        $scope.validateNewVacation = function () {
            $scope.errors = [];
            if (!$scope.vacationStartDate) {
                $scope.errors.push("Please enter the start date.");
                return true;
            }
            if (!$scope.vacationEndDate) {
                $scope.errors.push("Please enter the end date.");
                return true;
            }
            if (!$scope.vacationStartTime) {
                $scope.errors.push("Please enter the start time.");
                return true;
            }
            if (!$scope.vacationEndTime) {
                $scope.errors.push("Please enter the end time.");
                return true;
            }
            if (!$scope.vacationType || $scope.vacationType === "") {
                $scope.errors.push("Please select vacation type.");
                return true;
            }
            if (!$scope.vacationManager) {
                $scope.errors.push("Please select manager.");
                return true;
            }

            $scope.checkForConflictDates($scope.vacationStartDate, $scope.vacationEndDate, $scope.vacationStartTime, $scope.vacationEndTime);

            return $scope.errors.length > 0;
        };

        $scope.displayDate = function (date) {
            var mom = moment(date);

            return mom.format("MMM D");
        };

        $scope.editVacationIndex = -1;

        $scope.editVacation = function (index) {
            $scope.errors = [];
            $scope.editManagerEdit = false;
            if ($scope.editVacationIndex == index) {
                $scope.editVacationIndex = -1;
                $scope.getVacations();
            } else {
                $scope.editVacationIndex = index;

                var vacation = $scope.displayedVacations[index];
                var start = moment(vacation.startDate);
                var end = moment(vacation.endDate);
                $scope.vacationEditStartDate = start.format("YYYY-MM-DD");
                $scope.vacationEditEndDate = end.format("YYYY-MM-DD");
                $scope.vacationEditStartTime = start.format("HH:mm");
                $scope.vacationEditEndTime = end.format("HH:mm");
                $scope.vacationManagerEdit = _.findWhere($scope.managers, {resource: vacation.vacationManager.resource});
                $('.select-vacation-start-date-edit').selectpicker();
                $('.select-vacation-manager-' + index).selectpicker();
            }
        };

        $scope.clearCancelModal = function () {
            $("#vacCancelModal").modal('hide');
            $scope.cancelValidation = "";
            $scope.cancellationReason = null;
        };

        $scope.deleteVacation = function () {
            $scope.cancelValidation = "";

            if (!$scope.cancellationReason) {
                $scope.cancelValidation = "Please enter a reason.";
                return;
            }

            var vacation = $scope.displayedVacations[$scope.editVacationIndex];
            vacation.vacationManager = {
                resource: vacation.vacationManager.resource,
                name: Util.getPersonName(vacation.vacationManager)
            };
            vacation.status = "Cancelled";
            $scope.clearCancelModal();
            Resources.update(vacation).then(function (result) {
                $scope.vacations.splice($scope.editVacationIndex, 1);
                $scope.editVacationIndex = -1;
                $scope.showVacations();
            });
        };

        $scope.updateVacation = function (vacation) {
            $scope.errors = [];
            if (this.vacationEditStartDate && this.vacationEditEndDate && this.vacationEditStartTime && this.vacationEditEndTime) {
                vacation.startDate = this.vacationEditStartDate + " " + this.vacationEditStartTime;
                vacation.endDate = this.vacationEditEndDate + " " + this.vacationEditEndTime;
            } else {
                $scope.errors.push("Dates validation failed.");
                return;
            }

            $scope.submitting = true;

            if (!$scope.checkForConflictDates($scope.vacationEditStartDate, $scope.vacationEditEndDate, $scope.vacationEditStartTime, $scope.vacationEditEndTime, vacation.resource)) {
                return;
            }

            if ($scope.vacationManagerEdit) {
                vacation.vacationManager = {resource: $scope.vacationManagerEdit.resource};
            }

            if ($scope.isApproved(vacation)) {
                vacation.status = STATUS.Approved;

                // commit hours after updating vacation entry if it is gets approved instantly
                VacationsService.commitHours(vacation, function () {
                    $rootScope.$emit("hours:requiredRefresh");
                });
            } else {
                vacation.status = STATUS.Pending;
            }

            Resources.update(vacation).then(function (result) {
                $scope.editVacationIndex = -1;
                $scope.getVacations();
            });
        };

        $scope.isApproved = function (vacation) {
            if ((vacation.type == VACATION_TYPES.Appointment && moment(vacation.endDate).diff(vacation.startDate, 'hours') <= 4)
                || vacation.type == VACATION_TYPES.Travel || (moment().isAfter(vacation.startDate) && moment().isAfter(vacation.endDate)))
                return true;
            else
                return false;
        };

        $scope.getCurrentYearVacationDays = function () {
            var now = moment();
            var hoursPerDay = 8;
            var yearHours = 0;
            var hoursCapacity = hoursPerDay * $scope.profile.vacationCapacity;

            for (var i = 0; i < $scope.vacations.length; i++) {
                var vacation = $scope.vacations[i];
                if (vacation.type == VacationsService.VACATION_TYPES.Vacation &&
                    (vacation.status == VacationsService.STATUS.Pending || vacation.status == VacationsService.STATUS.Approved)) {
                    var start = moment(vacation.startDate);
                    var end = moment(vacation.endDate);
                    // check if start and end date in the same year
                    if (start.year() == end.year()) {
                        // check that year is current
                        if (start.year() == now.year()) {
                            var days = $scope.getActualDays(start, end);
                            if (days == 1) {
                                var diff = end.diff(start, 'hours');
                                if (diff <= 8) {
                                    yearHours += diff;
                                } else {
                                    yearHours += 8;
                                }
                            } else {
                                yearHours += days * 8;
                            }
                        }
                        // else vacation is split between years
                    } else {
                        var days = end.diff(start, 'days');
                        var dayIteration = start;
                        var thisYearHours = 0;
                        for (var d = 1; d <= days; d++) {
                            if (dayIteration.add('days', d).year() == now.year()) {
                                thisYearHours += 8;
                            }
                        }

                        yearHours += thisYearHours;
                    }
                }
            }

            var roundHours = ((hoursCapacity - yearHours) / 8);
            if (Math.ceil(roundHours) == roundHours) {
                return roundHours;
            } else {
                return roundHours.toFixed(1);
            }
        };

        $scope.checkForConflictDates = function (startDate, endDate, startTime, endTime, editedVacation) {
            $scope.errors = [];
            var vacStartDate = moment(startDate + " " + startTime);
            var vacEndDate = moment(endDate + " " + endTime);

            if (vacEndDate < vacStartDate) {
                $scope.errors.push('End date is less than start date.');
                return false;
            }

            if ($scope.getActualDays(startDate, endDate) == 0) {
                $scope.errors.push("Selected period does not contain working days.");
                return false;
            }

            for (var i = 0; i < $scope.vacations.length; i++) {
                var vacation = $scope.vacations[i];

                var start = moment(vacation.startDate);
                var end = moment(vacation.endDate);

                if (!editedVacation || editedVacation != vacation.resource) {
                    /*
                     *          ----------start----------end----------
                     *
                     * -----vacStartDate-----start-----vacEndDate-----end---------- (1)
                     * ----------start---vacStartDate----vacEndDate---end---------- (2)
                     * ----------start-----vacStartDate-----end-----vacEndDate----- (3)
                     * */
                    if (/* (1) */ (vacStartDate <= start && vacEndDate >= start) ||
                        /* (2) */ (vacStartDate >= start && vacStartDate <= end && vacEndDate >= start && vacEndDate <= end) ||
                        /* (3) */ (vacStartDate <= end && vacEndDate >= end)) {
                        if (vacation.startDate == vacation.endDate) {
                            $scope.errors.push("Conflict with vacation: [ " + start.format("MMM D") + " ]");
                        } else {
                            $scope.errors.push("Conflict with vacation: [ " + start.format("MMM D") + " - " + end.format("MMM D") + " ]");
                        }


                        return false;
                    }
                }
            }

            return true;
        };

        $scope.getStatusText = function (status) {
            return VacationsService.getStatusText(status);
        };

        $scope.getTypeText = function (type) {
            return VacationsService.getTypeText(type);
        };

        $scope.getStartVacDate = function (date) {
            return date;
        };

        $scope.startDateChanged = function (index) {
            if (index) {
                $('#toDateEdit' + index).datepicker('setStartDate', $scope.vacationEditStartDate);
            } else {
                $('#vacationToDate').datepicker('setStartDate', $scope.vacationStartDate);
            }
        }

        $scope.isManagement = function () {
            if ($scope.me.groups && ( ( $scope.me.groups.indexOf('Management') !== -1 ) || ( $scope.me.groups.indexOf('Executives') !== -1 ))) {
                return true;
            }

            return false;
        }

        $scope.getFormattedTime = function (datetime) {
            var mom = moment(datetime).format('hh:mm A');

            return mom;
        }

        $scope.timeChanged = function () {
            console.log($scope.vacationStartTime);
        }

        $scope.isSameDay = function (date1, date2) {
            return moment(date1).isSame(date2, 'days');
        }

        $scope.showVacationTime = false;

        $scope.managerSelected = function () {
            $scope.vacationManager = this.vacationManager;
            $scope.editManager = false;
        }

        $scope.managerEditSelected = function () {
            $scope.vacationManagerEdit = this.vacationManagerEdit;
            $scope.editManagerEdit = !$scope.editManagerEdit;
        }

        $scope.dateChanged = function () {
            $scope.vacationStartDate = this.vacationStartDate;
            $scope.vacationEndDate = this.vacationEndDate;
            $scope.vacationStartTime = this.vacationStartTime;
            $scope.vacationEndTime = this.vacationEndTime;
            $scope.startDateChanged();
        }

        $scope.editManagerCallback = function () {
            $scope.editManager = true;
            $timeout(function () {
                $(".select-vacation-manager").selectpicker();
            }, 5);
        }

        $scope.editManagerEditCallback = function (index) {
            if ($scope.editManagerEdit) {
                $scope.editManagerEdit = false;
            } else {
                $scope.editManagerEdit = true;

                $timeout(function () {
                    $(".select-vacation-manager-" + index).selectpicker();
                }, 5);
            }
        };

        $scope.getPersonName = function (person) {
            return Util.getPersonName(person);
        };

        $scope.newDescChanged = function () {
            $scope.newDescription = this.newDescription;
        };

        $scope.pointSourcePolicy = "PointSource provides a paid vacation benefit to regular full-time employees who regularly work a minimum of thirty (30) hours per week. Vacation time is allotted per calendar year and is accrued each pay period (i.e. 1/24th of allotted vacation time per pay period).";

        $scope.getVacations();
    }]);
