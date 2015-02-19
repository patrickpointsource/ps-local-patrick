'use strict';

/*
 * Controller for ooo widget
 */

angular.module('Mastermind').controller('OOOCtrl', [
    '$scope', '$state', '$filter', '$q', 'VacationsService',
    'Resources', 'ngTableParams', 'VacationsService', 
    function($scope, $state, $filter, $q, VacationsService, Resources, TableParams) {

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
        };

        $scope.editableVacation = null;
        $scope.newVacationCreation = false;
        
        $scope.requestNewVacation = function() {
            $scope.newVacationCreation = true;
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
    }
]);