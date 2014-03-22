'use strict';

/**
 * The main project controller
 */
var mmModule = angular.module('Mastermind').controller('MainCtrl', ['$scope', '$q', '$state', '$filter', 'Resources','RolesService','ProjectsService','People','AssignmentService', 'ngTableParams',
    function ($scope, $q, $state, $filter, Resources, RolesService, ProjectsService, People, AssignmentService, TableParams) {

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

    /*
     * Fetch a list of all the active Projects.
     * 
     */
    var rolesPromise = RolesService.getRolesMapByResource();;
    ProjectsService.getOngoingProjects(function(result){
    	$scope.ongoingProjects = result.data;
 
    	ProjectsService.getMyCurrentProjects($scope.me).then(function(myCurrentProjects) {
        	var myProjects = myCurrentProjects.data;
        	for (var m=0; m< myProjects.length; m++) {
        		var myProj = myProjects[m];
        		var found = undefined;
        		$scope.hoursProjects.push(myProj);
        		
        		for (var n=0;n< $scope.ongoingProjects.length; n++) {
        			var proj = $scope.ongoingProjects[n];
        			if(proj.resource == myProj.resource) {
        				$scope.ongoingProjects.splice(n,1);
        				break;
        			}
        		}
        	}
        	
        	while($scope.ongoingProjects.length >0) {
        		$scope.hoursProjects.push($scope.ongoingProjects.pop());
        	}        	
        });
    });

    
    var aProjectsPromise = ProjectsService.getActiveClientProjects(function(result){
    	$scope.activeProjects = result;
    	//console.log("main.js activeProjects:", $scope.activeProjects);
        $scope.projectCount = result.count;
        
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
     * Find available people given the active projects
     */
    var findNineAvailablePeople = function () {
		  var peopleFilter = $scope.peopleFilter;
		  var fields = {resource:1,name:1,primaryRole:1,thumbnail:1};
		  People.getPeoplePerRole(peopleFilter, fields).then(function(peopleResult){
			  var people = peopleResult.members;
			  
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
		  });
    };
    
    /**
     * Handle a change to the role selector on the people view
     */
    $scope.handlePeopleFilterChanged = function(){
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
				    {y: 'otherValue', color: '#f34d4b', label: 'Available'}
				  ],
				  lineMode: 'linear',
				  tooltipMode: "default"
			};
    		$scope.data = result;
	    });
    }
    
    
}]);

