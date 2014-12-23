'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'PeopleReportCtrl', [ '$scope', '$rootScope', '$q', '$state', '$stateParams', '$filter', '$location', '$anchorScroll', 'People', 'Resources', 
function( $scope, $rootScope, $q, $state, $stateParams, $filter, $location, $anchorScroll, People, Resources ) {

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

	$scope.CSVSplitter = ',';
	
  $scope.choiceLocationLabel = "Select one or more location";
  
  $scope.reportServicePingInterval = 5000;
  
  $scope.output = {};
  
  // Summary Section
  var created = moment();
  
  $scope.output.summary = {};
  
  $scope.output.reportData = {};
  
  $scope.exportOptions = {
		  allRoles: false,
		  csvOnly : false,
		  graphsOnly: false
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
			range: "week",
			start: moment().format("YYYY-MM-DD"),
			month: $scope.months[moment().month()],
			year: moment().year()
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
	
	$scope.selectRoleToExport = function ( role )
	{
		role.isSelected = !role.isSelected;
		var allSelected = true;
		for (var i in $scope.output.peopleDetails.utilizationDetails) {
			if ( !$scope.output.peopleDetails.utilizationDetails[i].role.isSelected ) {
				allSelected = false;
				break;
			}
		}
		$scope.exportOptions.allRoles = allSelected;
	};
	
	$scope.selectAllRolesToExport = function ( )
	{
		var selected = !$scope.exportOptions.allRoles;
		for (var i in $scope.output.peopleDetails.utilizationDetails) {
			$scope.output.peopleDetails.utilizationDetails[i].role.isSelected = selected;
		}
		$scope.exportOptions.allRoles = selected;
	};
	
	$scope.selectLocationParent = function (location)
	{
		if (!$scope.params.locations[location])
			$scope.params.locations.all = false;
	};
	
	$scope.selectDepartmentParent = function (department)
	{
		if (!$scope.params.departments[department])
			$scope.params.departments.all = false;
		
		// Enforces data bind.
		$scope.roles = $scope.roles;
	};
	
	$scope.selectAllDepartments = function ()
	{
		var selected = $scope.params.departments.all;
		
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
		var selected = $scope.params.locations.all;
		
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
		var selected = $scope.params.fields.all;
		
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
			
	$scope.reportHandler = {
			stringify: function( str ) {
				return '"' + str.replace( /^\s\s*/, '' ).replace( /\s*\s$/, '' )// trim spaces
				.replace( /"/g, '""' ) + // replace quotes with double quotes
				'"';
			},

			generate: function( e ) {
				if( $scope.output && $scope.output.type == "people" ) {
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
							$location.path('/reports/people/output');
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
	
	$scope.generateReport = function () {		
		
		if ($scope.isGenerationInProgress)
			return;
		
		var input = {
			reportName: $scope.params.reportName,
			locations: [],
			fields: $scope.params.fields,
			output: $scope.params.output,
			dateRange: $scope.params.date.range,
			roles: []
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
		
		for (var prop in $scope.params.locations)
			if ($scope.params.locations[prop])
				input.locations.push(prop);
		
		for (var prop in $scope.params.roles)
			if ($scope.params.roles[prop])
				input.roles.push(prop);

		$scope.startGenerationTimers();
		
		console.log( 'Report generation started' );
		
		Resources.refresh("/reports/people/generate", input, {});
	};
	
	$scope.onReportGenerated = function ( report ) {

		console.log( 'Report generation completed' );
				
		$scope.output = report;
		
		$scope.selectAllRolesToExport();		
		
		if ($scope.isGenerationInProgress)
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
				    $scope.cancelReportGeneration();
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
			var timer =  $( "#lblTimer" )[ 0 ];		
			if (timer) {
				var now = new moment( );
				var spentTime = moment.utc(moment(now,"DD/MM/YYYY HH:mm:ss")
						.diff(moment($rootScope.reportGenerationStartTime,"DD/MM/YYYY HH:mm:ss")))
						.format("HH:mm:ss");
				timer.textContent = spentTime;
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
	
	$scope.cancel = function(e) {
	  Resources.refresh("/reports/cancel").then(function( result ){
                    $scope.cancelReportGeneration();
                }).catch(function( err ){
                    $scope.cancelReportGeneration();
                });
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
	
	$scope.roleDepartementMapping = People.getPeopleGroupMapping( );
	
	$scope.init();
	
	$scope.getHoursHeader = function( ) {
        if( $scope.activeTab[ 'hours' ] )
            return [ 'Project/Task', 'Person', 'Role', 'Department', 'Date', 'Hours', 'Description' ];

        if( $scope.activeTab[ 'billing' ] ) {
            if( $scope.reportTypes[ 'customforecast' ] )
                return [ 'Project/Task', 'Project type', 'Invoice date', 'Fixed bid revenue', 'Role', 'Role quantity', 'Theoretical monthly revenue total' ];
            else if( $scope.reportTypes[ 'customaccruals' ] )
                return [ 'Project/Task', 'Project type', 'Invoice date', 'Fixed bid revenue', 'Role', 'Role quantity', 'Theoretical monthly total', 'Assignment name', 'Hours logged', 'Theoretical hours remaining', 'Total Revenue expected for month' ];
        }

    };
	
	$scope.JSON2CSV = function( reportData, rolesToExport ) {
        var str = '';
        var line = '';
        
        //Print the header
        var head = $scope.getHoursHeader( );
        var i = 0;

        line += head.join( $scope.CSVSplitter );
        str += line + '\r\n';

        for(var i = 0; i < reportData.length; i++ ) {
            line = '';

            var record = reportData[ i ];

            var getDepartment = function( role ) {
                var group;
                var result = [ ];

                for( group in $scope.roleDepartementMapping ) {
                    if( _.find( $scope.roleDepartementMapping[ group ], function( r ) {
                        return r == role;
                    } ) ) {
                        result.push( group );
                    }
                }

                return result.join( $scope.CSVSplitter );
            };
            
            for(var j = 0; record.roles && j < record.roles.length; j++ ) {
            	if ( !rolesToExport || _.contains(rolesToExport, record.roles[ j ].type.resource) ) {
                    // for hours report
                    for(var k = 0; record.roles[ j ].persons && k < record.roles[ j ].persons.length; k++ ) {
                        //line += [ '--', '--' ].join( ',' );

                        if( !record.roles[ j ].persons[ k ].hours || record.roles[ j ].persons[ k ].hours.length == 0 ) {
                            //line += [ '--' ].join( ',' );
                            line += $scope.reportHandler.stringify( record.name ) + $scope.CSVSplitter;
                            line += $scope.reportHandler.stringify( record.roles[ j ].persons[ k ].name ) + $scope.CSVSplitter;
                            line += (record.roles[ j ].abbreviation == CONSTS.UNKNOWN_ROLE ? 'Currently Unassigned': $scope.reportHandler.stringify( record.roles[ j ].type.id )) + $scope.CSVSplitter;
                            line += $scope.reportHandler.stringify( getDepartment( record.roles[ j ].type.id ) ) + $scope.CSVSplitter;
                            line += [ '--', '--', '--', '--' ].join( $scope.CSVSplitter );
                            line += '\r\n';
                        }

                        for(var l = 0; record.roles[ j ].persons[ k ].hours && l < record.roles[ j ].persons[ k ].hours.length; l++ ) {
                            //line += [ '--' ].join( ',' );
                            line += $scope.reportHandler.stringify( record.name ) + $scope.CSVSplitter;
                            line += $scope.reportHandler.stringify( record.roles[ j ].persons[ k ].name ) + $scope.CSVSplitter;
                            
                            if (record.roles[ j ].persons[ k ].abbreviation)
                                line += record.roles[ j ].persons[ k ].abbreviation + $scope.CSVSplitter;
                            else
                                line += (record.roles[ j ].abbreviation == CONSTS.UNKNOWN_ROLE ? 'Currently Unassigned': $scope.reportHandler.stringify( record.roles[ j ].type.id )) + $scope.CSVSplitter;
                            
                            line += $scope.reportHandler.stringify( getDepartment( record.roles[ j ].type.id ) ) + $scope.CSVSplitter;

                            line += record.roles[ j ].persons[ k ].hours[ l ].date + $scope.CSVSplitter;
                            line += record.roles[ j ].persons[ k ].hours[ l ].hours + $scope.CSVSplitter;
                            line += $scope.reportHandler.stringify( record.roles[ j ].persons[ k ].hours[ l ].description ) + $scope.CSVSplitter;
                            line += '\r\n';
                        }
                    }
            	}
            }

            // in case of tasks
            if( !record.roles ) {
                for(var k = 0; record.persons && k < record.persons.length; k++ ) {
                    for(var l = 0; record.persons[ k ].hours && l < record.persons[ k ].hours.length; l++ ) {
                        //line += [ '--' ].join( ',' );
                        line += $scope.reportHandler.stringify( record.name ) + $scope.CSVSplitter;
                        line += '--' + $scope.CSVSplitter;
                        line += $scope.reportHandler.stringify( record.persons[ k ].name ) + $scope.CSVSplitter;
                        line += record.persons[ k ].hours[ l ].date + $scope.CSVSplitter;
                        line += record.persons[ k ].hours[ l ].hours + $scope.CSVSplitter;
                        line += $scope.reportHandler.stringify( record.persons[ k ].hours[ l ].description ) + $scope.CSVSplitter;
                        line += '\r\n';
                    }
                }
            }

            if( line )
                str += line + '\r\n';
        }

        return str;
    };
    
    var prepareDocumentDownloadLink = function ( controlEvent, data ) {
    	
    	/*Only called when our custom event fired*/
    	var onInnerReportLink = function( e ) {
			e = e ? e : window.event;
			e.stopPropagation( );
			$( e.target ).closest( 'a' ).unbind( 'click' );
		};
		
    	var e = controlEvent ? controlEvent : window.event;
		var btn = $( e.target ).closest( '.btn-report' ).find( 'a' );
		e.preventDefault( );
		e.stopPropagation( );
		var evt = document.createEvent( "MouseEvents" );
		evt.initMouseEvent( "click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
		btn.attr( 'href', 'data:text/csv;charset=UTF-8,' + encodeURIComponent( $scope.csvData ));
		btn.click( onInnerReportLink );
		btn.get( 0 ).dispatchEvent( evt );
    };
  
} ] );