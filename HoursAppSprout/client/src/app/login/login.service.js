/*jshint camelcase: false */
(function() {
    'use strict';
    angular
	    .module('hoursappsprout.login')
	    .factory('LoginService', LoginService);

	    LoginService.$inject = ['$q', '$http', 'CONFIG', 'psafLogger', 'googlePlusService'];

	    function LoginService ($q, $http, CONFIG, psafLogger, googlePlusService) {
	       
	        var logger = psafLogger.getInstance('hoursappsprout.login.LoginService');
	        var accessToken = null;
	        return {

        	    setIsAuthenticated: function (isAuthenticated){
        		     sessionStorage.isAuthenticated = isAuthenticated;
        	    },
        	    getIsAuthenticated: function(){
        		    return sessionStorage.isAuthenticated;
        	    },
        	    isAuthenticated: function(){
        		    if(this.getIsAuthenticated() === 'true'){
        			    return true;
        		    }
        		    else{
        			    return false;
        		    }
        	    },
            googlePlusLogin: function(){
                var deferred = $q.defer();

                var self = this;
                googlePlusService.login().then(function (authResult) {


               $http.get('http://localhost:3000/auth?code=' + authResult.code, {
                    withCredentials: true
                })
                .success(function(result) {
                    console.log('Oh yeah! ' + result);
                   // login();
                    deferred.resolve();
                })
                .error(function(result) {
                    console.log('Oh no! ' + result);
                    //showLoginBox();
                    deferred.reject();
                });

                    // $http(request).success(
                    //     function (data, status, headers, config) {
                    //         logger.debug('Successful google authentication');
                    //         self.setIsAuthenticated(true);
                    //         deferred.resolve(authResult);
                    //     }).error(
                    //     function (data, status, headers, config) {
                    //         logger.error('Error authenticating with google: ' + data);
                    //         deferred.reject(data);
                    //     }).finally(function(){

                    //     });
                }, function (err) {
                    deferred.reject(err);
                });

                return deferred.promise;
            },

            logout: function (){
                var request = {
                    method: 'GET',
                    url: CONFIG.apiHost + 'api/auth/logout'
                };

                var self = this;
                $http(request).success(
                    function (data, status, headers, config) {
                        logger.debug('Google logout success');
                        self.setIsAuthenticated(false);
                    }).error(
                    function (data, status, headers, config) {
                        self.setIsAuthenticated(false);
                    }).finally(function(){
                       // misc.hideLoader();
                        window.location = '#/signin';
                    });

                if(!window.cordova){
                    gapi.auth.signOut();
                }
            }
        };
    }
})();