'use strict';

/**
 * The main project controller
 */
angular.module('Mastermind').controller('MainCtrl', ['$scope', '$q', '$state', '$filter', 'Resources','RolesService','ProjectsService','People','ngTableParams',
    function ($scope, $q, $state, $filter, Resources, RolesService, ProjectsService, People, TableParams) {

	// Table Parameters for Resource Deficit tables
    var params = {
      page: 1,            // show first page
      count: 100,           // count per page
      sorting: {
        customerName: 'asc'     // initial sorting
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
    	console.log("main.js activeAndBacklogProjects:", $scope.activeAndBacklogProjects);
    });

    
    var aProjectsPromise = ProjectsService.getActiveProjects(function(result){
    	$scope.activeProjects = result;
    	console.log("main.js activeProjects:", $scope.activeProjects);
        $scope.projectCount = result.count;
        
        /*
         * With the result, first find the list of active People for Widget 1.
         */
        findNineAvailablePeople();
        console.log("main.js availablePeople:", $scope.availablePeople);
        
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
      	  console.log("main.js using rolesMap:", rolesMap);
          setActivePeopleAndProjects(rolesMap);

          /*
           * Finally set projects without any assigned people.
           * 
           */
      	  for(var i = 0; i < activeProjects.length; i++){
              var roles = activeProjects[i].roles;
              if(roles){
              //Array to keep track of people already in an accounted role
                var activePeopleProjectsResources = [];

                //Loop through all the roles in the active projects
                for(var b = 0; b < roles.length; b++){
                  var activeRole = roles[b];
                  console.log("Next active Role:",activeRole);
                  
                  if (!activeRole.assignee || !activeRole.assignee.resource) {
                      $scope.activeProjectsWithUnassignedPeople[unassignedIndex++] = {
                    	  clientName: activeProjects[i].customerName,
                    	  projectName: activeProjects[i].name,
                    	  projectResource: activeProjects[i].resource,
                    	  hours: getHoursDescription(activeRole.rate.hours, activeRole.rate.fullyUtilized, activeRole.rate.type),
                    	  role: rolesMap[activeRole.type.resource].abbreviation,
                    	  startDate: activeProjects[i].startDate,
                    	  endDate: activeProjects[i].endDate,
                    	  rate: activeRole.rate.amount};
                      console.log("activeRole.type:",activeRole.type);
                      console.log("Unassigned Role in Proj:", $scope.activeProjectsWithUnassignedPeople[unassignedIndex-1]);
                  }
                }
              }
            }
            console.log("Unassigned Role list:",$scope.activeProjectsWithUnassignedPeople);
            
            /*
             * Build out the table that contains the Active Projects with resource deficits
             */
            $scope.unassignedRoleList = new TableParams(params, {
                total: $scope.activeProjectsWithUnassignedPeople.length, // length of data
                getData: function ($defer, params) {

                    var data = $scope.activeProjectsWithUnassignedPeople;
                    var start = (params.page() - 1) * params.count();
                    var end = params.page() * params.count();
                    // use build-in angular filter
                    var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                    var ret = orderedData.slice(start, end);
                    console.log("Ret value for Unassigned Role list:",ret);
                    
                    $defer.resolve(ret);
                 }
              });
      });
    });


    /*
     * Next, with the list of backlog projects, create a table with the resource deficit on these projects.
     * 
     */
    ProjectsService.getProjectsBacklog(function(result){
    	$scope.projectBacklog = result;
        $scope.backlogCount = result.count;
        $scope.backlogProjectsList = [];

        
        console.log("main.js $scope.projectBacklog:", $scope.projectBacklog);
        var projectBacklog = result.data;

        var unassignedIndex = 0;
        var rolesPromise = RolesService.getRolesMapByResource();
        $q.all(rolesPromise).then(function(rolesMap) {
            /*
             * Set backlog projects
             * 
             */
        	for(var i = 0; i < projectBacklog.length; i++){
        		var roles = projectBacklog[i].roles;
        		if(roles){
                	/*
                	 * Loop through all the roles in the backlog projects  
                	 */
                    for(var b = 0; b < roles.length; b++){
                        var backlogRole = roles[b];
                        var peopleWithResourceQuery = {'resource':backlogRole.resource};
                        var pepInRolesFields = {resource:1,name:1, familyName: 1, givenName: 1, primaryRole:1,thumbnail:1};
                        console.log("Project in backlog:", projectBacklog[i]);
                        console.log("backlog role:", backlogRole);
                        
                        var assigneeVar = backlogRole.assignee?backlogRole.assignee.resource:undefined;

                        $scope.backlogProjectsList[unassignedIndex++] = {
                          	  clientName: projectBacklog[i].customerName,
                          	  projectName: projectBacklog[i].name,
                          	  projectResource: projectBacklog[i].resource,
                          	  hours: getHoursDescription(backlogRole.rate.hours, backlogRole.rate.fullyUtilized, backlogRole.rate.type),
                          	  role: rolesMap[backlogRole.type.resource].abbreviation,
                          	  assignee: assigneeVar ,
                          	  startDate: projectBacklog[i].startDate,
                          	  endDate: projectBacklog[i].endDate,
                          	  rate: backlogRole.rate.amount
                      };
                      console.log("backlogRole.type:",backlogRole.type);
                      console.log("Next Role in backlog Proj:", $scope.backlogProjectsList[unassignedIndex-1]);

                  }
              }
                    
   
            };
            console.log("Backlogged project Role list:",$scope.backlogProjectsList);
            return $scope.backlogProjectsList;
        }).then (function(backlogProjectsList) {
        	
        	var peopleProm = Resources.get('people');
        	peopleProm.then(function(people) {
            	console.log("main.js peopleProm resolved. called with:", people);
            	console.log("main.js peopleProm resolved. I already have:", backlogProjectsList);

                for (var i=0; i< backlogProjectsList.length;i++) {
                	var backlogProject = backlogProjectsList[i];
                	console.log("main.js backlog project=", backlogProject);
                	var assignee = backlogProject.assignee;
                	if(assignee != undefined) {
                    	console.log("main.js peopleProm resolved. assignee:", assignee);
                    	backlogProject.assignee = getPersonName(people, assignee);
                    }
                }
        	});
            
            /*
             * Build out the table that contains the backlog Projects with resource deficits
             */
            $scope.backlogRoleList = new TableParams(params, {
                total: backlogProjectsList.length, // length of data
                getData: function ($defer, params) {
                
                    var data = backlogProjectsList;
                    var start = (params.page() - 1) * params.count();
                    var end = params.page() * params.count();
                    // use build-in angular filter
                    var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                    var ret = orderedData.slice(start, end);
                    console.log("Ret value for Backlog Role list:",ret);

                    $defer.resolve(ret);
                }
            });
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
     * Find available people given the active projects
     */
    var findNineAvailablePeople = function () {
        var pepInRolesQuery = {'primaryRole.resource':{$exists:true}};
        console.log("pepInRolesQuery",pepInRolesQuery);
        var pepInRolesFields = {resource:1,name:1,primaryRole:1,thumbnail:1};

        Resources.query('people',pepInRolesQuery,pepInRolesFields,function(peopleResult){
          	console.log("peopleResult:", peopleResult);
            var people = peopleResult.members;
            var activePeople = [];
            var activeProjects = $scope.activeProjects.data;
            console.log("activeProjects:", activeProjects);
            //Loop through all the active projects
            for(var m = 0; m < activeProjects.length; m++){
              var roles = activeProjects[m].roles;
              if(roles){
                //Loop through all the roles in the active projects
                for(var a = 0; a < roles.length; a++){
                  var activeRole = roles[a];
                  if(activeRole.assignee && activeRole.assignee.resource &&
                      activePeople.indexOf(activeRole.assignee.resource) === -1){
                    //Push the assignnee onto the active list
                    activePeople.push(activeRole.assignee.resource);
                  }
                }
              }
            }

            //Shuffle people
            for(var j, x, i = people.length; i; j = Math.floor(Math.random() * i)){
              x = people[--i];
              people[i] = people[j];
              people[j] = x;
            }

            var inactivePeople = [];
            var cnt = 0;
            //Find the first 9 people not active
            for(var g = 0; g < people.length; g++){
              var preson = people[g];
              if(activePeople.indexOf(preson.resource) === -1){
                inactivePeople[cnt++] = preson;
                if(cnt === 9){
                  break;
                }
              }
            }
          
            $scope.availablePeople =  inactivePeople;
        });
    };

    /**
     * Function to return a text description of the number of hours
     */
    var getHoursDescription = function (hours, fullyUtilized, type) {
    	console.log("getHoursDescription called with", hours, fullyUtilized, type);
    	var hoursDesc;
    	
    	if (fullyUtilized) {
    		hoursDesc="100%";
    	}
    	else {
    		switch (type) {
    		case 'hourly':
    			hoursDesc= hours + "/month";
    			break;
    		case 'weekly':
    			hoursDesc= hours + "/week";
    			break;
    		case 'monthly':
    			hoursDesc= 'Monthly';
    		}
    	}
    	console.log("getHoursDescription returning ", hoursDesc);
    	return hoursDesc;
    }
    
    /**
     * Function to set Active People and projects
     */
    var setActivePeopleAndProjects = function (rolesMap) {
        var activePeopleProjects = {};
        var activeProjects = $scope.qvProjects;
        var activePeople = [];
        console.log("setActivePeopleProjects using rolesMap:", rolesMap);
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
          console.log("Active People Projects:", activePeopleProjects);
          
          $q.all(activePeople).then(function(data){
              $scope.qvPeopleProjects = activePeopleProjects;
              $scope.qvPeople = data;
              console.log("Active Project People:", data);
              console.log("Active People Projects:", activePeopleProjects);

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