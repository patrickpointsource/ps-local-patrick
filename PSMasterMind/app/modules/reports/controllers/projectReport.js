'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'ProjectReportCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', '$location', '$anchorScroll', 'AssignmentService', 'ProjectsService', 'Resources', 
function( $scope, $q, $state, $stateParams, $filter, $location, $anchorScroll, AssignmentService, ProjectsService, Resources ) {

	var months = [];
	
	for (var i = 0; i < 12; i++)
		months.push({ index: i, name: moment().month(i).format("MMM") });
	
	$scope.months = months;
	
	var years = [];
	var currentYear = moment().year();
	
	for (var i = 5; i >= 0; i--)
		years.push(currentYear - i);
	
	for (var i = 1; i <= 5; i++)
		years.push(currentYear + i);
	
	$scope.years = years;
	
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
   
	$scope.params = {
		date: {
			range: "week",
			start: moment().format("YYYY-MM-DD"),
			month: $scope.months[moment().month()],
			year: moment().year()
		},
		fields: {
			assignmentHours: {},
			goals: {},
			projectHours: {},
			selectedAssignedRoles: {}
		}
	};
	$scope.projects = {};
   
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
	   $scope.projects = result.data;
	});
	
	$scope.selectActiveProjects = function ()
	{
		if ($scope.projects.active)
			ProjectsService.getActiveClientProjects(function (result)
			{
				$scope.projects.activeProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.selectBacklogProjects = function ()
	{
		if ($scope.projects.backlog)
			ProjectsService.getBacklogProjects(function (result)
			{
				$scope.projects.backlogProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.selectPipelineProjects = function ()
	{
		if ($scope.projects.pipeline)
			ProjectsService.getPipelineProjects(function (result)
			{
				$scope.projects.pipelineProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.selectCompletedProjects = function ()
	{
		if ($scope.projects.completed)
			ProjectsService.getCompletedProjects(function (result)
			{
				$scope.projects.completedProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.selectDealLostProjects = function ()
	{
		if ($scope.projects.dealLost)
			ProjectsService.getDealLostProjects(function (result)
			{
				$scope.projects.dealLostProjects = result.data;
				
				updateAssignedRoles(getSelectedProjects());
			});
		else
			updateAssignedRoles(getSelectedProjects());
	};
	
	$scope.onProjectSelect = function ()
	{
		updateAssignedRoles($scope.projects.selectedProjects);
	};
	
	function getSelectedProjects()
	{
		var projects = [];
		
		if ($scope.projects.active)
			projects = projects.concat($scope.projects.activeProjects);
		
		if ($scope.projects.backlog)
			projects = projects.concat($scope.projects.backlogProjects);
		
		if ($scope.projects.pipeline)
			projects = projects.concat($scope.projects.pipelineProjects);
		
		if ($scope.projects.completed)
			projects = projects.concat($scope.projects.completedtProjects);
		
		if ($scope.projects.dealLost)
			projects = projects.concat($scope.projects.dealLostProjects);
		
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
		$scope.params.fields.assignmentHours.all = selected;
		
		_.each($scope.assignedRoles, function (ar) { $scope.params.fields.selectedAssignedRoles[ar] = selected; });
		
		$scope.params.fields.assignmentHours.hoursAndDesc =
			$scope.params.fields.assignmentHours.oooDetails = selected;
		
		$scope.assignedRoles = $scope.assignedRoles;
	};
	
	$scope.selectAllProjectHours = function (selected)
	{
		$scope.params.fields.projectHours.all =
			$scope.params.fields.projectHours.available =
			$scope.params.fields.projectHours.spent =
			$scope.params.fields.projectHours.overallUtilRate =
			$scope.params.fields.projectHours.assignmentUtilRate = selected;
	};
	
	$scope.selectAllGoalsHours = function (selected)
	{
		$scope.params.fields.goals.projectedUtil =
		$scope.params.fields.goals.projectedHrs =
		$scope.params.fields.goals.projectedInvestment =
		$scope.params.fields.goals.projectedRevenue = selected;
	};
	
	$scope.selectAllFields = function (selected)
	{
		$scope.selectAllAssignmentHours(selected);
		$scope.selectAllProjectHours(selected);
		$scope.selectAllGoalsHours(selected);
	};
	
	$scope.generateReport = function ()
	{		
		var input = {
			roles: [],
			fields: $scope.params.fields,
			output: $scope.params.output,
			reportName: $scope.params.reportName
		};
		
		switch ($scope.params.date.range)
		{
			case "week":
				
				input.startDate = moment.utc($scope.params.date.start);
				input.endDate = moment.utc($scope.params.date.start).add(7, "day");
				break;
			
			case "weeks":
				
				input.startDate = moment.utc($scope.params.date.start);
				input.endDate = moment.utc($scope.params.date.start).add(14, "day");
				break;
			
			case "month":
				
				input.startDate = moment(Date.UTC($scope.params.date.year, $scope.params.date.month.index));
				input.endDate = moment(input.startDate).add(1, "month").subtract(1, "day");
				break;
				
			case "custom":
				
				input.startDate = moment.utc($scope.params.date.start);
				input.endDate = moment.utc($scope.params.date.end);
				break;
		}
		
		for (var prop in $scope.params.fields.selectedAssignedRoles)
			if ($scope.params.fields.selectedAssignedRoles[prop])
				input.roles.push(prop);
		
		console.log(JSON.stringify(input));
	};
  
} ] );