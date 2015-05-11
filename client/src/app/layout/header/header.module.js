/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('mastermind.layout.header', [])
        .directive('headerBar', function () {
            // Runs during compile
            return {
                name: 'headerBar',
                // priority: 1,
                // terminal: true,
                // scope: {}, // {} = isolate, true = child, false/undefined = no change
                // controller: function($scope, $element, $attrs, $transclude) {},
                // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
                // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
                // template: '',
                templateUrl: 'app/layout/header/header.html',
                replace: true,
                // transclude: true,
                // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return
                // function linking(scope, elm, attrs){}})),
                link: function ($scope, iElm, iAttrs, controller) {

                }
            };
        });


})();
