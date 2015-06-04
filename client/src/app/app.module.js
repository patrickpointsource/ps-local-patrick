/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function() {
    'use strict';

    /**
     * Base module which handles global configurations in .config and initialization in .run.
     * This module loads all other modules which in turn load their own sub modules
     */
    angular
        .module('mastermind', [
            'app.config',
            'app.services',
            'ui.router',
            'ngAnimate',
            'ngTouch',
            'foundation',
            'restangular',
            'ngCordova',
            'psaf-logger',
            'mastermind.layout',
            'swagger-client',
            'directive.g+signin',
            'mastermind.layout.header',
            'app.dashboard',
            'PeopleModule'
        ])
        .config(AppConfig)
        .run(AppRun);

    AppConfig.$inject = [
        '$stateProvider',
        '$urlRouterProvider',
        'psafLoggerProvider',
        'CONFIG'
    ];

    function AppConfig(
        $stateProvider,
        $urlRouterProvider,
        psafLoggerProvider,
        CONFIG
    ) {
        psafLoggerProvider.logging(true);

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise('/home');

        /**
         * This abstract route serves as the base route for all other routes with parent: 'root'.
         * It loads the default page elements, topbar, menu, header and footer
         */
        $stateProvider
            .state('root', {
                url: '',
                abstract: true,
                views: {
                    'menu@': {
                        templateUrl: 'app/layout/menu/menu.html',
                        controller: 'MenuController'
                    },
                    'header@': {
                        templateUrl: 'app/layout/header/header.html',
                        controller: 'HeaderController'
                    },
                    'content@': {
                        templateUrl: 'app/modules/dashboard/dashboard.html',
                        controller: 'DashboardController'
                    }
                }
            })
            .state('header', {
                parent: 'root',
                views: {
                    'header@': {
                        templateUrl: 'app/layout/header/header.html',
                        controller: 'HeaderController'
                    }
                }
            })
            .state('home', {
                parent: 'root',
                url: '/home',
                views: {
                    'content@': {
                        templateUrl: 'app/modules/dashboard/dashboard.html',
                        controller: 'DashboardController'
                    }
                }
            })
            .state('projects', {
                parent: 'root',
                url: '/projects',
                views: {
                    'content@': {
                        templateUrl: 'app/modules/projects/projects.html',
                        controller: 'ProjectsController'
                    }
                }
            })
            .state('profile', {
                parent: 'root',
                url: '/profile',
                views: {
                    'content@': {
                        templateUrl: 'app/modules/people/profile.html',
                        controller: 'ProfileController',
                        controllerAs: 'profile'
                    }
                }
            })
            .state('people', {
                parent: 'root',
                url: '/people',
                views: {
                    'content@': {
                        templateUrl: 'app/modules/people/people.html',
                        controller: 'PeopleController',
                        controllerAs: 'people'
                    }
                }
            })
            .state('styleguide', {
                parent: 'root',
                url: '/styleguide',
                views: {
                    'content@': {
                        templateUrl: 'app/layout/styleguide.html'
                    }
                }
            })
            .state('person', {
                parent: 'root',
                url: '/people/:id',
                views: {
                    'content@': {
                        templateUrl: 'app/modules/people/person.html',
                        controller: 'PersonController',
                        controllerAs: 'people'
                    }
                }
            });

    }

    AppRun.$inject = [
        '$rootScope',
        '$state',
        '$timeout',
        '$cordovaStatusbar',
        '$http',
        'Restangular',
        'AuthService',
        'CONFIG'
    ];

    function AppRun(
        $rootScope,
        $state,
        $timeout,
        $cordovaStatusbar,
        $http,
        Restangular,
        AuthService,
        CONFIG) {

        Restangular.setBaseUrl(CONFIG.development.apiUrl)
            .setDefaultHttpFields({
                withCredentials: true
            });

        Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
            if (response.status === 403 || response.status === 401) {
                AuthService.refreshAccessToken().then(function() {
                    // Repeat the request and then call the handlers the usual way.
                    $http(response.config).then(responseHandler, deferred.reject);
                });
                return false; // error handled
            }
            return true; // error not handled
        });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            $rootScope.logger.log('State Change ERROR:', JSON.stringify(error));
        });

        $rootScope.navigate = function(state, params) {
            //$rootScope.setNavLeft();
            $state.go(state, params);
        };

        $rootScope.back = function() {
            history.back();
        };

        $rootScope.navigateBack = function(state, params) {
            //$rootScope.setNavRight();
            $state.go(state, params);
        };

        $rootScope.setNavLeft = function() {
            $timeout(function() {
                $rootScope.AppSlide = 'slideInLeft slideOutLeft';
            }, $rootScope.slideTransitionDuration);
        };

        $rootScope.setNavRight = function() {
            $timeout(function() {
                $rootScope.AppSlide = 'slideInRight slideOutRight';
            }, $rootScope.slideTransitionDuration);
        };

        $rootScope.getAppSlide = function() {
            return $rootScope.AppSlide;
        };

        $rootScope.slideTransitionDuration = 250;

        FastClick.attach(document.body);

        document.addEventListener('deviceready', onDeviceReady, false);

        function onDeviceReady() {
            if (window.cordova) {
                $cordovaStatusbar.style(0);
            }
        }


    }

})();
