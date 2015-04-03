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
  angular.module('Mastermind.controllers.reports', []);
  angular.module('Mastermind.models.projects', []);
  angular.module('Mastermind.services.projects', []);
  angular.module('Mastermind.services.reports', []);
  angular.module('d3', []);
  angular.module('Mastermind.directives', ['d3']);
  angular.module('Mastermind', [
    'ui.router',
    'ui.select',
    'ui.bootstrap.tabs',
    'ui.bootstrap.timepicker',
    'ui.bootstrap',
    'ngTable',
    'restangular',
    'textAngular',
    'n3-charts.linechart',
    'Mastermind.directives',
    'Mastermind.controllers.people',
    'Mastermind.controllers.projects',
    'Mastermind.controllers.staffing',
    'Mastermind.controllers.reports',
    'Mastermind.models.projects',
    'Mastermind.services.projects',
    'Mastermind.services.reports'
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
          templateUrl: 'modules/admin/views/admin.html',
          controller: 'AdminCtrl'
        })
        .state('projects', {
          url: '/projects?filter',
          abstract: true,
          template: '<ui-view />'
        })
        .state('projects.index', {
          url: '',
          templateUrl: 'modules/projects/views/index.html?filter',
          controller: 'ProjectsCtrl'
        })
        .state('projects.new', {
          url: '/new',
          templateUrl: 'modules/projects/views/edit.html',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return true;
            }
          }
        })
        .state('projects.show', {
         // url: '/:projectId/:tabId',
        	 //url: '/:projectId/[tabId]',
          url: '/{projectId}{tabId:(?:/(?!edit)[^/]+)?}',
          templateUrl: 'modules/projects/views/show.html',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return false;
            }
          }
        })
        .state('projects.edit', {
          url: '/:projectId/edit/:editTab',
        	//url: '/{projectId}{tabId:(?:/(?!edit)[^/]+)?}/edit',
          templateUrl: 'modules/projects/views/edit.html',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return true;
            }
          }
        })
       
        .state('projects.show.tabEdit', {
          url: '/:edit',
          templateUrl: 'modules/projects/views/show.html',
          //template: '<div ui-view />',
          controller: 'ProjectCtrl',
          resolve: {
            editMode: function () {
              return true;
            }
          }
        })
        .state('people', {
          url: '/people?filter',
          abstract: true,
          template: '<ui-view />'
        })
        .state('people.index', {
          url: '',
          templateUrl: 'modules/people/people.html?filter',
          controller: 'PeopleCtrl'
        })
       .state('people.show', {
          url: '/:profileId?edit',
          templateUrl: 'modules/people/profile.html',
          controller: 'ProfileCtrl'
        })
        .state('calendar', {
          url: '/calendar',
          templateUrl: 'modules/calendar/views/calendar.html',
          controller: 'CalendarCtrl'
        })
       .state('staffing', {
          url: '/staffing?tab&startDate&endDate&projectName&projectResource&roleId&role',
          templateUrl: 'modules/staffing/staffing.html',
          controller: 'StaffingCtrl'
        })
      
        .state('reports', {
          url: '/reports',
          abstract: true,
          template: '<ui-view />',
          controller: 'ReportsCtrl'
        })
        .state('reports.shell', {
          url: '/?view',
          //templateUrl: '/modules/reports/views/reportsShell.html',
          templateUrl: '/modules/reports/views/reports.html',
        })
        .state('reports.people', {
          url: '/people',
          abstract: true,
          template: '<ui-view />',
          controller: 'PeopleReportCtrl'
        })
        .state('reports.project', {
          url: '/project',
          abstract: true,
          template: '<ui-view />',
          controller: 'ProjectReportCtrl'
        })
        .state('reports.people.select', {
          url: '/select',
          templateUrl: '/modules/reports/views/peopleSelect.html'
        })
        .state('reports.people.choice', {
          url: '/choice',
          templateUrl: '/modules/reports/views/reportsPeopleChoice.html'
        })
        .state('reports.people.output', {
          url: '/output',
          templateUrl: '/modules/reports/views/reportsPeopleOutput.html'
        })
        .state('reports.people.hours', {
          url: '/output/hours',
          templateUrl: '/modules/reports/views/peopleHours.html'
        })
        .state('reports.project.select', {
          url: '/select',
          templateUrl: '/modules/reports/views/projectSelect.html'
        })
        .state('reports.project.output', {
          url: '/output',
          templateUrl: '/modules/reports/views/projectOutput.html'
        })
      /*.state('reportsshell', {
          url: '/reportsshell',
          templateUrl: 'modules/reports/views/reportsShell.html',
          controller: 'ReportsCtrl'
        });*/
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
             '_id': { '$oid': '...' }
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
            data = resp.data,
            method = resp.method,
            url = resp.url,
            accessToken;

          console.log(method + ' ' + url + ' (' + status + ')');

          if (status === 401 || status === 403) {
            if (status === 401) {
              console.log('Failed to login to MasterMind:');
            }
            if (status === 403) {
              if (data.indexOf("Unauthorized") != -1) {
                  alert('You are not a member of the PointSource domain');
              }	
              
              accessToken = localStorage.getItem('access_token');
              helper.disconnectUser(accessToken);
              ret = false;
            }
          }

          return ret; // false to stop the promise chain
        }
      );
    }])
    .directive('errSrc', function() {
    	return {
    		link: function(scope, element, attrs) {
    			attrs.$observe('ngSrc', function(value) {
    				  if ((!value || value.indexOf("generic") > 0) && attrs.errSrc) {
    				    attrs.$set('ngSrc', attrs.errSrc);
    				  }
    				});
    			attrs.$observe('src', function(value) {
  				  	if ((!value || value.indexOf("generic") > 0) && attrs.errSrc) {
  				  		attrs.$set('src', attrs.errSrc);
  				  	}
  				});
    			element.bind('error', function() {
    		        if (attrs.ngSrc != attrs.errSrc || attrs.src != attrs.errSrc) {
    		          attrs.$set('ngSrc', attrs.errSrc);
    		          attrs.$set('src', attrs.errSrc);
    		        }
    		      });
    		}
    	};
    })
    .run(['$rootScope', '$state', 'Resources',
        function ($rootScope, $state, Resources) {
    	//Handle browser navigate away
    	window.onbeforeunload = function (event) {
    		if($rootScope.formDirty){
    			var message = 'You have not saved your changes. Are you sure want to leave?';
    			if (typeof event === 'undefined') {
    			    event = window.event;
    			}
    			if (event) {
    				event.returnValue = message;
    			}
    			return message;
    		}
    	};

    	if (localStorage.token)
	    {
    	    var token = JSON.parse(localStorage.token);

    	    gapi.auth.checkSessionState({ client_id: token.client_id, session_state: token.session_state },
                function (authenticated)
                {
                    if (authenticated)
                    {
                        var expTime = helper.calcExpiration();
                        
                        helper.authTimer = setTimeout(function () { helper.authorize(null, Resources); }, expTime);
                    }
                    else
                        helper.authorize(null, Resources);
                });
    	}
    	else
	        console.log("Access token not found.");
        
  	  	$rootScope.$on('$stateChangeStart', 
  	  		_.bind(function(event, toState, toParams, fromState, fromParams) {
  		  	if($rootScope.formDirty){
  		  		$rootScope.needsTonavigateOut = true;
  		  		
  		  		var _this = this;
  		  		event.preventDefault();
  		  		
  		  		$rootScope.modalDialog = {
  		  			title: 'Save Changes',
  		  			text: 'Would you like to save your changes before leaving?',
	  		  		ok: 'YES',
			  		no: 'NO',
			  		cancel: 'Cancel',
			  		okHandler: function() {
			  			if($rootScope.projectEdit) {
			  				return $rootScope.dirtySaveHandler();
			  			}
			  			else {
			  				return $rootScope.dirtySaveHandler().then(function(project) {//Unset dirty flag
				  				$rootScope.formDirty = false;
				  				$('.modalYesNo').modal('hide');
					  		});
			  			}
  		  			},
  		  			noHandler: function() {
  		  				$rootScope.formDirty = false;
  		  				$('.modalYesNo').modal('hide');
  		  			},
  		  			Handler: function() {
  		  				$('.modalYesNo').modal('hide');
  		  			}
  		  		};
  		  		
  		  		$rootScope.navigateOutFunc = function() { 
					$rootScope.formDirty = false;
					_this.state.go(toState); 
				};
  		  		
  		  		$('.modalYesNo').modal('show').on('hide.bs.modal', function(e) {
  		  			if(!$rootScope.formDirty) {
  		  				if($rootScope.projectEdit) {
  		  					_this.state.go(toState);
  		  				}
  		  			}
  		  		});
            }
  	  	}, {state: $state}));
  	  	
  	  	$rootScope.hideModals = function() {
  	  		$('.modalYesNo').modal('hide');
  	  		$('#dateShiftConfirm').modal('hide');
  	  		$('.modal-backdrop').hide();
  	  	};
  	  	
  	  	// use it as private variable
  	  	var currentPermissions = {};
  	  
  	  	$rootScope.setPermissions = function(permissions) {
  	  		currentPermissions = permissions;
  	  	};
  	  	
  	  	$rootScope.hasPermissions = function(permissionName) {
  	  		
  			var result = false;
  			
  			if (!permissionName) {
  				throw "Unknown permission passed:" + permissionName;
  				return;
  			}
  			for (var permission in currentPermissions) {
  				if (!result && _.find(currentPermissions[permission], function(perm) { return perm == permissionName}))
  					result = true;
  			}
  			
  			return result;
  		};
  		
  	  	
        $rootScope.logout = function () {
          var accessToken = localStorage.getItem('access_token');

          //Clear Local Storage
          localStorage.clear();

          helper.disconnectUser(accessToken, function(cb) {
        	  Resources.get('resetuser').then(function() {
        		  console.log('user resetted');
        		  cb(true);
        	  }).catch(function(e) {
        		  console.log('error:');
        		  cb(false);
        	  });
          });
        };

        // fix bootstrap responsive navbar not collapsing when being clicked in single page apps
        $(document).on('click', '.navbar-collapse.in', function() {
          $(this).collapse('hide');
        });
      }]);
}(window));