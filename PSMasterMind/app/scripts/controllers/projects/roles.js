'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.projects')
  .controller('RolesCtrl', ['$scope', 'RolesService', 'RoleTypes', 'Rates',
    function ($scope, RolesService, RoleTypes, Rates) {
      $scope.newRole = RolesService.create();

      RoleTypes.query().then(function (data) {
        console.log("Role Types = " + data);
        $scope.roleTypes = data;
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

      // Add a new role to the project
      $scope.add = function () {
        //Validate new role
        //Business Rule: Hourly Rate Assumes 100% utilization
        if ($scope.newRole.rate.hoursPerMonth != null) {
          $scope.newRole.rate.fullyUtilized = true;
        }

        // Bubble an event up to add this role.
        $scope.$emit('roles:add', $scope.newRole);

        // Create the new Role with the previously selected rate type.
        $scope.newRole = RolesService.create($scope.newRole.rate.type);

        // Reset the form to being pristine.
        $scope.rolesForm.$setPristine();
      };
    }]);