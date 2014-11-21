'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'PeopleReportCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', 'Resources', 
function( $scope, $q, $state, $stateParams, $filter, Resources ) {

  $scope.choiceLocationLabel = "Select one or more location";
  
  $scope.output = {};
  
  $scope.selectedGroups = [ "DEVELOPMENT", "ARCHITECTS" ];
  
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


} ] );