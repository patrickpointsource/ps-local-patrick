/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function(){
  'use strict';

  angular
      .module('mastermind')
      .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', 'psafLogger'];

  function HomeController ($scope, psafLogger) {

  	var logger = psafLogger.getInstance('mastermind.reports.controller');
  	logger.info('Welcome to MasterMind');

  }

})();
