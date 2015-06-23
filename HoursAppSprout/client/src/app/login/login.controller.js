(function() {
    'use strict';

    angular
	    .module('hoursappsprout.login')
	    .controller('LoginController', LoginController);

    LoginController.$inject = ['$scope', '$rootScope', 'psafLogger',  'LoginService', '$state'];

    function LoginController($scope, $rootScope, psafLogger, LoginService, $state) {
    	var self = this;
    	var accessToken = null;
	    var logger = psafLogger.getInstance('hoursappsprout.login.LoginController');

	    $rootScope.setNavLeft();

	    $scope.routeHome = function() {

	    	$rootScope.navigateBack('home');
	    };
        $scope.test = 'Calling from controller';

        function authSuccess(authResult) {
            console.log('auth success');
        	$state.go('home', null);
        }
        function authFailure(err){
        	//DO I Need This Logger?
            logger.error('Authentication failure: ');
            logger.error(err);
        }
        $scope.googlePlusLogin = function() {
        	LoginService.googlePlusLogin().then(authSuccess,authFailure);
            console.log('CLICKED IT');
    };
}
})();