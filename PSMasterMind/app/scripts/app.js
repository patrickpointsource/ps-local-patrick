'use strict';

angular.module('PSMasterMindApp', ['ui.router', 'ui.bootstrap', 'ui.date', 'ngTable', 'ngResource'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('projects', {
        url: '/projects',
        templateUrl: 'views/projects/index.html'
      })
      .state('projects.new', {
        url: '/new',
        templateUrl: 'views/project.html',
        controller: 'NewProjectCtrl'
      })
      .state('projects.new/tab', {
        url: '/new/:activeTab',
        templateUrl: 'views/project.html',
        controller: 'NewProjectCtrl'
      })
      .state('projects.new/tab/innerTab', {
        url: '/new/:activeTab/:newRoleRateType',
        templateUrl: 'views/project.html',
        controller: 'NewProjectCtrl'
      })
      .state('projects.show', {
        url: '/:projectId',
        templateUrl: 'views/project.html',
        controller: 'EditProjectCtrl'
      })
      .state('projects.show/tab', {
        url: '/:projectId/:activeTab',
        templateUrl: 'views/project.html',
        controller: 'EditProjectCtrl'
      })
      .state('projects.show/tab/innerTab', {
        url: '/:projectId/:activeTab/:newRoleRateType',
        templateUrl: 'views/project.html',
        controller: 'EditProjectCtrl'
      });
  }).run(["$rootScope", "$location",
              function ($rootScope, $location) {
	  $rootScope.logout = function(){
		  var access_token = localStorage["access_token"];
		  helper.disconnectUser(access_token);
	  }
  }] );;