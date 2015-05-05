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
      'snap',
      'psaf-logger',
      'mastermind.layout'
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

  function AppConfig ($stateProvider, $urlRouterProvider, snapRemoteProvider, psafLoggerProvider, CONFIG) {
    psafLoggerProvider.logging(true);

    snapRemoteProvider.globalOptions = {
      disable: 'right'
    };

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
          'left-menu@': {
            templateUrl: 'app/layout/menu/left-menu.html',
            controller: 'LeftMenuController'
          },
          'header@': {
            templateUrl: 'app/layout/header/header.html',
            controller: 'HeaderController'
          },
          'footer@': {
            templateUrl: 'app/layout/footer/footer.html',
            controller: 'FooterController'
          },
          'content@': {
            templateUrl: 'app/home.html',
            controller: 'HomeController'
          }
        }
      })
      .state('home', {
        parent: 'root',
        url: '/home',
        views: {
          'content@': {
            templateUrl: 'app/home.html',
            controller: 'HomeController'
          }
        }
      });

  }

  AppRun.$inject = [
    '$rootScope',
    '$state',
    '$timeout',
    '$cordovaStatusbar'
  ];

  function AppRun ($rootScope, $state, $timeout, $cordovaStatusbar) {

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        $rootScope.logger.log('State Change ERROR:', JSON.stringify(error));
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
