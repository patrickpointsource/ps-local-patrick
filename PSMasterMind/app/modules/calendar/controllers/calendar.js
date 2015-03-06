'use strict';

/*
 * Controller for calendar area
 */

angular.module('Mastermind').controller('CalendarCtrl', [
    '$scope', '$state', '$filter', '$q', 'VacationsService', 'People', 'Resources', 'ProjectsService', 'AssignmentService', 'RolesService', 'People',
    function($scope, $state, $filter, $q, VacationsService, People, Resources, ProjectsService, AssignmentService, RolesService, PeopleService) {
        $scope.startDate = '';
    	$scope.endDate = "";
    	$scope.months = [ 'Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    	$scope.weekDayLables = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    	$scope.displayedMonthDays = [];
    	$scope.hidePendingVacations = false;
    	
    	$scope.managersList = [];
    	$scope.selectedManager = null;
    	
    	$scope.rolesList = [];
    	$scope.selectedRole = null;
    	
    	$scope.filterVacationsBy = [{
    		label: 'All employees',
    		value: 'all'
    	}, {
    		label: "Manager name",
    		value: 'manager_name'
    	}, {
    		label: "Project name",
    		value: 'project_name'
    	}, {
    		label: "Role name",
    		value: 'role_name'
    	}, {
    		label: "Direct Reports",
    		value: 'direct_reports'
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
        	
        	
        	if (!entry.data('bs.popover')) {
        		var out = (vac.startDate.split(/\s+/g)[0] != vac.endDate.split(/\s+/g)[0]) ? ($scope.moment(vac.startDate).format('M/D') + '-' + $scope.moment(vac.endDate).format('M/D')): $scope.moment(vac.startDate).format('M/D');
	        	var placement = ind % 7 == 6 ? 'auto top': 'auto left';

        		popover = entry.popover({
	        		content: '<div class="vacation-entry-popup"><div class="name"><a href="index.html#/' + vac.person.resource + '">' + vac.person.name + '</a></div><div><b>Out:</b> ' + out + '</div><div><b>Category:</b> ' + vac.type + '</div>' + '<div>',
	        		html: true,
	        		placement: placement,
	        		container: '.vacation-day-entry.entry_' + ind + '_' + vacIndex
	        	});
	        	
	        	entry.data('popover', popover);
	        	entry.popover('show');
	        	
	        	entry.on('hidden.bs.popover', _.bind(function () {
	        		this.context.popover('destroy');
	        		this.context.data('popover', false);
        		}, {context: entry}));
        	} else
        		entry.popover('show');
        };
        
        $scope.onVacationHide  = function(e, vac, ind, vacIndex){
        	e = e ? e: window.event;
        	var entry = $(e.target).closest('.vacation-day-entry');
        	
        	//e.preventDefault();
        	e.stopPropagation();
        	
        	logger.log('onVacationHide:' + ind + ':person.name=' + vac.person.name + ':' + $('.vacation-day-entry.entry_' + ind).size() + ':target.size=' + entry.size());
        	
        	var popover;
        	
        	if (entry.data('bs.popover')) {
        		entry.popover('hide');
        	}
        		
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
        
        $scope.filterVacationsByChanged = function(e) {
        	if ($scope.filterVacationsByCurrent == 'manager_name') {
        		
        		if ($scope.managersList.length == 0)
	        		Resources.refresh("people/bytypes/byGroups", { group: "Managers"}).then(
	        			function (result) {
	        				for( var i = 0; result &&  result.members && i < result.members.length; i++ ) {
	        		            var manager = result.members[ i ];
	        		           
	        		            $scope.managersList.push( {
	        		                label: Util.getPersonName(manager, true),
	        		                value: manager.resource
	        		            } );
	        		        }
	        			}
	        		);
        	} else if ($scope.filterVacationsByCurrent == 'project_name') {
        		if (!$scope.projectList || $scope.projectList.length == 0)
	        		ProjectsService.getAllProjects( function( result ) {
	        			$scope.projectList = result.data;
	        		} );
        	} else if ($scope.filterVacationsByCurrent == 'role_name') {
        		if (!$scope.roleList || $scope.roleList.length == 0)
	        		RolesService.getRolesMapByResource().then( function( result ) {
	        			var roleMap = result;
	        			
	        			$scope.rolesList = [];
	        			
	        			for (var roleResource in roleMap) {
	        				$scope.rolesList.push({
	        					value: roleResource,
	        					label: roleMap[roleResource].abbreviation
	        				});
	        			}
	        			
	        		} );
        	} else
        		$scope.initCalendar();
        };
        
        $scope.filterVacationsByManagerChanged = function(e, passedScope) {
        	$scope.selectedManager = passedScope.selectedManager;
        	$scope.initCalendar();
        };
        
        $scope.filterVacationsByRoleChanged = function(e, passedScope) {
        	$scope.selectedRole = passedScope.selectedRole;
        	$scope.initCalendar();
        };
        
        $scope.filterVacationsByProjectChanged = function(e, selected) {
        	$scope.selectedProject = selected;
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
	    
    		var currentVacations = [];
    		var loadPromise;
    		
    		if ($scope.filterVacationsByCurrent == 'manager_name' && $scope.selectedManager) {
    			var p = {
    					startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
   		   			 	endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
    					includeApproved: true,
    					showSubordinateManagerRequests: true
				};
    			
    			if (!$scope.hidePendingVacations)
					p.includePending = true;
    			
    			loadPromise = VacationsService.getRequests({about: $scope.selectedManager}, p);
    		} else if ($scope.filterVacationsByCurrent == 'project_name' && $scope.selectedProject) {
    			loadPromise = AssignmentService.getAssignmentsByPeriod('all', {project: {resource: $scope.selectedProject.resource}});
    			
    			loadPromise = loadPromise.then(function(result) {
    				 var assignments = result && result.members ? result.members: [];
    				 var persons = [];
    				 var start = $scope.startDate.format( 'YYYY-MM-DD' );
    				 var end = $scope.endDate.format( 'YYYY-MM-DD' );
    				 
    				 for (var k = 0; k < assignments.length; k ++) {
    					 if (!assignments[k].endDate && assignments[k].startDate <= end)
    						 persons.push(assignments[k].person.resource);
    					 else if (assignments[k].endDate && assignments[k].startDate <= end && assignments[k].endDate >= start)
    						 persons.push(assignments[k].person.resource);
    						 
    				 }
    				 
    				 return persons;
    				 
    			 });
    			
    			loadPromise = loadPromise.then(function(persons) {
    				if (persons.length > 0)
	    				return Resources.refresh("vacations/all", {
		   		   			 startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
		   		   			 endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
		   		   			 status: status? status: '',
		   		   			 persons: persons.join(',')
		   		   		 });
    			});
    		} else if ($scope.filterVacationsByCurrent == 'role_name' && $scope.selectedRole) {
    			loadPromise = PeopleService.getPeoplePerRole($scope.selectedRole);
    			
    			loadPromise = loadPromise.then(function(result) {
    				 var persons = result.members ? result.members: [];
    				 
    				 persons = _.map(persons, function(p){ return p.resource });
    				 
    				 return persons;
    				 
    			 });
    			
    			loadPromise = loadPromise.then(function(persons) {
    				if (persons.length > 0)
	    				return Resources.refresh("vacations/all", {
		   		   			 startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
		   		   			 endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
		   		   			 status: status? status: '',
		   		   			 persons: persons.join(',')
		   		   		 });
    			});
    		} else if ($scope.filterVacationsByCurrent == 'direct_reports' && $scope.me) {
    			var p = {
    					startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
   		   			 	endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
    					includeApproved: true,
    					showSubordinateManagerRequests: true
				};
    			
    			if (!$scope.hidePendingVacations)
					p.includePending = true;
    			
    			loadPromise = VacationsService.getRequests({about: $scope.me.about}, p);
    		} else
    			loadPromise = Resources.refresh("vacations/all", {
		   			 startDate: $scope.startDate.format( 'YYYY-MM-DD' ),
		   			 endDate: $scope.endDate.format( 'YYYY-MM-DD' ),
		   			 status: status? status: ''
		   		 });
	   		 
		   		 
	   		 loadPromise.then(function(result) {
	   			 	$scope.hideCalendarSpinner = true;
	   			 	 	
		            if (result && (result.members || _.isArray(result))) {
		            	
		            	currentVacations = _.isArray(result) ? result: result.members;

		            	var persons = _.map(currentVacations, function(v) { if (v && v.person) return v.person.resource})
		            	
		            	persons = _.uniq(persons);
		            	
		            	var lightColors = randomColor({luminosity: 'light',count: persons.length});
		            
		            	var t = 0;
		            	
		            	// go throug colors and remove similar, and then add newly generated
		            	while(t < 20) {
		            		var sim = 0;
		            		
		            		for (var k = lightColors.length - 1; k >= 0; k --) {
		            			for (var j = k - 1; j >= 0; j --) {
		            				sim = Util.getColorDistance(lightColors[k], lightColors[j]) / 256;
		            				
		            				if (sim < 0.2){
		            					lightColors.splice(k, 1);
		            					break;
		            				}
		            					
		            			}
		            		}
		            		
		            		if (lightColors.length < persons.length)
		            			lightColors = lightColors.concat(randomColor({luminosity: 'light',count: (persons.length - lightColors.length)}))
		            		t ++;
		            	};
		            	
		            	var colorsMap = {};
		            	
		            	for (var k = 0; k < persons.length; k++)
		            		colorsMap[ persons[k] ] = lightColors[k];

		            	var dColor;
		            	var c;
		            	
		            	for (var k = 0; k < currentVacations.length; k++) {
		            		c = colorsMap[ currentVacations[k].person.resource ];
		            		
		            		if (currentVacations[k].status && currentVacations[k].status.toLowerCase() != 'pending')
		            			//currentVacations[k].background = $scope.getRandomBackground();
		            			currentVacations[k].background = c;
		            		else {
		            			dColor = Util.darkColorFrom(c, 0.4);
		            			currentVacations[k].background = 'repeating-linear-gradient( -45deg, ' + dColor + ', ' + dColor + 
		            				' 3px, ' + c + ' 3px, ' + c + ' 15px)';
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

	
	

