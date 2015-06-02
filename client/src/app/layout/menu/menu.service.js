(function() {
    angular.module('mastermind.layout.menu').
    factory('MenuService', MenuService);

    MenuService.$inject = ['DepartmentCategoriesService'];

    function MenuService(DepartmentCategoriesService) {

        var departmentMenu = [];

        DepartmentCategoriesService.getDepartmentCategories().then(function(response) {
            var departments = response;
            angular.forEach(departments, function(department) {
                departmentMenu.push({'name': department.name, 'id': department.id});
            });
            console.log(departmentMenu);
        });

        var dashboardMenu = {
            'name': 'home',
            'label': 'Dashboard',
            'iconClass': 'icon-dashboard'
        };
        var peopleMenu = {
            'name': 'people',
            'label': 'People',
            'iconClass': 'icon-people'
        };

        var projectMenu = {
            'name': 'projects',
            'label': 'Projects',
            'iconClass': 'icon-projects',
            'submenuItems': [{
                'name': 'all',
                'label': 'All Projects'
            }, {
                'name': 'active',
                'label': 'Active'
            }, {
                'name': 'backlog',
                'label': 'Backlog'
            }, {
                'name': 'pipeline',
                'label': 'Pipeline'
            }, {
                'name': 'investment',
                'label': 'Investment'
            }, {
                'name': 'deallost',
                'label': 'Deal Lost'
            }, {
                'name': 'complete',
                'label': 'Complete'
            }]
        };
        return {
            getMenu: function() {
                return [dashboardMenu, projectMenu, peopleMenu];
            }
        };
    }


})();
