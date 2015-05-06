(function () {
    angular.module('DashboardModule', []).
    service('DashboardService', DashboardService);

    DashboardService.$inject = [];

    function DashboardService() {
        return {
            getMenu: function () {
                return [
                    {'name': 'home', 'label': 'Dashboard'},
                    {'name': 'projects', 'label': 'Projects'},
                    {'name': 'people', 'label': 'People'}
                ];
            }
        };
    }


})();
