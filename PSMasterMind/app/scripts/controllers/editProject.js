'use strict';

/**
 * New Project Controller
 */
angular.module('PSMasterMindApp').controller(
  'EditProjectCtrl',  ['$scope','$location', '$routeParams', 'ngTableParams', 'Projects', 'People', 
              function($scope, $location, $routeParams, ngTableParams, Projects, People) {
	// Default the new project
	$scope.project = Projects.get($routeParams.id);
}]);