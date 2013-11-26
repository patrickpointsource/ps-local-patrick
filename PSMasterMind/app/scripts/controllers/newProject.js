'use strict';

/**
 * Controller for creating a new Project.
 */
angular.module('PSMasterMindApp')
  .controller('NewProjectCtrl', ['$scope', 'ngTableParams', 'ProjectsService', 'People', 'Groups', 'RoleTypes','$state', 'project',
    function ($scope, TableParams, ProjectsService, People, Groups,  RoleTypes, $state, project) {
      // Default the new project
      $scope.project = project;
      $scope.execs = Groups.get('execs');
      $scope.sales = Groups.get('sales'); 
      
      /**
       * Get All the Role Types
       */
      RoleTypes.query(function(data){
    	  //console.log("success="+JSON.stringify(data));
  		  var types = data.members;
  		  $scope.roleGroups = {};
  		  for ( var int = 0; int < types.length; int++) {
  			var roleId = types[int].id;
  			//console.log("get="+roleId);
  			RoleTypes.get(roleId, function(res){
  				//console.log("success="+JSON.stringify(res));
  				$scope.roleGroups[res.id] = res;
  			});
  			
  		  }
      });

      /**
       * Save the New Project
       */
      $scope.save = function () {
        ProjectsService.save($scope.project);
        $state.go('home');
      };

      /**
       * Get the list of people
       */
      $scope.people = People.query();

      // Role Parameters
      $scope.roleTableParams = new TableParams({
        page: 1, // show first page
        count: 10
        // count per page
      }, {
        counts: [], // hide page counts control
        total: $scope.project.roles.length, // value less
        // than count
        // hide pagination
        getData: function ($defer, params) {
          var data = $scope.project.roles;
          $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

      /*
       * Navigate to Details tab.
       */
      $scope.showDetails = function () {
        $state.go('projects.new.tab', {
          activeTab: 'details'
        });
      };

      /*
       * Navigate to Roles tab.
       */
      $scope.showRoles = function () {
        $state.go('projects.new.tab', {
          activeTab: 'roles'
        });
      };

      /*
       * Navigate to Assignments tab.
       */
      $scope.showAssignments = function () {
        $state.go('projects.new.tab', {
          activeTab: 'assignments'
        });
      };

      /*
       * Navigate to Summary tab.
       */
      $scope.showSummary = function () {
        $state.go('projects.new.tab', {
          activeTab: 'summary'
        });
      };

      /*
       * Whenever the roles:add event is fired from a child controller,
       * handle it by adding the supplied role to our project.
       */
      $scope.$on('roles:add', function (event, role) {
        $scope.project.addRole(role);
      });
    }]);