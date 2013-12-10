/*jslint browser: true*/
(function (window) {
  'use strict';

  var toString = window.toString,
    alert = window.alert,
    helper = window.helper,
    angular = window.angular,
    localStorage = window.localStorage,
    console = window.console;

  angular.module('Mastermind.controllers.people', []);
  angular.module('Mastermind.controllers.projects', []);
  angular.module('Mastermind.models.projects', []);
  angular.module('Mastermind.services.projects', []);
  angular.module('Mastermind', [
    'ui.router',
    'ui.date',
    'ui.bootstrap.tabs',
    'ngTable',
    'restangular',
    'Mastermind.controllers.people',
    'Mastermind.controllers.projects',
    'Mastermind.models.projects',
    'Mastermind.services.projects'
  ])
    .config(function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider
        .otherwise('/');

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'views/main.html',
          controller: 'MainCtrl',
          resolve: {
            projects: function (ProjectsService) {
              var accessToken = localStorage.getItem('access_token'),
                projects = null;

              if (accessToken !== null) {
                projects = ProjectsService.list();
              }

              return projects;
            }
          }
        })
        .state('projects', {
          url: '/projects?filter',
          abstract: true,
          template: '<ui-view />'
        })
        .state('projects.index', {
          url: '',
          templateUrl: 'views/projects/index.html?filter',
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
          controller: 'ProjectCtrl',
          resolve: {
            project: function (ProjectsService) {
              return ProjectsService.create();
            },
            executives: function (Groups) {
              return Groups.get('execs');
            },
            salesRepresentatives: function (Groups) {
              return Groups.get('sales');
            }
          }
        })
        .state('projects.show', {
          url: '/:projectId',
          templateUrl: 'views/projects/show.html',
          controller: 'ProjectCtrl',
          resolve: {
            project: function (ProjectsService, $stateParams) {
              return ProjectsService.get($stateParams.projectId);
            },
            executives: function (Groups) {
              return Groups.get('execs');
            },
            salesRepresentatives: function (Groups) {
              return Groups.get('sales');
            }
          }
        })
        .state('people', {
          url: '/people',
          abstract: true,
          template: '<ui-view />'
        })
        .state('people.index', {
          url: '/?filter',
          templateUrl: 'views/people/people.html',
          controller: 'PeopleCtrl',
          resolve: {
            result: function (People) {
              return People.query();
            }
          }
        })
        .state('people.show', {
          url: '/:profileId',
          templateUrl: 'views/people/profile.html',
          controller: 'ProfileCtrl'
        });
    })
    .config(function (RestangularProvider) {
      var serverLocation = 'http://localhost:8080';

      function toJsonReplacer(key, value) {
        var val = value;

        if (typeof key === 'string' && (key === '$$hashKey' || key === '$meta')) {
          val = undefined;
        }

        return val;
      }

      RestangularProvider.setBaseUrl(serverLocation + '/MasterMindStaging/rest/')
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
            return data !== null && typeof data === 'object' && toString.apply(data) !== '[object File]' ? JSON.stringify(data, toJsonReplacer) : data;
          }]
        });

      //Set Error Intercepter
      RestangularProvider.setErrorInterceptor(
        function (resp) {
          console.log('Error Interceptor!');
          //var json = JSON.stringify(resp);
          console.log(resp);

          var ret = true;

          var status = resp.status,
            method = resp.method,
            url = resp.url,
            accessToken;

          console.log(method + ' ' + url + ' (' + status + ')');

          if (status === 401 || status === 403) {
            if (status === 401) {
              console.log('Failed to login to MasterMind:');
            }
            if (status === 403) {
              alert('You are not a member of the PointSource domain');
            }

            accessToken = localStorage.getItem('access_token');
            helper.disconnectUser(accessToken);
            ret = false;
          }

          return ret; // false to stop the promise chain
        }
      );
    })
    .run(['$rootScope',
      function ($rootScope) {
        $rootScope.logout = function () {
          var accessToken = localStorage.getItem('access_token');

          //Clear Local Storage
          localStorage.clear();

          helper.disconnectUser(accessToken);
        };

        // fix bootstrap responsive navbar not collapsing when being clicked in single page apps
        $(document).on('click', '.navbar-collapse.in', function(e) {
          $(this).collapse('hide');
        });
      }]);
}(window));