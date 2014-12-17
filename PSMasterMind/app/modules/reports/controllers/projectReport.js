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
   
	Resources.get("roles").then(function (result)
	{
		if (!result)
			return;
		
		$scope.roles = _.sortBy(result.members, function (item) { return item.title; });
	});
	
	Resources.get("people/bytypes/withPrimaryRole").then(function (data)
	{
		$scope.peoples = data.members;
	});
   
	ProjectsService.getAllProjects(function (result)
	{
	   $scope.projectList = result.data;
	});
   
	$scope.fields = {
		assignmentHours: {},
		goals: {},
		projectHours: {}
	};
	
	$scope.selectedAssignedRoles = {};
	
	$scope.onProjectSelect = function ()
	{
		AssignmentService.getAssignments($scope.projectList.selectedProjects).then(function (data)
		{
			$scope.selectedAssignments = data;
			
			var assignedRoles = [];
			
			for (var i = 0, projCount = data.length; i < projCount; i++)
				for (var j = 0, assignmentCount = data[i].members.length; j < assignmentCount; j++)
				{
					var assignment = data[i].members[j];
					var assignee = _.find($scope.peoples, function (p) { return p.resource == assignment.person.resource; });
					
					if (!assignee)
						continue;
					
					var roleName = _.find($scope.roles, function (r) { return assignee.primaryRole && r.resource == assignee.primaryRole.resource; });
					
					if (roleName && assignedRoles.indexOf(roleName.abbreviation) == -1)
						assignedRoles.push(roleName.abbreviation);
				}
			
			$scope.assignedRoles = assignedRoles;
		});
	};
	
	$scope.selectAllAssignmentHours = function (selected)
	{
		$scope.fields.assignmentHours.all = selected;
		
		_.each($scope.assignedRoles, function (ar) { $scope.selectedAssignedRoles[ar] = selected; });
		
		$scope.assignedRoles = $scope.assignedRoles;
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