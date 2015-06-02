(function() {
    angular.module('mastermind.layout.menu').
    factory('MenuService', MenuService);

    MenuService.$inject = ['$http'];

    function MenuService($http) {
        return {
            getMenu: function() {
                return [{
                    'name': 'home',
                    'label': 'Dashboard',
                    'iconClass': 'icon-dashboard',
                    'submenuItems': [{
                        'name': 'subhome',
                        'label': 'SubDashboard',
                        'iconClass': 'icon-projects'
                    }]
                }, {
                    'name': 'projects',
                    'label': 'Projects',
                    'iconClass': 'icon-projects'
                }, {
                    'name': 'people',
                    'label': 'People',
                    'iconClass': 'icon-people'
                }];
            }
        };
    }


})();
