'use strict';

/**
 * The main project controller
 */
angular.module('Mastermind')
  .controller('MainCtrl', ['$scope', '$state', '$filter', 'Resources', 'projects',
    function ($scope, $state, $filter, Resources, projects) {
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
    	  
    	  var allRoles = [];
    	  allRoles.push(Resources.get('roles/SSA'));
    	  allRoles.push(Resources.get('roles/PM'));
    	  allRoles.push(Resources.get('roles/BA'));
    	  allRoles.push(Resources.get('roles/SSE'));
    	  allRoles.push(Resources.get('roles/SUXD'));
    	  allRoles.push(Resources.get('roles/SE'));
    	  allRoles.push(Resources.get('roles/UXD'));
    	  $scope.allRoles = allRoles;
    	  
    	  $.when.apply(window, allRoles).done(function(data){
    		  var activePeople = [];
    		  var people = [];
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
    		  
    		  //Loop through the role groups
    		  var allRoles = $scope.allRoles;
    		  for(var i = 0; i < allRoles.length; i++){
    			  var members = allRoles[i].members;
    			  if(members){
    				  //Loop through all the roles in the active projects
    				  for(var j = 0; j < members.length; j++){
    					  var member = members[j];
    					  if(member.resource && people.indexOf(member.resource) == -1){
    						  //Push the assignnee onto the active list
    						  people.push(member.resource);
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
    			  if(activePeople.indexOf(preson) == -1){
    				  inactivePeople[cnt++] = preson;
//    				  if(cnt == 9){
//    					  break;
//    				  }
    			  }
    		  }
    		  
    		  $scope.availablePeopleCount = inactivePeople.length;
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
        $state.go('people');
      };
      
      /**
       * Navigate to view a list of people who can be assigned to projects.
       */
      $scope.showAvailablePeople = function () {
        $state.go('people', {filter:'available'});
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
        var returnValue = new Date(project.startDate) <= endDay && (project.endDate === null || new Date(project.endDate) >= startDay);
        return returnValue;
      };
    }]);


