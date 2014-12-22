/**
 * Service to prepare data for people report output sections
 */

var util = require( '../util/util.js' );
var _ = require('underscore');
var memoryCache = require( '../data/memoryCache.js' );
var moment = require('moment');
var reportCalculations = require( '../services/reportCalculations.js' );
var reportsService = require( '../services/reportsService.js' );

var UNDETERMINED_ROLE = 'undetermined_role';

var TASKS = {
  MARKETING: "Marketing",
  SALES: "Sales",
  VACATION: "Vacation",
  SICK: "Sick Time"
};

// generates report output object and calls callback when ready
module.exports.generate = function(person, params, callback) {
  var report = {};
  var reportId = util.getReportId(person._id);
  report.type = params.type;
  
  reportsService.prepareData(person, params, function(err, data) {
    
    if(err || !data) {
      callback("Error getting data while generating report: " + err);
      return;
    }
    
    report.dataForCSV = getDataForCsv(data, params);
    
    report.summary = getSummarySection(data, params);
    report.peopleDetails = getPeopleDetailsSection(data, params);
    report.projectHours = getProjectHours(data, params);
    report.categoryHours = getCategoryHours(data, params);
    report.goals = getGoals(data, params);
    report.projections = getProjections(data, params);
    
    report.rawData = data;
    
    memoryCache.putObject(reportId, report);
    callback(null, "People report generated.");
  });
};

// Not implemented (fake data)
var getSummarySection = function(data, params) {
  var created = moment();
  
  var reportStartDate = moment(params.startDate);
  var reportEndDate = moment(params.endDate);
  var businessDaysCount = util.getBusinessDaysCount(reportStartDate, reportEndDate);
  var hoursForTeam =  reportCalculations.calculateCapacity(data, params.startDate, params.endDate);
  var hoursPerPerson = hoursForTeam / data.people.length;
  
  var summarySection = {
    createdDate: created.format("MM/D/YYYY"),
    createdTime: created.format("H:mm:ss a"),
    reportName: "Bi-monthly Department with Graphs Report",
    createdBy: { name: util.getPersonName(data.profile, true, false) },
    reportStartDate: reportStartDate.format("MMM D, YYYY"),
    reportEndDate: reportEndDate.format("MMM D, YYYY"),
    workingDays: businessDaysCount,
    workingHoursPerPerson: Math.round( hoursPerPerson ),
    workingHoursForTeam: Math.round( hoursForTeam )
  };
  
  return summarySection;
};

// Not implemented (fake data)
var getPeopleDetailsSection = function(data, params) {
	
	var capacity = reportCalculations.calculateCapacity(data, params.startDate, params.endDate);
	var hoursStatistics = reportCalculations.getHoursStatistics(data);
	var assignmentsStatistics = reportCalculations.getAssignmentsStatistics(data, params.startDate, params.endDate);
	var utilizationDetails = reportCalculations.getUtilizationDetails(data, params.startDate, params.endDate, params.roles);
		
	var totalClientInvestHours = Math.round( hoursStatistics.actualClientHours + hoursStatistics.actualInvestHours );
	var totalTasksHours = Math.round( hoursStatistics.overhead + hoursStatistics.allHours );
	var utilizationClient = Math.round( hoursStatistics.actualClientHours / assignmentsStatistics.projectedClientHours * 100 );
	var utilizationInvest = Math.round( hoursStatistics.actualInvestHours / assignmentsStatistics.projectedInvestHours * 100 );
	var	utilizationTotal = utilizationClient + utilizationInvest;
		
	return {
		totalPeople: data.people.length,
		utilizationDetails: utilizationDetails,
		peopleOnClient: assignmentsStatistics.peopleOnClient,
		peopleOnInvestment: assignmentsStatistics.peopleOnInvestment,
		availableHours: capacity,
		totalClientInvestHours: totalClientInvestHours,
		totalTasksHours: totalTasksHours,
		utilizationClient:  utilizationClient,
		utilizationInvest:  utilizationInvest,
		utilizationTotal: utilizationTotal 
	};
};

var getProjectHours = function(data, params) {

	var capacity = reportCalculations.calculateCapacity(data, params.startDate, params.endDate);
	var hoursStatistics = reportCalculations.getHoursStatistics(data);
	var assignmentsStatistics = reportCalculations.getAssignmentsStatistics(data, params.startDate, params.endDate);
	
	var projectedClient = Math.round((assignmentsStatistics.projectedClientHours / capacity) * 100); 
	var projectedInvest = Math.round((assignmentsStatistics.projectedInvestHours / capacity) * 100); 
	var projectedAllUtilization = projectedClient + projectedInvest + hoursStatistics.outOfOffice + hoursStatistics.overhead;
	
	var actualClient = Math.round(( hoursStatistics.actualClientHours / capacity ) * 100);
	var actualInvest = Math.round(( hoursStatistics.actualInvestHours / capacity ) * 100);
	var actualAllUtilization = actualClient + actualInvest + hoursStatistics.outOfOffice + hoursStatistics.overhead;
	
	var projectHours = {
		capacity : capacity,
		projectedClientHours : assignmentsStatistics.projectedClientHours,
		projectedInvestHours : assignmentsStatistics.projectedInvestHours,
		totalProjectedHours : assignmentsStatistics.totalProjectedHours,
		actualClientHours : hoursStatistics.actualClientHours,
		actualInvestHours : hoursStatistics.actualInvestHours,
		totalActualHours : hoursStatistics.actualClientHours + hoursStatistics.actualInvestHours,
		projectedClient : projectedClient,
		projectedInvest : projectedInvest,
		projectedAllUtilization : projectedAllUtilization,
		actualClient : actualClient,
		actualInvest : actualInvest,
		actualAllUtilization : actualAllUtilization
		
	};
	return projectHours;
};

var getCategoryHours = function(data, params) {

  var statistics = reportCalculations.getHoursStatistics(data);
  var capacity = reportCalculations.calculateCapacity(data, params.startDate, params.endDate);
  
  // calculating percent of OOO hours
  var percentOOO = 0;
  
  if(statistics.outOfOffice > 0) {
    percentOOO = Math.round( (statistics.outOfOffice * 100) / statistics.allHours );
  }
  
  // calculating percent of OH hours
  var percentOH = 0;
  
  if(statistics.overhead > 0) {
    percentOH = Math.round( (statistics.overhead * 100) / statistics.allHours );
  }
  
  //calculating percent of Client and Invest hours
  var percentClient = 0;
  var percentInvest = 0;
  
  var now = moment();
  var isFuture = moment(params.startDate).isAfter(now);
  
  var clientHours;
  var investHours;
  
  if(isFuture) {
    var assignmentsStatistics = reportCalculations.getAssignmentsStatistics(data, params.startDate, params.endDate);
    
    clientHours = assignmentsStatistics.projectedClientHours;
    investHours = assignmentsStatistics.projectedInvestHours;
    
    if(clientHours > 0) {
      percentClient = Math.round( (clientHours * 100) / assignmentsStatistics.totalProjectedHours);
    }
    
    if(investHours > 0) {
      percentInvest = Math.round( (investHours * 100) / assignmentsStatistics.totalProjectedHours );
    }
  } else {
    clientHours = statistics.actualClientHours;
    investHours = statistics.actualInvestHours;
    
    if(clientHours > 0) {
      percentClient = Math.round( (clientHours * 100) / statistics.allHours);
    }
    
    if(investHours > 0) {
      percentInvest = Math.round( (investHours * 100) / statistics.allHours );
    }
  }
  
  var percentUnaccounted = 100 - percentOOO - percentOH - percentClient - percentInvest;
  
  var categoryHours = {
     OOOHours: statistics.outOfOffice,
     OHHours: statistics.overhead,
     percentClientHours: percentClient,
     percentInvestHours: percentInvest,
     percentOOO: percentOOO,
     percentOH: percentOH,
     percentHoursUnaccounted: percentUnaccounted
  };
  
  categoryHours.totalOOOOHHours = categoryHours.OOOHours + categoryHours.OHHours;
  
  return categoryHours;
};

// Not implemented (fake data)
var getGoals = function(data, params) {
  return {
    clientUtilization: 80,
    investmentUtilization: 75,
    teamUtilization: 71
  };
};

// Not implemented (fake data)
var getProjections = function(data, params) {
  return projections = {
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
};

var getDataForCsv = function(data, params) {
  var assignments = data.assignments;
  var reportPerson = null;
  
  var rolesMapping = {};
              for( i = 0; i < data.allRoles.length; i++ ) {
                var role = data.allRoles[ i ];
                var resource = role.resource;

                role.value = role.abbreviation.toLowerCase( );

                rolesMapping[ role.resource ] = role.value;
              }
          
              var peopleMap = {};
              var peopleList = _.map( data.allPeople, function( m ) {
                abbr =  m.primaryRole && m.primaryRole.resource ? rolesMapping[m.primaryRole.resource]: UNDETERMINED_ROLE;
                
                if (abbr)
                  abbr = abbr.toUpperCase();
                
                peopleMap[ m.resource ] = {
                  name: m.name,
                  abbreviation: abbr
                };

                return {
                  value: m.name,
                  resource: m.resource
                };
              } );
  
  var projectMapping = {};
  
  for( i = 0; i < assignments.length; i++ ) {
            if(assignments[ i ].members) {
                for( j = 0; j < assignments[ i ].members.length; j++ ) {

                    if( !reportPerson || reportPerson.resource == assignments[ i ].members[ j ].person.resource ) {
                        if( !projectMapping[ assignments[ i ].project.resource ] )
                            projectMapping[ assignments[ i ].project.resource ] = {};

                        if( !projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ] )
                            projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ] = [ ];

                        projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ].push( {
                            resource: assignments[ i ].members[ j ].person.resource,
                            name:  util.getPersonName(peopleMap[ assignments[ i ].members[ j ].person.resource ]),
                            abbreviation: peopleMap[ assignments[ i ].members[ j ].person.resource ].abbreviation
                        } );
                    }
                }
              }
            }

  var csv = getHoursReportData(data.hours, params, projectMapping, peopleMap, data);
  
  return csv;
};

var getHoursReportData = function ( reportHours, params, projectMapping, peopleMap, data) {
        var person;
        var mappingEntry;
        var personEntry;
        
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

                if( !projectMapping[ reportHours[ i ].project.resource ][ UNDETERMINED_ROLE ] )
                    projectMapping[ reportHours[ i ].project.resource ][ UNDETERMINED_ROLE ] = [ ];

                personEntry = _.find(projectMapping[ reportHours[ i ].project.resource ][UNDETERMINED_ROLE], function(p) { 
                    return p.resource == reportHours[ i ].person.resource;
                });
                
                if (!personEntry)
                    projectMapping[ reportHours[ i ].project.resource ][ UNDETERMINED_ROLE ].push( {
                        resource: reportHours[ i ].person.resource,
                        name:  util.getPersonName(peopleMap[ reportHours[ i ].person.resource ])
                    } );
            
            // when we have logged entry for tasks
            } else if (reportHours[ i ].task) {
                if(  reportHours[ i ].task.resource && !projectMapping[ reportHours[ i ].task.resource ] )
                    projectMapping[ reportHours[ i ].task.resource ] = {};
                
                if( !projectMapping[ reportHours[ i ].task.resource ][ UNDETERMINED_ROLE ] )
                    projectMapping[ reportHours[ i ].task.resource ][ UNDETERMINED_ROLE ] = [ ];

                personEntry = _.find(projectMapping[ reportHours[ i ].task.resource ][UNDETERMINED_ROLE], function(p) { 
                    return p.resource == reportHours[ i ].person.resource;
                });
                
                if (!personEntry)
                    projectMapping[ reportHours[ i ].task.resource ][ UNDETERMINED_ROLE ].push( {
                        resource: reportHours[ i ].person.resource,
                        name:  util.getPersonName(peopleMap[ reportHours[ i ].person.resource ]),
                        abbreviation: peopleMap[ reportHours[ i ].person.resource ].abbreviation
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
                    person = _.find( projectMapping[ reportHours[ i ].task.resource ][ UNDETERMINED_ROLE ], function( p ) {
                        return p.resource == reportHours[ i ].person.resource;
                    } );

                if( !projectMapping[ reportHours[ i ].task.resource ].persons )
                    projectMapping[ reportHours[ i ].task.resource ].persons = [ ];

                if( !person ) {
                    person = {
                        name:  util.getPersonName(peopleMap[ reportHours[ i ].person.resource ]),
                        resource: reportHours[ i ].person.resource
                    };

                    projectMapping[ reportHours[ i ].task.resource ].persons.push( person );
                }
            }
            
            // for found person put current hours entry into hours collection
                person.hours = person.hours ? person.hours : [ ];

                if( ( !params.startDate || reportHours[ i ].date >= params.startDate ) && ( !params.endDate || reportHours[ i ].date <= params.endDate ) )
                    person.hours.push( {
                        hours: reportHours[ i ].hours,
                        description: reportHours[ i ].description,
                        date: reportHours[ i ].date
                    } );
        }

        var roleResource;
        var projects = data.projects;
        // migrate initialized persons collection with associated hours for each role to
        // each project role
        for(var i = 0; i < projects.length; i++ ) {
            
            // add empty - will be treated as undetermined
            if (!projects[ i ].roles)
                projects[ i ].roles = [{abbreviation: CONSTS.UNDETERMINED_ROLE}];
        
            for(var j = 0; j < projects[ i ].roles.length; j++ ) {
                
                if (projects[i].roles[ j ]._id)
                    roleResource = projects[ i ].resource + '/roles/' + projects[i].roles[ j ]._id;
                else
                    roleResource = UNDETERMINED_ROLE;

                if( projectMapping[ projects[ i ].resource ] && projectMapping[ projects[ i ].resource ][ roleResource ] ) {
                    projects[i].roles[ j ].persons = projectMapping[ projects[i].resource ][ roleResource ];
                    var l = 0;

                    for( l = 0; l < projects[i].roles[ j ].persons.length; l++ ) {
                        if( projects[i].roles[ j ].persons[ l ].hours )
                            projects[i].roles[ j ].persons[ l ].hours.sort( function( p1, p2 ) {
                                if( p1.date < p2.date )
                                    return 1;
                                else if( p1.date > p2.date )
                                    return -1;
                                return 0;
                            } );
                    }
                } else
                    projects[i].roles[ j ].persons = [ ];

            }
        }
        
        var returnedProjects = [];
        // remove perojects without hours
        if( projects.length > 0 ) {
            for(var p = 0; p < projects.length; p++ ) {
              var proj = projects[ p ];
              var hoursExist = false;
              for(var role in proj.roles) {
                if(proj.roles[role].persons && proj.roles[role].persons.length > 0) {
                  for(person in proj.roles[role].persons) {
                    if(proj.roles[role].persons[person].hours && proj.roles[role].persons[person].hours.length > 0) {
                      hoursExist = true;
                    }
                  }
                }
              }
              
              if(hoursExist){
                returnedProjects.push( projects[ p ] );
              }
            }
        }
        
        return returnedProjects;
    };
