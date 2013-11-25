'use strict';

/*
 * Controller for navigating through areas of MasterMind like its dashboard,
 * projects, people, and roles.
 */
angular.module('PSMasterMindApp').controller('AreasCtrl', ['$scope', '$state',
  function ($scope, $state) {
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