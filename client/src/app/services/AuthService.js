(function() {
    angular.module('AuthModule', []).
    factory('AuthService', AuthService);

    AuthService.$inject = ['$rootScope', '$http', 'psafLogger'];

    function AuthService($rootScope, $http, psafLogger) {

        var logger = psafLogger.getInstance('mastermind');

        var isLoggedIn = false;

        return {
            login: login,
            logout: logout,
            init: init,
            isLoggedIn: isLoggedIn,
        };

        function login() {
            isLoggedIn = true;
            $rootScope.isLoggedIn = true;
            console.log('Is Logged In ', isLoggedIn);
            return;
        }

        function logout() {
            isLoggedIn = false;
            return;
        }

        function init() {
            // Register a listener for signin success and pass along the credentials to
            // the server side so that we don't have to do that later.
            $rootScope.$on('event:google-plus-signin-success', function(event, authResult) {
                console.log(authResult);

                $http.get('http://localhost:3000/auth?code=' + authResult['code'], {
                        withCredentials: true
                    })
                    .success(function(result) {
                        console.log(result);
                        login();
                    });
            });
        }

    }

})();
