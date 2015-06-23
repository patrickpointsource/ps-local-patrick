/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function(){
  'use strict';

  angular
      .module('hoursappsprout.home')
      .controller('HomeController', HomeController);

  HomeController.$inject = ['$rootScope','$scope', 'psafLogger', 'HomeService', '$window'];

  function HomeController ($rootScope, $scope, psafLogger, HomeService, $window) {

    var userId;
  	var logger = psafLogger.getInstance('hoursappsprout.reports.controller');
  	logger.info('Welcome to hoursappsprout');

    console.log('calling from home controller');


    $scope.userData = HomeService.getUserData();

    $scope.dateArray = HomeService.constructDateArray();

    $scope.taskData = HomeService.getTaskData();
    $scope.projectData = HomeService.getProjectData();
    $scope.hoursData = HomeService.getHoursData();

    console.log('userData returns ', $scope.userData);
    console.log('hoursData returns ', $scope.hoursData);
    console.log('projectData returns ', $scope.projectData);
    console.log('taskData returns ', $scope.taskData);




   // console.log('logging from home controller ', $scope.taskData[0].name);
    $scope.showMenu = '';
    $scope.currentDay = $scope.dateArray[5];

    //testing gui with the following three lines
    $rootScope.Days = ['1'];

    $rootScope.HoursTasks = [{name: 'PS MasterMind', hours: '5', id: '111'}, 
    {name: 'OnBoarding', hours: '3', id: '222'}];

    var currentDayTasks;

    $scope.currentDayTasks = currentDayTasks;

    //HomeService.constructHoursArray($scope.hoursData, $scope.projectData, $scope.taskData);

    $scope.entryView = function() {
      console.log('entryView() clicked');
      $scope.showMenu = 'entryAnimProjMenu';
    };
    $scope.close = function() {
      $scope.showMenu = '';
    };
    $scope.onDateChange = function() {
      console.log('onChangeDate clicked');
      $rootScope.HoursTasks = [{name: 'Hours App', hours: '2', id: '333'}, {name: 'Marketing',
       hours: '3.5', id: '444'}, {name: 'OnBoarding', hours: '3', id: '555'}];
      $rootScope.Days = ['2'];

    };
    $scope.editTask = function(taskId) {
        //$('.datepicker').pickadate();
        console.log('You clicked on this task ', taskId);
    };
    $scope.getNextDay = function()
    {
      var dateArray = $scope.dateArray;
      var currentDay = localStorage.getItem('currentDay');
      var nextDay, flag;
      var currentDayTasks = [];
      for(var x = 0; x < 12; x++)
      {
        if(dateArray[x] === currentDay)
        {
          if(x !== 11)
          {
            localStorage.setItem(dateArray[x + 1]);
            nextDay = dateArray[x + 1];
          }
          else
          {
            console.log('end of day array');
            flag = -1;
          }
        }
      }
      if(flag !== -1)
      {
        var hours = $scope.hoursData;
        for(var y = 0; y < hours.length; y++)
        {
          if(hours[y].date === nextDay)
          {
            currentDayTasks.push(hours[y]);
          }
        }
      }
      return currentDayTasks;

    };
    $scope.testFunction = function()
    {
      console.log('Printing from testFunction');
    };

  }

})();
