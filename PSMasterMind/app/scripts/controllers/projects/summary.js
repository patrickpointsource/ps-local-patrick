'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.projects')
  .controller('SummaryCtrl', ['$scope', '$filter', 'Resources', 'People', 'ngTableParams',
    function ($scope, $filter, Resources, People, TableParams) {
	  // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
        	type: 'asc'     // initial sorting
        }
      };
      
      $scope.summaryRolesTableParams = new TableParams(params, {
        total: $scope.project.roles.length,
        getData: function ($defer, params) {
          var start = (params.page() - 1) * params.count();
          var end = params.page() * params.count();

          var orderedData = params.sorting() ?
                $filter('orderBy')($scope.project.roles, params.orderBy()) :
                $scope.project.roles;
          
          //use build-in angular filter
          var result = orderedData.slice(start, end);
          
          var defers = [];
          var ret = [];
          for(var i = 0; i < result.length; i++){
        	  var ithRole = Resources.deepCopy(result[i]);
        	  if(ithRole.assignee && ithRole.assignee.resource){
        		  defers.push(Resources.resolve(ithRole.assignee));
        		  //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
        	  }
        	  
        	  if(ithRole.type && ithRole.type.resource){
        		  defers.push(Resources.resolve(ithRole.type));
        		  //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
        	  }
        	  
        	  ret[i] = ithRole;
          }
	
	      $.when.apply(window, defers).done(function(){
	    	  $defer.resolve(ret);
	      });
        }
      });
    }]);