/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('app.dashboard', [
            'app.dashboard.widgets.hours'
        ])
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$scope', 'psafLogger'];

    function DashboardController($scope, psafLogger) {
        $scope.isManager = false;
        $scope.isExecutive = false;
    }

})();
