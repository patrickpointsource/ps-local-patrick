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

        return directive;
    }
})();
