'use strict';

/**
 * Used for services configuration properties
 */

angular.module('Mastermind').controller('ConfigCtrl', ['$scope', '$filter', '$q', 'Resources', 'ngTableParams',
   function ($scope, $filter, $q, Resources, TableParams) {
		var params = {
		  page: 1,            // show first page
		  count: -1,           // hide pagination
		  sorting: {
		    type: 'asc'     // initial sorting
		  }
		};
	
		Resources.refresh('config/services').then(function(result) {
			$scope.config = result;
			$scope.configTableParams = new TableParams(params,{
				total: $scope.config.properties.length, // length of data
				counts: [], // hide items per page
				getData: function ($defer, params) {
					$defer.resolve($scope.config);
				}
			});
		});
	

}]);