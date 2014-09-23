'use strict';

/**
 * Used for services configuration properties
 */

angular.module('Mastermind').controller('ConfigCtrl', ['$scope', '$filter', '$q', 'Resources',
   function ($scope, $filter, $q, Resources) {

		$scope.editIndex = null;
		
		$scope.edit = function(index) {
			if($scope.editIndex == index) {
				$scope.editIndex = null;
			} else {
				$scope.editIndex = index;
			}
		};
		
		$scope.save = function(index) {
			$scope.config.resource = 'config/services';
			Resources.update($scope.config).then(function(result) {
				$scope.refreshConfig();
			});
			
			$scope.editIndex = null;
		};
		
		$scope.cancel = function() {
			$scope.editIndex = null;
			$scope.refreshConfig();
		};
		
		$scope.config = {};
		
		$scope.refreshConfig = function() {
			Resources.refresh('config/services').then(function(result) {
				$scope.config = result;
				
				if ($scope.config.properties)
    				$scope.config.properties.sort(function(p1, p2){
    				    if (p1.name > p2.name)
    				        return 1;
    				    else if (p1.name < p2.name)
                            return -1;
                        return 0;
    				});
			});
		};
		
		$scope.refreshConfig();
}]);