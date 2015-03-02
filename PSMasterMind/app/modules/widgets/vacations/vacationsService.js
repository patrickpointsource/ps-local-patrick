'use strict';

/*
 * Services dealing with the vacations service
 */
angular.module( 'Mastermind' ).service( 'VacationsService', [ '$q', 'Resources', 'HoursService',
function ($q, Resources, HoursService) {

    this.START_TIME_DEFAULT = "09:00";
    this.END_TIME_DEFAULT = "17:00";

    this.STATUS = {
        Pending: "Pending",
        Approved: "Approved",
        Denied: "Denied",
        Cancelled: "Cancelled"
    };

    this.VACATION_TYPES = {
        Appointment: "Appointment",
        Vacation: "Vacation",
        Travel: "Customer Travel",
        Training: "Conference/Training"
    };


    this.getVacations = function(profileId) {
        var deferred = $q.defer();

        Resources.get("vacations/byperson/" + profileId, { t: (new Date()).getMilliseconds() }).then(function(result) {
            deferred.resolve(result.members);
        });

        return deferred.promise;
    };

    this.addNewVacation = function(vacation) {
        var deferred = $q.defer();

        Resources.create('vacations', vacation).then(function(result) {
            deferred.resolve(result);
        });

        return deferred.promise;
    };


    this.getRequests = function(manager) {
        var deferred = $q.defer();
        var params = {
            t: (new Date()).getMilliseconds()
        };

        params.manager = manager.about;
        params.status = [this.STATUS.Pending, this.STATUS.Cancelled];
        params.fields = ["_id", "description", "startDate", "endDate", "person", "status", "type", "resource"];
        Resources.get("vacations/bytypes/getRequests", params).then(function(result) {
            deferred.resolve(result.members);
        });
        return deferred.promise;
    };

    this.getMyRequests = function () {
        var deferred = $q.defer();

        Resources.refresh("vacations/requests", {}).then(function (result) {
            deferred.resolve(result);
        });
        return deferred.promise;
    };


    this.getOtherRequestsThisPeriod = function(manager, request) {
        var deferred = $q.defer();
        var params = {
            t: (new Date()).getMilliseconds()
        };
        params.manager = manager.about;
        params.startDate = request.startDate;
        params.endDate = request.endDate;
        params.fields = ["_id", "description", "startDate", "endDate", "person", "status", "type", "resource"];
        Resources.get("vacations/bytypes/getRequests", params).then(function(result) {
            deferred.resolve(result.members);
        });
        return deferred.promise;
    };

    this.getDays = function(start, end) {
        if (!start || !end) {
            return "";
        }
        var actualDays = this.getActualDays(start, end);

        var days = "days";

        if (actualDays == 1) {
            days = "day";

            var diff = moment(end).diff(start, 'hours');
            if (diff < 8) {
                days = "hours";

                if (diff == 4) {
                    return "0.5 day"
                }
                if (diff <= 1) {
                    days = "hour";
                }

                actualDays = diff;
            }
        }

        return actualDays + " " + days;
    };

    this.getActualDays = function(startDate, endDate) {
        var start = moment(startDate);
        var end = moment(endDate);
        var allDays = end.diff(start, 'days');
        var actualDays = 0;

        for (var d = 0; d <= allDays; d++) {
            if (d != 0) {
                start.add('days', 1);
            }

            if (start.day() != 0 && start.day() != 6) {
                actualDays++;
            }
        }

        return actualDays;
    };

    this.getTypeText = function(type) {
        if (type == this.VACATION_TYPES.Appointment) {
            return this.VACATION_TYPES.Appointment;
        }
        if (type == this.VACATION_TYPES.Vacation) {
            return this.VACATION_TYPES.Vacation;
        }
        if (type == this.VACATION_TYPES.Travel) {
            return "Travel";
        }
        if (type == this.VACATION_TYPES.Training) {
            return "Conf./Training";
        }
    };

    this.getStatusText = function(status) {
        if (status == this.STATUS.Pending) {
            return "PENDING";
        }
        if (status == this.STATUS.Approved) {
            return "APPROVED";
        }
        if (status == this.STATUS.Denied) {
            return "DENIED";
        }
        if (status == this.STATUS.Cancelled) {
            return "CANCELLED";
        }
    };

    this.getTaskForVacation = function(type) {
        var deferred = $q.defer();
        //var taskName = (type == this.VACATION_TYPES.Appointment) ? "Appointment" : "Vacation";

        //Resources.get( "tasks/byname/" + taskName, {
        var substr = type = type.replace('/', '|');
        substr = substr.replace(/\s+/g, '|');

        Resources.get("tasks/bysubstr/" + substr, {
            t: (new Date()).getMilliseconds()
        }).then(function(result) {
            if (result.count == 0) {
                var taskQuery = {
                    name: type
                };

                Resources.create('tasks', taskQuery).then(function(createdTask) {
                    //this.getTaskForVacation(type).then(function(res) {
                    deferred.resolve({
                        _id: createdTask._id,
                        name: createdTask.name,
                        rev: createdTask.rev,
                        route: createdTask.route
                    });
                    //});
                });

                deferred.resolve(null);
            } else {
                deferred.resolve(result.members[0]);
            }
        });
        return deferred.promise;
    };

    this.getHoursLost = function(vacation, startDate, endDate) {
        var start = moment(vacation.startDate);
        var end = moment(vacation.endDate);

        if (endDate && vacation.endDate > endDate)
            end = moment(endDate);
        if (startDate && vacation.startDate < startDate)
            start = moment(startDate);

        var actualDays = this.getActualDays(start, end);

        if (actualDays == 1) {
            var hours = end.diff(start, 'hours');

            var oneDayHours = 0;
            if (hours <= 8) {
                oneDayHours = hours;
            } else {
                oneDayHours = 8;
            }

            return oneDayHours;
        } else {
            var allDays = end.diff(start, 'days');
            actualDays = 0;
            var totalHours = 0;
            for (var d = 0; d <= allDays; d++) {
                if (d != 0) {
                    start.add('days', 1);
                }

                if (start.day() != 0 && start.day() != 6) {
                    totalHours += 8;
                }
            }

            return totalHours;
        }
    };

    this.commitHours = function(request, updateHoursNotification) {
        var $this = this;
        this.getTaskForVacation(request.type).then(function(task) {
            var start = moment(request.startDate);
            var end = moment(request.endDate);
            var actualDays = $this.getActualDays(request.startDate, request.endDate);

            // hours add for 1 day
            if (actualDays == 1) {
                var hours = end.diff(start, 'hours');

                var oneDayHours = 0;
                if (hours <= 8) {
                    oneDayHours = hours;
                } else {
                    oneDayHours = 8;
                }

                var hoursEntry = {
                    date: moment(request.startDate).format("YYYY-MM-DD"),
                    person: request.person,
                    description: task.name + ": " + request.description,
                    hours: oneDayHours,
                    task: { resource: task.resource, name: task.name }
                };

                HoursService.updateHours([hoursEntry]).then(updateHoursNotification);
                // hours add for many days
            } else {
                var allDays = end.diff(start, 'days');
                actualDays = 0;
                var hoursEntries = [];
                for (var d = 0; d <= allDays; d++) {
                    if (d != 0) {
                        start.add('days', 1);
                    }

                    if (start.day() != 0 && start.day() != 6) {
                        var hoursEntry = {
                            date: start.format("YYYY-MM-DD"),
                            person: request.person,
                            description: task.name + ": " + request.description,
                            hours: 8,
                            task: { resource: task.resource, name: task.name }
                        };

                        hoursEntries.push(hoursEntry);
                    }
                }

                HoursService.updateHours(hoursEntries).then(updateHoursNotification);
            }
        });
    };

    this.checkForConflictDates = function(startDate, endDate, startTime, endTime, editedVacation, vacations) {
        var errors = [];
        var vacStartDate = moment(startDate + " " + startTime);
        var vacEndDate = moment(endDate + " " + endTime);

        if (vacEndDate <= vacStartDate) {
            errors.push('End date is less or equal to start date.');
        }

        if (this.getActualDays(startDate, endDate) == 0) {
            errors.push("Selected period does not contain working days.");
        }

        for (var i = 0; i < vacations.length; i++) {
            var vacation = vacations[i];

            var start = moment(vacation.startDate);
            var end = moment(vacation.endDate);

            if (!editedVacation || editedVacation._id != vacation._id) {
                /*
               *          ----------start----------end----------
               *  
               * -----vacStartDate-----start-----vacEndDate-----end---------- (1)
               * ----------start---vacStartDate----vacEndDate---end---------- (2)
               * ----------start-----vacStartDate-----end-----vacEndDate----- (3)
               * */
                if ( /* (1) */ (vacStartDate <= start && vacEndDate >= start) ||
                    /* (2) */ (vacStartDate >= start && vacStartDate <= end && vacEndDate >= start && vacEndDate <= end) ||
                    /* (3) */ (vacStartDate <= end && vacEndDate >= end)) {
                    if (vacation.startDate == vacation.endDate) {
                        errors.push("Confict with vacation: [ " + start.format("MMM D") + " ]");
                    } else {
                        errors.push("Confict with vacation: [ " + start.format("MMM D") + " - " + end.format("MMM D") + " ]");
                    }


                    break;
                }
            }
        }

        return errors;
    };

    this.isApproved = function(vacation) {
        if ((vacation.type == this.VACATION_TYPES.Appointment && moment(vacation.endDate).diff(vacation.startDate, 'hours') <= 4)
            || vacation.type == this.VACATION_TYPES.Travel || (moment().isAfter(vacation.startDate) && moment().isAfter(vacation.endDate)))
            return true;
        else
            return false;
    };

} ] );