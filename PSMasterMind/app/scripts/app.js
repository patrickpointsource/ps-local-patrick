'use strict';

angular.module('PSMasterMindApp', ['ui.router', 'ui.bootstrap', 'ui.date', 'ngTable', 'ngResource'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      // Forward the user to the default tab
      .when('/projects/new', '/projects/new/details')
      .when('/projects/:projectId', '/projects/:projectId/details')
      .otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('projects', {
        url: '/projects',
        abstract: true,
        template: '<ui-view />'
      })
      .state('projects.index', {
        url: '',
        templateUrl: 'views/projects/index.html',
        controller: 'ProjectsCtrl',
        resolve: {
          projects: function (ProjectsService) {
            return ProjectsService.list();
          }
        }
      })
      .state('projects.new', {
        url: '/new',
        templateUrl: 'views/projects/show.html',
        controller: 'NewProjectCtrl',
        resolve: {
          project: function (ProjectsService) {
            return ProjectsService.create();
          }
        }
      })
      .state('projects.new.tab', {
        url: '/:activeTab',
        views: {
          'tabs': {
            templateUrl: 'views/projects/show/section-tabs.html',
            controller: 'ProjectSectionCtrl'
          },
          'tab-content': {
            templateUrl: function ($stateParams) {
              return 'views/projects/show/' + $stateParams.activeTab + '.html';
            },
            controller: 'ProjectSectionCtrl'
          }
        }
      })
      .state('projects.show', {
        url: '/:projectId',
        templateUrl: 'views/projects/show.html',
        controller: 'EditProjectCtrl',
        resolve: {
          project: function (ProjectsService, $stateParams) {
            return ProjectsService.get($stateParams.projectId).$promise;
          }
        }
      })
      .state('projects.show.tab', {
        url: '/:activeTab',
        views: {
          'tabs': {
            templateUrl: 'views/projects/show/section-tabs.html',
            controller: 'ProjectSectionCtrl'
          },
          'tab-content': {
            templateUrl: function ($stateParams) {
              return 'views/projects/show/' + $stateParams.activeTab + '.html';
            },
            controller: 'ProjectSectionCtrl'
          }
        }
      
      })
      .state('people', {
    	  url: '/people',
    	  templateUrl: 'views/people/people.html',
          controller: 'PeopleCtrl',
      });
  }).run(['$rootScope',
    function ($rootScope) {
      $rootScope.logout = function () {
        var access_token = localStorage['access_token'];
        helper.disconnectUser(access_token);
      };
    }]);