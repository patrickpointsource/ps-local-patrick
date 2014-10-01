'use strict';

/**
 * The main project controller
 */
var mmModule = angular.module('Mastermind').controller('MainCtrl', ['$scope', '$q', '$state', '$filter', '$timeout', 'Resources', 'RolesService', 'ProjectsService', 'People', 'AssignmentService', 'ngTableParams',
  function ($scope, $q, $state, $filter, $timeout, Resources, RolesService, ProjectsService, People, AssignmentService, TableParams) {

    /**Init Count vairables
     */
    $scope.activeCount = '';
    $scope.backlogCount = '';
    $scope.pipelineCount = '';
    $scope.investmentCount = '';

    // Table Parameters for Resource Deficit tables
    var params = {
      page: 1, // show first page
      count: 100, // count per page
      sorting: {
        startDate: 'asc' // initial sorting
      }
    };

    $scope.summarySwitcher = 'projects';
    //$scope.projects = projects;
    $scope.startDate = new Date();
    $scope.ongoingProjects = [];
    $scope.hoursProjects = [];
    // fill it in hours controller
    $scope.hoursTasks = [];

    var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    /**
     * display the month name from a month number (0 - 11)
     */
    $scope.getMonthName = function (monthNum) {
      if (monthNum > 11) {
        monthNum = monthNum - 12;
      }
      return monthNamesShort[monthNum];
    };

    //Get todays date formatted as yyyy-MM-dd
    var dd = $scope.startDate.getDate();
    var mm = $scope.startDate.getMonth() + 1; //January is 0!
    var yyyy = $scope.startDate.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
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
    $scope.showProjects = function (filter) {
      if (!filter) {
        $state.go('projects.index');
      } else {
        $state.go('projects.index', {
          filter: filter
        });
      }
    };

    /**
     * Navigate to view a list of active projects.
     */
    $scope.showActiveProjects = function () {
      $state.go('projects.index', {
        filter: 'active'
      });
    };

    /**
     * Navigate to view a list of people who can be assigned to projects.
     */
    $scope.showPeople = function () {
      $state.go('people.index');
    };

    /**
     * Navigate to view a list of people who can be assigned to projects.
     */
    $scope.showAvailablePeople = function () {
      $state.go('people.index', {
        filter: 'available'
      });
    };

    /**
     * Calculates whether a role is active within a particular month.
     *
     * @param project
     * @param month
     * @param year
     */
    $scope.isPersonActiveInMonth = function (assignment, person, month, year) {
      var projectIsActive = $scope.inMonth(assignment.project, month, year);
      if (!projectIsActive) {
        return false;
      }

      var nextMonth = month === 11 ? 0 : (month + 1),
        nextYear = month === 11 ? (year + 1) : year,
        startDay = new Date(year, month, 1),
        endDay = new Date(nextYear, nextMonth, 0);

      // If the assignment start day is before the last day of this month
      // and its end date is after the first day of this month.
      var assignmentStarted = new Date(assignment.startDate) <= endDay;
      var assignmentEnded = assignment.endDate && new Date(assignment.endDate) <= startDay;
      var ret = assignmentStarted && !assignmentEnded;

      return ret;
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
      var projectStarted = new Date(project.startDate) <= endDay;
      var projectEnded = project.endDate && new Date(project.endDate) <= startDay;
      var returnValue = projectStarted && !projectEnded;
      return returnValue;
    };

    /**
     * Moving this to its own controller controllers/hours.js
     * /
     *
     $scope.newHoursRecord = {};
     
     * Add a new Hours Record to the server
     */
    $scope.addHours = function () {
      //Set the person context
      $scope.newHoursRecord.person = {
        resource: $scope.me.about
      };

      Resources.create('hours', $scope.newHoursRecord).then(function () {
        $scope.newHoursRecord = {};

        //Navigate over to the users profile
        window.location = '#' + $scope.me.about;
      });
    };


    //    /**
    //     * returns true is string ends with a give suffix
    //     */
    //    var endsWith = function (str, suffix) {
    //      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    //    };
    //
    //    var parseDate = function (input) {
    //      var parts = input.split('-');
    //      // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    //      return new Date(parts[0], parts[1] - 1, parts[2]); // Note: months are 0-based
    //    }
    //
    //
    //    /**
    //     * Returns true if active in the next month
    //     */
    //    $scope.startWithinAMonth = function (project) {
    //      var startDate = parseDate(project.startDate);
    //
    //      var today = new Date();
    //      var oneMonthFromNow = moment(today).add('months', 1);
    //
    //      var ret = startDate <= oneMonthFromNow;
    //      return ret;
    //    };
    //
    //    /**
    //     * Converts a date to a display string
    //     */
    //    $scope.dateString = function (dateIn) {
    //      var date = parseDate(dateIn);
    //      //Get todays date formatted as yyyy-MM-dd
    //      var dd = date.getDate();
    //      var mm = date.getMonth();
    //
    //      var month = $scope.getMonthName(mm);
    //      var day = dd;
    //      if (endsWith(String(dd), '1')) {
    //        day = dd + 'st';
    //      }
    //      else if (endsWith(String(dd), '2')) {
    //        day = dd + 'nd';
    //      }
    //      else if (endsWith(String(dd), '3')) {
    //        day = dd + 'rd';
    //      }
    //      else {
    //        day = dd + 'th';
    //      }
    //
    //
    //      var ret = month + ' ' + day;
    //      return ret;
    //    };

    /**
     * Returns the text summary per project for the my projects section of the home page
     */
    $scope.getMyProjectSummaryLine = function (project) {
      var roles = [];
      if (project.status && project.status.isExecutiveSponsor) {
        roles.push('EXEC');
      }

      if (project.status && project.status.isSalesSponsor) {
        roles.push('SALES');
      }

      var projectAssignments = (project.status) ? project.status.assignments : [];
      var totalHoursPerWeek = 0, now = moment();
      for (var i = 0; i < projectAssignments.length; i++) {
        var projectAssignment = projectAssignments[i];
        var role = projectAssignment.role;
        if (role.type) {
          role = $scope.roleGroups ? $scope.roleGroups[role.type.resource] : null;

          if (role && role.abbreviation && $.inArray(role.abbreviation, roles) == -1) {
            roles.push(role.abbreviation);
          }
        }


        if (projectAssignment && projectAssignment.hoursPerWeek) {
          var startDate = moment(projectAssignment.startDate);
          var endDate = endDate ? moment(projectAssignment.endDate) : now.add('day', 1);

          if (now >= startDate && now <= endDate) {
            totalHoursPerWeek += projectAssignment.hoursPerWeek;
          }
        }
      }

      if (totalHoursPerWeek > 0) {
        totalHoursPerWeek = ' @' + totalHoursPerWeek + 'h/w ';
      } else {
        totalHoursPerWeek = '';
      }

      //Get the total hours logged
      var hoursLogged = '';
      if (project.status &&  project.status.hoursLogged) {
        hoursLogged = ' - ' + project.status.hoursLogged + ' hrs logged';
      }

      var ret = "<span class=\"text-muted\">" + roles + totalHoursPerWeek + hoursLogged + "</span>";
      return ret;
    }

  }]);