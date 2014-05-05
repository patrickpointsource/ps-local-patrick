'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('Mastermind')
  .controller('BreadcrumpCtrl', ['$q','$rootScope', '$scope', '$state', '$stateParams', '$location', '$filter', '$controller', 'ProjectsService', 'Resources', 'People', 'RoleTypes', 'Rates', 'AssignmentService', 'HoursService', 'RolesService',
  function ($q, $rootScope, $scope, $state, $stateParams, $location, $filter, $controller, ProjectsService, Resources, People, RoleTypes, Rates, AssignmentService, HoursService, RolesService) {
	  
	  $scope.state = $state.current;
	  $scope.params = $state.params;
	  $scope.promisedPart = "";
	  
	  $scope.getBreadCrump = function() {
		  var breadCrumpText = "";
		  $scope.promisedPart = "";
		  
	  		if($scope.state.name == 'home') {
	  			breadCrumpText = "Dashboard";
	  		}
	  		
	  		if($scope.state.name == 'projects.show') {
	  			breadCrumpText = "All Projects";
	  		}
	  		
	  		if($scope.state.name == 'projects.index') {
	  			breadCrumpText = "All Projects";
	  			
	  			if($scope.params.filter) {
	  				
	  				if($scope.params.filter != 'all') {
	  					breadCrumpText += " > ";
	  				}
	  				
	  				var projectFilters = $scope.params.filter.split(',');
	  				var filtersText = [];
	  				
	  				for(var i = 0; i < projectFilters.length; i++) {
	  					if(projectFilters[i] == 'active') {
	  						filtersText.push("Active");
	  					}
	  					if(projectFilters[i] == 'backlog') {
	  						filtersText.push("Backlog");
	  					}
	  					if(projectFilters[i] == 'pipeline') {
	  						filtersText.push("Pipeline");
	  					}
	  					if(projectFilters[i] == 'investment') {
	  						filtersText.push("Investment");
	  					}
	  					if(projectFilters[i] == 'completed') {
	  						filtersText.push("Completed");
	  					}
	  					if(projectFilters[i] == 'deallost') {
	  						filtersText.push("Deal Lost");
	  					}
	  				}
	  				
	  				breadCrumpText += filtersText.join(',');
	  			}
	  		}
	  		
	  		if($scope.state.name == 'people.index') {
	  			breadCrumpText = "All People";
	  		}
	  		
	  		if($scope.state.name == 'staffing') {
	  			breadCrumpText = "Staffing";
	  		}
	  		
	  		if($scope.state.name == 'admin') {
	  			breadCrumpText = "Administration";
	  		}
	  		
	  		if($scope.state.name == 'projects.show') {
	  			breadCrumpText = "All Projects > ";
	  			if($scope.params.projectId) {
	  				ProjectsService.getForEdit($scope.params.projectId).then(function(project) {
	  					$scope.promisedPart = project.name;
	  				})
	  			}
	  		}
	  		
	  		if($scope.state.name == 'people.index') {
	  			breadCrumpText = 'All People';
	  			if($scope.params.filter) {
	  				if($scope.params.filter == 'all') {
	  					$scope.promisedPart == '';
	  				}
	  				else {
	  					breadCrumpText += " > ";
	  					if($scope.params.filter == 'my')
		  					$scope.promisedPart += 'My';
		  				else {
		  					RolesService.getRolesMapByResource().then(function(map) {
		  						$scope.promisedPart = map[$scope.params.filter].title;
		  					});
		  				}
	  				}
	  				
	  			}
	  		}
	  		
	  		$scope.breadcrumpText = breadCrumpText;
	  }
	  
	  $scope.getBreadCrump();
	  
	  $rootScope.$on('$stateChangeStart', 
	  	  	_.bind(function(event, toState, toParams, fromState, fromParams) {
	  	  		$scope.state = toState;
	  	  		$scope.params = toParams;
	  	  		
	  	  		$scope.getBreadCrump();
	  	  }))
  }]);