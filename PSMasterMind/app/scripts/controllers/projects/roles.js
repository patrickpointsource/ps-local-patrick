'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.projects')
  .controller('RolesCtrl', ['$scope', '$filter', '$q', 'RolesService', 'RoleTypes', 'Rates', 'RateFactory', 'ngTableParams',
    function ($scope, $filter, $q, RolesService, RoleTypes, Rates, RateFactory, TableParams) {
        
      $scope.editingRole = false;
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
      
	  
	  $scope.handleRoleTypeChanged = function(){
		  var type = $scope.newRole.type.resource;
		  var roleType = $scope.roleGroups[type];
		  
		  var rateType = $scope.newRole.rate.type;
		  if(rateType == Rates.MONTHLY){
			  $scope.newRole.rate.amount =  roleType.monthlyAdvertisedRate;
		  }else{
			  $scope.newRole.rate.amount =  roleType.hourlyAdvertisedRate;
		  }
	  }

      /**
       * Change the rate type on the new role to the specified new rate type
       *
       * @param newRateType
       */
      function changeRateType(newRateType) {
        $scope.newRole.changeType(newRateType);
        
        $scope.handleRoleTypeChanged();
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
    	return RolesService.validateNewRole($scope.project, $scope.newRole);
      };

      $scope.displayHours = function(role){
    	  var ret = '';
    	  if(role.rate.fullyUtilized){
    		  if(role.rate.type == Rates.WEEKLY){
        		  ret = '100% Weekly';
        	  }
        	  else if(role.rate.type == Rates.HOURLY){
        		  ret = '100% Hourly';  
        	  }
        	  else if(role.rate.type == Rates.MONTHLY){
        		  ret = '100% Monthly';  
        	  }
    	  }
    	  else if(role.rate.type == Rates.WEEKLY){
    		  ret = role.rate.hours + ' per week';
    	  }
    	  else if(role.rate.type == Rates.HOURLY){
    		  ret = role.rate.hours + ' per month';  
    	  }
    	  return ret;
      };

      $scope.cancelAdd = function () {
        $('#newRoleDialog').collapse('hide');
      };

      $scope.triggerAddRole = function () {
        $scope.editingRole = false;
        $('#newRoleDialog').collapse('show');
        $scope.newRole = RolesService.create();
        $scope.newRole.startDate = $scope.project.startDate;
        $scope.newRole.endDate = $scope.project.endDate;
      };

      $scope.triggerEditRole = function (role, index) {
        $scope.editingRole = true;
        $scope.editRoleIndex = index;
        $('#newRoleDialog').collapse('show');
        $scope.newRole = role;
      };

      $scope.save = function () {
        //Validate new role
        var errors = $scope.validateNewRole();
        if(errors.length > 0){
          $scope.addRoleMessages = errors;
        }
        else{
          // Bubble an event up to add this role.
          $scope.$emit('roles:change', $scope.editRoleIndex, $scope.newRole);

          //Update the tables
          $scope.roleTableParams.reload();

          // Create the new Role with the previously selected rate type.
          $scope.newRole = RolesService.create(
            {
              startDate:$scope.project.startDate, 
              endDate:$scope.project.endDate,
              rate: RateFactory.build($scope.newRole.rate.type)
            }
          );

          //Clear any messages
          $scope.addRoleMessages = [];

          // Reset the form to being pristine.
          $scope.rolesForm.$setPristine();
          $('#newRoleDialog').collapse('hide');
        }
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
	        $scope.newRole = RolesService.create(
	        	{
	        		startDate:$scope.project.startDate, 
	        		endDate:$scope.project.endDate,
	        		rate: RateFactory.build($scope.newRole.rate.type)
	        	}
	        );

	        //Clear any messages
	        $scope.addRoleMessages = [];

	        // Reset the form to being pristine.
	        $scope.rolesForm.$setPristine();
          $('#newRoleDialog').collapse('hide');
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
//        console.log('assigneeChanged');
//        console.log('param index:' + index);
//        console.log('param role:');
//        console.log(role);

        $scope.$emit('roles:change');
      };

      $('.datepicker').on('hide', function(ev){
        $scope.$apply();
      });

      $scope.isFieldInError = function (fieldName) {
        var rolesFormField = $scope.rolesForm[fieldName];
        return (rolesFormField.$dirty
          || ($scope.submitAttempted && rolesFormField.$pristine))
          && rolesFormField.$invalid;
      };

    }]);