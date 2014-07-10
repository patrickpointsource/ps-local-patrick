angular.module( 'Mastermind').controller( 'VacationsCtrl', [ '$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'VacationsService', 'TasksService', 'RolesService',
function( $scope, $state, $rootScope, Resources, ProjectsService, VacationsService, TasksService, RolesService ) {
  
  var STATUS = {
    Pending: "Pending",
    Approved: "Approved",
    Denied: "Denied"
  }
  
  var VACATION_TYPES = {
	Personal: "Personal Leave",
	Vacation: "Vacation",
	Travel: "Customer Travel",
	Sick: "Sick Time"
  }
  
  $scope.START_TIME_DEFAULT = "09:00";
  
  $scope.END_TIME_DEFAULT = "17:00";
  
  $scope.vacationTypes = [VACATION_TYPES.Personal, VACATION_TYPES.Vacation, VACATION_TYPES.Travel, VACATION_TYPES.Sick];
  
  var VACATION_CAPACITY = 15;
  
  var VACATIONS_PER_PAGE = 3;
  
  $scope.vacations = [];
  
  $scope.vacationsPage = 1;
  
  $scope.getVacations = function() {
      $scope.profileLoaded = true;
	  VacationsService.getVacations($scope.profileId).then(function(result) {
	    $scope.vacations = _.sortBy(result, function(vacation) {
	      return new Date(vacation.startDate);
	    });
	  
	    $scope.showVacations();
	  });
  };
  
  $scope.getVacations();
  
  $scope.prevPage = function() {
	  $scope.vacationsPage--;
	  $scope.showVacations();
  }
  
  $scope.nextPage = function() {
	  $scope.vacationsPage++;
	  $scope.showVacations();
  }
  
  $scope.showVacations = function() {
	if($scope.vacations.length > VACATIONS_PER_PAGE) {
		var startIndex = ($scope.vacationsPage - 1) * VACATIONS_PER_PAGE;
		$scope.allPages = Math.ceil($scope.vacations.length / VACATIONS_PER_PAGE);
		$scope.displayedVacations = [];
		for(var i = 0; i < VACATIONS_PER_PAGE; i++) {
		  if($scope.vacations[startIndex + i]) {
			$scope.displayedVacations.push($scope.vacations[startIndex + i]);
		  }
		}
	} else {
	  $scope.displayedVacations = $scope.vacations;
	  $scope.vacationsPage = 1;
	}
  }
  
  $scope.getDays = function(start, end) {
	if(!start || !end) {
	  return "";
	}
	var actualDays = $scope.getActualDays(start, end);
	
	var days = "days";
	
	if(actualDays == 1) {
	  days = "day";
	  
	  var diff = moment(end).diff(start, 'hours');
	  if(diff < 8) {
	    days = "hours";
	    
	    if(diff <= 1) {
	      days = "hour";
	    }
	    
	    actualDays = diff;
	  }
	}
	
	return actualDays + " " + days;
  }
  
  $scope.getNewVacationDuration = function() {
    return $scope.getDays($scope.vacationStartDate + " " + $scope.vacationStartTime, this.vacationEndDate + " " + this.vacationEndTime);
  }
  
  $scope.getEditVacationDuration = function() {
    return $scope.getDays(this.vacationEditStartDate + " " + this.vacationEditStartTime, this.vacationEditEndDate + " " + this.vacationEditEndTime);
  }
  
  $scope.getActualDays = function(startDate, endDate) {
	var start = moment(startDate);
	var end = moment(endDate);
	var allDays = end.diff(start ,'days');
	var actualDays = 0;
	
	for(var d = 0; d <= allDays; d++) {
	  if(d != 0) {
		start.add('days', 1);
	  }
	  
	  if(start.day() != 0 && start.day() != 6) {
		actualDays++;
	  }
	}
	
	return actualDays;
  }
  
  $scope.requestHours = function() {
	$scope.errors = [];
	if($scope.requestNew) {
	  // clean new vacation form
	  $scope.requestNew = false;
	  $scope.vacationStartDate = "";
	  $scope.vacationEndDate = "";
	  $scope.newDescription = "";
	  $scope.vacationType = "";
	} else {
	  // fill new vacation form with default values (today)
	  var today = moment().format("YYYY-MM-DD");
	  $scope.vacationStartTime = $scope.START_TIME_DEFAULT;
	  $scope.vacationEndTime = $scope.END_TIME_DEFAULT;
	  $scope.vacationStartDate = today;
	  $scope.vacationEndDate = today;
	  $scope.requestNew = true;
	}
	
	$('.select-vacation-start-date').selectpicker();
	$('.select-vacation-start-date').selectpicker('render');
	
	$('.select-vacation-manager').selectpicker();
  }
  
  $scope.addVacation = function() {
	if($scope.validateNewVacation()) {
	  return;
	}
	
	var vacStatus;
	var vacStartTime = $scope.START_TIME_DEFAULT;
	var vacEndTime = $scope.END_TIME_DEFAULT;
	
	if($scope.vacationStartTime && $scope.vacationEndTime) {
	  vacStartTime = $scope.vacationStartTime;
	  vacEndTime = $scope.vacationEndTime;
	}
	
	//if($scope.vacationType == VACATION_TYPES.Sick || $scope.vacationType == VACATION_TYPES.Travel) {
	//  vacStatus = STATUS.Approved;
	//} else {
	//  vacStatus = STATUS.Pending;
	//}
	
	vacStatus = STATUS.Approved;
	
	var vacation = {
	  startDate: $scope.vacationStartDate + " " + vacStartTime,
	  endDate: $scope.vacationEndDate + " " + vacEndTime,
	  description: $scope.newDescription ? $scope.newDescription : "No description entered.",
	  person: { resource: $scope.profile.about},
	  status: vacStatus,
	  type: $scope.vacationType
	}
	
	VacationsService.addNewVacation(vacation).then(function(result) {
	  $scope.vacations.push(result);
	  $scope.requestHours();
	  $scope.vacations = _.sortBy($scope.vacations, function(vacation) {
		return new Date(vacation.startDate);
	  });
	  
	  $scope.showVacations();
	});
  }
  
  $scope.validateNewVacation = function() {
	$scope.errors = [];
	if(!$scope.vacationStartDate) {
	  $scope.errors.push("Please enter the start date.");
	  return true;
	}
	if(!$scope.vacationEndDate) {
	  $scope.errors.push("Please enter the end date.");
	  return true;
	}
	if(!$scope.vacationStartTime) {
      $scope.errors.push("Please enter the start time.");
      return true;
    }
    if(!$scope.vacationEndTime) {
      $scope.errors.push("Please enter the end time.");
      return true;
    }
	if(!$scope.vacationType || $scope.vacationType === "") {
	  $scope.errors.push("Please select vacation type.");
	  return true;
	}
	
	$scope.checkForConflictDates($scope.vacationStartDate, $scope.vacationEndDate, $scope.vacationStartTime, $scope.vacationEndTime);
	
	return $scope.errors.length > 0;
  }
  
  $scope.displayDate = function(date) {
	var mom = moment(date);
	
	return mom.format("MMM D");
  }
  
  $scope.editVacationIndex = -1;
  
  $scope.editVacation = function(index) {
	$scope.errors = [];
	$scope.editManagerEdit = false;
	if($scope.editVacationIndex == index) {
	  $scope.editVacationIndex = -1;
	  $scope.getVacations();
	} else {
	  $scope.editVacationIndex = index;
	  
	  var vacation = $scope.displayedVacations[index];
	  var start = moment(vacation.startDate);
	  var end = moment(vacation.endDate);
	  $scope.vacationEditStartDate = start.format("YYYY-MM-DD");
	  $scope.vacationEditEndDate = end.format("YYYY-MM-DD");
	  $scope.vacationEditStartTime = start.format("HH:mm");
	  $scope.vacationEditEndTime = end.format("HH:mm");
	  $('.select-vacation-start-date-edit').selectpicker();
	  $('.select-vacation-manager-' + index).selectpicker();
	}
  }
  
  $scope.deleteVacation = function(vacation) {
	Resources.remove(vacation.resource).then(function(result) {
	  $scope.vacations.splice($scope.editVacationIndex, 1);
	  $scope.editVacationIndex = -1;
	  $scope.showVacations();
	})
  }
  
  $scope.updateVacation = function(vacation) {
    $scope.errors = [];
    if(this.vacationEditStartDate && this.vacationEditEndDate && this.vacationEditStartTime && this.vacationEditEndTime) {
      vacation.startDate = this.vacationEditStartDate + " " + this.vacationEditStartTime;
      vacation.endDate = this.vacationEditEndDate + " " + this.vacationEditEndTime;
    } else {
      $scope.errors.push("Dates validation failed.");
      return;
    }
    
	if(!$scope.checkForConflictDates($scope.vacationEditStartDate, $scope.vacationEditEndDate, $scope.vacationEditStartTime, $scope.vacationEditEndTime, vacation.resource)) {
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
  
  $scope.checkForConflictDates = function(startDate, endDate, startTime, endTime, editedVacation) {
	$scope.errors = [];
	var vacStartDate = moment(startDate + " " + startTime);
	var vacEndDate = moment(endDate + " " + endTime);
	
	if(vacEndDate < vacStartDate) {
	  $scope.errors.push('End date is less than start date.');
	  return false;
	}
	
	if($scope.getActualDays(startDate, endDate) == 0) {
	  $scope.errors.push("Selected period does not contain working days.");
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
  
  $scope.getTypeText = function(type) {
	if(type == VACATION_TYPES.Personal) {
	  return "Personal";
	}
	if(type == VACATION_TYPES.Vacation) {
	  return VACATION_TYPES.Vacation;
	}
	if(type == VACATION_TYPES.Travel) {
	  return "Travel";
	}
	if(type == VACATION_TYPES.Sick) {
	  return VACATION_TYPES.Sick;
	}
  }
  
  $scope.getStartVacDate = function(date) {
	return date;
  }
  
  $scope.startDateChanged = function(index) {
	if(index) {
	  $('#toDateEdit' + index).datepicker('setStartDate', $scope.vacationEditStartDate);
	} else {
	  $('#vacationToDate').datepicker('setStartDate', $scope.vacationStartDate);
	}
  }
  
  $scope.isManagement = function() {
    if($scope.me.groups && ( ( $scope.me.groups.indexOf( 'Management' ) !== -1 ) || ( $scope.me.groups.indexOf( 'Executives' ) !== -1 ))) {
      return true;
    }
    
    return false;
  }
  
  $scope.getFormattedTime = function(datetime) {
    var mom = moment(datetime).format('hh:mm A');
    
    return mom;
  }
  
  $scope.timeChanged = function() {
    console.log($scope.vacationStartTime);
  }
  
  $scope.isSameDay = function(date1, date2) {
    return moment(date1).isSame(date2, 'days');
  }
  
  $scope.showVacationTime = false;
  
  $scope.managerSelected = function() {
    if(showVacationTime) {
      $scope.showVacationTime = false;
    } else {
      $scope.showVacationTime = true;
    }
  }
  
  $scope.dateChanged = function() {
    $scope.vacationStartDate = this.vacationStartDate;
    $scope.vacationEndDate = this.vacationEndDate;
    $scope.vacationStartTime = this.vacationStartTime;
    $scope.vacationEndTime = this.vacationEndTime;
    $scope.startDateChanged();
  }
  
  $scope.editManager = false;
  
  $scope.editManagerCallback = function() {
    if($scope.editManager) {
      $scope.editManager = false;
    } else {
      $scope.editManager = true;
      
      setTimeout(function() { 
        $(".select-vacation-manager").selectpicker();
      }, 5);
    }
  }
  
  $scope.editManagerEditCallback = function(index) {
    if($scope.editManagerEdit) {
      $scope.editManagerEdit = false;
    } else {
      $scope.editManagerEdit = true;
      
      setTimeout(function() { 
        $(".select-vacation-manager-" + index).selectpicker();
      }, 5);
    }
  }
  
} ] );