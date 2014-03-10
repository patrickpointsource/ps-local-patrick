'use strict';

/**
 * The main project controller
 */
var mmModule = angular.module('Mastermind').controller('MainCtrl', ['$scope', '$q', '$state', '$filter', 'Resources','RolesService','ProjectsService','People','ngTableParams',
    function ($scope, $q, $state, $filter, Resources, RolesService, ProjectsService, People, TableParams) {

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
    $scope.activeAndBacklogProjects = [];

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
    ProjectsService.getActiveAndBacklogProjects(function(result){
    	$scope.activeAndBacklogProjects = result.data;
    	//console.log("main.js activeAndBacklogProjects:", $scope.activeAndBacklogProjects);
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
        $scope.qvProjects = result.data;
        
        /*
         * Next, run through the list of projects and set the active projects and people.
         * 
         */
        
        var activeProjects = $scope.qvProjects;
        var activeProjectsWithUnassignedPeople = [];
        var unassignedIndex = 0;
        
        $scope.activeProjectsWithUnassignedPeople = [];
        $q.all(rolesPromise).then(function(rolesMap) {
      	  //console.log("main.js using rolesMap:", rolesMap);
          setActivePeopleAndProjects(rolesMap);
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
     * Find available people given the active projects
     */
    var findNineAvailablePeople = function () {
		  var peopleFilter = $scope.peopleFilter;
		  var fields = {resource:1,name:1,primaryRole:1,thumbnail:1};
		  People.getPeoplePerRole(peopleFilter, fields).then(function(peopleResult){
			  var people = peopleResult.members;
			//Shuffle people
            for(var j, x, i = people.length; i; j = Math.floor(Math.random() * i)){
              x = people[--i];
              people[i] = people[j];
              people[j] = x;
            }

            $scope.availablePeople =  people.slice(0,8);
		  });
    };
    
    /**
     * Handle a change to the role selector on the people view
     */
    $scope.handlePeopleFilterChanged = function(){
    	findNineAvailablePeople();
    };
    
    /**
     * Function to set Active People and projects
     */
    var setActivePeopleAndProjects = function (rolesMap) {
        var activePeopleProjects = {};
        var activeProjects = $scope.qvProjects;
        var activePeople = [];
        //console.log("setActivePeopleProjects using rolesMap:", rolesMap);
        for(var i = 0; i < activeProjects.length; i++){
            var roles = activeProjects[i].roles;
            if(roles){
            //Array to keep track of people already in an accounted role
              var activePeopleProjectsResources = [];

              //Loop through all the roles in the active projects
              for(var b = 0; b < roles.length; b++){
                var activeRole = roles[b];

                if(activeRole.assignee && activeRole.assignee.resource &&
                    !activePeopleProjects.hasOwnProperty(activeRole.assignee.resource)){

                  //Push the assignnee onto the active list
                  activePeople.push(Resources.get(activeRole.assignee.resource));

                  //Create a project list
                  activePeopleProjects[activeRole.assignee.resource] = [activeProjects[i]];
                  //Accout for person already in role in this project
                  activePeopleProjectsResources.push(activeRole.assignee.resource);
                }
                else if(activeRole.assignee && activeRole.assignee.resource &&
                    //And not already in an accounted role
                    activePeopleProjectsResources.indexOf(activeRole.assignee.resource) === -1){

                  //Just add the project to the activePeopleProjects list
                  activePeopleProjects[activeRole.assignee.resource].push(activeProjects[i]);
                }
               }
            }
          }
          //console.log("Active People Projects:", activePeopleProjects);
          
          $q.all(activePeople).then(function(data){
              $scope.qvPeopleProjects = activePeopleProjects;
              $scope.qvPeople = data;
              //console.log("Active Project People:", data);
              //console.log("Active People Projects:", activePeopleProjects);

          });
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
    $scope.isPersonActiveInMonth = function (project, person, month, year) {
      var projectIsActive = $scope.inMonth(project, month, year);
      if (!projectIsActive){
        return false;
      }

      //Look through all the roles
      var roles = project.roles;
      var personRef = person.about?person.about:person.resource;
      var ret = false;
      if (personRef){
        for (var f = 0; f < roles.length; f++){
          var role = roles[f];
          //Check if person is assigned to role
          if (role.assignee && personRef === role.assignee.resource){
            var nextMonth = month === 11 ? 0 : (month + 1),
            nextYear = month === 11 ? (year + 1) : year,
            startDay = new Date(year, month, 1),
            endDay = new Date(nextYear, nextMonth, 0);

            // If the role start day is before the last day of this month
            // and its end date is after the first day of this month.
            var roleStarted =   new Date(role.startDate) <= endDay;
            var roleEnded = role.endDate &&  new Date(role.endDate) <= startDay;
            ret =  roleStarted && !roleEnded;
            if (ret){
              break;
            }
          }
        }
      }

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
}]);

