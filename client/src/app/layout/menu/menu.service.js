(function () {
    angular.module('mastermind.layout.menu').
    factory('MenuService', MenuService);

    MenuService.$inject = ['$http'];

    function MenuService($http) {
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
