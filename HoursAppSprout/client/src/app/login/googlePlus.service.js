/*jshint -W106 */
(function() {
    'use strict';

    angular
        .module('googlePlus')
        .provider('googlePlusService', GooglePlus);

    function GooglePlus (CONFIG) {

        var clientid;
        var scope;
        var auth2;

        this.setConfig = function (params){
            clientid = params.clientid;
            scope = params.scope;
        };

        this.$get = ['$q', 'psafLogger', '$http', function ($q, psafLogger, $http) {

            var logger = psafLogger.getInstance('hoursappsprout.login.GooglePlus');

            return {
              

                login: function () {
                    var deferred = $q.defer();
                    console.log('calling from googlePlus.service');
                    // Flow modified from ngCordova to match our needs
                    // ngCordova was not setup to get a code.  It only supported access token response_type
                    if (window.cordova) {
                        var browserRef = window.open('https://accounts.google.com/o/oauth2/auth?access_type=online&' +
                        'client_id=' + clientid + '&redirect_uri=http://localhost/callback&scope=' + scope +
                        '&approval_prompt=force&response_type=code', '_blank', 'location=no,clearsessioncache=yes,'+
                        'clearcache=yes');

                        browserRef.addEventListener('loadstart', function (event) {
                            if ((event.url).indexOf('http://localhost/callback') === 0) {
                                var callbackResponse = (event.url).split('?')[1];
                                var responseParameters = (callbackResponse).split('&');
                                var parameterMap = [];
                                for (var i = 0; i < responseParameters.length; i++) {
                                    var key = responseParameters[i].split('=')[0];
                                    parameterMap[key] = responseParameters[i].split('=')[1];
                                }
                                if (parameterMap['code'] !== undefined && parameterMap['code'] !== null) {
                                    deferred.resolve(parameterMap['code']);
                                } else {
                                    deferred.reject('Unable to load google code');
                                }
                                browserRef.close();
                            }
                        });

                    } else {
                        gapi.auth.signIn({
                            clientid: clientid,
                            scope: scope,
                            immediate: false,
                            cookiepolicy: 'single_host_origin',
                            approvalprompt: 'force',
                            accesstype: 'offline',
                            redirecturi: CONFIG.redirect_uri,
                            callback: function (authResult) {
                                if (authResult && !authResult.error) {
                                    // The redirect URI does not come back in this request and is required
                                    // on the server
                                    authResult['redirect_uri'] = CONFIG.redirect_uri;
                                    deferred.resolve(authResult);
                                } else {
                                    deferred.reject('auth error');
                                }
                            }
                        });
                    }

                    return deferred.promise;
                }
            };
        }];
    }})();