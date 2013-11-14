'use strict';

/**
 * New Project Controller
 */
angular.module('PSMasterMindApp').controller(
  'NewProjectCtrl',  ['$scope','$location', 'ngTableParams', 'Projects', 'People', 
              function($scope, $location, ngTableParams, Projects, People) {
	// Default the new project
	$scope.project = Projects.start();
	
	/**
	 * Save the New Project
	 */
	$scope.save = function(){
		Projects.create($scope.project);
		$scope.go('/home');
	}
	
	/**
	 * Get the list of people
	 */
	$scope.people = People.get();
	
	/**
	 * Default a new role entry for this project
	 */
	function createNewRole() {
		return {
			id : $scope.project.nextRoleId,
			rate : {
				type : 'hourly'
			}
		}
	}
	;
	
	$scope.newRole = createNewRole();
	
	// On Role Rate Change
	$scope.onRoleRateChange = function() {
		var type = $scope.newRole.rate.type;
	
		if (type == 'hourly') {
			$('#monthlyControls').hide();
			$('#hourlyControls').show();
			scope.newRole.rate = {
				type : 'hourly'
			};
		} else {
			$('#hourlyControls').hide();
			$('#monthlyControls').show();
			scope.newRole.rate = {
				type : 'monthly'
			};
		}
	};
	
	// Add a new role to the project
	$scope.addRole = function() {
		// TODO Validate Input
	
		// Add the Role
		$scope.project.roles.push($scope.newRole);
	
		// Create out the new Role
		$scope.newRole = createNewRole();
	};
	
	// Role Parameters
	$scope.roleTableParams = new ngTableParams({
		page : 1, // show first page
		count : 10
	// count per page
	}, {
		counts : [], // hide page counts control
		total : $scope.project.roles.length, // value less
												// than count
		// hide pagination
		getData : function($defer, params) {
			var data = $scope.project.roles;
			$defer.resolve(data.slice((params.page() - 1)
					* params.count(), params.page()
					* params.count()));
		}
	});
	
	/**
	 * Navigate to another page
   	*/
	$scope.go = function ( path ) {
	  $location.path( path );
	};
}]);