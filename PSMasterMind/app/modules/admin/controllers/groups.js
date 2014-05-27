'use strict';

/**
 * Controller for handling the Groups tab in admin.
 */
angular.module('Mastermind').controller('GroupsCtrl',['$scope', 
                                                      '$rootScope', 
                                                      '$filter', 
                                                      'Resources', 
                                                      '$state', 
                                                      '$stateParams', 
                                                      'ngTableParams',
                                            function ($scope, 
                                            		  $rootScope, 
                                            		  $filter, 
                                            		  Resources, 
                                            		  $state, 
                                            		  $stateParams, 
                                            		  ngTableParams) {
   
	    
	    /**
	     * Get the list of people
	     * if person belongs in group, inject them into the group object
	     * 
	     * Currently Hard coded as {'Executives', 'Management', 'Project Management', 'Sales'}
	     */
	    
	    Resources.refresh('people').then(function(result){
	        $scope.members = result.members;
	        $scope.memberCount = result.count;
	        $scope.groups = [{label: 'Executives', members: []}, 
	    	                 {label: 'Management', members: []}, 
	    	                 {label: 'Project Management', members: []}, 
	    	                 {label: 'Sales', members: []}];
	        //Map the labels of the groups so I can match faster
	        var groupsMap = {};
	        $scope.groups.forEach(function(entry) {
	        	groupsMap[entry.label] = entry;
	        });
	        
	        // Count the number of entries into groups
	        var rowCount = 0;

	        for ( var i = 0 ; i < $scope.memberCount ; i++ ) {
	            var member = $scope.members[ i ];
	            if(member.groups) {
	            	for (var group in member.groups) {
	            		// Match the group label
	            		var groupLabel = member.groups[ group ];
	            		// push the member into the group
	            		groupsMap[ groupLabel ].members.push(member);
	            		rowCount++;
	            	}
	            }
	        }
	        $scope.tableParams = new ngTableParams({
	            page: 1,            // show first page
	            count: 10          // count per page
	        }, {
	            groupBy: 'groups',
	            total: rowCount,
	            getData: function($defer, params) {
	              var orderedData = params.sorting() ?
	                      $filter('orderBy')($scope.groups, $scope.tableParams.orderBy()) :
	                    	  $scope.groups;

	              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), 
	            		  		 params.page() * params.count()));
	            }
	        });
	    });

}]);


// Minimizes the Management group - added in case they want all collapsed at start
angular.module('Mastermind').controller('groupRowCtrl', ['$scope',
                                            function ($scope) {
	  if ($scope.group.label != 'Management')
	    $scope.groups.$hideRows = true;
}]);
