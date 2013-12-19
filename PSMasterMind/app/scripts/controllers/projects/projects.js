'use strict';

/**
 * Controller for handling the list of projects.
 */
angular.module('Mastermind.controllers.projects')
  .controller('ProjectsCtrl', [ '$scope', '$state', '$filter', 'ngTableParams', 'Resources', 'projects', 'ProjectsService',
    function ($scope, $state, $filter, TableParams, Resources, projects, ProjectsService) {

	  //Default to no projects
	  $scope.projects = [];
	  
	  $scope.handleProjectFilterChanged = function(){
    	var filter = $scope.projectFilter;
    	//Filter just the active projects
    	if(filter == 'active'){
    		 //Get todays date formatted as yyyy-MM-dd
    	      var today = new Date();
    	      var dd = today.getDate();
    	      var mm = today.getMonth()+1; //January is 0!
    	      var yyyy = today.getFullYear();
    	      if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = yyyy+'-'+mm+'-'+dd;
    	      
    	      var apQuery = {startDate:{$lte:today},$or:[{endDate:{$exists:false}},{endDate:{$gt:today}}]};
    	      var apFields = {resource:1,name:1,"roles.assignee":1};
    	      
    	      Resources.query('projects', apQuery, apFields, function(result){
    	    	  $scope.projects = result.data;
    	    	  //Reload the Table
    	    	  $scope.tableParams.reload();
    	      });
    	}
    	else{
		  //Default to all
		  $scope.projectFilter = 'all';
      	  
		  Resources.query('projects', {}, {resource:1,name:1}, function(result){
      		  $scope.projects = result.data;
      		  //Reload the table with data
      		  $scope.tableParams.reload();
    	   });
      	}
      };
	  
      $scope.projectFilter = $state.params.filter?$state.params.filter:'all';
      $scope.handleProjectFilterChanged();
      
      /**
       * Navigate to creating a project.
       */
      $scope.createProject = function () {
        $state.go('projects.new');
      };

      $scope.deleteProject = function (project) {
        ProjectsService.destroy(project).then(function () {
        	$scope.handleProjectFilterChanged();
        });
      };
      
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

    }]);