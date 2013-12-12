'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects')
  .controller('DetailsCtrl',
    function ($scope) {
      $scope.$watch(function () {
        return $scope.detailsForm.$valid;
      }, function (newValidity) {
        $scope.$emit('detailsForm:valid:change', newValidity);
      });

      $scope.isFieldInError = function (fieldName) {
        var detailsFormField = $scope.detailsForm[fieldName];
        return (detailsFormField.$dirty
          || ($scope.submitAttempted && detailsFormField.$pristine))
          && detailsFormField.$invalid;
      };

      $('.datepicker').on('hide', function(ev){
        $scope.$apply();
      });
    });