/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function() {
    'use strict';

    angular
        .module('mastermind.layout.header')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$scope', 'UserService', 'AuthService', '$rootScope'];

    function HeaderController($scope, UserService, AuthService, $rootScope) {

        $scope.isLoggedIn = $rootScope.isLoggedIn;

        if (!$scope.header) {
            $scope.header = {};
        }

        $scope.loadUser = function loadUser(refresh) {
            $scope.User = UserService.getUser(refresh);
        };

        $scope.loadUser(true);

    }

})();
