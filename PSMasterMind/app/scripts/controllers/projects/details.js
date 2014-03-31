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
  }])
    .directive('currencyFormat', ['$filter', function ($filter) { //helpfully found here: http://jsfiddle.net/SAWsA/811/
        return {
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
                if (!ctrl) return;


                ctrl.$formatters.unshift(function (a) {
                    return $filter(attrs.format)(ctrl.$modelValue)
                });


                ctrl.$parsers.unshift(function (viewValue) {
                    var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                    elem.val($filter('number')(plainNumber));
                    return plainNumber;
                });
            }
        };
    }]);