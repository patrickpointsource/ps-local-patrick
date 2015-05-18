/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('mastermind.layout.menu', [])
        .directive('mainMenu', ['MenuService', function (MenuService) {
            return {
                name: 'mainMenu',
                scope: {}, // {} = isolate, true = child, false/undefined = no change
                bindToController: true,
                restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
                templateUrl: 'app/layout/menu/menu.html',
                replace: true,
                link: function ($scope, iElm, iAttrs, controller) {
                    $scope.menuItems = MenuService.getMenu();
                }
            };
        }]);

})();
