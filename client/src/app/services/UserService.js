(function() {
    angular.module('app.services').
    factory('UserService', UserService);

    UserService.$inject = ['psafLogger', 'PeopleService', 'AuthService', '$interval'];

    function UserService(psafLogger, PeopleService, AuthService, $interval) {

        var logger = psafLogger.getInstance('mastermind');
        var User = User || {};

        AuthService.init();

        return {
            getUser: getUser
        };

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
            if (AuthService.isLoggedIn && !angular.isDefined(User.id)) {
                User = PeopleService.getProfile();
            }
            else {
                var authTimer = $interval(function() {
                    if (AuthService.isLoggedIn) {
                        User = PeopleService.getProfile();
                        $interval.cancel(authTimer);
                        authTimer = undefined;
                    }
                }, 3000, 20);
            }
        }

    }

})();
