'use strict';

/**
 * The main project controller
 */
angular.module('Mastermind')
  .controller('MainCtrl', ['$scope', '$state', '$filter', 'Resources', 'projects',
    function ($scope, $state, $filter, Resources, projects) {
      $scope.today = $filter('date')(new Date());
      $scope.projects = projects;
      
      //Get todays date formatted as yyyy-MM-dd
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = yyyy+'-'+mm+'-'+dd;
      
      var apQuery = {startDate:{$lte:today},$or:[{endDate:{$exists:false}},{endDate:{$gt:today}}]};
      var apFields = {resource:1,name:1};
      
      Resources.query('projects', apQuery, apFields, function(result){
    	  $scope.activeProjects = result;
    	  $scope.projectCount = result.count;
      });


      /**
       * Navigate to creating a project.
       */
      $scope.createProject = function () {
        $state.go('projects.new');
      };

      /**
       * Navigate to view a list of active projects.
       */
      $scope.showProjects = function () {
        $state.go('projects.index');
      };

      /**
       * Navigate to view a list of people who can be assigned to projects.
       */
      $scope.showPeople = function () {
        $state.go('people');
      };

      /**
       * Calculates whether the project exists within a particular month.
       *
       * @param project
       * @param month
       */
      $scope.inMonth = function (project, month, year) {
        var nextMonth = month === 11 ? 0 : (month + 1),
          nextYear = month === 11 ? (year + 1) : year,
          startDay = new Date(year, month, 1),
          endDay = new Date(nextYear, nextMonth, 0);

        // If the project start day is before the last day of this month
        // and its end date is after the first day of this month.
        var returnValue = new Date(project.startDate) <= endDay && (project.endDate === null || new Date(project.endDate) >= startDay);
        return returnValue;
      };
    }]);


