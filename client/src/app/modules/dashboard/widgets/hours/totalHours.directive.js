/* global moment, _ */
(function(){
    angular
        .module('app.dashboard.widgets.hours')
        .directive('totalHours', TotalHours);

    var CONSTS = {
            DELETE_MY_HOURS_PERMISSION: 'FIXME'
        },
        // TODO: FIXME
        Util = {
            formatFloat: _.noop
        },
        // TODO: FIXME
        Resources = {
            remove: _.noop,
            resolve: _.noop
        };

    function TotalHours() {

        var directive = {
            name: 'totalHours',
            controller: TotalHoursCtrl,
            restrict: 'EA',
            templateUrl: 'app/modules/dashboard/widgets/hours/totalHours.html',
            replace: true,
            transclude: true,
            link: function ($scope, iElm, iAttrs, controller) {
                if (angular.isDefined(iAttrs['mode'])) {
                    $scope.mode = iAttrs['mode'];
                }
            }
        };

        TotalHoursCtrl.$inject = [
            'psafLogger',
            '$scope',
            '$state',
            '$rootScope',
            '$timeout',
            // 'Resources',
            'PeopleService',
            'ProjectsService',
            'HoursService',
            'TasksService',
            'RolesService',
            'AssignmentsService'
        ];

        return directive;

        function TotalHoursCtrl(psafLogger,
                           $scope,
                           $state,
                           $rootScope,
                           $timeout,
                        //    Resources,
                           PeopleService,
                           ProjectsService,
                           HoursService,
                           TasksService,
                           RolesService,
                           AssignmentsService) {
        }
    }
})();
