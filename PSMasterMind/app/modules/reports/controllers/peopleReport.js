'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'PeopleReportCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', '$location', '$anchorScroll', 'Resources', 
function( $scope, $q, $state, $stateParams, $filter, $location, $anchorScroll, Resources ) {

  $scope.choiceLocationLabel = "Select one or more location";
  
  $scope.selectedGroups = [ "DEVELOPMENT", "ARCHITECTS" ];
  
  $scope.output = {};
  
  // Summary Section
  var created = moment();
  
  $scope.output.summary = {
    createdDate: created.format("MM/D/YYYY"),
    createdTime: created.format("H:mm:ss a"),
    reportName: "Bi-monthly Department with Graphs Report",
    createdBy: { name: "Krista Meyer" },
    reportStartDate: moment("September 9, 2014").format("MMM D, YYYY"),
    reportEndDate: moment("September 30, 2014").format("MMM D, YYYY"),
    workingDays: 21,
    workingHoursPerPerson: 176,
    workingHoursForTeam: 10920
  };
  
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
  
  // Goals section
  $scope.output.goals = {
    clientUtilization: 80,
    investmentUtilization: 75,
    teamUtilization: 71
  };
  
  // Projections section
  $scope.output.projections = {
    firstMonth: { 
      name: "October",
      actual: {
        capacity: 10920,
        clientHours: 4100,
        investHours: 3430,
        totalHours: 7530,
        OOO: 36,
        utilization: 70
      },
      estimated: {
        capacity: 10920,
        clientHours: 3979,
        investHours: 3668,
        totalHours: 7465,
        OOO: 48,
        utilization: 70
      }
    },
    months: [
      {
        name: "November",
        capacity: 11520,
        clientHours: 6160,
        investHours: 5280,
        totalHours: 11440,
        OOO: 80,
        utilization: 68
      },
      {
        name: "December",
        capacity: 11520,
        clientHours: 6660,
        investHours: 6020,
        totalHours: 12680,
        OOO: 360,
        utilization: 68
      }
    ]
  };
  $scope.scrollTo = function(id) {
      $location.hash(id);
      $anchorScroll();
   };
   
   var groupToRolesMap = {
		"development": [ 'SE', 'SSE', 'SEO', 'SSEO', 'ST', 'SI' ],
		"architects": [ 'SSA', 'SA', 'ESA', 'SSAO' ],
		"administration": [ 'ADMIN' ],
		"clientexpierencemgmt": [ "SBA", "BA", "PM", "CxD" ],
		"digitalexperience": [ "UXD", "SUXD", "DxM", "CD" ],
		"executivemgmt": [ "EXEC", "DD", "CxD", "CD", "DMDE" ],
		"marketing": [ "MKT", "DMDE", "MS" ],
		"sales": [ "SALES" ]
	};
   
   $scope.filterRolesByGroup = function (groups)
   {
	   return function (role)
	   {
		   if (!$scope.roles)
			   return false;
		   
		   if (groups.all)
			   return true;
		   
		   for (var group in groups)
			   if (groups[group] && groupToRolesMap[group] && groupToRolesMap[group].indexOf(role.abbreviation) != -1)
				   return true;
		   
		   return false;
	   };
   };
   
	Resources.get("roles").then(function (result)
	{
		if (!result)
			return;
		
		$scope.roles = _.sortBy(result.members, function (item) { return item.title; });
	});
	
	$scope.roleGroups = {};
	
	$scope.fields = {
		categoryHours: {
			out: {},
			overhead: {}
		},
		goals: {},
		graphs: {
			percent: {}
		},
		projectHours: {}
	};
	
	$scope.selectAllProjectHours = function (selected)
	{
		$scope.fields.projectHours.all =
			$scope.fields.projectHours.actualClient =
			$scope.fields.projectHours.actualInvestment =
			$scope.fields.projectHours.utilClientWork =
			$scope.fields.projectHours.utilInvestmentWork =
			$scope.fields.projectHours.utilRole =
			$scope.fields.projectHours.estimatedClientHrs =
			$scope.fields.projectHours.estimatedInvestmentHrs = selected;
	};
	
	$scope.selectAllOutOfOfficeHours = function (selected)
	{
		$scope.fields.categoryHours.out.all =
			$scope.fields.categoryHours.out.sick =
			$scope.fields.categoryHours.out.vacation =
			$scope.fields.categoryHours.out.holiday = selected;
	};
	
	$scope.selectAllOverheadHours = function (selected)
	{
		$scope.fields.categoryHours.overhead.all =
			$scope.fields.categoryHours.overhead.meetings =
			$scope.fields.categoryHours.overhead.trainings =
			$scope.fields.categoryHours.overhead.rd =
			$scope.fields.categoryHours.overhead.design =
			$scope.fields.categoryHours.overhead.admin =
			$scope.fields.categoryHours.overhead.hr = selected;
	};
	
	$scope.selectAllGoalsHours = function (selected)
	{
		$scope.fields.goals.all =
			$scope.fields.goals.projectedClientHrs =
			$scope.fields.goals.projectedInvestmentHrs =
			$scope.fields.goals.utilProjections =
			$scope.fields.goals.utilGoals =
			$scope.fields.goals.projectedOOO = selected;
	};
	
	$scope.selectAllGraphPercentHours = function (selected)
	{
		$scope.fields.graphs.percent.all =
			$scope.fields.graphs.percent.overhead =
			$scope.fields.graphs.percent.out = selected;
	};
	
	$scope.selectAllFields = function (selected)
	{
		$scope.selectAllProjectHours(selected);
		$scope.selectAllOutOfOfficeHours(selected);
		$scope.selectAllOverheadHours(selected);
		$scope.selectAllGoalsHours(selected);
		$scope.selectAllGraphPercentHours(selected);
		
		$scope.fields.categoryHours.marketing =
			$scope.fields.categoryHours.sales =
			$scope.fields.graphs.trendHrs =
			$scope.fields.graphs.trendGoals =
			$scope.fields.graphs.graph = selected;
	};
  
} ] );