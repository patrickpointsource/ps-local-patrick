(function() {
  'use strict';

  angular
      .module('hoursappsprout.home', [])
      .config(homeConfig);

    homeConfig.$inject = ['$stateProvider'];

    function homeConfig($stateProvider) {
    	console.log('Calling from home module');

    	$stateProvider
            .state('home', {
                url: '/home',
                views: {
                    'content@': {
                        templateUrl: 'app/home/home.html',
                        controller: 'HomeController',
                        resolve: {
                          resolveUserData: function(HomeService) {
                            return HomeService.downloadUserData()                  
                          .then(function()
                          {
                            return HomeService.downloadHoursData();
                          })
                          .then(function()
                          {
                            return HomeService.downloadProjectData();
                          })
                          .then(function() {
                            return HomeService.downloadTaskData();
                          });
                        }
                      }
                    },
                     'left-menu@': {
                        templateUrl: 'app/layout/menu/left-menu.html',
                        controller: 'LeftMenuController'
                    },
                     'header@': {
                       templateUrl: 'app/layout/header/header.html',
                       controller: 'HeaderController'
                    }
                }
            });

  }



})();
