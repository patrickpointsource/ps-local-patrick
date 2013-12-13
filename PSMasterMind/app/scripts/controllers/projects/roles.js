'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.projects')
  .controller('RolesCtrl', ['$scope', '$filter', 'RolesService', 'RoleTypes', 'Rates', 'RateFactory', 'ngTableParams',
    function ($scope, $filter, RolesService, RoleTypes, Rates, RateFactory, TableParams) {


      $scope.newRole = RolesService.create();

      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
        	type: 'asc'     // initial sorting
        }
      };
      $scope.roleTableParams = new TableParams(params, {
    	counts: [], // hide page counts control
        total: $scope.project.roles.length, // length of data
        getData: function ($defer, params) {
            var data = $scope.project.roles;
            var ret = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
            $defer.resolve(ret);
        }
      });

      /**
       * Change the rate type on the new role to the specified new rate type
       *
       * @param newRateType
       */
      function changeRateType(newRateType) {
        $scope.newRole.changeType(newRateType);
      }

      $scope.changeToHourlyRate = function () {
        changeRateType(Rates.HOURLY);
      };

      $scope.changeToWeeklyRate = function () {
        changeRateType(Rates.WEEKLY);
      };

      $scope.changeToMonthlyRate = function () {
        changeRateType(Rates.MONTHLY);
      };

      $scope.validateNewRole = function(){
    	var errors = [];
    	var newRole = $scope.newRole;
    	//Must select a type
    	if(!newRole){
    		errors.push('New Role is null');
    	}
    	else{
    		//Role Type is Required
    		if(!newRole.type || !newRole.type.resource){
    			errors.push("Role Type is required");
    		}
    		//Start Date is required
    		if(!newRole.startDate){
    			errors.push("Start Date is required");
    		}
    		//Role cannot start before the project starts
    		else if($scope.project.startDate && newRole.startDate < $scope.project.startDate){
    			errors.push("Role Start Date cannot be before Project Start Date");
    		}
    		//Role cannot start after the project ends
    		else if($scope.project.endDate && newRole.startDate > $scope.project.endDate){
    			errors.push("Role Start Date cannot be before Project End Date");
    		}
    	
    		//Role cannot end after the project is over
    		if(newRole.endDate && $scope.project.endDate && newRole.endDate > $scope.project.endDate){
    			errors.push("Role End Date cannot be after Project End Date");
    		}
    		
    		//Role cannot start before the project is starts
    		else if(newRole.endDate && $scope.project.startDate && newRole.endDate < $scope.project.startDate){
    			errors.push("Role End Date cannot be before Project Start Date");
    		}
    		
    		//End Date cannot be before start date
    		else if(newRole.startDate && newRole.endDate && newRole.startDate > newRole.endDate){
    			errors.push("Role Start Date cannot be after Role End Date");
    		}
    		
    		 //Business Rule: Monthly Rate Assumes 100% utilization
            if ($scope.newRole.rate.type == 'monthly') {
              $scope.newRole.rate.fullyUtilized = true;
            }
    	}
    	return errors;
      };
      
      /**
       * Add a new role to the project
       */
      $scope.add = function () {
        //Validate new role
        var errors = $scope.validateNewRole();
        if(errors.length > 0){
        	$scope.addRoleMessages = errors;
        }
        else{
	        // Bubble an event up to add this role.
	        $scope.$emit('roles:add', $scope.newRole);
	        
	
	        //Update the tables
	        $scope.roleTableParams.reload();
	
	        // Create the new Role with the previously selected rate type.
	        $scope.newRole = RolesService.create({rate: RateFactory.build($scope.newRole.rate.type)});
	
	        //Clear any messages
	        $scope.addRoleMessages = [];
	        
	        
	        // Reset the form to being pristine.
	        $scope.rolesForm.$setPristine();
        }
      };

      /**
       * Remove a role from the project
       */
      $scope.remove = function (role) {
        // Bubble up an event to handle removing a role elsewhere
        $scope.$emit('roles:remove', role);

        //Update the tables
        $scope.roleTableParams.reload();
      };

      $scope.$watch(function () {
        return $scope.project.roles.length;
      }, function (newLength) {
        $scope.$emit('roles:valid:change', newLength > 0);
      });

      $scope.assigneeChanged = function(index, role) {
        console.log('assigneeChanged');
        console.log('param index:' + index);
        console.log('param role:');
        console.log(role);

        $scope.$emit('roles:change');
      };

      $('.datepicker').on('hide', function(ev){
        $scope.$apply();
      });

    }]);