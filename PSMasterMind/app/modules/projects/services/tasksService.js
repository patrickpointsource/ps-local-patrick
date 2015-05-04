'use strict';

angular.module('Mastermind')
    .service('TasksService', ['$q', 'Resources', function ($q, Resources) {


        /**
         * Validate an assignments collection for specified role.
         *
         * @param project
         * @param assignments
         */
        this.validateTasks = function (tasks) {
            var errors = [];


            for (var i = 0; i < tasks.length; i++) {
                if (!(tasks[i].person && tasks[i].person.resource))
                    anyResourceUnassigned = true;

                if (!tasks[i].hoursPerWeek)
                    anyHoursPerWeekMissed = true;

                if (!tasks[i].hoursPerWeek || !(tasks[i].person && tasks[i].person.resource))
                    countEmptyPersons++;
            }

            // allow one entry assignment to keep role unassigned
            if (anyResourceUnassigned && (countEmptyPersons >= 1 && assignments.length > 1)) {
                errors.push('For each assignee entry can\'t be empty');
            } else if (anyHoursPerWeekMissed && !anyResourceUnassigned) {
                errors.push('For each assignee entry hours per week is required');
            }


            return errors;
        };

        /**
         * Get today for queries
         */
        this.getToday = function () {
            //Get todays date formatted as yyyy-MM-dd
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            today = yyyy + '-' + mm + '-' + dd;

            return today;
        };

        /**
         * Get today for js objects
         */
        this.getTodayDate = function () {
            //Get todays date formatted as yyyy-MM-dd
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth(); //January is 0!
            var yyyy = today.getFullYear();


            return new Date(yyyy, mm, dd);
        };

        /**
         * Refresh the task list
         *
         * project records that include the about or resource properties set
         */
        this.refreshTasks = function () {
            var deferred = $q.defer();

            Resources.refresh('tasks').then(function (result) {

                deferred.resolve(result.members);
            });

            return deferred.promise;
        };


    }]);
