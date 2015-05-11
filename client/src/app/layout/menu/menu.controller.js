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

        $scope.menuNavigate = function (state, params) {

            $rootScope.$broadcast('menuNavigate');
            $rootScope.navigate(state, params);

        };

    }


})();
