'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'PeopleReportCtrl', [ '$scope', '$rootScope', '$q', '$state', '$stateParams', '$filter', '$location', '$anchorScroll', 'People', 'Resources', 
function( $scope, $rootScope, $q, $state, $stateParams, $filter, $location, $anchorScroll, People, Resources ) {

  $scope.choiceLocationLabel = "Select one or more location";
  
  $scope.selectedGroups = [ "DEVELOPMENT", "ARCHITECTS" ];
  
  $scope.output = {};
  
  // Summary Section
  var created = moment();
  
  $scope.output.summary = {};
  
  $scope.output.reportData = {};
  
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
	
	$scope.getBusinessDaysCount = function ( startDate, endDate ) {
		var days = endDate.diff(startDate, 'days');
		var date = moment(startDate);
		for (var i = 0; i <= days; i++) {
			date = date.add(1, 'days');
		    if (date.isoWeekday() > 5) {
		      days -= 1;
		    }
		}
		return days;
	};
		
	$scope.getHoursReportData = function ( reportHours, cb ) {
		
		var person;
		var personEntry;
		var mappingEntry;
		var projectMapping = [];
		
		// find by person_resource person in {roles_mapping}-[persons]
		var findPersonOnProject = function( rolesPersonMapping, resource ) {
			var prop;
			var res = null;

			for( prop in rolesPersonMapping ) {
				res = res || _.find( rolesPersonMapping[ prop ], function( p ) {
					return p.resource == resource;
				} );
			}

			return res;
		};
		
		//init projectMapping with entries related to hours which were logged by persons who are not assigned on project
		for (var i = 0; i < reportHours.length; i ++) {
			
			// when we have project logged entry
			if (reportHours[ i ].project) {
				if(  reportHours[ i ].project.resource && !projectMapping[ reportHours[ i ].project.resource ] )
					projectMapping[ reportHours[ i ].project.resource ] = {};

				if( !projectMapping[ reportHours[ i ].project.resource ][ CONSTS.UNKNOWN_ROLE ] )
					projectMapping[ reportHours[ i ].project.resource ][ CONSTS.UNKNOWN_ROLE ] = [ ];

				personEntry = _.find(projectMapping[ reportHours[ i ].project.resource ][CONSTS.UNKNOWN_ROLE], function(p) { 
					return p.resource == reportHours[ i ].person.resource;
				});
				
				if (!personEntry)
					projectMapping[ reportHours[ i ].project.resource ][ CONSTS.UNKNOWN_ROLE ].push( {
						resource: reportHours[ i ].person.resource,
						name:  Util.getPersonName($scope.peopleMap[ reportHours[ i ].person.resource ])
					} );
			
			// when we have logged entry for tasks
			} else if (reportHours[ i ].task) {
				if(  reportHours[ i ].task.resource && !projectMapping[ reportHours[ i ].task.resource ] )
					projectMapping[ reportHours[ i ].task.resource ] = {};
				
				if( !projectMapping[ reportHours[ i ].task.resource ][ CONSTS.UNKNOWN_ROLE ] )
					projectMapping[ reportHours[ i ].task.resource ][ CONSTS.UNKNOWN_ROLE ] = [ ];

				personEntry = _.find(projectMapping[ reportHours[ i ].task.resource ][CONSTS.UNKNOWN_ROLE], function(p) { 
					return p.resource == reportHours[ i ].person.resource;
				});
				
				if (!personEntry)
					projectMapping[ reportHours[ i ].task.resource ][ CONSTS.UNKNOWN_ROLE ].push( {
						resource: reportHours[ i ].person.resource,
						name:  Util.getPersonName($scope.peopleMap[ reportHours[ i ].person.resource ]),
						abbreviation: $scope.peopleMap[ reportHours[ i ].person.resource ].abbreviation
					} );
			}
		}

		for(var i = 0; i < reportHours.length; i++ ) {

			// find person entry associated with current hours entry
			if( reportHours[ i ].project && reportHours[ i ].project.resource ) {
				mappingEntry = projectMapping[ reportHours[ i ].project.resource ];
				person = findPersonOnProject( mappingEntry, reportHours[ i ].person.resource );
			} else if( reportHours[ i ].task && reportHours[ i ].task.resource ) {
				person = null;

				if( projectMapping[ reportHours[ i ].task.resource ].persons )
					person = _.find( projectMapping[ reportHours[ i ].task.resource ][ CONSTS.UNKNOWN_ROLE ], function( p ) {
						return p.resource == reportHours[ i ].person.resource;
					} );

				if( !projectMapping[ reportHours[ i ].task.resource ].persons )
					projectMapping[ reportHours[ i ].task.resource ].persons = [ ];

				if( !person ) {
					person = {
						name:  Util.getPersonName($scope.peopleMap[ reportHours[ i ].person.resource ]),
						resource: reportHours[ i ].person.resource
					};

					projectMapping[ reportHours[ i ].task.resource ].persons.push( person );
				}
			}

			// for found person put current hours entry into hours collection
			if( person ) {
				person.hours = person.hours ? person.hours : [ ];

				if( ( !$scope.reportCustomStartDate || reportHours[ i ].date >= $scope.reportCustomStartDate ) && ( !$scope.reportCustomEndDate || reportHours[ i ].date <= $scope.reportCustomEndDate ) )
					person.hours.push( {
						hours: reportHours[ i ].hours,
						description: reportHours[ i ].description,
						date: reportHours[ i ].date
					} );
			}
		}

		var result = [];
		for(var prop in projectMapping )
			result.push( projectMapping[ prop ] );
		
		cb( result );
		
	};
	
	$scope.fillSummaryOutput = function ( report ) {
		
		 //TODO: should be modified to the correct person link (from the service response or from the input control)
		var person = $scope.me;
		var reportStartDate = moment("September 9, 2014");
		var reportEndDate = moment("September 30, 2014");
		var reportName = "Bi-monthly Department with Graphs Report";
		
		var hoursForTeam = 0;
		var hoursPerPerson = 0;
		for(var i in report) {
			var personReport = report[i];
			if (person.resource == personReport.person.resource)
				hoursPerPerson += personReport.hours;
			hoursForTeam += personReport.hours;
		}
		
		$scope.output.summary = {
				createdDate: moment().format("MM/D/YYYY"),
				createdTime: moment().format("H:mm:ss a"),
				reportName: reportName,
				createdBy: { name: Util.getPersonName($scope.me, true, false) },
				reportStartDate: reportStartDate.format("MMM D, YYYY"),
				reportEndDate: reportEndDate.format("MMM D, YYYY"),
				workingDays: $scope.getBusinessDaysCount(reportStartDate, reportEndDate),
				workingHoursPerPerson: Math.round( hoursPerPerson ),
				workingHoursForTeam: Math.round( hoursForTeam )
		};
	};
	
	$scope.generateReport = function () {
		
		if ($scope.isGenerationInProgress)
			return;
		
		$scope.startGenerationTimers();
		console.log( 'Report generation started' );
		
		var params = {};
		Resources.refresh("/reports/people/generate", params, {});
	
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