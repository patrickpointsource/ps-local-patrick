/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function(){
  'use strict';

  angular
      .module('mastermind.layout.menu')
      .controller('LeftMenuController', LeftMenuController);

  LeftMenuController.$inject = ['$scope', '$rootScope', 'FoundationApi'];

  function LeftMenuController ($scope, $rootScope, FoundationApi) {

    $scope.menuNavigate = function (state, params) {

      $rootScope.$broadcast('menuNavigate');
      $rootScope.navigate(state, params);

    };

  }

})();
