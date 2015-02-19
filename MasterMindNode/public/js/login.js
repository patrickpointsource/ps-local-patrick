'use strict';

var myApp = angular.module('mastermind',[]);
 
myApp.controller('loginController', ['$scope', '$http', function($scope, $http) {
     $scope.authenticate = function(token){
         // Set the authorization header to login
         $http({method: 'GET', url: '/login/google', headers: {'Authorization': 'Bearer ' + localStorage.access_token}}).
            success(function(data, status, headers, config) {

            }).
            error(function(data, status, headers, config) {

            });
        };
    }
]);
