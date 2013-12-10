'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('PeopleCtrl', ['$scope', '$state', '$filter', 'Resources', 'People', 'ngTableParams', 'result',
    function ($scope, $state, $filter, Resources, People, TableParams, result) {
      $scope.result = result;
      $scope.people = result.members;
      
      $scope.getPeople = function(){
    	  return People.getActivePeople();  
      
      };
      
      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
          familyName: 'asc'     // initial sorting
        }
      };
      $scope.tableParams = new TableParams(params, {
        total: $scope.people.length, // length of data
        getData: function ($defer, params) {
        	var data = $scope.people
       
          var start = (params.page() - 1) * params.count();
          var end = params.page() * params.count();

          // use build-in angular filter
          var orderedData = params.sorting() ?
            $filter('orderBy')(data, params.orderBy()) :
            data;

          var ret = orderedData.slice(start, end);
          $defer.resolve(ret);
         
        }
      });
      
      /**
       * Changes list of people on a filter change
       */
      $scope.handlePeopleFilterChanged = function(){
	      if($scope.peopleFilter == 'available'){
		      People.getActivePeople(function(people){
		    	  $scope.people = people;
		    	  
		    	  //Reload the table
			      $scope.tableParams.reload();
		      });
      	  }
	      else{
	    	  $scope.peopleFilter = 'all';
	    	  
	    	  $scope.people = result.members;
	    	  //Reload the table
		      $scope.tableParams.reload();
	      }
      };
      /**
       * Get Filter Param
       */
      $scope.peopleFilter = $state.params.filter?$state.params.filter:'all';
      //Trigger inital filter change
      $scope.handlePeopleFilterChanged();
    }]);