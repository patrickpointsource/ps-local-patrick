'use strict';

angular.module('PSMasterMindApp').controller('ProjectsCtrl', [ '$scope', '$location', 'ngTableParams', 'Projects',
  function ($scope, $location, ngTableParams, Projects) {

    $scope.projects = Projects.list();

  }]);