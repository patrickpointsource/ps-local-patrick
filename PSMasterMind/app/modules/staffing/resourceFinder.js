'use strict';

angular.module( 'Mastermind' ).controller( 'ResourceFinderCtrl', [ '$scope', '$state', '$location', '$filter', '$q', 'Resources', 'People', 'ProjectsService',
function( $scope, $state, $location, $filter, $q, Resources, People, ProjectsService ) {
	
	var HOURS_PER_WEEK = CONSTS.HOURS_PER_WEEK;
	var parent_fillPeopleProps = $scope.$parent.fillPeopleProps;
	
	$scope.$parent.fillPeopleProps = function( ) {
		for( var i = 0; i < $scope.$parent.people.length; i++ )
			$scope.people[ i ].availabilityDate = $scope.availabilityDates
				? ( $scope.availabilityDates[ $scope.people[ i ].resource ] ? formatDate($scope.availabilityDates[ $scope.people[ i ].resource ]) : '-' )
				: '-';
		
		parent_fillPeopleProps();
	};
	
	function formatDate(date)
	{
		return date ? date.getFullYear() + "-" + formatDayOrMonth(date.getMonth() + 1) + "-" + formatDayOrMonth(date.getDate()) : "";
	}
	
	function formatDayOrMonth(value)
	{
		return value < 10 ? "0" + value : value;
	}
	
	function getWorkingWeekInRange(startDate, endDate)
	{
		var days = 0;
    
	    for (var currentDate = new Date(startDate.valueOf()); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1))
	    {  
	        var day = currentDate.getDay();
	        
	        if (day != 0 && day != 6)
	        	days++;
	    }
	    
	    return days / 5; // Working week is 5 days.
	}
	
//	function truncateOverheads(assignments, startDate, endDate)
//	{
//		var assignments = assignments.sort(function(a1, a2)
//		{
//			var d1 = new Date(Date.parse(a1.startDate));
//			var d2 = new Date(Date.parse(a2.startDate));
//			
//			a1.sDate = d1;
//			a2.sDate = d2;
//			a1.eDate = a1.eDate || new Date(Date.parse(a1.endDate));
//			a2.eDate = a2.eDate || new Date(Date.parse(a2.endDate));
//			
//			if (a1 < a2)
//				return -1;
//			
//			if (a1 > a2)
//				return 1;
//			
//			return 0;
//		});
//		
//		for (var i = 0, count = assignments.length; i < count; i++)
//		{
//			var assignment = assignments[i];
//			var t = 0;
//			
//			while (t < 45)
//			{
//				t += assignment.hoursPerWeek;
//				
//				for (var a1 = assignment, a2 = assignments[i + 1]; a2 && a2.sDate < a1.eDate && t < 45; a1 = a2; i++)
//					t += assignments[i + 1].hoursPerWeek;
//			}
//		}
//	}
	
	function getAvailabilityDate(assignments, startDate, endDate)
	{
		if (!assignments || assignments.length == 0)
			return null;
		
		var HOURS_PER_WEEK = CONSTS.HOURS_PER_WEEK;
		var assignments2 = assignments.slice();
		var date = new Date(startDate.valueOf());
		var index = -1;
		var minDate;
		var totalHoursPerWeek = HOURS_PER_WEEK;
		
		while (totalHoursPerWeek >= HOURS_PER_WEEK)
		{
			totalHoursPerWeek = 0;
			
			if (index != -1)
			{
				// Removes the assignment that ends first.
				assignments2.splice(index, 1);
				
				// Stores the date of the last-deleted assignment, to return it
				// if the remaining assignments hours are less than the maximum defined working hours per week.
				date = new Date(minDate.valueOf());
			}
			
			minDate = null;
			
			for (var i = 0, count = assignments2.length; i < count; i++)
			{
				var assignment = assignments2[i];
				
//				if (new Date(Date.parse(assignment.startDate || "2094-08-31")) > endDate)
//					continue;
				
				var assignmentEndDate = new Date(Date.parse(assignment.endDate || "2024-01-01"));
				
				totalHoursPerWeek += assignment.hoursPerWeek;
				
				// Stores the index and end date of the first-ending assignment to remove it and loop again
				// if total assignment hours are greater or equal than the maximum defined working hours per week. 
				if (assignmentEndDate < minDate || !minDate)
				{
					minDate = assignmentEndDate;
					
					index = i;
				}
			}
		}
		
		return date;
	}
	
	$scope.$parent.buildTableView = function( ) {

		//Actual Table View Data
		if( $scope.$parent.showTableView ) {
//			var sDate = new Date(),
//				eDate = new Date(2014, 10, 1);
		    	
			People.getPeopleCurrentAssignments().then(function(activeAssignments)
			{
				//Sum the percentages for all of the active assignments
//				var activePercentages = {};
//				var availabilityDates = {};
//				
//				for (var person in activeAssignments)
//				{
//					//if (person == "people/52fa5fae5f445c2b8d3b147d"){
//					var actualWorkingHours = 0;
//					var assignments = activeAssignments[person];
//					var availabilityDate = null;
//					var workingHours = 0;
//					
//					var days = 0;
//				    
//				    for (var currentDate = new Date(sDate.valueOf()); currentDate <= eDate; currentDate.setDate(currentDate.getDate() + 1))
//				    {  
//				        var day = currentDate.getDay();
//				        
//				        if (day != 0 && day != 6)
//			        	{
//				        	days++;
//				        	
//				        	workingHours = 0;
//				        	
//				        	for (var i = 0, count = assignments.length; i < count; i++)
//							{
//								var assignment = assignments[i];
//								var assignmentEndDate = new Date(Date.parse(assignment.endDate || "2029-01-01")); // 2029 -- rising of skynet
//								
//								// Processing only those assignments which intersect the specified range.
//								if (assignmentEndDate >= currentDate)
//								{
//									workingHours += assignment.hoursPerWeek;
//									
//									if (workingHours >= HOURS_PER_WEEK)
//										break;
//								}
//							}
//				        	
//				        	if (!availabilityDate && workingHours < HOURS_PER_WEEK)
//				        		availabilityDate = new Date(currentDate.valueOf());
//				        	
//				        	actualWorkingHours += Math.min(workingHours, HOURS_PER_WEEK);
//			        	}
//				    }
//				    
////					for (var i = 0, count = assignments.length; i < count; i++)
////					{
////						var assignment = assignments[i];
////						var assignmentStartDate = new Date(Date.parse(assignment.startDate));
////						var assignmentEndDate = new Date(Date.parse(assignment.endDate));
////						
////						// Processing only those assignments which intersect the specified range.
////						if (assignmentEndDate >= sDate && assignmentStartDate <= eDate)
////						{
////							var minEndDate = assignmentEndDate < eDate ? assignmentEndDate : eDate;
////							var workingWeeks = getWorkingWeekInRange(availabilityDate, minEndDate);
////							
////							actualWorkingHours += assignment.hoursPerWeek * workingWeeks;
////						}
////					}
//					
//					availabilityDates[person] = availabilityDate;
//					activePercentages[person] = 100 - Math.round(actualWorkingHours / (days * HOURS_PER_WEEK) * 100);//}
//				}
//
//				$scope.$parent.availabilityDates = availabilityDates;
//				$scope.$parent.activePercentages = activePercentages;
				$scope.activeAssignments = activeAssignments;

				//Once we have the active people apply the default filter
				//Trigger initial filter change
				$scope.$parent.handlePeopleFilterChanged( );
			});
		}

		//Graph View Data
		else if( $scope.showGraphView ) {
			
		}
	};
	
	$scope.filterResources = function(startDate, endDate, availabilityPercentage)
	{
		return function (person)
			{
				if (person && $scope.activeAssignments && startDate && endDate)
				{
					var actualWorkingHours = 0;
					var assignments = $scope.activeAssignments[person.resource];
					var availabilityDate = null;
					var workingHours = 0;
					var days = 0;
					startDate = new Date(Date.parse(startDate));
					endDate = new Date(Date.parse(endDate));
					
					if (assignments == null)
					{
						person.availabilityDate = formatDate(startDate);
					    person.activePercentage = 100;
						
						return true;
					}
						
				    for (var currentDate = new Date(startDate.valueOf()); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1))
				    {  
				        var day = currentDate.getDay();
				        
				        if (day != 0 && day != 6)
			        	{
				        	days++;
				        	
				        	workingHours = 0;
				        	
				        	for (var i = 0, count = assignments.length; i < count; i++)
							{
								var assignment = assignments[i];
								var assignmentEndDate = new Date(Date.parse(assignment.endDate || "2029-01-01")); // 2029 -- rising of skynet
								
								// Processing only those assignments which intersect the specified range.
								if (assignmentEndDate >= currentDate)
								{
									workingHours += assignment.hoursPerWeek;
									
									if (workingHours >= HOURS_PER_WEEK)
										break;
								}
							}
				        	
				        	if (!availabilityDate && workingHours < HOURS_PER_WEEK)
				        		availabilityDate = new Date(currentDate.valueOf());
				        	
				        	actualWorkingHours += Math.min(workingHours, HOURS_PER_WEEK);
			        	}
				    }
				    
				    person.availabilityDate = formatDate(availabilityDate);
				    
				    person.activePercentage = 100 - Math.round(actualWorkingHours / (days * HOURS_PER_WEEK) * 100);
				    
				    return person.activePercentage > (availabilityPercentage || 0);
				}
				else
					return false;
			};
	};
} ] );
