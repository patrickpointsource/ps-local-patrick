'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('PSMasterMindApp').controller('PeopleCtrl', ['$scope', 'People',
  function ($scope, People) {
    $scope.people = People.list();

    
  }]);