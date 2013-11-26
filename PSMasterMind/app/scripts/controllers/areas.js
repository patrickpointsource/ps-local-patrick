'use strict';

/*
 * Controller for navigating through areas of MasterMind like its dashboard,
 * projects, people, and roles.
 */
angular.module('PSMasterMindApp').controller('AreasCtrl', ['$scope', '$state',
  function ($scope, $state) {

    /**
     * Determine the active area of the application for the user.
     *
     * @returns {string}
     */
    function activeArea() {
      // default the value in case none of the states match.
      var area = 'home';

      if ($state.includes('projects')) {
        area = 'projects';
      } else if ($state.includes('people')) {
        area = 'people';
      }

      return area;
    }

    $scope.activeArea = activeArea;

    /*
     * Navigate to the dashboard.
     */
    $scope.showHome = function () {
      $state.go('home');
    };

    /*
     * Navigate to the projects index.
     */
    $scope.showProjects = function () {
      $state.go('projects.index');
    };

    /*
     * Navigate to the projects index.
     */
    $scope.showPeople = function () {
      $state.go('people');
    };
  }]);