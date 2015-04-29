angular.module('Mastermind').controller('StaffingDeficitWidgetCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'AssignmentService',
    function ($scope, $state, $rootScope, Resources, AssignmentService) {

        $rootScope.staffingDeficitAvailable = true;

        AssignmentService.getActiveProjectStaffingDeficits().then(function (count) {
            $scope.activeProjectDeficitCount = count;

            $scope.$emit('staffingdeficit:loaded');
        });

    }
]);
