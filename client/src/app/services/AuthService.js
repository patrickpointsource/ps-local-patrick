(function() {
    angular
        .module('app.services')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['psafLogger', 'ModalFactory', '$rootScope', '$http', '$window', '$q', '$state'];

    function AuthService(psafLogger, ModalFactory, $rootScope, $http, $window, $q, $state) {

        var logger = psafLogger.getInstance('mastermind');

        var isLoggedIn = false;

        return {
            login: login,
            showLoginBox: showLoginBox,
            init: init,
            isLoggedIn: function() {
                return isLoggedIn;
            },
            refreshAccessToken: refreshAccessToken
        };

        function login() {
            isLoggedIn = true;
            $rootScope.isLoggedIn = true;
            logger.log('Is Logged In ', isLoggedIn);
            return;
        }

        function showLoginBox() {
            isLoggedIn = false;
            var loginConfig = {
                id: 'login-modal',
                template: '<div>You should login to get access.</div><div>' +
                        '<google-plus-signin zf-close clientid="141952851027-natg34uiqel1uh66im6k7r1idec5u8dh' +
                        '.apps.googleusercontent.com"></google-plus-signin></div>'
            };
            logger.log('Log \'em');
            var modal = new ModalFactory(loginConfig);

            modal.activate();

            return;
        }

        function init() {
            // Register a listener for signin success and pass along the credentials to
            // the server side so that we don't have to do that later.
            $rootScope.$on('event:google-plus-signin-success', function(event, authResult) {
                logger.log(authResult);

                refreshAccessToken(authResult).then(
                    function() {
                        var state = $state.current;
                        console.dir(state);
                        $state.reload(state.name);
                    });
            });
        }

        function refreshAccessToken(authResult) {
            var code;
            var deferred = $q.defer();

            if (angular.isDefined(authResult)) {
                code = authResult['code'];
            }

            if (!code) {
                // figure out how to trigger a login;
                showLoginBox();
                deferred.reject();
                return deferred.promise;
            }

            deferred.notify('Attempting to refresh access token.');
            $http.get('http://localhost:3000/auth?code=' + code, {
                    withCredentials: true
                })
                .success(function(result) {
                    logger.log('Oh yeah! ' + result);
                    login();
                    deferred.resolve();
                })
                .error(function(result) {
                    logger.log('Oh no! ' + result);
                    showLoginBox();
                    deferred.reject();
                });
            return deferred.promise;
        }
    }

})();
