'use strict';

angular.module('PSMasterMindApp').controller('RolesCtrl', ['$scope', '$location', 'ngTableParams', 'Projects', 'People', 'Roles', '$stateParams',
  function ($scope, $location, ngTableParams, Projects, People, Roles, $stateParams) {
    $scope.newRole = Roles.current();

    var defaultRoleRateType = 'hourly';
    $scope.newRoleRateType = $stateParams.newRoleRateType || defaultRoleRateType;

    // On Role Rate Change
    $scope.changeRateType = function (newRateType) {
      $scope.newRoleRateType = newRateType;

      $scope.newRole.changeType(newRateType);
    };

    // Add a new role to the project
    $scope.add = function () {
      // TODO Validate Input

      // Bubble an event up to add this role.
      $scope.$emit('roles:add', $scope.newRole);

      // Create the new Role
      $scope.newRole = Roles.create();
    };
  }]);