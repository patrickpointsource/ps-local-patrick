'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('Mastermind')
  .controller('ProjectCtrl', ['$scope', '$state', '$stateParams', '$filter', 'ProjectsService', 'Resources', 'People', 'Groups', 'RoleTypes', 'ngTableParams',
    function ($scope, $state, $stateParams, $filter, ProjectsService, Resources, People, Groups, RoleTypes, TableParams) {
      var detailsValid = false, rolesValid = false;
      
	  //Set our currently viewed project to the one resolved by the service.
      $scope.projectId = $stateParams.projectId;
      $scope.projectLoaded = false;
	  
	  /**
	   * Set the profile view in edit mode
	   */
	  $scope.edit = function(){
		  $state.go('projects.show', {projectId:$scope.projectId, edit:true});
	  };
	  
	  /**
	   * Set the profile view in edit mode
	   */
	  $scope.cancel = function(){
		  //Throw it away if it is a new project
		  if($scope.isTransient){
			  $state.go('projects.index');
		  }
		  //Fetch the old version of the project and show the read only mode
		  else{
			  Resources.get('projects/'+$scope.projectId).then(function(project){
				  $state.go('projects.show', {projectId:$scope.projectId, edit:null});
			  });
		  }
	  };
	  

      /**
       * Save the loaded project.
       */
      $scope.save = function () {
        $scope.submitAttempted = true;

        ProjectsService.save($scope.project).then(function (project) {
        	if($scope.isTransient){
  			  $state.go('projects.index');
  		  	}
        	else{
        		$state.go('projects.show', {projectId:$scope.projectId, edit:null});
        	}
        }, function (response) {
          var BAD_REQUEST = 400;

          if (response.status === BAD_REQUEST) {
            $scope.messages = response.data.reasons;
          }
        });
      };

      
      $scope.projectMargin = function(){
    	 var servicesEst = $scope.project.terms.servicesEstimate;
    	 var softwareEst = $scope.project.terms.softwareEstimate;
    	 
    	 //Cannot be null
    	 servicesEst = servicesEst?servicesEst:0;
    	 softwareEst = softwareEst?softwareEst:0;
    	 
    	 var revenue = servicesEst+softwareEst;
    	 var cost = $scope.servicesTotal();
    	 
    	 var margin = null;
    	 
    	 if(cost){
    		 var diff = revenue - cost;
    		 margin = diff/revenue*100;
    	 }
    	 
    	 return margin;
      };
      
      /**
       * Calculate total services caost in plan
       */
      $scope.servicesTotal = function(){
    	  var roles = $scope.project.roles;
    	  
    	  var runningTotal = 0;
    	  for(var i = 0; roles && i < roles.length; i++){
    		  var role = roles[i];
    		  var rate = role.rate;
    		  if(rate && rate.amount){
    			  var amount = rate.amount;
    			  if(amount){
    				  var type = rate.type;
    				  var startDate = new Date(role.startDate);
    				  var endDate = new Date(role.endDate);
    				  
    				  if(startDate && endDate){
	    				  //Hourly Charge rate
	    				  if(type && type == 'monthly'){
	    					  var numMonths = $scope.monthDif(startDate, endDate);
	    					  var roleTotal = numMonths * amount;
	    					  runningTotal += roleTotal;
	    				  }
	    				  //Weekly Charge rate
	    				  else if(type && type== 'weekly'){
	    					  var numWeeks = $scope.weeksDif(startDate, endDate);
	    					  var hoursPerWeek = rate.fullyUtilized?50:rate.hours;
	    					  var roleTotal = numWeeks * hoursPerWeek * amount;
	    					  runningTotal += roleTotal;
	    				  }
	    				  //Hourly Charge rate
	    				  else if(type && type== 'hourly'){
	    					  var numMonths = $scope.monthDif(startDate, endDate);
	    					  var hoursPerMonth = rate.fullyUtilized?220:rate.hours;
	    					  var roleTotal = numMonths * hoursPerMonth * amount;
	    					  runningTotal += roleTotal;
	    				  }
    				  }
    			  }
    		  }
    	  }
    	  
    	  return runningTotal;
      };
      
      /**
       * Number of months between 2 dates
       */
      $scope.monthDif = function(d1, d2) {
    	  var months;
    	  months = (d2.getFullYear() - d1.getFullYear()) * 12;
    	  months -= d1.getMonth() + 1;
    	  months += d2.getMonth() + 1;
    	  return months <= 0 ? 0 : months;
      };
      
      /**
       * Number of weeks between 2 dates
       */
      $scope.weeksDif = function(d1, d2) {
			// The number of milliseconds in one week
			var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
			// Convert both dates to milliseconds
			var date1_ms = d1.getTime();
			var date2_ms = d2.getTime();
			// Calculate the difference in milliseconds
			var difference_ms = Math.abs(date1_ms - date2_ms);
			// Convert back to weeks and return hole weeks
			return Math.floor(difference_ms / ONE_WEEK);
      };
      
      
      
      $scope.handleProjectSelected = function(){
    	  var project = $scope.project;
    	  $scope.isTransient = ProjectsService.isTransient(project);
    	  /**
    	   * Controls the edit state of the project form (an edit URL param can control this from a URL ref)
    	   */
    	  $scope.editMode = $state.params.edit?Boolean($state.params.edit):Boolean($scope.isTransient);
    	  $scope.projectLoaded = true;

          $scope.submitAttempted = false;

          // The title of the page is the project's name or 'New Project' if transient.
          $scope.title = $scope.isTransient ? 'New Project' : project.name;

          // Table Parameters
          var params = {
            page: 1,            // show first page
            count: 10,           // count per page
            sorting: {
            	type: 'asc'     // initial sorting
            }
          };

          $scope.summaryRolesTableParams = new TableParams(params, {
            total: $scope.project.roles.length,
            getData: function ($defer, params) {
              var start = (params.page() - 1) * params.count();
              var end = params.page() * params.count();

              var orderedData = params.sorting() ?
                    $filter('orderBy')($scope.project.roles, params.orderBy()) :
                    $scope.project.roles;

              //use build-in angular filter
              var result = orderedData.slice(start, end);

              var defers = [];
              var ret = [];
              for(var i = 0; i < result.length; i++){
                var ithRole = Resources.deepCopy(result[i]);
                if(ithRole.assignee && ithRole.assignee.resource){
                  defers.push(Resources.resolve(ithRole.assignee));
                  //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
                }

                if(ithRole.type && ithRole.type.resource){
                  defers.push(Resources.resolve(ithRole.type));
                  //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
                }

                ret[i] = ithRole;
              }

              $.when.apply(window, defers).done(function(){
                $defer.resolve(ret);
              });
            }
          });
      };
      
      /**
       * Get Existing Project
       */
      if($scope.projectId){
          ProjectsService.getForEdit($scope.projectId).then(function(project){
        	  $scope.project = project;
        	  $scope.handleProjectSelected();
          });
      }
      /**
       * Default create a new project
       */
      else{
    	  $scope.project = ProjectsService.create();
    	  $scope.handleProjectSelected();
      }


      /**
       * Get All the Role Types
       */
       Resources.get('roles').then(function(result){
    	   var resources = [];
    	   var roleGroups = {};
    	   //Save the list of role types in the scope
    	   $scope.roleTypes = result.members;
    	   //Get list of roles to query members
    	   for(var i = 0; i < result.members.length;i++){
    		   var role = result.members[i];
    		   var resource = role.resource;
    		   roleGroups[resource] = role;
    		   resources.push(resource);
    		   //create a members array for each roles group
    		   role.assiganble = [];
    	   }

    	   //Query all people with a primary role
    	   var roleQuery = {'primaryRole.resource':{$exists:1}};
    	   var fields = {resource:1,name:1,familyName:1,givenName:1,primaryRole:1,thumbnail:1};
    	   var sort = {'primaryRole.resource':1,'familyName':1,'givenName':1};
    	   Resources.query('people',roleQuery, fields, function(peopleResults){
    		    var people = peopleResults.members;
    		    //Set up lists of people in roles
    		    for(var i = 0; i < people.length; i++){
    		    	var person = people[i];
    		    	var personsRole = roleGroups[person.primaryRole.resource];
    		    	person.title = personsRole.abbreviation + ': ' + person.familyName + ", " + person.givenName;
    		    	
    		    	for(var j = 0; j < result.members.length;j++){
    		    		var roleJ = result.members[j];
    		    		
    		    		//Primary role match place it at the front of the array in sort order
    		    		if(roleJ.resource == person.primaryRole.resource){
    		    			//assignable list was empty add it to the front
    		    			if(roleGroups[roleJ.resource].assiganble.length == 0){
    		    				roleGroups[roleJ.resource].assiganble[0] = person;
    		    			}
    		    			//First match just add it to the font
    		    			else if(roleGroups[roleJ.resource].assiganble[0].primaryRole.resource != roleJ.resource){
    		    				roleGroups[roleJ.resource].assiganble.unshift(person);
    		    			}
    		    			//Add it after the last match
    		    			else{
    		    				var index = 0;
    		    				while(roleGroups[roleJ.resource].assiganble.length>index&&roleGroups[roleJ.resource].assiganble[index].primaryRole.resource == roleJ.resource){
    		    					index++;
    		    				}
    		    				roleGroups[roleJ.resource].assiganble.splice(index,0,person);
    		    			}
    		    		}
    		    		//Not the primary role leave it in sort order
    		    		else{
    		    			roleGroups[roleJ.resource].assiganble.push(person);
    		    		}
    		    	}
    		    }
    		    
    		    //Set a map of role types to members
    		    $scope.roleGroups = roleGroups;
    	   },sort);
       });


      /**
       * Whenever the roles:add event is fired from a child controller,
       * handle it by adding the supplied role to our project.
       */
      $scope.$on('roles:add', function (event, role) {
        $scope.project.addRole(role);
        $scope.summaryRolesTableParams.reload();
      });

      /**
       * Whenever the roles:change event is fired from a child controller,
       * handle it by updating the supplied role in our project.
       */
      $scope.$on('roles:change', function (event, index, role) {
        $scope.project.changeRole(index, role);
        $scope.summaryRolesTableParams.reload();
      });

      /**
       * Whenever the roles:remove event is fired from a child controller,
       * handle it by removing the supplied role from our project.
       */
      $scope.$on('roles:remove', function (event, role) {
        $scope.project.removeRole(role);
        $scope.summaryRolesTableParams.reload();
      });

      /**
       * Whenever the details form's state changes, update the watchers in this view.
       */
      $scope.$on('detailsForm:valid:change', function (event, validity) {
        detailsValid = validity;
      });

      /**
       * Whenever the roles form's state changes, update the watchers in this view.
       */
      $scope.$on('roles:valid:change', function (event, validity) {
        rolesValid = validity;
      });

      /**
       * Must have the details filled out before the user can view the roles tab.
       *
       * @returns {boolean}
       */
      $scope.isRolesTabDisabled = function () {
        return !detailsValid;
      };

      /**
       * Must have the details filled out and at least one role assigned before the user
       * can view the assignments tab.
       *
       * @returns {boolean}
       */
      $scope.isAssignmentsTabDisabled = function () {
        return !detailsValid || !rolesValid;
      };

      /**
       * Must have the details filled out and at least one role assigned before the user
       * can view the summary tab.
       *
       * @returns {boolean}
       */
      $scope.isSummaryTabDisabled = function () {
        return !detailsValid || !rolesValid;
      };
    }]);