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
  angular.module('Mastermind.controllers.staffing', []);
  angular.module('Mastermind.models.projects', []);
  angular.module('Mastermind.services.projects', []);
  angular.module('Mastermind', [
    'ui.router',
    'ui.bootstrap.tabs',
    'ngTable',
    'restangular',
    'textAngular',
    'n3-charts.linechart',
    'Mastermind.controllers.people',
    'Mastermind.controllers.projects',
    'Mastermind.controllers.staffing',
    'Mastermind.models.projects',
    'Mastermind.services.projects'
  ])
    .config( ['$logProvider','$stateProvider','$urlRouterProvider', function($logProvider, $stateProvider, $urlRouterProvider) {
      $logProvider.debugEnabled(false);

      $urlRouterProvider
        .otherwise('/');

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'views/main.html',
          controller: 'MainCtrl'
        })
        .state('admin', {
          url: '/admin',
          templateUrl: 'views/admin/admin.html',
          controller: 'AdminCtrl'
        })
        .state('projects', {
          url: '/projects?filter',
          abstract: true,
          template: '<ui-view />'
        })
        .state('projects.index', {
          url: '',
          templateUrl: 'views/projects/index.html?filter',
          controller: 'ProjectsCtrl'
        })
        .state('projects.new', {
          url: '/new',
          templateUrl: 'views/projects/edit.html',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return true;
            }
          }
        })
        .state('projects.show', {
          url: '/:projectId',
          templateUrl: 'views/projects/show.html',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return false;
            }
          }
        })
        .state('projects.edit', {
          url: '/:projectId/edit',
          templateUrl: 'views/projects/edit.html',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return true;
            }
          }
        })
        .state('projects.show.tabId', {
          url: '/:tabId',
          templateUrl: 'views/projects/show.html',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return false;
            }
          }
        })
        .state('projects.show.tabId.edit', {
          url: '/edit',
          templateUrl: 'views/projects/show.html',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return false;
            }
          }
        })
        .state('people', {
          url: '/people',
          abstract: true,
          template: '<ui-view />'
        })
        .state('people.index', {
          url: '/?filter&view',
          templateUrl: 'views/people/people.html',
          controller: 'PeopleCtrl'
        })
       .state('people.show', {
          url: '/:profileId?edit',
          templateUrl: 'views/people/profile.html',
          controller: 'ProfileCtrl'
        })
       .state('staffing', {
          url: '/staffing',
          templateUrl: 'views/staffing/staffing.html',
          controller: 'StaffingCtrl'
        });
    }])
    .config(['$compileProvider',
      function( $compileProvider ) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|skype|data):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
      }
    ])
    .config(['RestangularProvider', function(RestangularProvider) {
      var serverLocation = window.serverLocation;
      var restPath = window.restPath;

      function toJsonReplacer(key, value) {
        var val = value;

        if (typeof key === 'string' && (key === '$$hashKey' || key === '$meta')) {
          val = undefined;
        }

        return val;
      }

      RestangularProvider.setBaseUrl(serverLocation + restPath)
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
    }])
    .run(['$rootScope', '$state',
      function ($rootScope, $state) {
    	//Handle browser navigate away
    	window.onbeforeunload = function (event) {
    		if($rootScope.formDirty){
    			var message = 'You have not saved your changes. Are you sure want to leave?';
    			if (typeof event == 'undefined') {
    			    event = window.event;
    			}
    			if (event) {
    				event.returnValue = message;
    			}
    			return message;
    		}
    	};
	  	  
  	  	$rootScope.$on('$stateChangeStart', 
  	  		_.bind(function(event, toState, toParams, fromState, fromParams) { 
  		  	if($rootScope.formDirty){
  		  		
  		  		var _this = this;
  		  		event.preventDefault();
  		  		
  		  		$rootScope.modalDialog = {
  		  			title: "Save Changes",
  		  			text: "Would you like to save your changes before leaving?",
	  		  		ok: "Yes",
			  		no: "No",
			  		cancel: "Cancel",
			  		okHandler: function() {
			  			return $rootScope.dirtySaveHandler().then(function(project) {//Unset dirty flag
			  				$rootScope.formDirty = false;
			  				$(".modalYesNo").modal('hide');
				  		});
  		  			},
  		  			noHandler: function() {
  		  				$rootScope.formDirty = false;
  		  				$(".modalYesNo").modal('hide');
  		  			},
  		  			Handler: function() {
  		  				$(".modalYesNo").modal('hide');
  		  			}
  		  		};
  		  		
  		  		$(".modalYesNo").modal('show').on('hide.bs.modal', function(e) {
  		  			if(!$rootScope.formDirty) {	  				
  		  				_this.state.go(toState);
  		  			}
  		  		});
            }
  	  	}, {state: $state}));

        $rootScope.logout = function () {
          var accessToken = localStorage.getItem('access_token');

          //Clear Local Storage
          localStorage.clear();

          helper.disconnectUser(accessToken);
        };

        // fix bootstrap responsive navbar not collapsing when being clicked in single page apps
        $(document).on('click', '.navbar-collapse.in', function() {
          $(this).collapse('hide');
        });
      }]);
}(window));