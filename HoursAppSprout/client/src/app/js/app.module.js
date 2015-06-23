/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function() {
  'use strict';

  /**
   * Base module which handles global configurations in .config and initialization in .run.
   * This module loads all other modules which in turn load their own sub modules
   */
  angular
    .module('hoursappsprout', [
      'app.config',

      'ui.router',
      'ngAnimate',
      'ngTouch',

      'foundation',

      'ngCordova',
      'snap',
      'psaf-logger',
      'hoursappsprout.layout',
      'hoursappsprout.login',
      'hoursappsprout.home',
      'hoursApp.directives'
    ])
    .config(AppConfig)
    .run(AppRun);

  AppConfig.$inject = [
    '$stateProvider',
    '$urlRouterProvider',
    'snapRemoteProvider',
    'psafLoggerProvider',
    'CONFIG'
  ];

  function AppConfig ($stateProvider, $urlRouterProvider, snapRemoteProvider, 
    psafLoggerProvider, CONFIG, RestangularProvider) {
    psafLoggerProvider.logging(true);

    snapRemoteProvider.globalOptions = {
      disable: 'right'
    };

    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('/login');

    /**
     * This abstract route serves as the base route for all other routes with parent: 'root'.
     * It loads the default page elements, topbar, menu, header and footer
     */
    $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        views: {
          
          '@content': {
            templateUrl: 'app/login/login.html',
            controller: 'LoginController'
          }
        }
      });

  }

  AppRun.$inject = [
    '$rootScope',
    '$state',
    '$timeout',
    '$cordovaStatusbar',
    'LoginService',
    'HomeService'
  ];

  function AppRun ($rootScope, $state, $timeout, $cordovaStatusbar, LoginService, HomeService) {

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        //$rootScope.logger.log('State Change ERROR:', JSON.stringify(error));
    });

    $rootScope.navigate = function (state, params) {
      //$rootScope.setNavLeft();
      $state.go(state, params);
    };

    $rootScope.back = function () {
      history.back();
    };

    $rootScope.navigateBack = function (state, params) {
      //$rootScope.setNavRight();
      $state.go(state, params);
    };

    $rootScope.setNavLeft = function () {
      $timeout(function () {
        $rootScope.AppSlide = 'slideInLeft slideOutLeft';
      }, $rootScope.slideTransitionDuration);
    };

    $rootScope.setNavRight = function () {
      $timeout(function () {
        $rootScope.AppSlide = 'slideInRight slideOutRight';
      }, $rootScope.slideTransitionDuration);
    };

    $rootScope.getAppSlide = function () {
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
