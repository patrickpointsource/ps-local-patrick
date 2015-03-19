/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind')
  .controller('DepartmentsCtrl',['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'DepartmentsService', 'People',
  function ($scope, $rootScope, $filter, Resources, $state, $stateParams, DepartmentsService, PeopleService) {
	  $scope.selectedDepartment = {};
	  $scope.availableDepartments = [];
	  $scope.managersList = [];
	  $scope.availablePeopleList = [];
	  $scope.departmentCodes = [];
	  $scope.departmentCategories = [];
	  
	  $scope.selectedManagerChanged = function(e, item){
		  var tmp;
	  };
	  
	  $scope.editDepartment = function() {
		  $scope.selectedDepartment.isEdit = true;
		  $scope.currentDepartmentCodes = ([]).concat($scope.departmentCodes);
		  
		  $scope.currentDepartmentCodes.push($scope.selectedDepartment.departmentCode);
		  
	  };
	  
	  
	  $scope.cancelDepartment = function () {
		  //$scope.selectedDepartment = {};
		 
		  if ($scope.selectedDepartmentOrig)
			  $scope.selectedDepartment = $scope.selectedDepartmentOrig;
		  
		  $scope.selectedDepartment.isEdit = false;
		  $scope.selectedDepartment.isNew = false;
		  $scope.selectedDepartment.isEdit = false;
		  
		  DepartmentsService.loadAvailablePeople().then( function(result) {
      		
      		$scope.availablePeopleList = _.map(result.members, function(p) {
      			return {
      				resource: p.resource,
      				name: Util.getPersonName(p, true)
      			};
      			
      		});
	       	
      		$scope.availablePeopleList.sort(function(p1, p2) {
      			if (p1.name > p2.name)
      				return 1;
      			else if (p1.name < p2.name)
      				return -1;
      		});
      		
		  });

		 // $scope.selectedDepartmentForm.$setPristine();
	  };

	  $scope.$on("admin:departments", function(event, command) {
		  if (command == 'create') {
			  $scope.selectedDepartment = {isNew: true};
			  $scope.currentDepartmentCodes = ([]).concat($scope.departmentCodes);
			  $scope.selectedDepartmentPeople = [];
		  }
	  });
	  
	  $scope.searchDepartments = function(e) {
		  if ($scope.searchDeptStr.length >= 2) {
			  DepartmentsService.searchDepartments($scope.searchDeptStr).then(function(result) {
				  $scope.availableDepartments = result;
			  });
		  } else if ($scope.searchDeptStr.length == 0)
			  $scope.loadDepartments();
	  };
	  
	  $scope.searchAvailablePeople = function(e, childScope) {
		  var searchPromise;
		  $scope.searchAvaialbleStr = childScope.searchAvaialbleStr;
		  
		  if ($scope.searchAvaialbleStr && $scope.searchAvaialbleStr.length >= 2) {
			  searchPromise = DepartmentsService.loadAvailablePeople($scope.searchAvaialbleStr);
		  } else
			  searchPromise = DepartmentsService.loadAvailablePeople();
		  
		  searchPromise.then(function(result) {
			  	$scope.availablePeopleList = _.map(result.members, function(p) {
	      			return {
	      				resource: p.resource,
	      				name: Util.getPersonName(p, true)
	      			};
	      			
	      		});
		       	
	      		$scope.availablePeopleList.sort(function(p1, p2) {
	      			if (p1.name > p2.name)
	      				return 1;
	      			else if (p1.name < p2.name)
	      				return -1;
	      		});
		  });
			  
	  };
	  
	  $scope.selectDepartment = function(e, department) {
		  $scope.selectedDepartment = _.extend({}, department);
		  
		  $scope.selectedDepartmentOrig = department;
		  
		  $scope.selectedDepartment.isNew = false;
		  $scope.selectedDepartment.isEdit = false;
		  $scope.selectedDepartmentPeople = [];
		  var found;
		  
		  for (var k = 0; $scope.selectedDepartment.departmentPeople && k < $scope.selectedDepartment.departmentPeople.length; k ++) {
			  found = _.find($scope.allPeopleList, function(p){ return p.resource == $scope.selectedDepartment.departmentPeople[k]});
			  $scope.selectedDepartmentPeople.push({
				  resource: $scope.selectedDepartment.departmentPeople[k],
				  name: found ? Util.getPersonName(found, true): ''
			  });
		  }
			  
	  };
	  
	  $scope.editDepartmentPeople = function() {
		  //$scope.selectedDepartmentPeople = [];
		  $scope.selectedDepartment.editDepartmenPeople = true;
	  };
	  
	  $scope.cancelDepartmentPeople = function() {
		  $scope.selectedDepartment.editDepartmenPeople = false;
		  
		  var ind;
		  
		  for (var k = 0; k < $scope.selectedDepartmentPeople.length; k ++) {
			  ind = _.indexOf($scope.selectedDepartment.departmentPeople, $scope.selectedDepartmentPeople[k].resource);
			  
			  if (ind >= 0)
				  $scope.selectedDepartment.departmentPeople.splice(ind, 1);
		  }
	  };
	  
	  $scope.saveDepartmentPeople = function() {
		  $scope.selectedDepartment.editDepartmenPeople = false;
		  
		  $scope.selectedDepartment.departmentPeople = [];
		  for (var k = 0; k < $scope.selectedDepartmentPeople.length; k ++)
			  $scope.selectedDepartment.departmentPeople.push($scope.selectedDepartmentPeople[k].resource);
		  
		  $scope.saveDepartment();
	  };
	  
	  $scope.addDepartmentPerson = function(p) {
		  if (! $scope.selectedDepartment.departmentPeople)
			  $scope.selectedDepartment.departmentPeople = [];
		  
		  $scope.selectedDepartment.departmentPeople.push(p.resource);
		  
		  $scope.selectedDepartment.departmentPeople = _.uniq( $scope.selectedDepartment.departmentPeople);
		  
		  $scope.selectedDepartmentPeople.push(p);
		  
		  $scope.availablePeopleList = _.filter($scope.availablePeopleList, function(ap) { return ap.resource != p.resource});
		  
		  p.added = true;
	  };
	  
	  $scope.removeDepartmentPerson = function(person) {
		  $scope.selectedDepartmentPeople = _.filter($scope.selectedDepartmentPeople, function(p){ return p.resource != person.resource});
		  
		  $scope.availablePeopleList.push(person);
		  
		  $scope.availablePeopleList.sort(function(p1, p2) {
			if (p1.name > p2.name)
				return 1;
			else if (p1.name < p2.name)
				return -1;
		  });
	  };
	    /**
	     * Add a new task to the server
	     */
	    $scope.addDepartment = function(){
	    	DepartmentsService.addDepartment($scope.selectedDepartment).then(function(){
	    		$scope.loadDepartments().then(function(result){
		          //Reset New Role Object
		          $scope.selectedDepartment = {};
	
	
		          //Clear New Role Form
		          $scope.selectedDepartmentForm.$setPristine();
		          
	    		});
	    	});
	    };

	    /**
	     * Update a new Role to the server
	     */
	    $scope.saveDepartment = function(){
	    	var correctCode = (_.filter($scope.currentDepartmentCodes, function(c) { return c.name == $scope.selectedDepartment.departmentCode.name})).length > 0;
	    	
	    	if (!correctCode) {
	    		//$scope.selectedDepartmentForm.$invalid = true;
	    		
	    		return;
	    	}
	    		
	    	if (!$scope.selectedDepartment.isNew)
		      Resources.update($scope.selectedDepartment).then(function(created){
		    	  $scope.selectedDepartment = created;
		    	  $scope.selectedDepartment.isEdit = false;
		    	  $scope.selectedDepartment.isNew = false;
		        $scope.loadDepartments().then(function(result){
		         
		         
	
		        });
		      });
	    	else
	    		DepartmentsService.addDepartment($scope.selectedDepartment).then(function(updated){
	    			$scope.selectedDepartment = updated;
	    			 $scope.selectedDepartment.isEdit = false;
			    	  $scope.selectedDepartment.isNew = false;
	    			$scope.loadDepartments().then(function(result){
			          
			          
		
		
			          //Clear New Role Form
			         // $scope.selectedDepartmentForm.$setPristine();
			          
		    		});
		    	});
	    	
	    	
	    	Resources.refresh("departments/available/people").then( function(result) {
        		var tmpPerson;
        		
        		$scope.availablePeopleList = _.map(result.members, function(p) {
        			return {
        				resource: p.resource,
        				name: Util.getPersonName(p, true)
        			};
        			
        		});
 	        	
        		//$scope.availablePeopleList.splice(0, $scope.availablePeopleList.length - 7);
        		$scope.availablePeopleList.sort(function(p1, p2) {
          			if (p1.name > p2.name)
          				return 1;
          			else if (p1.name < p2.name)
          				return -1;
          		});
 	        });
	    };

	    /**
	     * Delete a task
	     */
	    $scope.deleteDepartment = function () {
	      return DepartmentsService.removeDepartment($scope.selectedDepartment.resource).then(function(){
	        $scope.loadDepartments();
	      });
	    };

	  
	    $scope.loadDepartments = function() {
	    	return DepartmentsService.refreshDepartments().then(function(result) {
	    		$scope.availableDepartments = result;
	    		
	    		for (var k = 0; k < result.length; k ++) {
	    			if (result[k].departmentPeople)
		    			result[k].departmentPeople = _.map(result[k].departmentPeople, function(dp) {
		    				return dp.replace('departments/people', 'people/')
		    			});
	    		}
	    	});
	    };
	    
	    $scope.initDepartments =  function () {
	    	if ($scope.managersList.length == 0)
        		Resources.refresh("people/bytypes/byGroups", { group: "Managers"}).then(
        			function (result) {
        				for( var i = 0; result &&  result.members && i < result.members.length; i++ ) {
        		            var manager = result.members[ i ];
        		           
        		            $scope.managersList.push( {
        		                name: Util.getPersonName(manager, true),
        		                resource: manager.resource
        		            } );
        		            
        		        }
        				
        				 $scope.managersList.sort(function(m1, m2) {
     		            	if (m1.name.toLowerCase() < m2.name.toLowerCase())
     		            		return -1;
     		            	else if (m1.name.toLowerCase() > m2.name.toLowerCase())
     		            		return 1;
     		            	
     		            });
        			}
        		);
	    	
	    	if ($scope.availablePeopleList.length == 0)
	    		//PeopleService.getAllActivePeople().then(function(result) {
	    		Resources.refresh("departments/available/people").then( function(result) {
	        		var tmpPerson;
	        		
	        		$scope.availablePeopleList = _.map(result.members, function(p) {
	        			return {
	        				resource: p.resource,
	        				name: Util.getPersonName(p, true)
	        			};
	        			
	        		});
	 	        	
	        		$scope.availablePeopleList.sort(function(p1, p2) {
	          			if (p1.name > p2.name)
	          				return 1;
	          			else if (p1.name < p2.name)
	          				return -1;
	          		});
	 	        		
	 	        });
	    	
	    	if ($scope.departmentCodes.length == 0)
	    		DepartmentsService.loadDepartmentCodes().then(function(res) {
	    			$scope.departmentCodes = _.isArray(res) ? res: res.members;
	    		});
	    		
	    	if ($scope.departmentCategories.length == 0)
	    		DepartmentsService.loadDepartmentCategories().then(function(res) {
	    			$scope.departmentCategories = res;
	    		});
	    	
	    	if (!$scope.allPeopleList || $scope.allPeopleList.length == 0)
	    		PeopleService.getAllActivePeople().then(function(result) {
	    			$scope.allPeopleList = result.members;
	    		});
	    	
	    	DepartmentsService.refreshDepartments().then(function(departments){
	    		$scope.availableDepartments = departments;
	    		
	    		for (var k = 0; k < departments.length; k ++) {
	    			if (departments[k].departmentPeople)
	    				departments[k].departmentPeople = _.map(departments[k].departmentPeople, function(dp) {
		    				return dp.replace('departments/people', 'people/')
		    			});
	    		}
	    	});
	    };

    	$scope.initDepartments();
    
  }]);