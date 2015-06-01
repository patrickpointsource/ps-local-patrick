/* global moment, _ */
(function(){
    angular
        .module('app.dashboard.widgets.hours')
        .directive('hoursEntryRow', HoursEntryRow);

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

    function HoursEntryRow() {

        var directive = {
            name: 'totalHours',
            scope: true,
            controller: HoursEntryRowCtrl,
            restrict: 'EA',
            templateUrl: 'app/modules/dashboard/widgets/hours/hoursEntryRow.html',
            replace: true,
            link: function ($scope, iElm, iAttrs, controller) {
                if (angular.isDefined(iAttrs['mode'])) {
                    $scope.mode = iAttrs['mode'];
                }
            }
        };

        HoursEntryRowCtrl.$inject = [
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

        function HoursEntryRowCtrl(psafLogger,
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
