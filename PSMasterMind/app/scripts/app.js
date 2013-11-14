'use strict';

angular.module('PSMasterMindApp', ['ngRoute', 'ui.bootstrap', 'ui.date', 'ngTable'])
  .config(function ($routeProvider) {  
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/newProject', {
    	  templateUrl: 'views/project.html',
          controller: 'NewProjectCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });