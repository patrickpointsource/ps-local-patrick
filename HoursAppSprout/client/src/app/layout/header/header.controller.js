/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function(){
  'use strict';

  angular
      .module('hoursappsprout.layout.header')
      .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', 'snapRemote'];

  function HeaderController ($scope, snapRemote) {

  	/**
     ** This is just a demonstration of how to potentially use the snapRemote if necessary
     **/
    $scope.toggle = function (side) {
      snapRemote.getSnapper().then(function(snapper) {
        snapRemote.toggle(side);
      });
    };

  }

})();
