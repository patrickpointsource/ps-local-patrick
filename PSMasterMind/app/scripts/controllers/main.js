'use strict';

/**
 * The main project controller
 */
angular.module('PSMasterMindApp')
  .controller('MainCtrl', ['$scope', '$state', '$filter', 'projects',
    function ($scope, $state, $filter, projects) {
      $scope.today = $filter('date')(new Date());

      $scope.projectCount = projects.length;

      /**
       * Navigate to creating a project.
       */
      $scope.createProject = function () {
        $state.go('projects.new');
      };

      /**
       * Navigate to view a list of active projects.
       */
      $scope.showProjects = function () {
        $state.go('projects.index');
      };

      /**
       * Navigate to view a list of people who can be assigned to projects.
       */
      $scope.showPeople = function () {
        $state.go('people');
      };
    }]);


