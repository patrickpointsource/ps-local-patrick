'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('Mastermind')
  .controller('BreadcrumpCtrl', ['$q','$rootScope', '$scope', '$state', '$stateParams', '$location', '$filter', '$controller', 'ProjectsService', 'Resources', 'People', 'RoleTypes', 'Rates', 'AssignmentService', 'HoursService', 'RolesService',
  function ($q, $rootScope, $scope, $state, $stateParams, $location, $filter, $controller, ProjectsService, Resources, People, RoleTypes, Rates, AssignmentService, HoursService, RolesService) {
	  
	  $scope.state = $state.current;
	  $scope.params = $state.params;
	  $scope.fromState = {};
  	  $scope.fromParams = {};
	  $scope.promisedPart = "";
	  $scope.breadCrumpParts = [];
	  
	  var rolePeopleGroupMap = People.getPeopleGroupMapping();
	  
	  var mapPeopleFilterToUI = function(filterPeople) {
		  if(filterPeople == 'businessdevelopment') {
				return 'Business Development';
			}
			if(filterPeople == 'clientexpierencemgmt') {
				return 'Client Experience Mgmt';
			}
			if(filterPeople == 'digitalexperience') {
				return 'Digital Experience';
			}
			if(filterPeople == 'executivemgmt') {
				return 'Executive Mgmt';
			}
			
			var bigLetter = filterPeople[0].toUpperCase();
			var endPart = filterPeople.slice(1, filterPeople.length);
			return bigLetter + endPart;
	  }
	  
	  $scope.updateBreadCrump = function() {
		  $scope.breadCrumpParts = _.filter($scope.breadCrumpParts, function(part) {
			  return part;
		  });
		  
		  /*for(var i = 0; i < $scope.breadCrumpParts.length; i++) {
			  if($scope.breadCrumpParts[i].length > 70) {
				  $scope.breadCrumpParts[i] = $scope.breadCrumpParts[i].substring(0, 67) + '...';
			  }
		  }*/
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
		  					if(projectFilters[i] == 'complete') {
		  						filtersText.push("Complete");
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
	  		
	  		if($scope.state.name == 'reports') {
	  			$scope.breadCrumpParts.push("Reports");
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
	  			$scope.breadCrumpParts = [ 'People' ];
	  			if($scope.params.filter) {
	  				if($scope.params.filter == 'none') {
	  					$scope.breadCrumpParts = [ 'People' ];
	  				} else {
	  				if($scope.params.filter == 'all') {
	  					$scope.breadCrumpParts = [ 'People', 'All' ];
	  				} else {
		  					/*RolesService.getRolesMapByResource().then(function(map) {
		  						
		  						if (map[$scope.params.filter]) {
		  							$scope.breadCrumpParts.push(map[$scope.params.filter].title);
		  							$scope.updateBreadCrump();
		  						}
		  					});*/
		  					if($scope.params.filter.indexOf("all") == 0) {
		  						$scope.breadCrumpParts.push("All");
		  					} else {
		  						var filterPeople = $scope.params.filter.split(',');
		  						
		  						for(var i = 0; i < filterPeople.length; i++) {
		  							filterPeople[i] = mapPeopleFilterToUI(filterPeople[i]);
		  						}
		  						
		  						$scope.breadCrumpParts.push(filterPeople.join(', '));
		  					}
		  					
		  					$scope.updateBreadCrump();
		  				
	  				    }
	  				}
	  			}
	  		}
	  		
	  		if($scope.state.name == 'people.show') {
	  			var fromPeopleList = false;
	  			$scope.breadCrumpParts = [ 'People', '' ];
	  			if($scope.fromState.name == 'people.index') {
	  				if($scope.fromParams.filter) {
	  					var splittedPeopleFilter = $scope.fromParams.filter.split(',');
	  					if(splittedPeopleFilter.length == 1) {
	  						$scope.breadCrumpParts = ['People', mapPeopleFilterToUI(splittedPeopleFilter[0]), ''];
	  						
	  						fromPeopleList = true;
	  					}
	  					else {
	  						$scope.breadCrumpParts = [ 'People', '' ];
	  					}
	  				} else {
	  					$scope.breadCrumpParts = [ 'People', '' ];
	  				}
	  			}
	  			
	  			if($scope.params.profileId) {
	  				People.get($scope.params.profileId).then(function(profile) {
	  					if(profile.accounts.length > 0) {
	  						if(fromPeopleList) {
	  							RolesService.getRolesMapByResource().then(function(map) {
			  						if(profile.primaryRole) {
			  							var roleAbbr = map[profile.primaryRole.resource].abbreviation;
			  							var mapRoles = rolePeopleGroupMap[$scope.fromParams.filter];
			  							if(_.contains(mapRoles, roleAbbr)) {
			  								if($scope.breadCrumpParts[1] != mapPeopleFilterToUI(splittedPeopleFilter[0])) {
			  									$scope.breadCrumpParts = ['People', profile.name];
			  								} else {
			  									$scope.breadCrumpParts[2] = profile.name;
			  								}
			  							} else {
			  								$scope.breadCrumpParts = ['People', profile.name];
			  							}
			  							
				  						$scope.updateBreadCrump();
			  						} else {
			  							$scope.updateBreadCrump();
			  						}
			  					});
	  							$scope.breadCrumpParts[2] = profile.name;
	  						} else {
	  							$scope.breadCrumpParts[1] = profile.name;
	  						}
	  						
	  					}
	  					/*RolesService.getRolesMapByResource().then(function(map) {
	  						if(profile.primaryRole) {
	  							var role = map[profile.primaryRole.resource];
	  							$scope.breadCrumpParts[1] = map[profile.primaryRole.resource].title;
		  						$scope.updateBreadCrump();
	  						} else {
	  							$scope.updateBreadCrump();
	  						}
	  					});*/
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
	  	  		$scope.fromState = fromState;
	  	  		$scope.fromParams = fromParams;
	  	  		
	  	  		$scope.getBreadCrump();
	  	  }))
  }]);