'use strict';

/**
 * The main project controller
 */
angular.module('Mastermind')
  .controller('MainCtrl', ['$scope', '$state', '$filter', 'projects',
    function ($scope, $state, $filter, projects) {
      $scope.today = $filter('date')(new Date());
      $scope.projects = projects;
      if (projects) {
        $scope.projectCount = projects.length;
      }


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
        return project.startDate <= endDay && (project.endDate === null || project.endDate >= startDay);
      };
    }]);


