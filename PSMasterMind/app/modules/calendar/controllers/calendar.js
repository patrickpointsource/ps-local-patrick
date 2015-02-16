'use strict';

/*
 * Controller for calendar area
 */
angular.module('Mastermind').controller('CalendarCtrl', ['$scope', '$state','$filter', '$q', 
                                                      'Resources','ngTableParams',
  function ($scope, $state, $filter, $q, Resources, TableParams) {
	
	$scope.startDate = 'January 1';
	$scope.endDate = "31";
	$scope.months = [ 'Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    $scope.displayedMonthDays = [];

    $scope.moment = window.moment ? window.moment: moment;
    /**
     * Go back
     */
    $scope.backMonth = function(){
      
    };
    
    /**
     * Go back
     */
    $scope.backMonth = function(){
      
    };
    
    $scope.initCalendar = function() {
    	$scope.displayedMonthDays = [ ];
    	$scope.currentMonth = $scope.moment().month();
    	
		var moment = $scope.moment( $scope.currentMonth );

		var startOfMonth = moment.startOf( 'month' );
		var starOfFirstWeek = startOfMonth.startOf( 'week' );

		var current;
		var day = 0;

		while( day < 35 ) {
			current = $scope.moment( starOfFirstWeek ).add( day, 'days' );
			day += 1;

			$scope.displayedMonthDays.push( current.format( 'YYYY-MM-DD' ) );
		}
		
		$scope.hideCalendarSpinner = true;
    };
    
    $scope.initCalendar();
}]);