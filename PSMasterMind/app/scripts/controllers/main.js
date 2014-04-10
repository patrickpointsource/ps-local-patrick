'use strict';

/**
 * The main project controller
 */
var mmModule = angular.module('Mastermind').controller('MainCtrl', ['$scope', '$q', '$state', '$filter', 'Resources','RolesService','ProjectsService','People','AssignmentService', 'ngTableParams',
    function ($scope, $q, $state, $filter, Resources, RolesService, ProjectsService, People, AssignmentService, TableParams) {
	
	/**Init Count vairables
     */
    $scope.activeCount = '';
	$scope.backlogCount = '';
	$scope.pipelineCount = '';
	$scope.investmentCount = '';
	
	// Table Parameters for Resource Deficit tables
    var params = {
      page: 1,            // show first page
      count: 100,           // count per page
      sorting: {
        startDate: 'asc'     // initial sorting
      }
    };
    
    $scope.summarySwitcher = 'projects';
    //$scope.projects = projects;
    $scope.startDate = new Date();
    $scope.ongoingProjects = [];
    $scope.hoursProjects = [];

    var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    /**
     * display the month name from a month number (0 - 11)
     */
    $scope.getMonthName = function(monthNum) {
      if (monthNum > 11) {
        monthNum = monthNum - 12;
      }
      return monthNamesShort[monthNum];
    };

    //Get todays date formatted as yyyy-MM-dd
    var dd = $scope.startDate.getDate();
    var mm = $scope.startDate.getMonth()+1; //January is 0!
    var yyyy = $scope.startDate.getFullYear();
    if (dd<10){
      dd='0'+dd;
    }
    if (mm<10){
      mm='0'+mm;
    }
       var rolesPromise = RolesService.getRolesMapByResource();
   
    /**
     * Set up the projects to be added to the hours entry drop down
     */
    ProjectsService.getOngoingProjects(function(result){
    	$scope.ongoingProjects = result.data;
 
    	ProjectsService.getMyCurrentProjects($scope.me).then(function(myCurrentProjects) {
    		$scope.myProjects = myCurrentProjects.data;
        	if($scope.myProjects.length>0){
  	          $scope.hasActiveProjects = true;
  	      	}
        	
        	var myProjects = [];
        	for (var m=0; m< $scope.myProjects.length; m++) {
        		var myProj = $scope.myProjects[m];
        		var found = undefined;
        		myProj.title = myProj.customerName+': '+myProj.name;
        		myProjects.push(myProj);
        		
        		//Check if you have an assignment to flag that you have an assignment on the project
        		//and not that you are an exec or sales sponsor
        		if(myProj && myProj.status && myProj.status.hasAssignment){
        			$scope.hasAssignment = true;
        		}
        		
        		for (var n=0;n< $scope.ongoingProjects.length; n++) {
        			var proj = $scope.ongoingProjects[n];
        			if(proj.resource == myProj.resource) {
        				$scope.ongoingProjects.splice(n,1);
        				break;
        			}
        		}
        	}
        	
        	myProjects.sort(function(item1,item2){
        		if ( item1.title < item2.title )
        		  return -1;
        		if ( item1.title > item2.title )
        			return 1;
        		return 0;
        	});
        	
        	var otherProjects = [];
        	while($scope.ongoingProjects.length >0) {
        		var myProj = $scope.ongoingProjects.pop();
        		myProj.title = myProj.customerName+': '+myProj.name;
        		otherProjects.push(myProj);
        	}   
        	
        	otherProjects.sort(function(item1,item2){
        		if ( item1.title < item2.title )
        		  return -1;
        		if ( item1.title > item2.title )
        			return 1;
        		return 0;
        	});
        	
        	$scope.hoursProjects = myProjects.concat(otherProjects);
        });
    });
    
    /**
     * Fetch a count of the number of staffing deficits
     */
    AssignmentService.getActiveProjectStaffingDeficits().then(function(assignments){
    	var count = assignments.length;
    	$scope.activeProjectDeficitCount = count;
    });  

    
    
    /**
     * Fetch the counts of the current projects
     */
    ProjectsService.getProjectCounts().then(function(counts){
	    	$scope.activeCount = counts.active;
			$scope.backlogCount = counts.backlog;
			$scope.pipelineCount = counts.pipeline;
			$scope.investmentCount = counts.investment;
    });
    
    var aProjectsPromise = ProjectsService.getActiveClientProjects(function(result){
    	$scope.activeProjects = result;
    	//console.log("main.js activeProjects:", $scope.activeProjects);
        
        
        /*
         * With the result, first find the list of active People for Widget 1.
         */
        findNineAvailablePeople();
        //console.log("main.js availablePeople:", $scope.availablePeople);
        
        /*
         * Next, with the list of active projects, find the resource deficit on these projects.
         * 
         */
        ProjectsService.getQickViewProjects().then(function(result){
        	$scope.qvProjects = result.data;
        	
        	/*
             * Next, run through the list of projects and set the active projects and people.
             * 
             */
            
            var activeProjects = $scope.qvProjects;
        });
    });


    
    /**
     * Return a persons name from an array of People objects.
     */
    var getPersonName = function(people, assignee) {
    	var peopleData = people.members;
    	for (var i=0; i<peopleData.length; i++) {
    		var person = peopleData[i];
    		if (person.resource == assignee) {
    			return person.name;
    		}
    	}  	
    }
    
    
    /**
     * Get the set of roles to display in the filter options drop down
     */
    /**
     * Get All the Role Types
     */
    Resources.get('roles').then(function(result){
	      var roleGroups = {};
	      //Save the list of role types in the scope
	      $scope.rolesFilterOptions = result.members;
	      //Get list of roles to query members
	      for(var i = 0; i < result.members.length;i++){
	        var role = result.members[i];
	        var resource = role.resource;
	        roleGroups[resource] = role;
	      }
	      $scope.roleGroups = roleGroups;
	
	      //Kick off fetch all the people
	     // $scope.buildTableView();
    });
    
    /**
     * Go to the people page filter by selected role
     */
    $scope.handleShowPeopleClick = function(){
    	 $state.go('people.index',{filter:$scope.peopleFilter});
    };

    /**
     * Randomize the people result
     */
    var randomizePeople = function(people){
    	if(people.length > 12){
		  	//Seed the randomness per day
		  	var today = new Date();
		  	var seed = Math.ceil((today.getDay()+1)*(today.getMonth()+1)*today.getFullYear());
		  	var randomResult = [];
		  	
			//Shuffle people
            for(var i = 0; i < 12; i++){
              var j = ((seed+i)%(people.length));
              randomResult[i] = people[j];
            }
            $scope.availablePeople =  randomResult;
	  }

	  else{
		  $scope.availablePeople = people;
	  }
    }
    
    /**
     * Find available people given the active projects
     */
    var findNineAvailablePeople = function() {
    	if($scope.peopleFilter){
		  var peopleFilter = $scope.peopleFilter;
		  var fields = {resource:1,name:1,primaryRole:1,thumbnail:1};
		  People.getPeoplePerRole(peopleFilter, fields).then(function(peopleResult){
			  var people = peopleResult.members;
			  randomizePeople(people);
		  });
    	}
    	else{
    		People.getMyPeople($scope.me).then(function(peopleResult){
  			  randomizePeople(peopleResult);
  		  });
    	}
    };
    
    /**
     * Handle a change to the role selector on the people view
     */
    $scope.handlePeopleFilterChanged = function(){
    	// Somehow peopleFilter goes to the separate scope.
    	$scope.peopleFilter = this.peopleFilter;
    	findNineAvailablePeople();
    };
     
    /**
     * Navigate to creating a project.
     */
    $scope.createProject = function () {
      $state.go('projects.new');
    };

    /**
     * Navigate to view a list of active projects.
     */
    $scope.showProjects = function () {
      $state.go('projects.index');
    };

    /**
     * Navigate to view a list of active projects.
     */
    $scope.showActiveProjects = function () {
      $state.go('projects.index',{filter:'active'});
    };

    /**
     * Navigate to view a list of people who can be assigned to projects.
     */
    $scope.showPeople = function () {
      $state.go('people.index');
    };

    /**
     * Navigate to view a list of people who can be assigned to projects.
     */
    $scope.showAvailablePeople = function () {
      $state.go('people.index', {filter:'available'});
    };

    /**
     * Calculates whether a role is active within a particular month.
     *
     * @param project
     * @param month
     * @param year
     */
    $scope.isPersonActiveInMonth = function (assignment, person, month, year) {
      var projectIsActive = $scope.inMonth(assignment.project, month, year);
      if (!projectIsActive){
        return false;
      }

      var nextMonth = month === 11 ? 0 : (month + 1),
	  nextYear = month === 11 ? (year + 1) : year,
	  startDay = new Date(year, month, 1),
	  endDay = new Date(nextYear, nextMonth, 0);
	
	  // If the assignment start day is before the last day of this month
	  // and its end date is after the first day of this month.
	  var assignmentStarted =   new Date(assignment.startDate) <= endDay;
	  var assignmentEnded = assignment.endDate &&  new Date(assignment.endDate) <= startDay;
	  var ret =  assignmentStarted && !assignmentEnded;

      return ret;
    };

    /**
     * Calculates whether the project exists within a particular month.
     *
     * @param project
     * @param month
     */
    $scope.inMonth = function (project, month, year) {
      var nextMonth = month === 11 ? 0 : (month + 1),
        nextYear = month === 11 ? (year + 1) : year,
        startDay = new Date(year, month, 1),
        endDay = new Date(nextYear, nextMonth, 0);

      // If the project start day is before the last day of this month
      // and its end date is after the first day of this month.
      var projectStarted =   new Date(project.startDate) <= endDay;
      var projectEnded = project.endDate &&  new Date(project.endDate) <= startDay;
      var returnValue =  projectStarted && !projectEnded;
      return returnValue;
    };

/**
 * Moving this to its own controller controllers/hours.js
 * /
 *
    $scope.newHoursRecord = {};

    /**
     * Add a new Hours Record to the server
     */
    $scope.addHours = function(){
      //Set the person context
      $scope.newHoursRecord.person = {resource:$scope.me.about};

      Resources.create('hours', $scope.newHoursRecord).then(function(){
        $scope.newHoursRecord = {};

        //Navigate over to the users profile
        window.location='#'+$scope.me.about;
      });
    };
    
    
    /**
     * Get the list of projects kicking off
     */
    ProjectsService.getProjectsKickingOff().then(function(result){
    	$scope.projectsKickingOff = result.data;
    });
    
    /**
     * returns true is string ends with a give suffix
     */
    var endsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };
    
    var parseDate = function(input) {
    	  var parts = input.split('-');
    	  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    	  return new Date(parts[0], parts[1]-1, parts[2]); // Note: months are 0-based
    	}
    
    
    /**
     * Returns true if active in the next month
     */
    $scope.startWithinAMonth = function (project) {
      var startDate = parseDate(project.startDate);
      
      var today = new Date();
      var oneMonthFromNow = moment(today).add('months', 1);

      var ret = startDate <= oneMonthFromNow;
      return ret;
    };
    
    /**
     * Converts a date to a display string
     */
    $scope.dateString = function(dateIn){
    	var date = parseDate(dateIn);
    	 //Get todays date formatted as yyyy-MM-dd
        var dd = date.getDate();
        var mm = date.getMonth(); 
        
        var month = $scope.getMonthName(mm);
        var day = dd;
        if(endsWith(String(dd), '1')){
        	day = dd+'st';
        }
        else if(endsWith(String(dd),'2')){
        	day = dd+'nd';
        }
        else if(endsWith(String(dd),'3')){
        	day = dd+'rd';
        }
        else{
        	day = dd+'th';
        }
        
        
        var ret = month + ' ' + day;
        return ret;
    };
    
    /**
     * Booking Forecast Data
     */
    ProjectsService.getActiveBacklogAndPipelineProjects(function(result){
    	var projects = result.data;
    	//console.log("main.js ongoingProjects:", $scope.ongoingProjects);
    	$scope.fbProjects = projects;
    	$scope.initBookingForecast();
    });
    
    $scope.bfShowPipeline = false;
    $scope.handleFBShowPipeline = function(checked){
    	$scope.bfShowPipeline = checked;
    	$scope.initBookingForecast();
    };
    
    
    $scope.initBookingForecast = function(){
    	var showPipeline = $scope.bfShowPipeline;
    	var projects = $scope.fbProjects;
    	ProjectsService.getBookingForecastData(projects, showPipeline).then(function(result){
	    	//If data did not exist set it
    		
    		$scope.options = {
				axes: {
				    x: {key: 'x', type: 'date', tooltipFormatter: function (d) {return moment(d).fromNow();}},
				    y: {type: 'linear'}
				  },
				  series: [
				    {y: 'value', color: '#4baa30', type: 'area', striped: true, label: 'Booked'},
				    {y: 'otherValue', color: '#f34d4b', label: 'Bookable People'}
				  ],
				  lineMode: 'linear',
				  tooltipMode: "default"
			};
    		$scope.data = result;
	    });
    };
    
    /**
     * Returns the text summary per project for the my projects section of the home page
     */
    $scope.getMyProjectSummaryLine = function(project){
    	var roles = [];
    	if(project.status.isExecutiveSponsor){
    		roles.push('EXEC');
    	}
    	
    	if(project.status.isSalesSponsor){
    		roles.push('SALES');
    	}
    	
    	var projectAssignments = project.status.assignments;
    	var totalHoursPerWeek = 0;
    	var now = moment();
    	for(var i = 0; i < projectAssignments.length;i++){
    		var projectAssignment = projectAssignments[i];
    		var role = projectAssignment.role;
    		if(role.type){
    			role = $scope.roleGroups[role.type.resource];
    			if(role && role.abbreviation && $.inArray(role.abbreviation, roles) == -1){
    				roles.push(role.abbreviation);
    			}
    		}
    		
    
    		if(projectAssignment && projectAssignment.hoursPerWeek){
    			var startDate = moment(projectAssignment.startDate);
        		var endDate = endDate?moment(projectAssignment.endDate):now.add('day', 1);
    			
        		if(now >= startDate && now <= endDate){
        			totalHoursPerWeek += projectAssignment.hoursPerWeek;
        		}
    		}
    	}
    	
    	if(totalHoursPerWeek > 0){
    		totalHoursPerWeek = ' @'+totalHoursPerWeek+'h/w ';
    	}else{
    		totalHoursPerWeek = '';
    	}
    	
    	//Get the total hours logged
    	var hoursLogged = '';
    	if(project.status.hoursLogged){
    		hoursLogged = ' - ' + project.status.hoursLogged + ' hrs logged';
    	}
    
    	var ret = "<span class=\"text-muted\">" + roles + totalHoursPerWeek + hoursLogged + "</span>";
    	return ret;
    }
    
}]);

