'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('Mastermind')
  .controller('ProjectCtrl', ['$scope', '$state', '$filter', 'ProjectsService', 'Resources', 'People', 'Groups', 'RoleTypes', 'project', 'executives', 'salesRepresentatives','ngTableParams',
    function ($scope, $state, $filter, ProjectsService, Resources, People, Groups, RoleTypes, project, executives, salesRepresentatives, TableParams) {
      var detailsValid = false, rolesValid = false;

      // Set our currently viewed project to the one resolved by the service.
      $scope.project = project;

      $scope.execs = executives;

      $scope.sales = salesRepresentatives;

      $scope.isTransient = ProjectsService.isTransient(project);

      $scope.submitAttempted = false;

      // The title of the page is the project's name or 'New Project' if transient.
      $scope.title = $scope.isTransient ? 'New Project' : project.name;
      
      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
        	type: 'asc'     // initial sorting
        }
      };
      
      $scope.assignmentsTableParams = new TableParams(params, {
        total: $scope.project.roles.length,
        getData: function ($defer, params) {
          var start = (params.page() - 1) * params.count(),
            end = params.page() * params.count(),

            orderedData = params.sorting() ?
                $filter('orderBy')($scope.project.roles, params.orderBy()) :
                $scope.project.roles,
          // use build-in angular filter
            ret = orderedData.slice(start, end);

          $defer.resolve(ret);
        }
      });


      /**
       * Get All the Role Types
       */
      RoleTypes.query().then(function (data) {
        function assignRoleGroup(result) {
          $scope.roleGroups[result.about] = result;
        }

        $scope.roleGroups = {};
        _(data).pluck('resource').forEach(function (resource) {
        	
        	Resources.get(resource, function(data){assignRoleGroup(data)});
        });
        
        $scope.newFunctionNewName = function(resource){
	      	return $scope.roleGroups[resource];
	     }
        
      });
      
//      /**
//       * Get All the people
//       */
//      People.query().then(function (data) {
//	      function assignPeople(result) {
//	        $scope.people[result.about] = result;
//	      }
//	
//	      $scope.people = {};
//	      _(data).pluck('resource').forEach(function (resource) {
//	      	Resources.get(resource).then(assignRoleGroup);
//	      });
//	      
//	      $scope.newFunctionNewName = function(resource){
//	      	return $scope.roleGroups[resource];
//	     }
//	      
//	    });

      /**
       * Save the loaded project.
       */
      $scope.save = function () {
        $scope.submitAttempted = true;

        ProjectsService.save($scope.project).then(function () {
          $state.go('projects.index');
        }, function (response) {
          var BAD_REQUEST = 400;

          if (response.status === BAD_REQUEST) {
            $scope.messages = response.data.reasons;
          }
        });
      };
      
      /**
       * Whenever the roles:add event is fired from a child controller,
       * handle it by adding the supplied role to our project.
       */
      $scope.$on('roles:add', function (event, role) {
        $scope.project.addRole(role);
        $scope.assignmentsTableParams.reload();
      });

      /**
       * Whenever the roles:remove event is fired from a child controller,
       * handle it by removing the supplied role from our project.
       */
      $scope.$on('roles:remove', function (event, role) {
        $scope.project.removeRole(role);
        $scope.assignmentsTableParams.reload();
      });

      /**
       * Whenever the details form's state changes, update the watchers in this view.
       */
      $scope.$on('detailsForm:valid:change', function (event, validity) {
        detailsValid = validity;
      });

      /**
       * Whenever the roles form's state changes, update the watchers in this view.
       */
      $scope.$on('roles:valid:change', function (event, validity) {
        rolesValid = validity;
      });

      /**
       * Must have the details filled out before the user can view the roles tab.
       *
       * @returns {boolean}
       */
      $scope.isRolesTabDisabled = function () {
        return !detailsValid;
      };

      /**
       * Must have the details filled out and at least one role assigned before the user
       * can view the assignments tab.
       *
       * @returns {boolean}
       */
      $scope.isAssignmentsTabDisabled = function () {
        return !detailsValid || !rolesValid;
      };

      /**
       * Must have the details filled out and at least one role assigned before the user
       * can view the summary tab.
       *
       * @returns {boolean}
       */
      $scope.isSummaryTabDisabled = function () {
        return !detailsValid || !rolesValid;
      };
    }]);