'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'PeopleReportCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', 'Resources', 
function( $scope, $q, $state, $stateParams, $filter, Resources ) {

  $scope.choiceLocationLabel = "Select one or more location";
  
  $scope.selectedGroups = [ "DEVELOPMENT", "ARCHITECTS" ];
  
  $scope.output = {};
  
  // People Details Section
  $scope.output.peopleDetails = {
    peopleOnClient: 35,
    peopleOnInvestment: 30,
    totalPeople: 65,
    
    utilizationByRole: [
      { name: "Software Engineer", value: "84" },
      { name: "Senior Software Architect", value: "22" },
      { name: "Senior Software Engineer", value: "78" },
    ]
  };
  
  // Project Hours Section
  $scope.output.projectHours = {
    capacity: 10920,
    estimatedClientHours: 4100,
    estimatedInvestHours: 3430,
    actualClientHours: 3979,
    actualInvestHours: 3668,
    estimatedClient: 72,
    estimatedInvest: 69,
    estimatedAverage: 70,
    estimatedAllUtilization: 70,
    actualClient: 68,
    actualInvest: 73,
    actualAverage: 70,
    actualAllUtilization: 70,
  };
  
  $scope.output.projectHours.totalHoursEstimated = $scope.output.projectHours.estimatedClientHours + $scope.output.projectHours.estimatedInvestHours;
  $scope.output.projectHours.totalActualHours = $scope.output.projectHours.actualClientHours + $scope.output.projectHours.actualInvestHours;
  
  // Category Hours Section
  $scope.output.categoryHours = {
     estimatedOOOHours: 36,
     estimatedOHHours: 0,
     actualOOOHours: 48,
     actualOHHours: 133,
     percentClientHours: 35,
     percentInvestHours: 34,
     percentOOO: 0.4,
     percentOH: 1.2,
     percentHoursUnaccounted: 29.4
  };
  
  $scope.output.categoryHours.totalOOOOHHoursEstimated = $scope.output.categoryHours.estimatedOOOHours + $scope.output.categoryHours.estimatedOHHours;
  $scope.output.categoryHours.totalOOOOHHoursActual = $scope.output.categoryHours.actualOOOHours + $scope.output.categoryHours.actualOHHours;
  
} ] );