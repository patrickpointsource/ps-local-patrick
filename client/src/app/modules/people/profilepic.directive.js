/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('PersonModule')
        .directive('profilePic', profilePic);

        profilePic.$inject = ['PersonService'];

        function profilePic(PersonService) {

            return {
                name: 'profilePic',
                scope: {},
                bindToController: true,
                restrict: 'E',
                template: '<img ng-src="{{thumbnail}}" height="50" width="50" class="user-profile-image">',
                replace: true,
                link: function ($scope, iElm, iAttrs, controller) {
                    $scope.thumbnail = iAttrs['person'].thumbnail;
                }
            };
        }
})();
