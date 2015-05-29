/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function() {
    'use strict';

    angular
        .module('mastermind.layout.header')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$scope', 'UserService', '$rootScope', '$state', '$timeout'];

    function HeaderController($scope, UserService, $rootScope, $state, $timeout) {

        if (!$scope.header) {
            $scope.header = {};
        }

        $rootScope.$on('event:google-plus-signin-success', function() {
            $timeout(function(){
                UserService.getUser(true).then(function(response) {
                    $scope.user = response;
                    console.log('Refreshing the header');
                    $state.reload('header');
                });
            }, 1000);
        });

    }

})();
