angular.module( 'Mastermind').controller( 'VacationRequestsCtrl', [ '$q', '$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'VacationsService', 'TasksService', 'RolesService', 'HoursService',
function( $q, $scope, $state, $rootScope, Resources, ProjectsService, VacationsService, TasksService, RolesService, HoursService ) {
  
  $scope.showRequests = function() {
    VacationsService.getRequests($scope.me).then(function(result) {
    $scope.requests = result;
    
    for(var i = 0; i < $scope.requests.length; i++) {
      var request = $scope.requests[i];
      
      Resources.resolve(request.person);
      request.days = VacationsService.getDays(request.startDate, request.endDate);
    }
  });
  }
  
  $scope.requests = [];
  $scope.showRequests();
  $scope.expandedIndex = -1;
  
  $scope.expandRequest = function(index) {
    if($scope.expandedIndex == index) {
      $scope.expandedIndex = -1;
    } else {
      $scope.expandedIndex = index;
      VacationsService.getOtherRequestsThisPeriod($scope.me, $scope.requests[index]).then(function(result) {
        $scope.peopleOutThisDay = [];//_.uniq(_.pluck(result, "person"));
        
        for(var r = 0; r < result.length; r++) {
          var req = result[r];
          if(req.person.resource != $scope.requests[index].person.resource) {
            var finded = _.findWhere($scope.peopleOutThisDay, {resource: req.person.resource});
            if(finded) {
                finded.periods.push({startDate: req.startDate, endDate: req.endDate});
              } else {
                $scope.peopleOutThisDay.push({
                  resource: req.person.resource,
                  periods: [ {startDate: req.startDate, endDate: req.endDate} ]
                });
              }
          }
        }
        
        for(var i = 0; i < $scope.peopleOutThisDay.length; i++) {
          Resources.resolve($scope.peopleOutThisDay[i]);
        }
      });
    }
  }
  
  $scope.decide = function(index, isApproved) {
    var status;
    if(isApproved) {
      status = VacationsService.STATUS.Approved;
    } else {
      status = VacationsService.STATUS.Denied;
    }
    
    var request = $scope.requests[index];
    request.status = status;
    request.person = { resource: request.person.about };
    
    Resources.update(request).then(function(result) {
      $scope.requests.splice(index, 1);
      $scope.expandedIndex = -1;
      
      if(isApproved) {
        $scope.commitHours(request);
      }
    });
  }
  
  $scope.commitHours = function(request) {
    $scope.getTaskForVacation(request.type).then(function(task) {
      var start = moment(request.startDate);
      var end = moment(request.endDate);
      var actualDays = VacationsService.getActualDays(request.startDate, request.endDate);
    
    // hours add for 1 day
    if(actualDays == 1) {
      var hours = end.diff(start ,'hours');
      
      var oneDayHours = 0;
      if(hours <= 8) {
        oneDayHours = 8;
      } else {
        oneDayHours = hours;
      }
      
      var hoursEntry = {
        date: moment(request.startDate).format("YYYY-MM-DD"),
        person: request.person,
        description: "Vacation: " + request.description,
        hours: oneDayHours,
        task: {resource: task.resource, name: task.name}
      }
      
      HoursService.updateHours([hoursEntry]);
    // hours add for many days
    } else {
      var allDays = end.diff(start ,'days');
      actualDays = 0;
      var hoursEntries = [];
      for(var d = 0; d <= allDays; d++) {
        if(d != 0) {
          start.add('days', 1);
        }
      
        if(start.day() != 0 && start.day() != 6) {
          var hoursEntry = {
            date: start.format("YYYY-MM-DD"),
            person: request.person,
            description: "Vacation: " + request.description,
            hours: 8,
            task: {resource: task.resource, name: task.name}
          }
          
          hoursEntries.push(hoursEntry);
        }
      }
      
      HoursService.updateHours(hoursEntries);
    }
    });
  }
  
  $scope.getTaskForVacation = function(type) {
    var deferred = $q.defer();
    
    var taskQuery = { name: "Vacation" };
    
    if(type == VacationsService.VACATION_TYPES.Appointment) {
      taskQuery = { name: "Appointment" };
    }
    
    Resources.query('tasks', taskQuery, null, function(result) {
      if(result.count == 0) {
        Resources.create('tasks', taskQuery).then(function() {
          $scope.getTaskForVacation(type).then(function(res) {
            deferred.resolve(res);
          });
        });
      } else {
        deferred.resolve(result.members[0]);
      }
    });
    
    return deferred.promise;
  }
  
  $scope.queryVacationTask = function() {
    var deferred = $q.defer();
    var taskQuery = { name: "Vacation" };
    Resources.query('tasks', taskQuery, null, function(result) {
      deferred.resolve(result[0]);
    });
    
    return deferred.promise;
  }
  
  $scope.getStatusText = function(status) {
    return VacationsService.getStatusText(status);
  }
  
  $scope.getTypeText = function(type) {
    return VacationsService.getTypeText(type);
  }
  
  $scope.displayDate = function(date) {
    var mom = moment(date);
    
    return mom.format("dddd, MMMM Do, YYYY hh:mm A");
  }
  
  $scope.isSameDay = function(date1, date2) {
    return moment(date1).isSame(date2, 'days');
  }
  
  $scope.getDays = function(start, end) {
    return VacationsService.getDays(start, end);
  }
  
  $scope.displayShortPeriod = function(period) {
    var start = moment(period.startDate);
    var end = moment(period.endDate);
    
    if(end.diff(start, 'hours') <= 8) {
      return start.format("dddd, MMMM Do, YYYY hh:mm A") + " - " + end.format("hh:mm A");
    } else {
      return $scope.displayDate(period.startDate) + " - " + $scope.displayDate(period.endDate);
    }
  }
} ] );