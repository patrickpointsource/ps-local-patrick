'use strict';

/**
 * Controller for handling the list of projects.
 */
angular.module('Mastermind.controllers.projects')
  .controller('ProjectsCtrl', [ '$scope', '$state', '$filter', '$location', 'ngTableParams', 'ProjectsService','Resources',
  function ($scope, $state, $filter, $location, TableParams, ProjectsService, Resources) {

    //Default to no projects
    $scope.projects = [];

    $scope.handleProjectFilterChanged = function(){
      var filter = $scope.projectFilter;
      // project entity columns which must be displkaye don UI
      var apFields = {resource:1,name:1,'roles.assignee':1,customerName:1,committed:1,type:1,description: 1};
      
      //Filter just the active projects
      if (filter === 'active'){       
        ProjectsService.getActiveClientProjects(reloadProjects);
      }
      else if (filter === 'backlog'){       
          ProjectsService.getBacklogProjects(reloadProjects);
      }
      else if (filter == 'pipeline') {
          ProjectsService.getPipelineProjects(reloadProjects);
      }
      else if (filter == 'investment') {
          ProjectsService.getInvestmentProjects(reloadProjects);
      }
      else if (filter == 'completed') {
          ProjectsService.getCompletedProjects(reloadProjects);
      }
      else if (filter == 'deallost') {
          ProjectsService.getDealLostProjects(reloadProjects);
      }
      else {
        //Default to all
        $scope.projectFilter = 'all';

        ProjectsService.getAllProjects(reloadProjects);
      }
      
      //Replace the URL in history with the filter
      if($scope.projectFilter != $state.params.filter){
	      var updatedUrl = $state.href('projects.index', { filter: $scope.projectFilter}).replace('#', '');
	      $location.url(updatedUrl).replace();
      }
    };
    
    /**
     * Reload the Projects listing table.
     */
    function reloadProjects(result) {
        $scope.projects = result.data;
//        //Reload the table
//        if (!$scope.tableParams){
//          $scope.tableParams = $scope.getTableData();
//        }
//        else {
//          $scope.tableParams.total($scope.projects.length);
//          $scope.tableParams.reload();
//        }
    };

    $scope.toggleTableView = function() {
	    if ($scope.showGraphView) {
	      $scope.showTableView = !$scope.showTableView;
	      $scope.showGraphView = !$scope.showGraphView;
	    }
	};

	$scope.toggleGraphView = function() {
		if ($scope.showTableView) {
			$scope.showGraphView = !$scope.showGraphView;
			$scope.showTableView = !$scope.showTableView;
		}
	};
    
    /**
     * Navigate to creating a project.
     */
    $scope.createProject = function () {
      $state.go('projects.new');
    };
    
    $scope.startDate = new Date();
    var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    /**
     * display the month name from a month number (0 - 11)
     */
    $scope.getMonthName = function(monthNum) {
      if (monthNum > 11) {
        monthNum = monthNum - 12;
      }
      return monthNamesShort[monthNum];
    };

    /**
     * Calculates whether the project exists within a particular month.
     *
     * @param project
     * @param month
     */
    $scope.inMonth = function (project, month, year) {
      var nextMonth = month === 11 ? 0 : (month + 1),
        nextYear = month === 11 ? (year + 1) : year,
        startDay = new Date(year, month, 1),
        endDay = new Date(nextYear, nextMonth, 0);

      // If the project start day is before the last day of this month
      // and its end date is after the first day of this month.
      var projectStarted =   new Date(project.startDate) <= endDay;
      var projectEnded = project.endDate &&  new Date(project.endDate) <= startDay;
      var returnValue =  projectStarted && !projectEnded;
      return returnValue;
    };

//    $scope.getTableData = function () {
//      // Table Parameters
//      var params = {
//        page: 1,            // show first page
//        count: 100,           // count per page
//        sorting: {
//          customerName: 'asc'     // initial sorting
//        }
//      };
//      return new TableParams(params, {
//        counts: [],
//        total: $scope.projects.length, // length of data
//        getData: function ($defer, params) {
//          var orderedData = params.sorting() ? $filter('orderBy')($scope.projects, params.orderBy()) : $scope.projects;
//
//          var ret = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
//          
//          for(var i =0; i < ret.length;i++){
//        	  var ith = ret[i];
//        	  ith.title = ith.customerName + ': ' + ith.name;
//          }
//          
//          $defer.resolve(ret);
//        }
//      });
//    };
    
    $scope.projectFilter = $state.params.filter ? $state.params.filter:'all';
    $scope.showTableView = $state.params.view?$state.params.view=='table':true;
    $scope.showGraphView = $state.params.view?$state.params.view=='graph':false;
    $scope.handleProjectFilterChanged();

  }]);