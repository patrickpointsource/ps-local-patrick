'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('ProfileCtrl', ['$scope', '$state', '$stateParams', '$filter', 'Resources', 'People', 'ngTableParams',
    function ($scope, $state, $stateParams, $filter, Resources, People, TableParams) {
	  $scope.profileId = $stateParams.profileId;
	  $.when(Resources.get('people/'+$scope.profileId)).then(function(person){
		 $scope.profile = person;
		 
		 var query = {'roles.assignee':{resource:person.about}};
		 var fields = {resource:1,name:1};
		 
		 Resources.query('projects', query, fields, function(result){
			 $scope.projects = result.data;
			 $scope.hasProjects = result.data.length > 0;
			 
			  // Table Parameters
		      var params = {
		        page: 1,            // show first page
		        count: 10,           // count per page
		        sorting: {
		          name: 'asc'     // initial sorting
		        }
		      };
		      $scope.tableParams = new TableParams(params, {
		        counts: [],
		        total: $scope.projects.length, // length of data
		        getData: function ($defer, params) {
		          var start = (params.page() - 1) * params.count(),
		            end = params.page() * params.count(),

		          // use build-in angular filter
		            orderedData = params.sorting() ?
		              $filter('orderBy')($scope.projects, params.orderBy()) :
		            	  $scope.projects,

		              ret = orderedData.slice(start, end);
		             
		              
		          $defer.resolve(ret);
		        }
		      });
			 
		 });
	  });
	  
	  
	  
	  
	  

	 
  }]);