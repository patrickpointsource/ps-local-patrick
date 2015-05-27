(function() {
    angular.module('UserModule', []).
    factory('UserService', UserService);

    UserService.$inject = ['psafLogger', 'PeopleService', 'AuthService'];

    function UserService(psafLogger, PeopleService, AuthService) {

        var logger = psafLogger.getInstance('mastermind');
        var User = {};

        AuthService.init();

        return {
            getMenu: getMenu,
            getUser: getUser,
            refreshUser: refreshUser
        };

        function getMenu(logger) {
            var menu = [{
                'name': 'home',
                'label': 'Dashboard'
            }, {
                'name': 'projects',
                'label': 'Projects'
            }, {
                'name': 'people',
                'label': 'People'
            }];

            if (logger) {
                logger.log(menu);
            }
            return menu;
        }

        function getUser(refresh) {
            if (refresh || !angular.isDefined(User.id)) {
                refreshUser();
            }

            if (logger) {
                logger.log(User);
            }
            return User;
        }

        function refreshUser() {
            if (AuthService.isLoggedIn) {
                User = PeopleService.getProfile('me');
            }
        }

    }

})();
