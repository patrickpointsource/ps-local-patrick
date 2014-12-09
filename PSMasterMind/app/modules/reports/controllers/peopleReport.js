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
	
	$scope.getBusinessDaysCount = function ( startDate, endDate ) {
		var days = endDate.diff(startDate, 'days');
		var dayNum = startDate.day();
		var count = 0;
		for (var i = 0; i < days; i++) {
			dayNum++;
			if (dayNum < 6)
				count++;
			else
				dayNum = 0;
		}
		return count;
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
		for(var i in report)
			for(var j in report[i])
				for(var k in report[i][j]) {
					var personReport = report[i][j][k];
					var hours = 0;
					for (var k in personReport.hours)
						hours +=  personReport.hours[k].hours;
					if (person.resource == personReport.resource)
						hoursPerPerson += hours;
					hoursForTeam += hours;
				}
		
		$scope.output.summary = {
				createdDate: moment().format("MM/D/YYYY"),
				createdTime: moment().format("H:mm:ss a"),
				reportName: reportName,
				createdBy: { name: Util.getPersonName($scope.me, true, false) },
				reportStartDate: reportStartDate.format("MMM D, YYYY"),
				reportEndDate: reportEndDate.format("MMM D, YYYY"),
				workingDays: $scope.getBusinessDaysCount(reportStartDate, reportEndDate),
				workingHoursPerPerson: hoursPerPerson,
				workingHoursForTeam: hoursForTeam
		};
	};
	
	$scope.generateReport = function () {
		
		if ($scope.isGenerationInProgress)
			return;
		
		$scope.startGenerationTimers();
		console.log( 'Report generation started' );
		
		var params = {
				projectResources: [],
				projectMapping: [],
				reportClient: '',
				reportProject: '',
				reportPerson: ''
		};
		Resources.refresh("/reports/people/generate", params, {});
	
	};
	
	$scope.onReportGenerated = function ( report ) {
		
		var created = new moment();
		var reportDataCb = function( reportData ) {
			$scope.output.reportData = {
					CSV : $scope.JSON2CSV( reportData ),
					link: 'data:text/csv;charset=UTF-8,' + encodeURIComponent( $scope.csvData )
			};
			$scope.fillSummaryOutput ( reportData );
			$scope.cancelReportGeneration();
			console.log( 'Report generation completed' );
			$location.path('/reports/people/output');
		};
		$scope.getHoursReportData( report, function( reportData ) {
			reportDataCb( reportData );
		} );
	};

	$scope.checkGenerationStatus = function ( ) {
		return Resources.refresh("/reports/status").then(function( result ){
			if (result.status != "Running" && result.status != "Completed") {
				$scope.cancelReportGeneration();
			}
			if (result.status == "Completed") {
				Resources.refresh("/reports/get").then(function( result ){
				    console.log("Generated report type: " + result.type);
				    if(result && result.data && result.data.hours && result.data.hours.members) {
				      $scope.onReportGenerated( result.data.hours.members );
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