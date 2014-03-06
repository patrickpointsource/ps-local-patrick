/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects')
  .controller('AssignmentsCtrl',['$scope', '$filter', 'Resources', 'AssignmentService', 'ngTableParams',
  function ($scope, $filter, Resources, AssignmentService, TableParams) {
   
	  $scope.editMode = false;
	  // Table Parameters
	var params = {
	  page: 1,            // show first page
	  count: 10,           // count per page
	  sorting: {
	    type: 'asc'     // initial sorting
	  }
	};
	
	for (var i = 0; i < $scope.project.roles.length; i ++)
		$scope.project.roles[i].assignees = [];
	
	$scope.roleTableParams = new TableParams(params, {
	  counts: [], // hide page counts control
	  total: $scope.project.roles.length, // length of data
	  getData: function ($defer, params) {
	    var data = $scope.project.roles;
	    var ret = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
	    $defer.resolve(ret);
	  }
	});
	
	$scope.addNewAssignmentToRole =  function (index, role) {
		
		role.assignees.push(AssignmentService.create({
	          startDate:$scope.project.startDate,
	          endDate:$scope.project.endDate,
	          percentage: 0
	        }))
	}
	
	$scope.removeAssignmentToRole = function(index, role) {
		if (role.assignees.length > 1)
			role.assignees.splice(index, 1);
		
	}
	
	$scope.cancelAssignment = function () {
		$scope.assignmentsErrorMessages = [];
		
		var role;
		
		for (var i = 0; i < $scope.project.roles.length; i ++) {
         	role = $scope.project.roles[i];
         	role.assignees = role.originalAssignees;
		}
		
		$scope.editMode = false;
	};
	
	$scope.validateAssignments = function(assignments){
        return AssignmentService.validateAssignments($scope.project, assignments);
      };
      
    $scope.edit = function() {
    	$scope.editMode = true;
    	
    	 var role;
         
    	 // to support cancel functionality
         for (var i = 0; i < $scope.project.roles.length; i ++) {
         	role = $scope.project.roles[i];
         	
         	if (!role.originalAssignees) {
         		role.originalAssignees = [];
         		
		    	for (var j = 0; role.assignees && role.assignees.length && j < role.assignees.length; j ++) {
		    		role.originalAssignees.push(AssignmentService.create(role.assignees[j]))
		    	}
         	}
         }
    	 
    }
    
    $scope.getPersonName = function(personId, assignable) {
    	var result = undefined;
    	
    	if (assignable)
	    	for(var i = 0; i < assignable.length; i ++) {
	    		if (assignable[i].resource == personId) {
	    			result = assignable[i].title;
	    			break;
	    		}
	    	}
    	
    	return result;
    };
    
	/**
     * Save role assignements
     */
    $scope.saveAssignment = function () {
      //Validate new role
      var errors = [];
      
      for (var i = 0; i < $scope.project.roles.length; i ++)
        	errors = errors.concat($scope.validateAssignments($scope.project.roles[i].assignees))
    	  
      if (errors.length > 0){
        $scope.assignmentsErrorMessages = _.uniq(errors);
      } else {
    	 
    	  var assignments = [];
    	  var role;
    	  
          for (var i = 0; i < $scope.project.roles.length; i ++) {
          	role = $scope.project.roles[i];
          	
          	for (var j = 0; j < role.assignees.length; j ++) {
          		role.assignees[j].role = {
          			resource: role.about
          		}
          
          	}
          	
          	// remove empty assignments
          	if (role.assignees.length > 1) {
          		for (var j = role.assignees.length - 1; j >= 0; j --) {
          		  
          		  
          		  if (!role.assignees[j].percentage && !(role.assignees[j].person && role.assignees[j].person.resource))
          			role.assignees.splice(j, 1)
          	  }
          	}
          	
          	assignments = assignments.concat(role.assignees);
          	
          	if (role.originalAssignees) 
          		delete role.originalAssignees;
          	
          }
		 

          //Clear any messages
          $scope.assignmentsErrorMessages = [];
          $scope.editMode = false;
          

          //if (assignments.length > 0) {
    	  $scope.projectAssignment.members = assignments;
    	  AssignmentService.save($scope.project, $scope.projectAssignment);
          //}

       

        // Reset the form to being pristine.
        for (var i = 0; i < 10 && $scope["newPersonToRoleForm" + i]; i ++ )
        	$scope["newPersonToRoleForm" + i].$setPristine();
      }
    };

    

    /**
     * Fetch the list of roles and assignments
     */
    Resources.get($scope.project.about + '/assignments').then(function(result){
    	var role;
    	
	      if(result && result.members){
				$scope.projectAssignment = result;
					  
				var assignments = result.members ? result.members: [];
				   
				var findRole = function(roleId) {
					return _.find( $scope.project.roles, function(r){
						return roleId.indexOf(r.about) > -1;
					})
				}
				    
				
				    
				for (var  i = 0; i < assignments.length; i ++) {
					if (assignments[i].role && assignments[i].role.resource)
						role = findRole(assignments[i].role.resource)
					else
						role = null;
					
					if (role)
						role.assignees.push(assignments[i])
				}
				
				
	      } else {
	    	  $scope.projectAssignment = {
	    			  about: $scope.project.about + '/assignments'
	    	  }
	      }
	      
	      	for (var i = 0; i < $scope.project.roles.length; i ++) {
				role = $scope.project.roles[i];
				
				if (!role.assignees || role.assignees.length == 0) {
					role.assignees = [];
					
					var props = {
			          startDate:$scope.project.startDate,
			          endDate:$scope.project.endDate
			        };
					
					if (role.assignee && role.assignee.resource)
						_.extend(props, {person: role.assignee});
					
					var newAssignee = AssignmentService.create(props)
					
					role.assignees.push(newAssignee)
				}
			}
    });


  }]);