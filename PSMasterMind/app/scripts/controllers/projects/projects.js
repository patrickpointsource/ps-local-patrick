'use strict';

/**
 * Controller for handling the list of projects.
 */
angular.module('PSMasterMindApp').controller('ProjectsCtrl', [ '$scope', '$state', 'projects',
  function ($scope, $state, projects) {

    $scope.projects = projects;

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

  }]);