/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('mastermind.layout.menu')
        .controller('MenuController', MenuController);

    MenuController.$inject = ['$scope', '$rootScope', 'FoundationApi', 'MenuService'];

    function MenuController($scope, $rootScope, FoundationApi, MenuService) {

        $scope.menuItems = MenuService.getMenu();

        console.log($scope.menuItems);

        $scope.menuNavigate = function (menuItem, params) {
            var state = menuItem.name;

            if (menuItem.submenuItems) {
                menuItem.visible = !menuItem.visible;
            }

            console.log(state);

            $rootScope.$broadcast('menuNavigate');
            $rootScope.navigate(state, params);

        };

        $scope.showIt = function() {
            console.log('Showing it!');
        };

    }


})();
