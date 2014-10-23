'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects', [])
  .controller('DetailsCtrl',['$scope', '$filter', 'Resources', function ($scope, Resources) {
    $scope.$watch(function () {
      return $scope.detailsForm.$valid;
    }, function (newValidity) {
      $scope.$emit('detailsForm:valid:change', newValidity);
    });
    
    $scope.getPersonName = function(person, isSimply, isFirst) {
		return Util.getPersonName(person, isSimply, isFirst);
	};
	
	$scope.orderByName = function(person) {
		return $scope.getPersonName(person);
	};

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
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var filter = $filter;
                console.log(ctrl);
                if (!ctrl) return;


                ctrl.$formatters.unshift(function (a) {
                    return filter(attrs.format)(ctrl.$modelValue)
                });


                ctrl.$parsers.unshift(function (viewValue) {
                    var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                    elem.val($filter('number')(plainNumber));
                    return plainNumber;
                });
            }
        };
    }])
.directive('currencyInput', function() {
    return {
        restrict: 'A',
        replace: true,
        require: "ngModel",
        link: function(scope, element, attrs) {

            $(element).bind('keyup', function(e) {
                var input = element.find('input');
                var inputVal = input.val();

                //clearing left side zeros
                while (scope.field.charAt(0) == '0') {
                    scope.field = scope.field.substr(1);
                }

                scope.field = scope.field.replace(/[^\d.\',']/g, '');

                var point = scope.field.indexOf(".");
                if (point >= 0) {
                    scope.field = scope.field.slice(0, point + 3);
                }

                var decimalSplit = scope.field.split(".");
                var intPart = decimalSplit[0];
                var decPart = decimalSplit[1];

                intPart = intPart.replace(/[^\d]/g, '');
                if (intPart.length > 3) {
                    var intDiv = Math.floor(intPart.length / 3);
                    while (intDiv > 0) {
                        var lastComma = intPart.indexOf(",");
                        if (lastComma < 0) {
                            lastComma = intPart.length;
                        }

                        if (lastComma - 3 > 0) {
                            intPart = intPart.splice(lastComma - 3, 0, ",");
                        }
                        intDiv--;
                    }
                }

                if (decPart === undefined) {
                    decPart = "";
                }
                else {
                    decPart = "." + decPart;
                }
                var res = intPart + decPart;

                scope.$apply(function() {scope.field = res});


            });

        }
    };
});

String.prototype.splice = function(idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

