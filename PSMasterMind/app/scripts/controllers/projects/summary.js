'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('PSMasterMindApp').controller('SummaryCtrl', ['$scope', 'People', 'ngTableParams',
     function ($scope, People, ngTableParams) {
	People.query().then(function(people){
		$scope.people = people;
	})
}]);