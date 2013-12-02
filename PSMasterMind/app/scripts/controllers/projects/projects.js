'use strict';

/**
 * Controller for handling the list of projects.
 */
angular.module('Mastermind.controllers.projects')
  .controller('ProjectsCtrl', [ '$scope', '$state', '$filter', 'ngTableParams', 'projects',
    function ($scope, $state, $filter, TableParams, projects) {

      $scope.projects = projects;

      /**
       * Navigate to creating a project.
       */
      $scope.createProject = function () {
        $state.go('projects.new');
      };

      /**
       * Navigate to a project's show page.
       *
       * @param project An object that represents a view of a project
       *   meant to be shown in a list.
       */
      $scope.showProject = function (project) {
        $state.go('projects.show', {
          projectId: project.id
        });
      };

      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
          familyName: 'asc'     // initial sorting
        }
      };
      $scope.tableParams = new TableParams(params, {
        counts: [],
        total: projects.length, // length of data
        getData: function ($defer, params) {
          var start = (params.page() - 1) * params.count(),
            end = params.page() * params.count(),

          // use build-in angular filter
            orderedData = params.sorting() ?
              $filter('orderBy')(projects, params.orderBy()) :
              projects,

            ret = orderedData.slice(start, end);
          $defer.resolve(ret);
        }
      });

    }]);