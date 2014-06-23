angular.module( 'Mastermind' ).controller( 'VacationsCtrl', [ '$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'VacationsService', 'TasksService', 'RolesService',
function( $scope, $state, $rootScope, Resources, ProjectsService, VacationsService, TasksService, RolesService ) {
  
  var STATUS = {
    Pending: "Pending",
    Approved: "Approved",
    Denied: "Denied"
  }
  
  $scope.vacations = [];
  
  $scope.getVacations = function() {
	VacationsService.getVacations($scope.profile).then(function(result) {
	  $scope.vacations = result;
	});
  }
  
  $scope.getVacations();
  
  $scope.getNewRequestDays = function() {
	if($scope.vacationStartDate && $scope.vacationEndDate) {
	  var start = moment($scope.vacationStartDate);
	  var end = moment($scope.vacationEndDate);
	  
	  var result = end.diff(start, 'days');
	  
	  result++
	  
	  return result;
	}
  }
  
  $scope.getDays = function(start, end) {
	var start = moment(start);
	var end = moment(end);
	
	var result = end.diff(start, 'days');
	
	result++;
	
	var days = "Days";
	
	if(result == 1) {
	  days = "Day";
	}
	
	return result + " " + days;
  }
  
  $scope.requestHours = function() {
	$scope.errors = [];
	if($scope.requestNew) {
	  $scope.requestNew = false;
	} else {
	  $scope.requestNew = true;
	}
  }
  
  $scope.getVacationCapacity = function() {
	return 14;
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
	return $scope.errors.length > 0;
  }
  
  $scope.displayDate = function(date) {
	var mom = moment(date);
	
	return mom.format("MMM D");
  }
  
  $scope.editVacationIndex = -1;
  
  $scope.editVacation = function(index) {
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
	Resources.update(vacation).then(function(result) {
	  $scope.editVacationIndex = -1;
	});
  }
} ] );