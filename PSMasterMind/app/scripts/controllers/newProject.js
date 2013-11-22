'use strict';

/**
 * New Project Controller
 */
angular.module('PSMasterMindApp')
  .controller('NewProjectCtrl', ['$scope', '$location', 'ngTableParams', 'Projects', 'People', '$stateParams',
    function ($scope, $location, TableParams, Projects, People, $stateParams) {
      // Default the new project
      $scope.project = Projects.current();

      var defaultTab = 'details';
      // Set the active tab to the one specified in the location
      $scope.activeTab = $stateParams.activeTab || defaultTab;

      /**
       * Save the New Project
       */
      $scope.save = function () {
        Projects.save($scope.project);
        $scope.go('/home');
      };

      /**
       * Get the list of people
       */
      $scope.people = People.get();

      // Role Parameters
      $scope.roleTableParams = new TableParams({
        page: 1, // show first page
        count: 10
        // count per page
      }, {
        counts: [], // hide page counts control
        total: $scope.project.roles.length, // value less
        // than count
        // hide pagination
        getData: function ($defer, params) {
          var data = $scope.project.roles;
          $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

      /**
       * Navigate to another page
       */
      $scope.go = function (path) {
        $location.path(path);
      };

      $scope.showDetails = function () {
        $location.path('/projects/new/details');
      };

      $scope.showRoles = function () {
        $location.path('/projects/new/roles');
      };

      $scope.showAssignments = function () {
        $location.path('/projects/new/assignments');
      };

      $scope.showSummary = function () {
        $location.path('/projects/new/summary');
      };

      $scope.$on('roles:add', function (event, role) {
        $scope.project.addRole(role);
      });
    }]);