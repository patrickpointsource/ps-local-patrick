'use strict';

/*
 * Controller for calendar area
 */

angular.module('Mastermind').controller('CalendarCtrl', [
    '$scope', '$state', '$filter', '$q', 'VacationsService',
    'Resources', 'ngTableParams', 'VacationsService', 
    function($scope, $state, $filter, $q, VacationsService, Resources, TableParams) {
        $scope.startDate = '';
    	$scope.endDate = "";
    	$scope.months = [ 'Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    	$scope.weekDayLables = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    	$scope.displayedMonthDays = [];

        $scope.moment = window.moment ? window.moment: moment;
        $scope.currentMonth = $scope.moment();
        
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

	
	

