'use strict';

/**
 * New Project Controller
 */
angular.module('PSMasterMindApp')
  .controller('EditProjectCtrl', ['$scope', '$state', '$stateParams', 'ngTableParams', 'Projects',
    function ($scope, $state, $stateParams, ngTableParams, Projects) {
      // Default the new project
      $scope.project = Projects.get($stateParams.projectId);

      var defaultTab = 'details';
      // Set the active tab to the one specified in the location
      $scope.activeTab = $stateParams.activeTab || defaultTab;

      $scope.showDetails = function () {
        $state.go('projects.show/tab', {
          activeTab: 'details'
        });
      };

      $scope.showRoles = function () {
        $state.go('projects.show/tab', {
          activeTab: 'roles'
        });
      };

      $scope.showAssignments = function () {
        $state.go('projects.show/tab', {
          activeTab: 'assignments'
        });
      };

      $scope.showSummary = function () {
        $state.go('projects.show/tab', {
          activeTab: 'summary'
        });
      };
    }]);