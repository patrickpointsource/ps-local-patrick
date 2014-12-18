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
   
	$scope.fields = {
		assignmentHours: {},
		goals: {},
		projectHours: {}
	};
	$scope.projectList = {};
	$scope.selectedAssignedRoles = {};
   
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
	
	$scope.selectActiveProjects = function ()
	{
		if ($scope.projectList.active)
			ProjectsService.getActiveClientProjects(function (result)
			{
				$scope.projectList.activeProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.selectBacklogProjects = function ()
	{
		if ($scope.projectList.backlog)
			ProjectsService.getBacklogProjects(function (result)
			{
				$scope.projectList.backlogProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.selectPipelineProjects = function ()
	{
		if ($scope.projectList.pipeline)
			ProjectsService.getPipelineProjects(function (result)
			{
				$scope.projectList.pipelineProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.selectCompletedProjects = function ()
	{
		if ($scope.projectList.completed)
			ProjectsService.getCompletedProjects(function (result)
			{
				$scope.projectList.completedProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.selectDealLostProjects = function ()
	{
		if ($scope.projectList.dealLost)
			ProjectsService.getDealLostProjects(function (result)
			{
				$scope.projectList.dealLostProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.onProjectSelect = function ()
	{
		updateAssignedRoles($scope.projectList.selectedProjects);
	};
	
	function getSelectedProjects()
	{
		var projects = [];
		
		if ($scope.projectList.active)
			projects = projects.concat($scope.projectList.activeProjects);
		
		if ($scope.projectList.backlog)
			projects = projects.concat($scope.projectList.backlogProjects);
		
		if ($scope.projectList.pipeline)
			projects = projects.concat($scope.projectList.pipelineProjects);
		
		if ($scope.projectList.completed)
			projects = projects.concat($scope.projectList.completedtProjects);
		
		if ($scope.projectList.dealLost)
			projects = projects.concat($scope.projectList.dealLostProjects);
		
		return projects;
	}
	
	function updateAssignedRoles(projects)
	{
		AssignmentService.getAssignments(projects || []).then(function (data)
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
			
			$scope.assignedRoles = _.sortBy(assignedRoles, function (ar) { return ar; });
		});
	}
	
	$scope.selectAllAssignmentHours = function (selected)
	{
		$scope.fields.assignmentHours.all = selected;
		
		_.each($scope.assignedRoles, function (ar) { $scope.selectedAssignedRoles[ar] = selected; });
		
		$scope.fields.assignmentHours.hoursAndDesc =
			$scope.fields.assignmentHours.oooDetails = selected;
		
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