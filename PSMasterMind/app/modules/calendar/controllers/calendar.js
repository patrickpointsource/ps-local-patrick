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
    	$scope.hidePendingVacations = false;
    	
    	$scope.filterVacationsBy = [{
    		label: 'All employees',
    		value: 'all'
    	}];
    	
    	$scope.filterVacationsByCurrent = 'all';
    	
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
        
        $scope.getVacationPeriod = function(vac) {
        	//return 'test'
        	if ($scope.moment(vac.startDate).date() != $scope.moment(vac.endDate).date())
        		return ($scope.moment(vac.startDate).format('MMM D') + '-' + $scope.moment(vac.endDate).format('MMM D'));
        	
        	return $scope.moment(vac.startDate).format('MMM D');
        };
        
        $scope.onVacationClicked = function(e, vac, ind, vacIndex){
        	e = e ? e: window.event;
        	var entry = $(e.target).closest('.vacation-day-entry');
        	
        	//e.preventDefault();
        	e.stopPropagation();
        	
        	logger.log('onVacationClicked:' + ind + ':person.name=' + vac.person.name + ':' + $('.vacation-day-entry.entry_' + ind).size() + ':target.size=' + entry.size());
        	
        	var popover;
        	
        	if (!entry.data('popover')) {
        		var out = (vac.startDate.split(/\s+/g)[0] != vac.endDate.split(/\s+/g)[0]) ? ($scope.moment(vac.startDate).format('M/D') + '-' + $scope.moment(vac.endDate).format('M/D')): $scope.moment(vac.startDate).format('M/D');
	        	
        		popover = entry.popover({
	        		content: '<div class="vacation-entry-popup"><div class="name"><a href="index.html#/' + vac.person.resource + '">' + vac.person.name + '</a></div><div><b>Out:</b> ' + out + '</div><div><b>Category:</b> ' + vac.type + '</div>' + '<div>',
	        		html: true,
	        		placement: 'auto left',
	        		container: '.vacation-day-entry.entry_' + ind + '_' + vacIndex
	        	});
	        	
	        	entry.data('popover', popover);
	        	entry.popover('show');
	        	
	        	entry.on('hidden.bs.popover', _.bind(function () {
	        		this.context.popover('destroy');
	        		this.context.data('popover', false);
        		}, {context: entry}));
        	} else
        		entry.popover('toogle');
        	/*
        	if (!entry.data('popover_shown')) {
        		entry.popover('show');
        		entry.data('popover_shown', true);
        	} else {
        		entry.popover('hide');
        		entry.data('popover_shown', false);
        	}*/
        		
        };
        
        $scope.onVacationHide  = function(e, vac, ind, vacIndex){
        	e = e ? e: window.event;
        	var entry = $(e.target).closest('.vacation-day-entry');
        	
        	//e.preventDefault();
        	e.stopPropagation();
        	
        	logger.log('onVacationHide:' + ind + ':person.name=' + vac.person.name + ':' + $('.vacation-day-entry.entry_' + ind).size() + ':target.size=' + entry.size());
        	
        	var popover;
        	
        	if (entry.data('popover')) {
        		/*var out = (vac.startDate.split(/\s+/g)[0] != vac.endDate.split(/\s+/g)[0]) ? ($scope.moment(vac.startDate).format('M/D') + '-' + $scope.moment(vac.endDate).format('M/D')): $scope.moment(vac.startDate).format('M/D');
	        	
        		popover = entry.popover({
	        		content: '<div class="vacation-entry-popup"><div class="name"><a href="index.html#/' + vac.person.resource + '">' + vac.person.name + '</a></div><div><b>Out:</b> ' + out + '</div><div><b>Category:</b> ' + vac.type + '</div>' + '<div>',
	        		html: true,
	        		placement: 'auto left',
	        		container: '.vacation-day-entry.entry_' + ind + '_' + vacIndex
	        	});
	        	
	        	entry.data('popover', popover);
	        	entry.popover('show');
	        	
	        	entry.on('hidden.bs.popover', _.bind(function () {
	        		this.context.popover('destroy');
	        		this.context.data('popover', false);
        		}, {context: entry}));*/
        		entry.popover('hide');
        	} /*else
        		entry.popover('toogle');*/
        	/*
        	if (!entry.data('popover_shown')) {
        		entry.popover('show');
        		entry.data('popover_shown', true);
        	} else {
        		entry.popover('hide');
        		entry.data('popover_shown', false);
        	}*/
        		
        };
        
        $scope.onShowMoreClicked = function(e, vacations, ind, vacInd) {
        	e = e ? e: window.event;
        	var entry = $(e.target).closest('.vacation-day-entry');
        	
        	//e.preventDefault();
        	e.stopPropagation();
        	
        	logger.log('onShowMoreClicked:' + ind + ':target.size=' + entry.size());
        	
        	var popover;
        	
        	if (!entry.data('popover')) {
        		var out;
        		var html = '<div class="vacation-entry-popup"><div class="vacation-popup-body">';
        		var vac;
        		
        		for (var k = 0; k < vacations.length; k ++) {
        			vac = vacations[k];
        			
        			if (vac.startDate.split(/\s+/g)[0] != vac.endDate.split(/\s+/g)[0])
        				out = $scope.moment(vac.startDate).format('M/D') + '-' + $scope.moment(vac.endDate).format('M/D');
        			else
        				out = $scope.moment(vac.startDate).format('M/D');
        			
        			html += '<div class="vacation-person-name"><a href="index.html#/' + vac.person.resource + '">' + vac.person.name + '</a></div><div><b>Out:</b> ' + out + '</div><div class="vacation-person-type"><b>Type:</b> ' + vac.type + '</div>';
        		}
        			
        		html += '</div></div>';
        		
	        	popover = entry.popover({
	        		content: html,
	        		title: 'Out of Office',
	        		html: true,
	        		placement: 'auto left',
	        		container: '.vacation-day-entry.entry_' + ind + '_' + vacInd
	        	});
	        	
	        	entry.data('popover', popover);
	        	entry.popover('show');
	        	
	        	entry.on('hidden.bs.popover', _.bind(function () {
	        		this.context.popover('destroy');
	        		this.context.data('popover', false);
        		}, {context: entry}));
        	}else
        		entry.popover('toogle');
        };
        
        $scope.getRandomBackground = function() {
        	var colors = ['#A4D49C', '#EA959D', '#9FCFEF', '#BD8C8F', '#E8EC99', '#F69679'];
        	
        	function getRandom(max) {
    			var result = Math.random();
    			
    			return Math.round(result * max);
			}
        	
        	return colors[getRandom(colors.length - 1)];
        };
        
        $scope.showHidePending = function() {
        	if ($scope.hidePendingVacations)
        		 $scope.initCalendar('Approved');
    		 else
    			 $scope.initCalendar();
        };
        
        $scope.initCalendar = function(status) {
        	$scope.hideCalendarSpinner = false;
        	
        	 $scope.displayedMonthDays = [ ];
	        	
	        	
    		var moment = $scope.moment( $scope.currentMonth );

    		var startOfMonth = moment.startOf( 'month' );
    		var starOfFirstWeek = startOfMonth.startOf( 'week' );

    		$scope.startDate = $scope.moment( $scope.currentMonth ).startOf( 'month' );
    		$scope.endDate = $scope.moment( $scope.currentMonth ).endOf( 'month' );
	    
    		var currentVacations;
    		
	        Resources.refresh("vacations/all", {
	   			 startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
	   			 endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
	   			 status: status? status: ''
	   		 }).then(function(result) {
	   			 	$scope.hideCalendarSpinner = true;
	   			 	 	
		            if (result && result.members) {
		            	var c;
		            	
		            	currentVacations = result.members;
		            	
		            	var lightColors = randomColor({luminosity: 'light',count: currentVacations.length});
		            	var darkColors = randomColor({luminosity: 'dark',count: currentVacations.length});
		            	var dColor;
		            	
		            	for (var k = 0; k < currentVacations.length; k++) {
		            		if (currentVacations[k].status && currentVacations[k].status.toLowerCase() != 'pending')
		            			//currentVacations[k].background = $scope.getRandomBackground();
		            			currentVacations[k].background = lightColors[k];
		            		else {
		            			dColor = Util.darkColorFrom(lightColors[k], 0.4);
		            			
		            			currentVacations[k].background = 'repeating-linear-gradient( -45deg, ' + lightColors[k] + ', ' + lightColors[k] + 
		            				' 3px, ' + dColor + ' 3px, ' + dColor + ' 15px)';
		            		}
		            	}
		            		
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
		    				vacations: []
		    			};
		    			
		    			var tmpStart;
		    			var tmpEnd;
		    			
		    			currentDay.vacations = _.filter(currentVacations, function(v, ind) {
		    				var res = false;
		    				
		    				tmpStart = v.startDate.split(/\s+/gi)[0];
		    				tmpEnd = v.endDate.split(/\s+/gi)[0];
		    				
		    				if (currentDate >= tmpStart && currentDate <= tmpEnd)
		    					res = true;
		    				
		    				if (currentDate == tmpStart) {
		    					//currentDay.startOnDateVacations.push(v);
		    					v.startDateOfMultidays = currentDate;
		    					//v.order = ind;
		    				}
		    				
		    				return res;
		    			});
		    			/*
		    			if (currentDate == '2014-11-27') {
		    				//people/52ab7005e4b0fd2a8d130015
		    				var tmpVac = _.extend({}, currentDay.vacations[currentDay.vacations.length - 1]);
		    				
		    				tmpVac.person.resource = 'people/52ab7005e4b0fd2a8d130015';
		    				tmpVac.description = 'Test vacation';
		    				
		    				 currentDay.vacations.push(tmpVac);
		    				
		    			}
		    			*/
		    			for (var k = currentDay.vacations.length - 1; k >= 0; k --) {
		    				if (currentDate.indexOf(currentDay.vacations[k].startDateOfMultidays) > -1 )
		    					currentDay.vacations[k].order = k;
		    			}
		    			
		    			var tmpVac;
		    			
		    			for (var k = currentDay.vacations.length - 1; k >= 0; k --) {
		    				if (!isNaN(parseInt(currentDay.vacations[k].order)) && k != currentDay.vacations[k].order) {
		    					tmpVac = currentDay.vacations[ currentDay.vacations[k].order ];
		    					
		    					currentDay.vacations[ currentDay.vacations[k].order ] = currentDay.vacations[k];
		    					
		    					currentDay.vacations[k] = tmpVac;
		    				}
		    			}
		    			
		    			for (var k = currentDay.vacations.length - 1; k >= 0; k --) {
		    				if (!currentDay.vacations[k])
		    					currentDay.vacations[k] = {
		    						isEmpty: true
		    					};
		    			}
		    			
		    			if (currentDay.vacations.length > 4)
		    				currentDay.moreBackground = $scope.getRandomBackground();
		    			
		    			$scope.displayedMonthDays.push(currentDay );
		    		}
	                	
	        }).then(function() {
	        	currentVacations;
	        	
	        	People.getAllActivePeople().then(function(result) {
	        		var tmpPerson;
	        		
	 	        	for (var k = 0; k < currentVacations.length; k ++) {
	 	        		tmpPerson = _.find(result.members, function(p) {
	 	        			return p.resource == currentVacations[k].person.resource;
	 	        			
	 	        		});
	 	        		
	 	        		if (tmpPerson)
	 	        			currentVacations[k].person.name = Util.getPersonName(tmpPerson, true);
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

	
	

