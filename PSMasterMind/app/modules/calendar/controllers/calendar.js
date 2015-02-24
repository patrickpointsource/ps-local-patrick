'use strict';

/*
 * Controller for calendar area
 */

angular.module('Mastermind').controller('CalendarCtrl', [
    '$scope', '$state', '$filter', '$q', 'VacationsService', 'People', 'Resources',
    function($scope, $state, $filter, $q, VacationsService, People, Resources) {
        $scope.startDate = '';
    	$scope.endDate = "";
    	$scope.months = [ 'Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    	$scope.weekDayLables = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    	$scope.displayedMonthDays = [];

        $scope.moment = window.moment ? window.moment: moment;
        $scope.currentMonth = $scope.moment();
        
        $scope.currentVacations = [];
        
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
        	$scope.hideCalendarSpinner = false;
        	
        	 $scope.displayedMonthDays = [ ];
	        	
	        	
    		var moment = $scope.moment( $scope.currentMonth );

    		var startOfMonth = moment.startOf( 'month' );
    		var starOfFirstWeek = startOfMonth.startOf( 'week' );

    		$scope.startDate = $scope.moment( $scope.currentMonth ).startOf( 'month' );
    		$scope.endDate = $scope.moment( $scope.currentMonth ).endOf( 'month' );
	    	
    		function getRandom(max) {
    			var result = Math.random();
    			
    			return Math.round(result * max);
			}
    		
    		var colors = ['#A4D49C', '#EA959D', '#9FCFEF', '#BD8C8F', '#E8EC99'];
    		
    		var currentVacations;
    		
	        Resources.refresh("vacations/all", {
	   			 startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
	   			 endDate: $scope.endDate.format( 'YYYY-MM-DD' )
	   		 }).then(function(result) {
	   			 	$scope.hideCalendarSpinner = true;
	   			 	
	   			 	
		            if (result && result.members) {
		           	
		           	 
		            	currentVacations = result.members;
		            	
		            	for (var k = 0; k < currentVacations.length; k++)
		            		currentVacations[k].background = colors[getRandom(colors.length - 1)];
		            }
		            
		           
		    		
		    		var current;
		    		var day = 0;
		    		var currentDay;
		    		var currentDate;
		    		
		    		while( day < 35 ) {
		    			current = $scope.moment( starOfFirstWeek ).add( day, 'days' );
		    			day += 1;
		    			
		    			currentDate = current.format( 'YYYY-MM-DD' );
		    			
		    			currentDay = {
		    				date: currentDate,
		    				dayOfMonth: current.format( 'D' ),
		    				vacations: [],
		    				startOnDateVacations: []
		    			};
		    			
		    			var tmpStart;
		    			var tmpEnd;
		    			
		    			currentDay.vacations = _.filter(currentVacations, function(v) {
		    				var res = false;
		    				
		    				tmpStart = v.startDate.split(/\s+/gi)[0];
		    				tmpEnd = v.startDate.split(/\s+/gi)[0];
		    				
		    				if (currentDate >= tmpStart && currentDate <= tmpEnd)
		    					res = true;
		    				
		    				if (currentDate == tmpStart)
		    					currentDay.startOnDateVacations.push(v);
		    				
		    				return res;
		    			});
		    			
		    			$scope.displayedMonthDays.push(currentDay );
		    		}
	                	
	        }).then(function() {
	        	currentVacations;
	        	
	        	People.getActivePeople().then(function(result) {
	        		var tmpPerson;
	        		
	 	        	for (var k = 0; k < currentVacations.length; k ++) {
	 	        		tmpPerson = _.find(result.members, function(p) {
	 	        			return p.resource == currentVacations[k].person.resource;
	 	        			
	 	        		});
	 	        		
	 	        		if (tmpPerson)
	 	        			currentVacations[k].person.name = Util.getPersonName(tmpPerson);
	 	        	}
	 	        		
	 	        });
	        });
	        
	       
        	
        	
        	
        	
        	
    		
    		 
    		 
    		
        };
        
        //if (!$scope.initialized) {
        	$scope.initCalendar();
        	$scope.initialized = true;
        //}
    }
]);

	
	

