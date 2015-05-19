/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('mastermind.layout.header', [])
        .directive('headerBar', HeaderBar);

    HeaderBar.$inject = ['UserService', '$http'];

    function HeaderBar(UserService, $http) {

        return {
            name: 'headerBar',
            restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: 'app/layout/header/header.html',
            replace: true,
            link: HeaderBarLink
        };

        function HeaderBarLink($scope, iElm, iAttrs) {

            UserService.getUserProfile($http).then(function(response) {
                $scope.$apply($scope.header.User = response);
            }, function(error) {
                console.log(error);
            });

            if (!$scope.header) {
                $scope.header = {};
            }

        }
    }


})();
