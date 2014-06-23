angular.module( 'Mastermind' ).controller( 'VacationsCtrl', [ '$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'VacationsService', 'TasksService', 'RolesService',
function( $scope, $state, $rootScope, Resources, ProjectsService, VacationsService, TasksService, RolesService ) {
  
  var STATUS = {
    Pending: "Pending",
    Approved: "Approved",
    Denied: "Denied"
  }
  
  var VACATION_CAPACITY = 14;
  
  $scope.vacations = [];
  
  $scope.getVacations = function() {
	VacationsService.getVacations($scope.profile).then(function(result) {
	  $scope.vacations = _.sortBy(result, function(vacation) {
	    return new Date(vacation.startDate);
	  });
	});
  }
  
  $scope.getVacations();
  
  $scope.getDays = function(start, end) {
	if(!start || !end) {
	  return "";
	}
	var actualDays = $scope.getActualDays(start, end);
	
	var days = "Days";
	
	if(actualDays == 1) {
	  days = "Day";
	}
	
	return actualDays + " " + days;
  }
  
  $scope.getActualDays = function(startDate, endDate) {
	var start = moment(startDate);
	var end = moment(endDate);
	var allDays = end.diff(start ,'days');
	var actualDays = 0;
	
	for(var d = 0; d <= allDays; d++) {
	  start.add('days', 1);
	  
	  if(start.day() != 0 && start.day() != 6) {
		actualDays++;
	  }
	}
	
	return actualDays;
  }
  
  $scope.requestHours = function() {
	$scope.errors = [];
	if($scope.requestNew) {
	  $scope.requestNew = false;
	} else {
	  $scope.requestNew = true;
	}
  }
  
  $scope.addVacation = function() {
	if($scope.validateNewVacation()) {
	  return;
	}
	
	var vacation = {
	  startDate: $scope.vacationStartDate,
	  endDate: $scope.vacationEndDate,
	  description: $scope.newDescription ? $scope.newDescription : "No description entered.",
	  person: { resource: $scope.profile.about},
	  status: STATUS.Pending
	}
	
	VacationsService.addNewVacation(vacation).then(function(result) {
	  $scope.vacations.push(result);
	  $scope.requestHours();
	  $scope.vacations = _.sortBy($scope.vacations, function(vacation) {
		return new Date(vacation.startDate);
	  });
	});
  }
  
  $scope.validateNewVacation = function() {
	$scope.errors = [];
	if(!$scope.vacationStartDate) {
	  $scope.errors.push("Please enter the start date.");
	}
	if(!$scope.vacationEndDate) {
	  $scope.errors.push("Please enter the end date.");
	}
	
	$scope.checkForConflictDates($scope.vacationStartDate, $scope.vacationEndDate);
	
	return $scope.errors.length > 0;
  }
  
  $scope.displayDate = function(date) {
	var mom = moment(date);
	
	return mom.format("MMM D");
  }
  
  $scope.editVacationIndex = -1;
  
  $scope.editVacation = function(index) {
	$scope.errors = [];
	if($scope.editVacationIndex == index) {
	  $scope.editVacationIndex = -1;
	  $scope.getVacations();
	} else {
	  $scope.editVacationIndex = index;
	}
  }
  
  $scope.deleteVacation = function(vacation) {
	Resources.remove(vacation.resource).then(function(result) {
	  $scope.vacations.splice($scope.editVacationIndex, 1);
	  $scope.editVacationIndex = -1;
	})
  }
  
  $scope.updateVacation = function(vacation) {
	if(!$scope.checkForConflictDates(vacation.startDate, vacation.endDate, vacation.resource)) {
	  return;
	}
	Resources.update(vacation).then(function(result) {
	  $scope.editVacationIndex = -1;
	  $scope.getVacations();
	});
  }
  
  $scope.getCurrentYearVacationDays = function() {
	var now = moment();
	var yearDays = 0;
	for(var i = 0; i < $scope.vacations.length; i++) {
	  var vacation = $scope.vacations[i];
	  var start = moment(vacation.startDate);
	  var end = moment(vacation.endDate);
	  // check if start and end date in the same year
	  if(start.year() == end.year()) {
		// check that year is current
		if(start.year() == now.year()) {
		  var days = $scope.getActualDays(start, end);
		  yearDays += days;
		}
		// else vacation is split between years
	  } else {
		var days = end.diff(start, 'days');
		var dayIteration = start;
		var thisYearDays = 0;
		for(var d = 1; d <= days; d++) {
		  if(dayIteration.add('days', d).year() == now.year()) {
			thisYearDays++;
		  }
		}
		
		yearDays += thisYearDays;
	  }
	}
	
	return VACATION_CAPACITY - yearDays;
  }
  
  $scope.checkForConflictDates = function(startDate, endDate, editedVacation) {
	$scope.errors = [];
	var vacStartDate = moment(startDate);
	var vacEndDate = moment(endDate);
	
	if(end < start) {
	  $scope.errors.push('End date is less than start date.');
	  return false;
	}
	
	for(var i = 0; i < $scope.vacations.length; i++) {
	  var vacation = $scope.vacations[i];
	  
	  var start = moment(vacation.startDate);
	  var end = moment(vacation.endDate);
	  
	  if(!editedVacation || editedVacation != vacation.resource) {
	  /*
	   *          ----------start----------end----------
	   *  
	   * -----vacStartDate-----start-----vacEndDate-----end---------- (1)
	   * ----------start---vacStartDate----vacEndDate---end---------- (2)
	   * ----------start-----vacStartDate-----end-----vacEndDate----- (3)
	   * */
	    if( /* (1) */ (vacStartDate <= start && vacEndDate >= start) ||
		  /* (2) */ (vacStartDate >= start && vacStartDate <= end && vacEndDate >= start && vacEndDate <= end) ||
		  /* (3) */ (vacStartDate <= end && vacEndDate >= end)) {
		  if(vacation.startDate == vacation.endDate) {
			$scope.errors.push("Confict with vacation: [ " + start.format("MMM D") + " ]");
		  } else {
			$scope.errors.push("Confict with vacation: [ " + start.format("MMM D") + " - " + end.format("MMM D") + " ]");
		  }
		  
		  
		  return false;
	    }
	  }
	}
	
	return true;
  }
  
  $scope.getStatusText = function(status) {
	if(status == STATUS.Pending) {
	  return "PENDING";
	}
	if(status == STATUS.Approved) {
	  return "APPROVED";
	}
	if(status == STATUS.Denied) {
	  return "DENIED";
	}
  }
} ] );