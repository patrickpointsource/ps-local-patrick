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

            'ui.router',
            'ngAnimate',
            'ngTouch',

            'foundation',

            'ngCordova',
            'psaf-logger',
            'mastermind.layout',
            'swagger-client',
            'directive.g+signin',
            'restangular',
            'PeopleModule',
            'AuthModule',
            'UserModule',
            'mastermind.layout.header'
        ])
        .config(AppConfig)
        .run(AppRun);

    AppConfig.$inject = [
        '$stateProvider',
        '$urlRouterProvider',
        'psafLoggerProvider',
        'RestangularProvider',
        'CONFIG'
    ];

    function AppConfig($stateProvider, $urlRouterProvider, psafLoggerProvider, RestangularProvider, CONFIG) {
        psafLoggerProvider.logging(true);

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise('/home');

        RestangularProvider.setBaseUrl(CONFIG.development.apiUrl)
            .setDefaultHttpFields({
                withCredentials: true
            });

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
                        templateUrl: 'app/modules/people/index.html',
                        controller: 'PeopleController',
                        controllerAs: 'people'
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
        'PeopleService',
        'AuthService',
        'UserService',
    ];

    function AppRun($rootScope, $state, $timeout, $cordovaStatusbar, $http, AuthService, UserService) {

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
