'use strict';

/**
 * The main project controller
 */
angular.module('Mastermind')
  .controller('MainCtrl', ['$scope', '$q', '$state', '$filter', 'Resources', 'projects',
    function ($scope, $q, $state, $filter, Resources, projects) {
	  $scope.summarySwitcher = 'projects';
      $scope.today = $filter('date')(new Date());
      $scope.projects = projects;
      
      //Get todays date formatted as yyyy-MM-dd
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = yyyy+'-'+mm+'-'+dd;
      
      var apQuery = {startDate:{$lte:today},$or:[{endDate:{$exists:false}},{endDate:{$gt:today}}]};
      var apFields = {resource:1,name:1,"roles.assignee":1};
      
      Resources.query('projects', apQuery, apFields, function(result){
    	  $scope.activeProjects = result;
    	  $scope.projectCount = result.count;
    	  
    	  var pepInRolesQuery = {'primaryRole.resource':{$exists:true}};
    	  var pepInRolesFields = {resource:1,name:1,primaryRole:1,thumbnail:1};

    	  Resources.query('people',pepInRolesQuery,pepInRolesFields,function(peopleResult){
    		  var people = peopleResult.members;
    		  var activePeople = [];
    		  var activeProjects = $scope.activeProjects.data;
    		  
    		  //Loop through all the active projects
    		  for(var i = 0; i < activeProjects.length; i++){
    			  var roles = activeProjects[i].roles;
    			  if(roles){
    				  //Loop through all the roles in the active projects
    				  for(var j = 0; j < roles.length; j++){
    					  var activeRole = roles[j];
    					  if(activeRole.assignee && activeRole.assignee.resource 
    							  && activePeople.indexOf(activeRole.assignee.resource) == -1){
    						  //Push the assignnee onto the active list
    						  activePeople.push(activeRole.assignee.resource);
    					  }
    				  }
    			  }
    		  }
    		  
    		  //Shuffle people
    		  for(var j, x, i = people.length; i; j = Math.floor(Math.random() * i), x = people[--i], people[i] = people[j], people[j] = x);
    			  
    		  var inactivePeople = [];
    		  var cnt = 0;
    		  //Find the first 9 people not active
    		  for(var i = 0; i < people.length; i++){
    			  var preson = people[i];
    			  if(activePeople.indexOf(preson.resource) == -1){
    				  inactivePeople[cnt++] = preson;
    				  if(cnt == 9){
    					  break;
    				  }
    			  }
    		  }
    		  
    		  $scope.availablePeople = inactivePeople;
	      });
      });
      
      var sixMontsFromNow = new Date();
      sixMontsFromNow.setMonth(sixMontsFromNow.getMonth() + 6);
      var dd6 = sixMontsFromNow.getDate();
      var mm6 = sixMontsFromNow.getMonth()+1; //January is 0!
      var yyyy6 = sixMontsFromNow.getFullYear();
      if(dd6<10){dd6='0'+dd6} if(mm6<10){mm6='0'+mm6} sixMontsFromNow = yyyy6+'-'+mm6+'-'+dd6;
      
      var qvProjQuery = {startDate:{$lte:sixMontsFromNow},$or:[{endDate:{$exists:false}},{endDate:{$gt:today}}]};
      var qvProjFields = {resource:1,name:1,startDate:1,endDate:1,"roles.assignee":1};
      
      Resources.query('projects', qvProjQuery, qvProjFields, function(result){
    	  $scope.qvProjects = result.data;
    	  
    	  //Sort By People
    	  var activePeoplePojects = {};
    	  var activeProjects = $scope.qvProjects;
    	  var activePeople = [];
    	  for(var i = 0; i < activeProjects.length; i++){
			  var roles = activeProjects[i].roles;
			  if(roles){
				//Arrary to keep track of people already in an accounted role
				  var activePeoplePojectsResources = [];
				  
				  //Loop through all the roles in the active projects
				  for(var j = 0; j < roles.length; j++){
					  var activeRole = roles[j];
					  
					  if(activeRole.assignee && activeRole.assignee.resource 
							  && !activePeoplePojects.hasOwnProperty(activeRole.assignee.resource)){
						  //Push the assignnee onto the active list
						  activePeople.push(Resources.get(activeRole.assignee.resource));
						  
						  //Create a project list 
						  activePeoplePojects[activeRole.assignee.resource] = [activeProjects[i]];
						  //Accout for person already in role in this project
						  activePeoplePojectsResources.push(activeRole.assignee.resource);
					  }
					  else if(activeRole.assignee && activeRole.assignee.resource
							  //And not already in an accounted role
							  && activePeoplePojectsResources.indexOf(activeRole.assignee.resource) == -1){
						  //Just add the project to the activePeopleProjects list
						  activePeoplePojects[activeRole.assignee.resource].push(activeProjects[i]);
					  }
				  }
			  }
		  }
    	  
    	  $q.all(activePeople).then(function(data){
    		  $scope.qvPeopleProjects = activePeoplePojects;
    		  $scope.qvPeople = data;
    	  });
    	  
      });
      

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
    }]);


