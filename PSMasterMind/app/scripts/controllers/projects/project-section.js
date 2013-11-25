'use strict';

angular.module('PSMasterMindApp').controller('ProjectSectionCtrl', [ '$scope', '$stateParams',
  function ($scope, $stateParams) {
    $scope.activeTab = $stateParams.activeTab;
  }]);