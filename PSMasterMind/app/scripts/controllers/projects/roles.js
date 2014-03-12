'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.projects')
  .controller('RolesCtrl', ['$scope', '$filter', '$q', 'RolesService', 'Resources', 'RoleTypes', 'Rates', 'RateFactory', 'ngTableParams',
  function ($scope, $filter, $q, RolesService, Resources, RoleTypes, Rates, RateFactory, TableParams) {

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

    /**
     * Role rate type has changed in the UI (ripple)
     */
    $scope.handleRoleTypeChanged = function(){
      var type = $scope.newRole.type.resource;
      var roleType = $scope.roleGroups[type];

      var rateType = $scope.newRole.rate.type;
      if(rateType === Rates.MONTHLY){
        $scope.newRole.rate.amount =  roleType.monthlyAdvertisedRate;
        $scope.newRole.rate.advAmount =  roleType.monthlyAdvertisedRate;
      }
      else{
        $scope.newRole.rate.amount =  roleType.hourlyAdvertisedRate;
        $scope.newRole.rate.advAmount =  roleType.hourlyAdvertisedRate;
      }
    };

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


    $scope.cancelAdd = function () {
      //Close the new role dialog instance
      if($('#newRoleDialog').hasClass('in')){
        $('#newRoleDialog').collapse('hide');
      }

      $scope.editingRole = false;
      $scope.editRoleIndex = null;
    };

    /**
     * When the new role button is clicked
     */
    $scope.triggerAddRole = function () {
      if($scope.editRoleIndex === null && $scope.editingRole){
        $scope.cancelAdd();
      }
      else{
        $scope.editRoleIndex = null;
        $scope.editingRole = true;

        $scope.newRole = RolesService.create();
        $scope.newRole.startDate = $scope.project.startDate;
        $scope.newRole.endDate = $scope.project.endDate;
      }
    };
    
    $scope.triggerDuplicateRole = function (role, index) {
    	 // Create the new Role with the previously selected rate type.
        var newRole = RolesService.create(
          {
            startDate:role.startDate,
            endDate:role.endDate,
            rate: Resources.deepCopy(role.rate),
            shore: role.shore,
            type:Resources.deepCopy(role.type)
          }
        );
    	
    	 // Bubble an event up to add this role.
        $scope.$emit('roles:add', newRole);

        //Update the tables
        $scope.roleTableParams.total($scope.project.roles.length);
        $scope.roleTableParams.reload();
    };

    /**
     *
     */
    $scope.triggerEditRole = function (role, index) {
      if($scope.editRoleIndex === index && $scope.editingRole){
        $scope.cancelAdd();
      }
      else{
        //Close the new role dialog instance
        if($('#newRoleDialog').hasClass('in')){
          $('#newRoleDialog').collapse('hide');
        }

        $scope.editingRole = true;
        $scope.editRoleIndex = index;

        $scope.newRole = role;
      }
    };

    /**
     * Update an existing role deinition
     */
    $scope.save = function () {
      //Validate new role
      var errors = $scope.validateNewRole();
      if (errors.length > 0){
        $scope.addRoleMessages = errors;
      }
      else {
        // Bubble an event up to add this role.
        $scope.$emit('roles:change', $scope.editRoleIndex, $scope.newRole);

        //Update the tables
        $scope.roleTableParams.total($scope.project.roles.length);
        $scope.roleTableParams.reload();

        // Create the new Role with the previously selected rate type.
        $scope.newRole = RolesService.create({
          startDate:$scope.project.startDate,
          endDate:$scope.project.endDate,
          rate: RateFactory.build($scope.newRole.rate.type)
        });

        $scope.editingRole = false;
        $scope.editRoleIndex = null;

        //Clear any messages
        $scope.addRoleMessages = [];

        // Reset the form to being pristine.
        $scope.rolesForm.$setPristine();
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
        $scope.roleTableParams.total($scope.project.roles.length);
        $scope.roleTableParams.reload();

        // Create the new Role with the previously selected rate type.
        $scope.newRole = RolesService.create(
          {
            startDate:$scope.project.startDate,
            endDate:$scope.project.endDate,
            rate: RateFactory.build($scope.newRole.rate.type)
          }
        );

        $scope.editingRole = false;
        $scope.editRoleIndex = null;

        //Clear any messages
        $scope.addRoleMessages = [];

        // Reset the form to being pristine.
        $scope.rolesForm.$setPristine();
        //Close the new role dialog instance
        if($('#newRoleDialog').hasClass('in')){
          $('#newRoleDialog').collapse('hide');
        }
      }
    };

    /**
     * Remove a role from the project
     */
    $scope.remove = function (role) {
      // Bubble up an event to handle removing a role elsewhere
      $scope.$emit('roles:remove', role);

      //Update the tables
      $scope.roleTableParams.total($scope.project.roles.length);
      $scope.roleTableParams.reload();
    };
	
    /**
     * Update an existing role deinition
     */
    $scope.refreshAdvAmount = function () {
        var type = $scope.newRole.type.resource;
        var roleType = $scope.roleGroups[type];

        var rateType = $scope.newRole.rate.type;
        if(rateType === Rates.MONTHLY){
          $scope.newRole.rate.advAmount =  roleType.monthlyAdvertisedRate;
        }
        else{
          $scope.newRole.rate.advAmount =  roleType.hourlyAdvertisedRate;
        }
    };
    
    $scope.$watch(function () {
      return $scope.project.roles.length;
    }, function (newLength) {
      $scope.$emit('roles:valid:change', newLength > 0);
    });

    $scope.assigneeChanged = function() {
      $scope.$emit('roles:change');
    };

    $('.datepicker').on('hide', function(){
      $scope.$apply();
    });
    

    $scope.isFieldInError = function (fieldName) {
      var rolesFormField = $scope.rolesForm[fieldName];
      return (rolesFormField.$dirty || ($scope.submitAttempted && rolesFormField.$pristine)) &&
        rolesFormField.$invalid;
    };

  }]);