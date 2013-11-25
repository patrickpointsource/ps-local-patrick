'use strict';

angular.module('PSMasterMindApp').controller('ProjectsCtrl', [ '$scope', '$state', 'Projects',
  function ($scope, $state, Projects) {

    $scope.projects = Projects.list();

    $scope.showProject = function (project) {
      $state.go('projects.show', {
        projectId: project.id
      });
    };

  }]);