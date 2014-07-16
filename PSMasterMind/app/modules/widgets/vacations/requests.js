angular.module( 'Mastermind').controller( 'VacationRequestsCtrl', [ '$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'VacationsService', 'TasksService', 'RolesService',
function( $scope, $state, $rootScope, Resources, ProjectsService, VacationsService, TasksService, RolesService ) {
  
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
    });
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