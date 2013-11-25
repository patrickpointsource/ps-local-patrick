'use strict';

/**
 * The main project controller
 */
angular.module('PSMasterMindApp')
  .controller('MainCtrl', ['$scope', '$state', '$filter',
    function ($scope, $state, $filter) {
      $scope.today = $filter('date')(new Date());

      $scope.createProject = function () {
        $state.go('projects.new');
      };
    }]);


