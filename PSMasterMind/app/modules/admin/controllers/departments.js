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
	  
	  $scope.cancelDepartment = function () {
		  $scope.selectedDepartment = {};
		  //Clear New Task Form
		  $scope.selectedDepartmentForm.$setPristine();
	  };

	  $scope.$on("admin:departments", function(event, command) {
		  if (command == 'create') {
			  $scope.selectedDepartment = {isNew: true};
			  $scope.selectedDepartmentPeople = [];
		  }
	  });
	  
	  $scope.selectDepartment = function(e, department) {
		  $scope.selectedDepartment = department;
		  
		  $scope.selectedDepartmentPeople = [];
		  var found;
		  
		  for (var k = 0; $scope.selectedDepartment.departmentPeople && k < $scope.selectedDepartment.departmentPeople.length; k ++) {
			  found = _.find($scope.availablePeopleList, function(p){ return p.resource == $scope.selectedDepartment.departmentPeople[k]});
			  $scope.selectedDepartmentPeople.push({
				  resource: $scope.selectedDepartment.departmentPeople[k],
				  name: found ? found.name: ''
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
		  
		  p.added = true;
	  };
	  
	  $scope.removeDepartmentPerson = function(person) {
		  $scope.selectedDepartmentPeople = _.filter($scope.selectedDepartmentPeople, function(p){ return p.resource != person.resource});
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
	    	if (!$scope.selectedDepartment.isNew)
		      Resources.update($scope.selectedDepartment).then(function(){
		        $scope.loadDepartments().then(function(result){
		          //Reset New Role Object
		          $scope.selectedDepartment = {};
	
		          //Clear New Role Form
		         // $scope.selectedDepartmentForm.$setPristine();
		        });
		      });
	    	else
	    		DepartmentsService.addDepartment($scope.selectedDepartment).then(function(){
		    		$scope.loadDepartments().then(function(result){
			          //Reset New Role Object
			          $scope.selectedDepartment = {};
		
		
			          //Clear New Role Form
			         // $scope.selectedDepartmentForm.$setPristine();
			          
		    		});
		    	});
	    };

	    /**
	     * Delete a task
	     */
	    $scope.deleteDepartment = function () {
	      DepartmentsService.removeDepartment($scope.selectedDepartment).then(function(){
	        $scope.loadDepartments();
	      });
	    };

	  
	    $scope.loadDepartments = function() {
	    	return DepartmentsService.refreshDepartments().then(function(result) {
	    		$scope.availableDepartments = result;
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
	    		PeopleService.getAllActivePeople().then(function(result) {
	        		var tmpPerson;
	        		
	        		$scope.availablePeopleList = _.map(result.members, function(p) {
	        			return {
	        				resource: p.resource,
	        				name: Util.getPersonName(p, true)
	        			};
	        			
	        		});
	 	        	
	        		//$scope.availablePeopleList.splice(0, $scope.availablePeopleList.length - 7);
	 	        		
	 	        });
	    	
	    	if ($scope.departmentCodes.length == 0)
	    		DepartmentsService.loadDepartmentCodes().then(function(res) {
	    			$scope.departmentCodes = res;
	    		})
	    		
	    	if ($scope.departmentCategories.length == 0)
	    		DepartmentsService.loadDepartmentCategories().then(function(res) {
	    			$scope.departmentCategories = res;
	    		});
	    	
	    	DepartmentsService.refreshDepartments().then(function(departments){
	    		$scope.availableDepartments = departments;
	    	});
	    };

    	$scope.initDepartments();
    
  }]);