'use strict';

/**
 * Controller for handling the list of projects.
 */
angular.module('Mastermind.controllers.projects')
  .controller('ProjectsCtrl', [ '$scope', '$state', '$filter', '$location', 'ngTableParams', 'ProjectsService','Resources',
  function ($scope, $state, $filter, $location, TableParams, ProjectsService, Resources) {

    //Default to no projects
    $scope.projects = [];
    
    $scope.fillStatuses = function() {
    	
    }
    
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
      else if (filter == 'completed' || filter == 'complete') {
          ProjectsService.getCompletedProjects(reloadProjects);
      }
      else if (filter == 'deallost') {
          ProjectsService.getDealLostProjects(reloadProjects);
      }
      // in case of complex filter, e.g. status:deallost, active, active
      else if (filter.indexOf(':') > -1 || filter.indexOf(',') > -1) {
    	  var tmp = filter.split(':');
    	  
    	  ProjectsService.getProjectsByStatusFilter(tmp[tmp.length - 1], reloadProjects)
      } else if (filter == 'none'){
         // show empty list
          reloadProjects({
        	  data: []
          });
      } else {
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
        
        for(var i = 0; i < $scope.projects.length; i++) {
        	$scope.projects[i].state = ProjectsService.getProjectState($scope.projects[i]);
        }
        
        $scope.changeSort('proj-desc');
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
    
    $scope.switchSort = function(prop) {
    	if($scope.sortType == prop + "-desc") {
			$scope.changeSort(prop + "-asc");
		} else {
			$scope.changeSort(prop + "-desc");
		}
    }
    
    $scope.sort = function(array, property, descending) {
    	$scope.projects.sort(function(a, b) {
    		if(!a[property] && !b[property]) {
  			  return 0;
  		  	}
  		  	if(!a[property]) {
  			  return 1;
  		  	}
  		  	if(!b[property]) {
  			  return -1;
  		  	}
    		
			if (a[property] < b[property]){
			      return descending ? -1 : 1;
			} else if (a[property] > b[property]) {
			     return descending ? 1 : -1;
			  } else{
			      return 0;
			    } 
		});
    }
    
    $scope.changeSort = function(type) {
  	  
  	  if(type) {
  		  $scope.sortType = type;
  	  }
  	  
  	  if(type == 'proj-desc') {
  		  $scope.sort($scope.projects, 'name', true);
  	  }
  	  
  	  if(type == 'proj-asc') {
  		$scope.sort($scope.projects, 'name', false);
  	  }
  	  
  	  if(type == 'cust-desc') {
  		$scope.sort($scope.projects, 'customerName', true);
  	  }
  	  
  	  if(type == 'cust-asc') {
  		$scope.sort($scope.projects, 'customerName', false);
  	  }
  	  
  	  if(type == 'sd-desc') {
  		$scope.projects.sort(function(a, b) {
			  if (new Date(a.startDate) < new Date(b.startDate)){
			        return -1;
			  } else if (new Date(a.startDate) > new Date(b.startDate)) {
			       return 1;
			    } else{
			        return 0;
			      } 
		});
  	  }
  	  
  	  if(type == 'sd-asc') {
  		$scope.projects.sort(function(a, b) {
			if (new Date(a.startDate) < new Date(b.startDate)){
			      return 1;
			} else if (new Date(a.startDate) > new Date(b.startDate)) {
			     return -1;
			  } else{
			      return 0;
			    }
		});
      }
  	  
  	  if(type == 'ed-desc') {
  		$scope.projects.sort(function(a, b) {
  			if(!a.endDate && !b.endDate) {
    			return 0;
    		  }
    		  if(!a.endDate) {
    			return 1;
    		  }
    		  if(!b.endDate) {
    			return -1;
    		}
  			
			if (new Date(a.endDate) < new Date(b.endDate)){
			      return -1;
			} else if (new Date(a.endDate) > new Date(b.endDate)) {
			     return 1;
			  } else{
			      return 0;
			    } 
		});
  	  }
  	  
  	  if(type == 'ed-asc') {
  		$scope.projects.sort(function(a, b) {
  			if(!a.endDate && !b.endDate) {
    			return 0;
    		  }
    		  if(!a.endDate) {
    			return 1;
    		  }
    		  if(!b.endDate) {
    			return -1;
    		}
  			
			if (new Date(a.endDate) < new Date(b.endDate)){
			      return 1;
			} else if (new Date(a.endDate) > new Date(b.endDate)) {
			     return -1;
			  } else{
			      return 0;
			    } 
		});
  	  }
  	  
  	  if(type == 'stat-desc') {
  		$scope.sort($scope.projects, 'state', true);
  	  }
  	  
  	  if(type == 'stat-asc') {
  		$scope.sort($scope.projects, 'state', false);
  	  }
    }
    
    $scope.projectFilter = $state.params.filter ? $state.params.filter:'all';
    $scope.showTableView = $state.params.view?$state.params.view=='table':true;
    $scope.showGraphView = $state.params.view?$state.params.view=='graph':false;
    $scope.handleProjectFilterChanged();
  }]);