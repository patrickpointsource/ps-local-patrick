angular.module('Mastermind').controller('CurrentProjectCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService',
    function ($scope, $state, $rootScope, Resources, ProjectsService) {

        /**
         * Fetch the counts of the current projects
         */
        ProjectsService.getProjectCounts().then(function (counts) {
            $scope.activeCount = counts.active;
            $scope.backlogCount = counts.backlog;
            $scope.pipelineCount = counts.pipeline;
            $scope.investmentCount = counts.investment;
        });

    }
]);
