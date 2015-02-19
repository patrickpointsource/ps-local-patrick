'use strict';

/*
 * Controller for calendar area
 */
angular.module('Mastermind').controller('CalendarCtrl', [
    '$scope', '$state', '$filter', '$q', 'VacationsService',
    'Resources', 'ngTableParams', 'VacationsService', 
    function($scope, $state, $filter, $q, VacationsService, Resources, TableParams) {

        $scope.startDate = 'January 1';
        $scope.endDate = "31";
        $scope.months = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        $scope.displayedMonthDays = [];

        $scope.moment = window.moment ? window.moment : moment;
        /**
     * Go back
     */
        $scope.backMonth = function() {

        };

        /**
     * Go back
     */
        $scope.backMonth = function() {

        };

        $scope.initCalendar = function() {
            $scope.displayedMonthDays = [];
            $scope.currentMonth = $scope.moment().month();

            var moment = $scope.moment($scope.currentMonth);

            var startOfMonth = moment.startOf('month');
            var starOfFirstWeek = startOfMonth.startOf('week');

            var current;
            var day = 0;

            while (day < 35) {
                current = $scope.moment(starOfFirstWeek).add(day, 'days');
                day += 1;

                $scope.displayedMonthDays.push(current.format('YYYY-MM-DD'));
            }

            $scope.hideCalendarSpinner = true;
        };

        $scope.initCalendar();

        $scope.initOOO = function() {
            Resources.refresh("vacations/my").then(function(result) {
                if (result) {
                    $scope.oooPeriods = result.periods;
                    $scope.oooDaysLeft = result.daysLeft;
                }
            });
        };

        $scope.initOOO();

        $scope.editableVacation = null;
        $scope.collapsedPeriodIndex = 0;

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
            _.each(period.vacations, function(vacation) {
                hours += VacationsService.getHoursLost(vacation);
            });
            
            return (hours / 8).toFixed(1);
        }
    }
]);