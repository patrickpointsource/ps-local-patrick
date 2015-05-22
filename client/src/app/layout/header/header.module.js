/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('mastermind.layout.header', [])
        .directive('headerBar', HeaderBar);

    HeaderBar.$inject = ['UserService'];

    function HeaderBar(UserService) {

        return {
            name: 'headerBar',
            restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: 'app/layout/header/header.html',
            replace: true,
            link: HeaderBarLink
        };

        function HeaderBarLink($scope, iElm, iAttrs) {
            if (!$scope.header) {
                $scope.header = {};
            }

            var User = UserService.getUser().then(function(response) {
                $scope.User = response;
                console.log($scope.User);
            });
        }
    }


})();
