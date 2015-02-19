'use strict';

/*
 * Controller for calendar area
 */

angular.module('Mastermind').controller('CalendarCtrl', [
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
        }
        
        $scope.startDate = '';
    	$scope.endDate = "";
    	$scope.months = [ 'Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    	$scope.weekDayLables = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    	$scope.displayedMonthDays = [];

        $scope.moment = window.moment ? window.moment: moment;
        $scope.currentMonth = $scope.moment();
        $scope.editableVacation = null;
        $scope.newVacationCreation = false;
        
        $scope.requestNewVacation = function() {
            $scope.newVacationCreation = true;
        }
        
        $scope.editManager = false;
        
        $scope.editManagerCallback = function() {
            $scope.editManager = true;
            setTimeout(function() { 
                $(".select-vacation-manager").selectpicker();
            }, 5);
        }
        
        $scope.managerSelected = function() {
            $scope.vacationManager = this.vacationManager;
            $scope.editManager = false;
        }
        /**
         * Go back
         */
        $scope.backMonth = function(){
        	$scope.currentMonth = $scope.moment( $scope.currentMonth ).subtract( 1, 'month' );
        	$scope.initCalendar();
        };
        
        /**
         * Go next month
         */
        $scope.nextMonth = function(){
        	$scope.currentMonth = $scope.moment( $scope.currentMonth ).add( 1, 'month' );

    		$scope.initCalendar();
        };
        
        $scope.initCalendar = function() {
        	$scope.displayedMonthDays = [ ];
        	
        	
    		var moment = $scope.moment( $scope.currentMonth );

    		var startOfMonth = moment.startOf( 'month' );
    		var starOfFirstWeek = startOfMonth.startOf( 'week' );

    		$scope.startDate = $scope.moment( $scope.currentMonth ).startOf( 'month' );
    		
    		$scope.endDate = $scope.moment( $scope.currentMonth ).endOf( 'month' );
    		
    		var current;
    		var day = 0;

    		while( day < 35 ) {
    			current = $scope.moment( starOfFirstWeek ).add( day, 'days' );
    			day += 1;

    			$scope.displayedMonthDays.push( {
    				date: current.format( 'YYYY-MM-DD' ),
    				dayOfMonth: current.format( 'D' )
    			} );
    		}
    		
    		$scope.hideCalendarSpinner = true;
        };
        
        $scope.initCalendar();
    }
]);

	
	

