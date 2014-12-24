'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'ProjectReportCtrl', [ '$scope', '$rootScope', '$q', '$state', '$stateParams', '$filter', '$location', '$anchorScroll', 'AssignmentService', 'ProjectsService', 'Resources', 
function( $scope, $rootScope, $q, $state, $stateParams, $filter, $location, $anchorScroll, AssignmentService, ProjectsService, Resources ) {

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
			projects: [],
			roles: [],
			fields: $scope.params.fields,
			output: $scope.params.output,
			reportName: $scope.params.reportName
		};
		
		switch ($scope.params.date.range)
		{
			case "week":
				
				input.startDate = moment.utc($scope.params.date.start);
				input.endDate = moment.utc($scope.params.date.start).add(1, "week");
				break;
			
			case "weeks":
				
				input.startDate = moment.utc($scope.params.date.start);
				input.endDate = moment.utc($scope.params.date.start).add(2, "week");
				break;
			
			case "month":
				
				input.startDate = moment(Date.UTC($scope.params.date.year, $scope.params.date.month.index));
				input.endDate = moment(input.startDate).endOf("month");
				break;
				
			case "previousMonth":
				
				input.startDate = moment.utc().startOf("month").subtract(1, "month");
				input.endDate = moment(input.startDate).endOf("month");
				break;
				
			case "currentMonth":
				
				input.startDate = moment.utc().startOf("month");
				input.endDate = moment.utc().subtract(1, "day");
				break;
				
			case "custom":
				
				input.startDate = moment.utc($scope.params.date.start);
				input.endDate = moment.utc($scope.params.date.end);
				break;
		}
		
		var projectList = $scope.projects.selectedProjects && $scope.projects.selectedProjects.length
			? $scope.projects.selectedProjects : $scope.projects;
		
		_.each(projectList, function (p) { input.projects.push({ resource: p.resource }); });
		
		for (var prop in $scope.params.fields.selectedAssignedRoles)
			if ($scope.params.fields.selectedAssignedRoles[prop])
				input.roles.push(prop);
		
		console.log(JSON.stringify(input));
		
		$scope.startGenerationTimers();
        
        Resources.refresh("/reports/project/generate", input, {});
	};

    $scope.onReportGenerated = function ( report ) {

        console.log( 'Report generation completed' );
                
        $scope.output = report;
        
        if($scope.output.assignmentsHours) {
          _.each($scope.output.assignmentsHours.people, function(person) {
            person.isCollapsed = false;
          });
        }
        
        if ($scope.isGenerationInProgress)
            $location.path('/reports/project/output');
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
                    $scope.cancelReportGeneration();
                });
            }
            return result.status;
        }).catch(function( err ){
            $scope.cancelReportGeneration();
            return err.data;
        });
    };
    
    $scope.reportServicePingInterval = 5000;
    
    $scope.startGenerationTimers = function ( ) {
        
        if ($scope.isGenerationInProgress)
            return;
        
        if (!$rootScope.reportGenerationStartTime)
            $rootScope.reportGenerationStartTime = new moment();
                
        $scope.generationTimer = setInterval( function( ) {
            var timer =  $( "#timer" )[ 0 ];
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
        $scope.isGenerationInProgress = false;
        $scope.checkGenerationStatus().then( function ( state ) {
            if (state == "Running")
                $scope.startGenerationTimers();
        });
    };
    
    $scope.init();
    
    $scope.reportHandler = {
            stringify: function( str ) {
                return '"' + str.replace( /^\s\s*/, '' ).replace( /\s*\s$/, '' )// trim spaces
                .replace( /"/g, '""' ) + // replace quotes with double quotes
                '"';
            },

            generate: function( e ) {
                if( $scope.output && $scope.output.type == "project" ) {
                    $rootScope.modalDialog = {
                        title: "Generate report",
                        text: "Report already generated. Would you like to generate new report?",
                        ok: "Yes",
                        no: "No",
                        okHandler: function( ) {
                            $( ".modalYesNoCancel" ).modal( 'hide' );
                            $scope.generateReport( );
                        },
                        noHandler: function( ) {
                            $( ".modalYesNoCancel" ).modal( 'hide' );
                            $location.path('/reports/project/output');
                        }
                    };
                    $( ".modalYesNoCancel" ).modal( 'show' );
                } else {
                    $scope.generateReport( );
                }
            },

            exportHours: function( e ) {
                $scope.csvData = $scope.JSON2CSV( $scope.output.dataForCSV );
                prepareDocumentDownloadLink(e, $scope.csvData);
            },
            
            exportHoursByRoles: function( e ) {
                var rolesToExport = []; 
                _.each($scope.output.peopleDetails.utilizationDetails, function( record ) { 
                    if ( record.role.isSelected )
                        rolesToExport.push(record.role.resource);
                });
                $scope.csvData = $scope.JSON2CSV( $scope.output.dataForCSV, rolesToExport );
                prepareDocumentDownloadLink(e, $scope.csvData);
            },
            
            cancel:  function( e ) {
                Resources.refresh("/reports/cancel").then(function( result ){
                    $scope.cancelReportGeneration();
                }).catch(function( err ){
                    $scope.cancelReportGeneration();
                });
            },
            
            link: function( ) {
                return {};
            }
        };
  
} ] );