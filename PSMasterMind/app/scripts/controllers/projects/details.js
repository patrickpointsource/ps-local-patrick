'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects')
  .controller('DetailsCtrl',['$scope', 'Resources', function ($scope, Resources) {
    //Load the members of the executive Group
    var execQuery = {groups:'Executives'};
    var salesQuery = {groups:'Sales'};
    var fields = {name:1,resource:1};

    Resources.query('people', execQuery, fields, function(result){
      $scope.execs = result;
    });
    Resources.query('people', salesQuery, fields, function(result){
      $scope.sales = result;
    });

    $scope.$watch(function () {
      return $scope.detailsForm.$valid;
    }, function (newValidity) {
      $scope.$emit('detailsForm:valid:change', newValidity);
    });

    $scope.isFieldInError = function (fieldName) {
      var detailsFormField = $scope.detailsForm[fieldName];

      if (fieldName === 'type') {
        if ($scope.submitAttempted && detailsFormField.$pristine && $scope.project.type === undefined) {
          return true;
        }
      }

      return (detailsFormField.$dirty || ($scope.submitAttempted && detailsFormField.$pristine)) && detailsFormField.$invalid;
    };

    $('.datepicker').on('hide', function(){
      $scope.$apply();
    });
  }]);