'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'ProjectReportCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', '$location', '$anchorScroll', 'AssignmentService', 'ProjectsService', 'Resources', 
function( $scope, $q, $state, $stateParams, $filter, $location, $anchorScroll, AssignmentService, ProjectsService, Resources ) {

  $scope.output = {};
  
  // Summary Section
  var created = moment();
  
  $scope.output.summary = {
    createdDate: created.format("MM/D/YYYY"),
    createdTime: created.format("H:mm:ss a"),
    reportName: "SFI Customer Facing apps, mobile app, website",
    createdBy: { name: "Krista Meyer" },
    reportStartDate: moment("September 9, 2014").format("MMM D, YYYY"),
    reportEndDate: moment("September 30, 2014").format("MMM D, YYYY"),
    workingDays: 21,
    workingHoursPerPerson: 176,
    workingHoursForTeam: 10920
  };
  
  $scope.scrollTo = function(id) {
      $location.hash(id);
      $anchorScroll();
   };
   
   ProjectsService.getAllProjects(function (result)
   {
	   $scope.projectList = result.data;
   });
   
	$scope.fields = {
		assignmentHours: {},
		goals: {},
		projectHours: {}
	};
	
	$scope.selectAllAssignmentHours = function (selected)
	{
		$scope.fields.assignmentHours.all = selected;
	};
	
	$scope.selectAllProjectHours = function (selected)
	{
		$scope.fields.projectHours.all =
			$scope.fields.projectHours.available =
			$scope.fields.projectHours.spent =
			$scope.fields.projectHours.overallUtilRate =
			$scope.fields.projectHours.assignmentUtilRate = selected;
	};
	
	$scope.selectAllGoalsHours = function (selected)
	{
		$scope.fields.goals.projectedUtil =
		$scope.fields.goals.projectedHrs =
		$scope.fields.goals.projectedInvestment =
		$scope.fields.goals.projectedRevenue = selected;
	};
	
	$scope.selectAllFields = function (selected)
	{
		$scope.selectAllAssignmentHours(selected);
		$scope.selectAllProjectHours(selected);
		$scope.selectAllGoalsHours(selected);
	};
  
} ] );