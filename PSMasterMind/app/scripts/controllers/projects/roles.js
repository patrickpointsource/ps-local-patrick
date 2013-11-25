'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('PSMasterMindApp').controller('RolesCtrl', ['$scope', 'RolesService',
  function ($scope, RolesService) {
    $scope.newRole = RolesService.create();

    // On Role Rate Change
    $scope.changeRateType = function (newRateType) {
      $scope.newRoleRateType = newRateType;

      $scope.newRole.changeType(newRateType);
    };

    // Add a new role to the project
    $scope.add = function () {
      // Bubble an event up to add this role.
      $scope.$emit('roles:add', $scope.newRole);

      // Create the new Role
      $scope.newRole = RolesService.create();
    };
  }]);