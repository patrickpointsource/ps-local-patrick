(function() {
    angular.module('UserModule', []).
    factory('UserService', UserService);

    UserService.$inject = ['psafLogger', 'PersonService'];

    function UserService(psafLogger, PersonService) {

        var logger = psafLogger.getInstance('mastermind');
        var User = {};

        return {
            getMenu: getMenu,
            getUser: getUser
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

        function getUser() {
            if (!angular.isDefined(User.id)) {
                User = PersonService.getProfile('me');
            }

            if (logger) {
                logger.log(User);
            }
            return User;
        }


    }

})();
