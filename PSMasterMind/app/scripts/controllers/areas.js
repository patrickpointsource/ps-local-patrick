'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, and roles.
 */
angular.module('Mastermind').controller('AreasCtrl', ['$scope', '$state','Resources',
  function ($scope, $state, Resources) {
	
	//Load my profile for group and role checking
    Resources.refresh('people/me').then(function(me){
	  	 $scope.me = me; 
    });

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
      } else if ($state.includes('admin')) {
        area = 'admin';
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
      $state.go('people.index');
    };
    
    /*
     * Navigate to the projects index.
     */
    $scope.showAdmin = function () {
      $state.go('admin');
    };
  }]);