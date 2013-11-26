'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('PSMasterMindApp')
  .controller('EditProjectCtrl', ['$scope', '$state', 'ProjectsService', 'People', 'Groups', 'RoleTypes', 'project',
    function ($scope, $state, ProjectsService,  People, Groups,  RoleTypes, project) {
      // Set our currently viewed project to the one resolved by the service.
      $scope.project = project;
      
      Groups.get('execs').then(function(group){
    	  $scope.execs = group;
      })
      Groups.get('sales').then(function(group){
    	  $scope.sales = group;
      })

      /**
       * Get All the Role Types
       */
      RoleTypes.query().then(function(data){
    	  //console.log("success="+JSON.stringify(data));
  		  var types = data;
  		  $scope.roleGroups = {};
  		  for ( var int = 0; int < types.length; int++) {
  			var roleId = types[int].id;
  			//console.log("get="+roleId);
  			RoleTypes.get(roleId).then(function(res){
  				//console.log("success="+JSON.stringify(res));
  				$scope.roleGroups[res.id] = res;
  			});
  		  }
      });

      // The title of the page is the project's name.
      $scope.title = project.name;

      /**
       * Save the loaded project.
       */
      $scope.save = function () {
        ProjectsService.save($scope.project).then(function (project) {
          $scope.project = project;
        }, function (response) {
          // TODO: revisit just fetching the new copy on save failures. The user probably won't enjoy
          // having their data erased without recourse.
          ProjectsService.get($scope.project.id).then(function (project) {
            $scope.project = project;
          });
        });
      };

      /**
       * View the Details tab.
       */
      $scope.showDetails = function () {
        $state.go('projects.show.tab', {
          activeTab: 'details'
        });
      };

      /**
       * View the Roles tab.
       */
      $scope.showRoles = function () {
        $state.go('projects.show.tab', {
          activeTab: 'roles'
        });
      };

      /**
       * View the Assignments tab.
       */
      $scope.showAssignments = function () {
        $state.go('projects.show.tab', {
          activeTab: 'assignments'
        });
      };

      /**
       * View the summary tab.
       *
       * TODO: Add validation to ensure the required fields are complete
       */
      $scope.showSummary = function () {
        $state.go('projects.show.tab', {
          activeTab: 'summary'
        });
      };

      /**
       * Whenever the roles:add event is fired from a child controller,
       * handle it by adding the supplied role to our project.
       */
      $scope.$on('roles:add', function (event, role) {
        $scope.project.addRole(role);
      });
    }]);