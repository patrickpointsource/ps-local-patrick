'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('PSMasterMindApp')
  .controller('EditProjectCtrl', ['$scope', '$state', '$stateParams', 'ngTableParams', 'Projects', 'project',
    function ($scope, $state, $stateParams, ngTableParams, Projects, project) {
      // Set our currently viewed project to the one resolved by the service.
      $scope.project = project;

      // The title of the page is the project's name.
      $scope.title = project.name;

      var defaultTab = 'details';
      // Set the active tab to the one specified in the location
      $scope.activeTab = $stateParams.activeTab || defaultTab;

      /**
       * Save the loaded project.
       */
      $scope.save = function () {
        Projects.save(project);
      };

      /*
       * View the Details tab.
       */
      $scope.showDetails = function () {
        $state.go('projects.show.tab', {
          activeTab: 'details'
        });
      };

      /*
       * View the Roles tab.
       */
      $scope.showRoles = function () {
        $state.go('projects.show.tab', {
          activeTab: 'roles'
        });
      };

      /*
       * View the Assignments tab.
       */
      $scope.showAssignments = function () {
        $state.go('projects.show.tab', {
          activeTab: 'assignments'
        });
      };

      /*
       * View the summary tab.
       *
       * TODO: Add validation to ensure the required fields are complete
       */
      $scope.showSummary = function () {
        $state.go('projects.show.tab', {
          activeTab: 'summary'
        });
      };
    }]);