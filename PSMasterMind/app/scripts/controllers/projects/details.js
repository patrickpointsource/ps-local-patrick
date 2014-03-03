'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects')
  .controller('DetailsCtrl',['$scope', 'Resources', function ($scope, Resources) {
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