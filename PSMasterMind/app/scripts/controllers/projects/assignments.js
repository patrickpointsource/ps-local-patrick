/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects')
  .controller('AssignmentsCtrl',['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'AssignmentService', '$location', 'ngTableParams',
  function ($scope, $rootScope, $filter, Resources, $state, $stateParams, AssignmentService, $location, TableParams) {
   
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
	
	  
	  /*
	  //TODO what is this for?
	  // Load "all" assignments for displaying it on "summary" tab, and possibly on other tabs
	  if ($scope.projectTabId != "assignments"){
		  $scope.selectedAssignmentsFilter = "all";
	  }
	  //If explicit use the passed in filter
	  else if($state.params.filter){
		  $scope.selectedAssignmentsFilter = $state.params.filter;
	  } else
		  $scope.selectedAssignmentsFilter = $scope.getDefaultAssignmentsFilter()
	 */
	  $scope.selectedAssignmentsFilter = "all";
	  
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
	
	$scope.currentTabStates = [{
		tabId: $state.params.tabId,
		edit:  $state.params.edit
		/*,filter:  $state.params.filter*/
	}];
	
	$scope.pushState = function(state) {
		if ($scope.currentTabStates.length > 5)
			$scope.currentTabStates.splice($scope.currentTabStates.length - 1, 1);
		
		$scope.currentTabStates.unshift(state);
		
	}
	
	$scope.getDefaultRoleHoursPerWeek = function(info) {
		
		return info.hoursNeededToCover;
	}
	
	$scope.addNewAssignmentToRole =  function (index, role) {
		var coverageInfo = AssignmentService.calculateSingleRoleCoverage(role, role.assignees);
		
		role.assignees.push(AssignmentService.create({
          startDate:$scope.project.startDate,
          endDate:$scope.project.endDate,
          //percentage: $scope.getDefaultRolePercentage(role)
          hoursPerWeek: $scope.getDefaultRoleHoursPerWeek(coverageInfo)
        }))
	}
	
	$scope.removeAssignmentFromRole = function(index, role, parent) {
		if (role.assignees.length > 1)
			role.assignees.splice(index, 1)
		else if (role.assignees.length == 1 && role.assignees[0].person && role.assignees[0].person.resource) {
			role.assignees[0].person = {};
		}
		
		$("#roleAssignmentDelete" + parent + index).collapse('hide');
	}
	
	$scope.cancelAssignment = function () {
		$scope.assignmentsErrorMessages = [];
		
		var role;
		//var assignments = [];
		
		for (var i = 0; i < $scope.project.roles.length; i ++) {
         	role = $scope.project.roles[i];
         	role.assignees = _.toArray(role.originalAssignees);
         	
         	//assignments = assignments.concat(role.assignees);
         	
         	delete role.originalAssignees;
		}
		
		//AssignmentService.calculateRolesCoverage($scope.project.roles, assignments)
    	
		$scope.editMode = false;
			//TODO removing dirty handler
		 	//$rootScope.formDirty = false;
		
		var params = {
			tabId: $scope.projectTabId,
			edit: null
			//filter: $scope.selectedAssignmentsFilter
			//filter: "all"
		};
		
		 $scope.selectedAssignmentsFilter = "all";
		 $scope.handleAssignmentsFilterChanged();
		 
		$state.go('projects.show', params);
		$scope.pushState(params)
	};
	
	$scope.validateAssignments = function(assignments){
        return AssignmentService.validateAssignments($scope.project, assignments);
      };
      
    $scope.edit = function(avoidStateSwitch) {
    	
    	
    	AssignmentService.getAssignmentsByPeriod("all", {
    		project: {
    			resource: $scope.project.about
    		}
    	}).then(function(data) {
        	$scope.refreshAssignmentsData(data);
        	$scope.editMode = true;
        	
        	if (!avoidStateSwitch) {
           	 var params = {
   				tabId: $scope.projectTabId,
   				//filter: null,
   				edit: 'edit'
   			}
           	 
   	         $state.go('projects.show', params);
   	         
   	         $scope.pushState(params)
            }
        })
        
    	// $scope.fillOriginalAssignees();
    	 
      	  $scope.stopWatchingAssignmentChanges();
      	  
      	  //Create a new watch
      	  $scope.sentinel = $scope.$watch('project.roles', function(newValue, oldValue){
  	    	  if(!$rootScope.formDirty && $scope.editMode){
  	    		  //Do not include anthing in the $meta property in the comparison
  	    		  if(oldValue.hasOwnProperty('$meta')){
  	    			  var oldClone = Resources.deepCopy(oldValue);
  	    			  delete oldClone['$meta'];
  	    			  oldValue = oldClone;
  	    		  }
  	    		  if(newValue.hasOwnProperty('$meta')){
  	    			  var newClone = Resources.deepCopy(newValue);
  	    			  delete newClone['$meta'];
  	    			  newValue = newClone;
  	    		  }
  	    		  
  	    		  //Text Angular seems to add non white space characters for some reason
  	    		  if(newValue.description){
  	    			  newValue.description = newValue.description.trim();
  	    		  }
  	    		  if(oldValue.description){
  	    			  oldValue.description = oldValue.description.trim();
  	    		  }
  	    		  
  	    		  var oldStr = JSON.stringify(oldValue);
  	    		  var newStr = JSON.stringify(newValue);
  	    		  
  	    		  if(oldStr != newStr){
  	    			  console.debug('assignment is now dirty');
  	    			  $rootScope.formDirty = true;
  	    			  $rootScope.dirtySaveHandler = function(){
  	    			    	return $scope.saveAssignment(true);
  	    			   };
  	    		  }
  	    	  }
  	    	 
  	      },true);
    }
    
    $scope.stopWatchingAssignmentChanges = function(){
    	var sentinel = $scope.sentinel;
	  	if(sentinel){
	  		sentinel();  //kill sentinel
	  	}
    };
    
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
    
    $scope.getPerson = function(personId, assignable) {
    	var result = undefined;
    	
    	if (assignable)
	    	for(var i = 0; i < assignable.length; i ++) {
	    		if (assignable[i].resource == personId) {
	    			result = assignable[i];
	    			break;
	    		}
	    	}
    	
    	return result;
    };
    
	/**
     * Save role assignements
     */
    $scope.saveAssignment = function (navigateOut) {
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
          			//resource: role.about
          			resource: $scope.project.about + '/roles/' + role._id
          		}
          
          	}
          	
          	// remove empty assignments
          	assignments = assignments.concat(_.filter(role.assignees, function(a){
          		if (!(a.person && a.person.resource))
          			 return false
          			 
          		return true;
          	}));
          	
          }
		 
          $scope.cleanupAssignmentsExtraInfo();

          //Clear any messages
          $scope.assignmentsErrorMessages = [];
          $scope.editMode = false;
          

          // concatenate hided assingnee members
    	  $scope.projectAssignment.members = assignments.concat($scope.projectAssignment.excludedMembers ? $scope.projectAssignment.excludedMembers: []);
    	  
    	  return AssignmentService.save($scope.project, $scope.projectAssignment).then(function(result) {
    		  $scope.showInfo(['Assignments successfully saved']);
    		  	//TODO removing dirty handler
  		 		//$rootScope.formDirty = false;
    		  
    		  window.setTimeout(function(){
    			  $scope.hideMessages();
    		  }, 7 * 1000);
    		  
    		  $scope.refreshAssignmentsData( AssignmentService.filterAssignmentsByPeriod($scope.projectAssignment, $scope.selectedAssignmentsFilter));
    		  
    		  var params = {
	  				tabId: $scope.projectTabId,
	  				//filter: $scope.selectedAssignmentsFilter
	  				filter: null
				}
    		  
    		  if(!navigateOut){
    			  $scope.stopWatchingAssignmentChanges();
    			  $rootScope.formDirty = false;
    			  $state.go('projects.show', params);
    		  }
    		  
    		  $scope.pushState(params)
    	  })
    	 
       

        // Reset the form to being pristine.
        for (var i = 0; i < 10 && $scope["newPersonToRoleForm" + i]; i ++ )
        	$scope["newPersonToRoleForm" + i].$setPristine();
      }
    };
    
    /*
     * Remove from saved objects unnecessary properties
     */
    $scope.cleanupAssignmentsExtraInfo = function() {
    	var role;
    	
    	for (var i = 0; i < $scope.project.roles.length; i ++) {
          	role = $scope.project.roles[i];
          	
          	for (var j = 0; j < role.assignees.length; j ++) {
          		for (var propP in role.assignees[j].person)
          			if (propP != "resource")
          				delete role.assignees[j].person[propP]
          
          	}
          	
          	
          	
          	if (role.originalAssignees) 
          		delete role.originalAssignees;
          	
          	if (role.about) 
          		delete role.about;
          	
          }
    	
    	if ($scope.projectAssignment.excludedMembers)
    		delete $scope.projectAssignment.excludedMembers;
    }
    
    $scope.handleAssignmentsFilterChanged = function() {
    	AssignmentService.getAssignmentsByPeriod("all", {
    		project: {
    			resource: $scope.project.about
    		}
    	}).then(function(data) {
        	$scope.refreshAssignmentsData(data);
        })
        
        if ($scope.projectTabId == "assignments" && !$state.is("projects.show.edit")) {
	        // in case when we simply converting url "assignments" to "assignments?filter=current" we must replace latest history entry
	        var filter = $scope.projectTabId == "assignments" ? $scope.selectedAssignmentsFilter: null;
	        var options = {
	        		location: $state.params.filter != null? true: "replace"
	        }
	
	        if ($scope.currentTabStates[0].edit)
	        	filter = null;
	        // for some reasons $state.go do not recognize "replace" value
	        /*
	    	$state.go('projects.show', {
	    			filter: filter, 
					tabId: $scope.projectTabId
				}, options);
	        */
	        var params = { 
    			//filter: filter, 
    			tabId: $scope.projectTabId,
    			edit: $scope.currentTabStates[0].edit
			}
	        var updatedUrl = $state.href('projects.show', params).replace('#', '');
	        
	        $scope.pushState(params);
	        
	        if (options.location == "replace")
	        	$location.url(updatedUrl).replace();
	        else
	        	$location.url(updatedUrl)
        }
        
    }
    
    $scope.fillOriginalAssignees = function() {
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
    
    $scope.getActualProjectAssignmentMembers = function() {
    	var result = [];
    	var role = null;
    	
    	for (var i = 0; i < $scope.project.roles.length; i ++) {
          	role = $scope.project.roles[i];
          	
          	result = result.concat(role.assignees)
    	}
    	
    	return result;
    }
    
    $scope.peopleList = [];
    
    $scope.refreshAssignmentsData = function(result) {
    	for (var i = 0; i < $scope.project.roles.length; i ++) {
    		$scope.project.roles[i].assignees = [];
    	}
    	
    	if (result && result.members) {
    		$scope.projectAssignment = result;
			  
			var assignments = result.members ? result.members: [];
			
			
			var findRole = function(roleResource) {
				return _.find( $scope.project.roles, function(r){
					return roleResource.indexOf(r._id) > -1;
				})
			}
			
			var findPerson = function(personId) {
				return _.find( $scope.peopleList, function(p){
					return personId == p.resource;
				})
			}
			   
			// fill people list
		
			if ($scope.peopleList.length == 0) {
				var people = [];
				
				for (var prop in $scope.roleGroups)
					people = people.concat( $scope.roleGroups[prop].assiganble)
					
				$scope.peopleList = _.uniq(people, function(p) { return p.resource; })
			}
			
			var role = null;
			var person = null;
			
			for (var  i = 0; i < assignments.length; i ++) {
				if (assignments[i].role && assignments[i].role.resource)
					role = findRole(assignments[i].role.resource)
				else
					role = null;
				
				person = assignments[i].person && assignments[i].person.resource ? findPerson(assignments[i].person.resource): null;
				
				if (person) {
					assignments[i].person.thumbnail = person.thumbnail;
					assignments[i].person.name = person.familyName + ', ' + person.givenName
				}
				
				if (role)
					role.assignees.push(assignments[i])
					
			}
			
			$scope.fillOriginalAssignees();
			
    	} else {
    		 $scope.projectAssignment = {
	    			  about: $scope.project.about + '/assignments'
	    	  }
    	}
    	
    	
    	
    	AssignmentService.calculateRolesCoverage($scope.project.roles, $scope.getActualProjectAssignmentMembers())
    	
    	for (var i = 0; i < $scope.project.roles.length; i ++) {
			role = $scope.project.roles[i];
			
			if (!role.assignees || role.assignees.length == 0) {
				role.assignees = [];
				
				var props = {
		          startDate:$scope.project.startDate,
		          endDate:$scope.project.endDate,
		          //percentage: $scope.getDefaultRolePercentage(role),
		          hoursPerWeek: $scope.getDefaultRoleHoursPerWeek(role)
		        };
				
				
				var newAssignee = AssignmentService.create(props)
				
				role.assignees.push(newAssignee)
			}
		}
    	
    	$scope.$emit('roles:assignments:change');
    	
    	
    }
    
    $scope.handleAssignmentsFilterChanged();
   
    // switch to edit mode if needed
	if ($state.params.edit  && $scope.adminAccess){
    	$scope.edit(true);
    }
  }]);