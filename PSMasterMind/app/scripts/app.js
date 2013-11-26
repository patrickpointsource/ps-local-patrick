'use strict';

angular.module('PSMasterMindApp', ['ui.router', 'ui.bootstrap', 'ui.date', 'ngTable', 'ngResource', 'restangular'])
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
        controller: 'MainCtrl',
        resolve: {
          projects: function (ProjectsService) {
            return ProjectsService.list();
          }
        }
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
            return ProjectsService.get($stateParams.projectId);
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
        resolve: {
          result: function (People) {
            return People.query();
          }
        }
      });
  })
  .config(function (RestangularProvider) {
    var serverLocation = 'http://localhost:8080';

    function toJsonReplacer(key, value) {
      var val = value;

      if (typeof key === 'string' && key === '$$hashKey') {
        val = undefined;
      }

      return val;
    }

    RestangularProvider.setBaseUrl(serverLocation + '/MasterMindServer/rest/')
      .setDefaultHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      })
      .setDefaultHttpFields({
        withCredentials: true,
        transformRequest: [function (data) {
          /*
          HACK to get around #1463 at:
          https://github.com/angular/angular.js/issues/1463
          This encodes the provided object as-is, whereas the default Angular behavior strips out all properties
          beginning with '$'. This is an issue when using data from MongoDB where a response may include a property
          like

          ...
          "_id": { "$oid": "..." }
          ...

          Also, need to remove any keys that match '$$hashKey' because these are added by Angular and hated by Mongo
          */
          return data != null && typeof data === 'object' && toString.apply(data) !== '[object File]' ? JSON.stringify(data, toJsonReplacer) : data;
        }]
      });
  })
  .run(['$rootScope',
    function ($rootScope) {
      $rootScope.logout = function () {
        var access_token = localStorage['access_token'];
        helper.disconnectUser(access_token);
      };
    }]);