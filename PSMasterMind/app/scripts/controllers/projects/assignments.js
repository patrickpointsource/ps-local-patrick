/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects')
  .controller('AssignmentsCtrl',['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'AssignmentService', 'ngTableParams',
  function ($scope, $rootScope, $filter, Resources, $state, $stateParams, AssignmentService, TableParams) {
   
	  $scope.editMode = false;
	  // Table Parameters
	  var params = {
		  page: 1,            // show first page
		  count: 10,           // count per page
		  sorting: {
		    type: 'asc'     // initial sorting
		  }
	  };
	  
	  $scope.assignmentsFilters = [{name: "Current Assignments", value: "current"}, 
	                               	{name: "Future Assignments", value: "future"},
	                               	{name: "Past Assignments", value: "past"},
	                               	{name: "All Assignments", value: "all"}]
	
	  // make selected by default to "current"
	  $scope.selectedAssignmentsFilter = $state.params.filter ? $state.params.filter: "current";
	  
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
	
	$scope.getRoleCSSClass= function(abr) {
		var result = 'well';
		/*
		if (abr == 'BA')
			result = 'bg-success';
		else if (abr == 'SSE')
			result = 'bg-warning';
		else if (abr == 'SSA')
			result = 'bg-danger';
		else if (abr == 'SE')
			result = 'bg-warning';
		else if (abr == 'PM')
			result = 'bg-primary';
		else if (abr == 'SUXD')
			result = "bg-info"
		else if (abr == 'SUXD')
			result = "bg-info"
			*/	
		return result;
	}
	
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
         	
         	delete role.originalAssignees;
		}
		
		$scope.editMode = false;
		 $rootScope.formDirty = false;
		 
		$state.go('projects.show.tabId', {
			tabId: $scope.projectTabId
		});
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
         
         $state.go('projects.show.tabId.edit', {
				tabId: $scope.projectTabId
			}).then(function() {
				$rootScope.formDirty = true;
			});
    	 
    }
    
    $scope.getPersonName = function(personId, assignable) {
    	var result = undefined;
    	
    	if (assignable)
	    	for(var i = 0; i < assignable.length; i ++) {
	    		if (assignable[i].resource == personId) {
	    			result = assignable[i].familyName + ', ' + assignable[i].givenName;
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
    	  
      if (errors.length > 0)
        $scope.assignmentsErrorMessages = _.uniq(errors);
      else {
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
          	assignments = assignments.concat(_.filter(role.assignees, function(a){
          		if (!a.percentage && !(a.person && a.person.resource))
          			 return false
          			 
          		return true;
          	}));
          	
          	if (role.originalAssignees) 
          		delete role.originalAssignees;
          	
          }
		 

          //Clear any messages
          $scope.assignmentsErrorMessages = [];
          $scope.editMode = false;
          

          //if (assignments.length > 0) {
    	  $scope.projectAssignment.members = assignments;
    	  
    	  AssignmentService.save($scope.project, $scope.projectAssignment).then(function() {
    		  $scope.showInfo(['Assignments successfully saved']);
    		  $rootScope.formDirty = false;
    		  
    		  window.setTimeout(function(){
    			  $scope.hideMessages();
    		  }, 7 * 1000);
    		  
    		  $state.go('projects.show.tabId', {
  				tabId: $scope.projectTabId
  			});
    	  })
    	 
          //}

       

        // Reset the form to being pristine.
        for (var i = 0; i < 10 && $scope["newPersonToRoleForm" + i]; i ++ )
        	$scope["newPersonToRoleForm" + i].$setPristine();
      }
    };
    
    $scope.handleAssignmentsFilterChanged = function() {
    	AssignmentService.getAssignmentsByPeriod($scope.selectedAssignmentsFilter).then(function(data) {
        	$scope.refreshAssignmentsData(data);
        })
        
        var filter = $scope.projectTabId == "assignments" ? $scope.selectedAssignmentsFilter: null;
        
    	//if ($state.params.filter != filter;
    	$state.go('.', {
    			filter: filter, 
				tabId: $scope.projectTabId
			});
    }
    
    $scope.refreshAssignmentsData = function(result) {
    	for (var i = 0; i < $scope.project.roles.length; i ++) 
			$scope.project.roles[i].assignees = [];
    	
    	if (result && result.members) {
    		$scope.projectAssignment = result;
			  
			var assignments = result.members ? result.members: [];
			var role = null;
			
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
				
				/*
				if (role.assignee && role.assignee.resource)
					_.extend(props, {person: role.assignee});
				*/
				var newAssignee = AssignmentService.create(props)
				
				role.assignees.push(newAssignee)
			}
		}
    }
   
    $scope.handleAssignmentsFilterChanged();
    
    if ($state.is("projects.show.tabId.edit"))
    	$scope.edit();
    
  }]);