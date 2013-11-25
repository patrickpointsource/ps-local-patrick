'use strict';

/**
 * Controls the tabbed sections in the Project create/edit dialogs.
 */
angular.module('PSMasterMindApp').controller('ProjectSectionCtrl', [ '$scope', '$stateParams',
  function ($scope, $stateParams) {
    $scope.activeTab = $stateParams.activeTab;
  }]);