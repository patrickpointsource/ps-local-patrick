angular.module('Mastermind').controller('ProjectKickoffsCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService',
  function ($scope, $state, $rootScope, Resources, ProjectsService) {

    /**
     * Get the list of projects kicking off
     */
    ProjectsService.getProjectsKickingOff().then(function(result){
      $scope.projectsKickingOff = result.data;
    });

    /**
     * Converts a date to a display string
     */
    $scope.dateString = function (dateIn) {
      var date = parseDate(dateIn);
      //Get todays date formatted as yyyy-MM-dd
      var dd = date.getDate();
      var mm = date.getMonth();

      var month = $scope.getMonthName(mm);
      var day = dd;
      if (endsWith(String(dd), '1')) {
        day = dd + 'st';
      }
      else if (endsWith(String(dd), '2')) {
        day = dd + 'nd';
      }
      else if (endsWith(String(dd), '3')) {
        day = dd + 'rd';
      }
      else {
        day = dd + 'th';
      }


      var ret = month + ' ' + day;
      return ret;
    };

    /**
     * returns true is string ends with a give suffix
     */
    var endsWith = function (str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    var parseDate = function (input) {
      var parts = input.split('-');
      // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
      return new Date(parts[0], parts[1] - 1, parts[2]); // Note: months are 0-based
    }


    /**
     * Returns true if active in the next month
     */
    $scope.startWithinAMonth = function (project) {
      var startDate = parseDate(project.startDate);

      var today = new Date();
      var oneMonthFromNow = moment(today).add('months', 1);

      var ret = startDate <= oneMonthFromNow;
      return ret;
    };

    /**
     * Converts a date to a display string
     */
    $scope.dateString = function (dateIn) {
      var date = parseDate(dateIn);
      //Get todays date formatted as yyyy-MM-dd
      var dd = date.getDate();
      var mm = date.getMonth();

      var month = $scope.getMonthName(mm);
      var day = dd;
      if (endsWith(String(dd), '1')) {
        day = dd + 'st';
      }
      else if (endsWith(String(dd), '2')) {
        day = dd + 'nd';
      }
      else if (endsWith(String(dd), '3')) {
        day = dd + 'rd';
      }
      else {
        day = dd + 'th';
      }


      var ret = month + ' ' + day;
      return ret;
    };

  }
]);