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
	  $scope.breadCrumpParts = [];
	  
	  $scope.updateBreadCrump = function() {
		  $scope.breadCrumpParts = _.filter($scope.breadCrumpParts, function(part) {
			  return part;
		  });
	  }
	  
	  $scope.getBreadCrump = function() {
		  $scope.breadCrumpParts = [];
		  
	  		if($scope.state.name == 'home') {
	  			$scope.breadCrumpParts.push("Dashboard");
	  		}
	  		
	  		if($scope.state.name == 'projects.show') {
	  			$scope.breadCrumpParts.push("All Projects");
	  		}
	  		
	  		if($scope.state.name == 'projects.index') {
	  			$scope.breadCrumpParts.push("All Projects");
	  			
	  			if($scope.params.filter) {
	  				
	  				if($scope.params.filter == 'all') {
	  					$scope.breadCrumpParts = ['All Projects'];
	  				} else {
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
		  				
		  				$scope.breadCrumpParts.push(filtersText.join(','));
	  				}
	  			}
	  		}
	  		
	  		if($scope.state.name == 'staffing') {
	  			$scope.breadCrumpParts.push("Staffing");
	  		}
	  		
	  		if($scope.state.name == 'admin') {
	  			$scope.breadCrumpParts.push("Administration");
	  		}
	  		
	  		if($scope.state.name == 'projects.show' || $scope.state.name == 'projects.edit' || $scope.state.name == 'projects.show.tabEdit') {
	  			$scope.breadCrumpParts = [ 'All Projects' ];
	  			if($scope.params.projectId) {
	  				$scope.breadCrumpParts.push("");
	  				ProjectsService.getForEdit($scope.params.projectId).then(function(project) {
	  					$scope.breadCrumpParts[1] = project.name;
	  					$scope.updateBreadCrump();
	  				})
	  			}
	  		}
	  		
	  		if($scope.state.name == 'people.index') {
	  			$scope.breadCrumpParts = [ 'All People' ];
	  			if($scope.params.filter) {
	  				if($scope.params.filter == 'all') {
	  					$scope.breadCrumpParts = [ 'All People' ];
	  				}
	  				else {
	  					if($scope.params.filter == 'my')
	  						$scope.breadCrumpParts.push('My');
		  				else {
		  					RolesService.getRolesMapByResource().then(function(map) {
		  						$scope.breadCrumpParts.push(map[$scope.params.filter].title);
		  						$scope.updateBreadCrump();
		  					});
		  				}
	  				}
	  				
	  			}
	  		}
	  		
	  		if($scope.state.name == 'people.show') {
	  			$scope.breadCrumpParts = [ 'All People', '', '' ];
	  			
	  			if($scope.params.profileId) {
	  				People.get($scope.params.profileId).then(function(profile) {
	  					if(profile.accounts.length > 0) {
	  						$scope.breadCrumpParts[2] = profile.name;
	  					}
	  					RolesService.getRolesMapByResource().then(function(map) {
	  						if(profile.primaryRole) {
	  							$scope.breadCrumpParts[1] = map[profile.primaryRole.resource].title;
		  						$scope.updateBreadCrump();
	  						} else {
	  							$scope.updateBreadCrump();
	  						}
	  					});
	  					
	  				});
	  			}
	  		}
	  		
	  		$scope.updateBreadCrump();
	  }
	  
	  $scope.getBreadCrump();
	  
	  $rootScope.$on('$stateChangeStart', 
	  	  	_.bind(function(event, toState, toParams, fromState, fromParams) {
	  	  		$scope.state = toState;
	  	  		$scope.params = toParams;
	  	  		
	  	  		$scope.getBreadCrump();
	  	  }))
  }]);