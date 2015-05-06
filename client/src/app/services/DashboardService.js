(function () {
    angular.module('DashboardModule', []).
    service('DashboardService', DashboardService);

    DashboardService.$inject = [];

    function DashboardService() {
        return {
            getMenu: function () {
                return {
                    'Dashboard': 'home',
                    'Projects': 'projects',
                    'People': 'people'
                };
            }
        };
    }


})();
