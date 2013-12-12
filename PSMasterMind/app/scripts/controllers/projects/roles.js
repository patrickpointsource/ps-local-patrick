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

        //Update the tables
        $scope.roleTableParams.reload();

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

    }]);