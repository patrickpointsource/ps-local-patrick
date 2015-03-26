/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind')
  .controller('DepartmentsCtrl',['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'DepartmentsService', 'People', '$q',
  function ($scope, $rootScope, $filter, Resources, $state, $stateParams, DepartmentsService, PeopleService, $q) {
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
		  if ($scope.searchDeptStr.length >= 1) {
			  DepartmentsService.searchDepartments($scope.searchDeptStr).then(function(result) {
				  $scope.availableDepartments = result;
			  });
		  } else if ($scope.searchDeptStr.length == 0)
			  $scope.loadDepartments();
	  };
	  
	  $scope.searchAvailablePeople = function(e, childScope) {
		  var searchPromise;
		  $scope.searchAvaialbleStr = childScope.searchAvaialbleStr;
		  
		  if ($scope.searchAvaialbleStr && $scope.searchAvaialbleStr.length >= 1) {
			  searchPromise = DepartmentsService.loadAvailablePeople($scope.searchAvaialbleStr);
		  } else
			  searchPromise = DepartmentsService.loadAvailablePeople();
		  
		  searchPromise.then(function(result) {
			  	$scope.availablePeopleList = _.map(result.members, function(p) {
	      			return {
	      				resource: p.resource,
	      				name: Util.getPersonName(p, true),
	      				alreadyAssigned: p.alreadyAssigned
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
		  $scope.selectedDepartment.editDepartmentPeople = false;
		  							
		  $scope.selectedDepartmentPeople = [];
		  var found;
		  
		  for (var k = 0; $scope.selectedDepartment.departmentPeople && k < $scope.selectedDepartment.departmentPeople.length; k ++) {
			  found = _.find($scope.allPeopleList, function(p){ return p.resource == $scope.selectedDepartment.departmentPeople[k];});
			  
			  $scope.selectedDepartmentPeople.push({
				  resource: $scope.selectedDepartment.departmentPeople[k],
				  name: found ? Util.getPersonName(found, true): ''
			  });
		  }
		  
		  $scope.selectedDepartmentPeople.sort(function(p1, p2) {
			if (p1.name > p2.name)
				return 1;
			else if (p1.name < p2.name)
				return -1;
		  });  
	  };
	  
	  $scope.onEditDepartmentPeople = function() {
		  //$scope.selectedDepartmentPeople = [];
		  $scope.selectedDepartment.editDepartmentPeople = true;
		  $scope.searchAvaialbleStr = '';
	  };
	  
	  $scope.cancelDepartmentPeople = function() {
		  $scope.selectedDepartment.editDepartmentPeople = false;
		  
		  var ind;
		  
		  for (var k = 0; k < $scope.selectedDepartmentPeople.length; k ++) {
			  ind = _.indexOf($scope.selectedDepartment.departmentPeople, $scope.selectedDepartmentPeople[k].resource);
			  
			  if (ind >= 0)
				  $scope.selectedDepartment.departmentPeople.splice(ind, 1);
		  }
	  };
	  
	  $scope.saveDepartmentPeople = function() {
		  $scope.selectedDepartment.editDepartmentPeople = false;
		  
		  var prevDepartmentPeople = $scope.selectedDepartment.departmentPeople;
		  
		  $scope.selectedDepartment.departmentPeople = [];
		  
		  var alreadyAssigned = [];
		  
		  for (var k = 0; k < $scope.selectedDepartmentPeople.length; k ++){
			  $scope.selectedDepartment.departmentPeople.push($scope.selectedDepartmentPeople[k].resource);
			  
			  if ($scope.selectedDepartmentPeople[k].alreadyAssigned)
				  alreadyAssigned.push($scope.selectedDepartmentPeople[k].resource);
		  }
			  
		  
		  var result = $scope.saveDepartment(alreadyAssigned);
		  
		  if (!result)
			  $scope.selectedDepartment.departmentPeople = prevDepartmentPeople;
	  };
	  
	  $scope.addDepartmentPerson = function(p) {
		  if (! $scope.selectedDepartment.departmentPeople)
			  $scope.selectedDepartment.departmentPeople = [];
		  
		  $scope.selectedDepartment.departmentPeople.push(p.resource);
		  
		  $scope.selectedDepartment.departmentPeople = _.uniq( $scope.selectedDepartment.departmentPeople);
		  
		  $scope.selectedDepartmentPeople.push(p);
		  
		  $scope.availablePeopleList = _.filter($scope.availablePeopleList, function(ap) { return ap.resource != p.resource;});
		  
		  p.added = true;
		  
		  $scope.selectedDepartmentPeople.sort(function(p1, p2) {
			if (p1.name > p2.name)
				return 1;
			else if (p1.name < p2.name)
				return -1;
		  });
	  };
	  
	  $scope.removeDepartmentPerson = function(person) {
		  $scope.selectedDepartmentPeople = _.filter($scope.selectedDepartmentPeople, function(p){ return p.resource != person.resource;});
		  
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
		          $rootScope.$emit('department:created');
		          
	    		});
	    	});
	    };

	    /**
	     * Update a new Role to the server
	     */
	    $scope.saveDepartment = function(alreadyAssigned){
	    	var result = true;
	    	
	    	var correctCode = $scope.currentDepartmentCodes ? 
	    			(_.filter($scope.currentDepartmentCodes, function(c) { return c.name == $scope.selectedDepartment.departmentCode.name})).length > 0: true;
	    	
	    	if (correctCode) {
	    		var promise;
	    		
	    		if (alreadyAssigned && alreadyAssigned.length > 0)
	    			promise = DepartmentsService.unassignPeople(alreadyAssigned);
	    		
	    		
		    	if (!$scope.selectedDepartment.isNew)
		    		promise = promise.then(function() {
		    			return Resources.update($scope.selectedDepartment)
	    			});
		    	
		    	else
		    		promise = promise.then(function() {
		    			return DepartmentsService.addDepartment($scope.selectedDepartment)
	    			});
		    	
		    		//promises.push(DepartmentsService.addDepartment($scope.selectedDepartment));
		    		
		    	promise.then(function(updated){
	    			$scope.selectedDepartment = Util.syncRevProp(updated);
	    			$scope.selectedDepartment.isEdit = false;
	    			$scope.selectedDepartment.isNew = false;
	    			$scope.loadDepartments().then(function(result){
			        
		    		});
	    			
	    			$rootScope.$emit('department:updated');
		    	});
	    	} else
	    		result = false;
	    	
	    	
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
	    	
	    	return result;
	    };

	    /**
	     * Delete a task
	     */
	    $scope.deleteDepartment = function () {
	      return DepartmentsService.removeDepartment($scope.selectedDepartment.resource).then(function(){
	        $scope.loadDepartments();
	        
	        $rootScope.$emit('department:deleted');
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
	    			$scope.departmentCategories = res && res.members ? res.members: res;
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
		    				return dp.replace('departments/people', 'people/');
		    			});
	    		}
	    	});
	    };

    	$scope.initDepartments();
    
  }]);