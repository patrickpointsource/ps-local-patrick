'use strict';

/**
 * The main project controller
 */
angular.module('PSMasterMindApp')
  .controller('MainCtrl', ['$scope', '$location', 'Projects', 'People', 
      function ($scope, $location, Projects, People) {
	  $scope.projects = Projects.get();
	  
	  $scope.clearData = function(){
		//Clear local storage
		localStorage.clear();
		
		$scope.projects = Projects.get();
	  };
	  
	  /**
	   * Navigate to another page
	   */
	  $scope.go = function ( path ) {
		  $location.path( path );
	  };
 }]);


