/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function(){
  'use strict';

  angular
      .module('hoursappsprout.layout.menu')
      .controller('LeftMenuController', LeftMenuController);

  LeftMenuController.$inject = ['$scope', '$rootScope', 'FoundationApi', 'HomeService', '$state'];

  function LeftMenuController ($scope, $rootScope, FoundationApi, HomeService, $state) {


    $scope.userData = HomeService.getUserData();
    $scope.ProfPic = $scope.userData.thumbnail;
    $scope.username = $scope.userData.name.fullName;
    console.log('calling from menu, userdata is ', $scope.userData);

    $scope.menuNavigate = function (state, params) {

      $rootScope.$broadcast('menuNavigate');
      $rootScope.navigate(state, params);

     // $scope.ProfPic = userData.thumbnail;
      


    };
    var Message;
    var ProfPic;



    $scope.logout = function(){
      console.log('logout Clicked');
      localStorage.clear();
      $state.go('login');
      
    };

  }

  

})();
