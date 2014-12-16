'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'PeopleReportCtrl', [ '$scope', '$rootScope', '$q', '$state', '$stateParams', '$filter', '$location', '$anchorScroll', 'People', 'Resources', 
function( $scope, $rootScope, $q, $state, $stateParams, $filter, $location, $anchorScroll, People, Resources ) {

  $scope.choiceLocationLabel = "Select one or more location";
  
  $scope.reportServicePingInterval = 5000;
  
  $scope.output = {};
  
  // Summary Section
  var created = moment();
  
  $scope.output.summary = {};
  
  $scope.output.reportData = {};
  
  $scope.exportOptions = {
		  allRoles: false
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
   
   $scope.getPersonName = function(person, isSimply, isFirst) {
	   return Util.getPersonName(person, isSimply, isFirst);
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
	
	$scope.params = {
		date: {
			range: "week"
		},
		departments: {},
		fields: {
			categoryHours: {
				out: {},
				overhead: {}
			},
			goals: {},
			graphs: {
				percent: {}
			},
			projectHours: {}
		},
		locations: {},
		output: "csv",
		roles: {}
	};
	
	$scope.selectExportRole = function ( role )
	{
		var allSelected = true;
		role.isSelected = !role.isSelected;
		for (var i in $scope.output.peopleDetails.peopleByRoles) {
			if ( !$scope.output.peopleDetails.peopleByRoles[i].role.isSelected ) {
				allSelected = false;
				break;
			}
		}
		$scope.exportOptions.allRoles = allSelected;
	};
	
	$scope.selectExportAllRoles = function ( )
	{
		var selected = !$scope.exportOptions.allRoles;
		for (var i in $scope.output.peopleDetails.peopleByRoles) {
			$scope.output.peopleDetails.peopleByRoles[i].role.isSelected = selected;
		}
	};
	
	$scope.selectLocationParent = function (location)
	{
		if (location)
			$scope.params.locations.all = false;
	};
	
	$scope.selectDepartmentParent = function (department)
	{
		if ($scope.params.departments[department])
			$scope.params.departments.all = false;
		
		// Enforces data bind.
		$scope.roles = $scope.roles;
	};
	
	$scope.selectAllDepartments = function ()
	{
		var selected = !$scope.params.departments.all;
		
		$scope.params.departments.administration =
			$scope.params.departments.architects =
			$scope.params.departments.clientexpierencemgmt =
			$scope.params.departments.development =
			$scope.params.departments.digitalexperience =
			$scope.params.departments.executivemgmt =
			$scope.params.departments.marketing =
			$scope.params.departments.sales = selected;
		
		// Enforces data bind.
		$scope.roles = $scope.roles;
	};
	
	$scope.selectAllLocations = function ()
	{
		var selected = !$scope.params.locations.all;
		
		$scope.params.locations.onshore =
			$scope.params.locations.chicago =
			$scope.params.locations.offshore = selected;
	};
		
	$scope.selectAllProjectHours = function (selected)
	{
		$scope.params.fields.projectHours.all =
			$scope.params.fields.projectHours.actualClient =
			$scope.params.fields.projectHours.actualInvestment =
			$scope.params.fields.projectHours.utilClientWork =
			$scope.params.fields.projectHours.utilInvestmentWork =
			$scope.params.fields.projectHours.utilRole =
			$scope.params.fields.projectHours.estimatedClientHrs =
			$scope.params.fields.projectHours.estimatedInvestmentHrs = selected;
	};
	
	$scope.selectAllOutOfOfficeHours = function (selected)
	{
		$scope.params.fields.categoryHours.out.all =
			$scope.params.fields.categoryHours.out.sick =
			$scope.params.fields.categoryHours.out.vacation =
			$scope.params.fields.categoryHours.out.holiday = selected;
	};
	
	$scope.selectAllOverheadHours = function (selected)
	{
		$scope.params.fields.categoryHours.overhead.all = 
			$scope.params.fields.categoryHours.overhead.meetings =
			$scope.params.fields.categoryHours.overhead.trainings =
			$scope.params.fields.categoryHours.overhead.rd =
			$scope.params.fields.categoryHours.overhead.design =
			$scope.params.fields.categoryHours.overhead.admin =
			$scope.params.fields.categoryHours.overhead.hr = selected;
	};
	
	$scope.selectAllGoalsHours = function (selected)
	{
		$scope.params.fields.goals.all = 
			$scope.params.fields.goals.projectedClientHrs =
			$scope.params.fields.goals.projectedInvestmentHrs =
			$scope.params.fields.goals.utilProjections =
			$scope.params.fields.goals.utilGoals =
			$scope.params.fields.goals.projectedOOO = selected;
	};
	
	$scope.selectAllGraphPercentHours = function (selected)
	{
		$scope.params.fields.graphs.percent.all = 
			$scope.params.fields.graphs.percent.overhead =
			$scope.params.fields.graphs.percent.out = selected;
	};
	
	$scope.selectAllFields = function ()
	{
		var selected = !$scope.params.fields.all;
		
		$scope.selectAllProjectHours(selected);
		$scope.selectAllOutOfOfficeHours(selected);
		$scope.selectAllOverheadHours(selected);
		$scope.selectAllGoalsHours(selected);
		$scope.selectAllGraphPercentHours(selected);
		
		$scope.params.fields.categoryHours.marketing =
			$scope.params.fields.categoryHours.sales =
			$scope.params.fields.graphs.trendHrs =
			$scope.params.fields.graphs.trendGoals =
			$scope.params.fields.graphs.graph = selected;
	};
		
	$scope.generateReport = function () {
		
		if ($scope.isGenerationInProgress)
			return;
		
		var input = {
			locations: [],
			fields: $scope.params.fields,
			output: $scope.params.output,
			roles: []
		};
		
		switch ($scope.params.date.range)
		{
			case "week":
				
				input.startDate = moment.utc().subtract(7, "day");
				input.endDate = moment.utc();
				break;
			
			case "weeks":
				
				input.startDate = moment.utc().subtract(14, "day");
				input.endDate = moment.utc();
				break;
			
			case "month":
				
				input.startDate = moment.utc().subtract(30, "day");
				input.endDate = moment.utc();
				break;
				
			case "custom":
				
				input.startDate = moment.utc($scope.params.date.start);
				input.endDate = moment.utc($scope.params.date.end);
				break;
		}
		
		for (var prop in $scope.params.locations)
			if ($scope.params.locations[prop])
				input.locations.push(prop);
		
		for (var prop in $scope.params.roles)
			if ($scope.params.roles[prop])
				input.roles.push(prop);

		$scope.startGenerationTimers();
		console.log(JSON.stringify(input));
		console.log( 'Report generation started' );
		
		Resources.refresh("/reports/people/generate", input, {});
	};
	
	$scope.cancelReport = function () {
		Resources.refresh("/reports/cancel").then(function( result ){
			$scope.cancelReportGeneration();
		}).catch(function( err ){
			$scope.cancelReportGeneration();
		});
	};
	
	$scope.onReportGenerated = function ( report ) {

		console.log( 'Report generation completed' );
		$scope.cancelReportGeneration();
		
		$scope.output.reportData = {
				CSV : null,
				link: ''
		};
		
		$scope.output = report;
		
		$location.path('/reports/people/output');
	};

	$scope.checkGenerationStatus = function ( ) {
		return Resources.refresh("/reports/status").then(function( result ){
			if (result.status != "Running" && result.status != "Completed") {
				$scope.cancelReportGeneration();
			}
			if (result.status == "Completed") {
				Resources.refresh("/reports/get").then(function( result ){
				    console.log("Generated report type: " + result.data.type);
				    if(result && result.data && result.data.type) {
				      $scope.onReportGenerated( result.data );
				    } else {
				      console.log("Server returned broken data for report.");
				    }
				});
			}
			return result.status;
		}).catch(function( err ){
			$scope.cancelReportGeneration();
			return err.data;
		});
	};
	
	$scope.startGenerationTimers = function ( ) {
		
		if ($scope.isGenerationInProgress)
			return;
		
		if (!$rootScope.reportGenerationStartTime)
			$rootScope.reportGenerationStartTime = new moment();
				
		$scope.generationTimer = setInterval( function( ) {
			var timer = document.getElementById('timer');		
			if (timer) {
				var now = new moment( );
				var spentTime = moment.utc(moment(now,"DD/MM/YYYY HH:mm:ss")
						.diff(moment($rootScope.reportGenerationStartTime,"DD/MM/YYYY HH:mm:ss")))
						.format("HH:mm:ss");
				timer.firstChild.textContent = spentTime;
			}
		},
		1000);
		
		$scope.generationPing = setInterval( function( ) {
			$scope.checkGenerationStatus();
		},
		$scope.reportServicePingInterval);
		
		$scope.isGenerationInProgress = true;
	};
	
	$scope.stopGenerationTimers = function ( ) {
		if ($scope.generationTimer) {
			clearInterval($scope.generationTimer);
		}
		if ($scope.generationPing) {
			clearInterval($scope.generationPing);
		}
	};
	
	$scope.cancelReportGeneration = function ( ) {
		$scope.stopGenerationTimers();
		$scope.isGenerationInProgress = false;	
		$rootScope.reportGenerationStartTime = null;
		console.log( 'Report generation aborted' );
	};

	$scope.$on("$destroy", function(){
		$scope.stopGenerationTimers();
	});
	
	$scope.init = function( ) {
		$scope.startGenerationTimers();
		$scope.checkGenerationStatus();
	};
	
	$scope.init();
  
} ] );