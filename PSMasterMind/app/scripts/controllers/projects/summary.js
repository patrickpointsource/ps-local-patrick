'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.projects')
  .controller('SummaryCtrl', ['$scope', 'People',
    function ($scope, People) {
      People.query().then(function (people) {
        $scope.people = people;
      });
    }]);