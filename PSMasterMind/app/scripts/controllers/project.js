'use strict';

/**
 * New Project Controller
 */
angular.module('PSMasterMindApp').controller(
  'ProjectCtrl',  ['$scope','$location', '$routeParams', 'ngTableParams', 'Projects', 'People', 
              function($scope, $location, $routeParams, ngTableParams, Projects, People) {
	// Default the new project
	$scope.project = Projects.get($routeParams.id);
	
	/**
	 * Save the New Project
	 */
	$scope.save = function(){
		Projects.update($scope.project);
		$scope.go('/home');
	}
}]);