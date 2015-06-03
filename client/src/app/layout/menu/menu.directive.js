(function () {

    angular.module('mastermind.layout.menu')
        .directive('mainMenu', MainMenu);

        MainMenu.$inject = ['MenuService', '$state', '$rootScope'];

        function MainMenu(MenuService, $state, $rootScope) {

            var currentMenu = {};

            function MenuLink($scope, iElm, iAttrs) {
                $scope.menuItems = MenuService.getMenu();

                $scope.menuNavigate = function (menuItem) {
                    var state = menuItem.name;

                    if (menuItem.name === currentMenu.name) {
                        menuItem.visible = !menuItem.visible;
                    }
                    else {
                        currentMenu.visible = false;
                        currentMenu = menuItem;
                        menuItem.visible = true;
                    }

                    // figure out if this is a new state or a filter
                    // and then do the right thing
                    $state.go(state, null);
                };

                $scope.filterItems = function(menuItem) {
                console.log(menuItem);
                };
            }

            return {
                name: 'mainMenu',
                scope: {}, // {} = isolate, true = child, false/undefined = no change
                bindToController: true,
                restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
                templateUrl: 'app/layout/menu/menu.html',
                replace: true,
                link: MenuLink
            };
        }

})();
