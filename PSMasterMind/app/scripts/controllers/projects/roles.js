'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.projects')
  .controller('RolesCtrl',
    function ($scope, RolesService, RoleTypes, Rates, RateFactory) {
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

      /**
       * Add a new role to the project
       */
      $scope.add = function () {
        //Validate new role
        //Business Rule: Hourly Rate Assumes 100% utilization
        if ($scope.newRole.rate.hoursPerMonth != null) {
          $scope.newRole.rate.fullyUtilized = true;
        }

        // Bubble an event up to add this role.
        $scope.$emit('roles:add', $scope.newRole);

        // Create the new Role with the previously selected rate type.
        $scope.newRole = RolesService.create({rate: RateFactory.build($scope.newRole.rate.type)});

        // Reset the form to being pristine.
        $scope.rolesForm.$setPristine();
      };

      /**
       * Remove a role from the project
       */
      $scope.remove = function (role) {
        // Bubble up an event to handle removing a role elsewhere
        $scope.$emit('roles:remove', role);
      };

      $scope.$watch(function () {
        return $scope.project.roles.length;
      }, function (newLength) {
        $scope.$emit('roles:valid:change', newLength > 0);
      });
    });