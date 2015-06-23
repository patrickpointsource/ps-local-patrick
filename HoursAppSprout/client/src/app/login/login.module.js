(function() {
	'use strict';

	angular
	    .module('hoursappsprout.login', ['googlePlus'])
        .config(LoginConfig)
        .run(LoginRun);

    LoginConfig.$inject = [
    '$stateProvider',
    'CONFIG',
    'googlePlusServiceProvider'];

    function LoginConfig ($stateProvider, CONFIG, googlePlusServiceProvider) {

        console.log('Calling from login module');

    	googlePlusServiceProvider.setConfig({
    		clientid: CONFIG.googleClientId,
    		scope: CONFIG.googleScopes
    	});

    	$stateProvider
            .state('login', {
                url: '/login',
                views: {
                    'content@': {
                        templateUrl: 'app/login/login.html',
                        controller: 'LoginController'
                    }
                }
            });

    }

    LoginRun.$inject = [];

    function LoginRun() {
    }

})();
