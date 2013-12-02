'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('Mastermind')
  .controller('ProjectCtrl', ['$scope', '$state', 'ProjectsService', 'People', 'Groups', 'RoleTypes', 'project', 'executives', 'salesRepresentatives', 'ngTableParams', '$filter',
    function ($scope, $state, ProjectsService, People, Groups, RoleTypes, project, executives, salesRepresentatives, TableParams, $filter) {
      // Set our currently viewed project to the one resolved by the service.
      $scope.project = project;

      $scope.execs = executives;

      $scope.sales = salesRepresentatives;

      $scope.isTransient = ProjectsService.isTransient(project);

      // The title of the page is the project's name or 'New Project' if transient.
      $scope.title = $scope.isTransient ? 'New Project' : project.name;

      /**
       * Get All the Role Types
       */
      RoleTypes.query().then(function (data) {
        function assignRoleGroup(result) {
          $scope.roleGroups[result.id] = result;
        }

        $scope.roleGroups = {};
        _(data).pluck('id').forEach(function (roleTypeId) {
          RoleTypes.get(roleTypeId).then(assignRoleGroup);
        });
      });

      var unbindWatch = angular.noop;
      /**
       * Save the loaded project.
       */
      $scope.save = function () {
        var validation = $scope.project.validate();

        // Remove the watch, or on the first time through it performs a noop
        unbindWatch();
        if (!validation.valid) {
          $scope.messages = validation.messages;

          /*
           After the user attempts to save an invalid project, watch for changes in the validity of
           the project being edited and update the messages on the page.
           */
          unbindWatch = $scope.$watch(function () {
            return $scope.project.validate().messages;
          }, function (newMessages) {
            $scope.messages = newMessages;
          }, true);
        } else {
          ProjectsService.save($scope.project).then(function () {
            $state.go('projects.index');
          });
        }
      };

      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10           // count per page
      };
      $scope.roleTableParams = new TableParams(params, {
        counts: [],
        total: project.roles.length, // length of data
        getData: function ($defer, params) {
          var start = (params.page() - 1) * params.count(),
            end = params.page() * params.count(),

          // use build-in angular filter
            ret = project.roles.slice(start, end);

          $defer.resolve(ret);
        }
      });

      /**
       * Whenever the roles:add event is fired from a child controller,
       * handle it by adding the supplied role to our project.
       */
      $scope.$on('roles:add', function (event, role) {
        $scope.project.addRole(role);

        $scope.roleTableParams.reload();
      });
    }]);