(function () {
    angular.module('mastermind.layout.menu').
    factory('MenuService', MenuService);

    MenuService.$inject = ['$http'];

    function MenuService($http) {
        return {
            getMenu: function () {
                return [
                    {'name': 'home', 'label': 'Dashboard', 'iconClass': 'icon-dashboard'},
                    {'name': 'projects', 'label': 'Projects', 'iconClass': 'icon-projects'},
                    {'name': 'people', 'label': 'People', 'iconClass': 'icon-people'}
                ];
            }
        };
    }


})();
