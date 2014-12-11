var dbAccess = require( '../data/dbAccess.js' );
var dataAccess = require( '../data/dataAccess.js' );
var memoryCache = require( '../data/memoryCache.js' );
var moment = require('moment');

var assignments = require( '../controllers/assignments' );
var util = require( '../util/util.js' );
var _ = require('underscore');

// Report types

var REPORT_TYPES = {
  PEOPLE: "people",
  PROJECT: "project",
  CUSTOM: "custom",
  DASHBOARD: "dashboard"
};

// Supported new report types
var SUPPORTED_REPORT_TYPES = [ REPORT_TYPES.PEOPLE, REPORT_TYPES.DASHBOARD ];

// Report statuses
var REPORT_IS_NOT_STARTED = "Not started";
var REPORT_IS_RUNNING = "Running";
var REPORT_IS_CANCELLED = "Cancelled";
var REPORT_IS_COMPLETED = "Completed";

var REPORT_PREFIX = "report_";
var STATUS_SUFFIX = "_status";

var UNDETERMINED_ROLE = 'undetermined_role';

var ASYNC_HOURS = 'asyncHours';
var ASYNC_BILLING_ACCURALS = 'asyncBillingAccurals';
var ASYNC_BILLING_FORECAST = 'asyncBillingForecast';

// backward compatibility for old report types
var OLD_TYPES = [ ASYNC_HOURS, ASYNC_BILLING_ACCURALS, ASYNC_BILLING_FORECAST ];

var HOURS_FIELDS =  ["_id", "date", "description", "project", "person", "task", "hours"];
var PROJECT_FIELDS = ["resource", "name", "startDate", "endDate", "roles", "customerName", "committed", "type", "description", "terms"];
var PEOPLE_FIELDS = ["_id", "groups", "primaryRole", "name", "isActive", "resource", "lastSynchronized", "mBox", "phone", "about", "thumbnail" ];

// generate report id using personId
var getReportId = function (personId) {
  return util.getReportId(personId);
};

// method that checks type of report and start the process of report data generation
var startGenerateReport = function(person, type, params, callback) {
  var reportId = getReportId(person._id);
  params.type = type;
  
  // new supported types
  if(SUPPORTED_REPORT_TYPES.indexOf(type) > -1) {
    // service path is '../services/[name]Report' (e.g. '../services/peopleReport')
    var supportedReportService = require("../services/" + type + "Report");
    if(supportedReportService) {
      supportedReportService.generate(person, params, callback);
    } else {
      callback("Error in initializing report generation: report type " + type + " is not supported yet.", null);
    }
  } else {
    // old report types
    switch(type) {
      case ASYNC_HOURS: 
        generateHoursReportAsync(reportId, params, callback);
        break;
      case ASYNC_BILLING_ACCURALS: 
        generateBillingAccuralsReportAsync(reportId, params, callback);
        break;
      default: 
        callback("Unknown report type: " + type, null);
    }
  }
};

// gets the report for person by his id
var getReportFromMemoryCache = function(personId, callback) {
  var reportId = getReportId(personId);
  callback(null, memoryCache.getObject(reportId));
};

// gets the report status for person by his id
var getStatusFromMemoryCache = function(personId) {
  var reportId = getReportId(personId) + STATUS_SUFFIX;
  var status = memoryCache.getObject(reportId);
  if(!status) {
    status = REPORT_IS_NOT_STARTED;
  }
  return status;
};

// updates status of report for person
var updateStatus = function(personId, status) {
  var reportId = getReportId(personId) + STATUS_SUFFIX;
  memoryCache.putObject(reportId, status);
};

// returns caclulated hours query for report or error if happens in callback
var getHoursQuery = function(assignments, reportPerson, projectMapping, projects, people, roles, startDate, endDate, rolesMapping, peopleMap, callback) {
  var persons = [ ];
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
                            name:  util.getPersonName(peopleMap[ assignments[ i ].members[ j ].person.resource ])
                        } );

                        
                        persons.push( assignments[ i ].members[ j ].person.resource );
                    }
                }
              }
            }

            // prepare requests to load hours for associated with filtered projects people
            var hoursQ = {
                $or: [ ]
            };

            var prop;
            
            if(!_.isEmpty(projectMapping)) {
              hoursQ.$or = _.map( projectMapping, function( val, key ) {
                if( key.indexOf( 'tasks' ) > -1 )
                    return {
                        "task.resource": key
                    };
                return {
                    "project.resource": key
                };
              } );
            }
            
            
            // include all projects not only on which we have assignments
            if(!_.isEmpty(projects)) {
              hoursQ.$or = _.map( projects, function( val ) {
                if( val.resource.indexOf( 'tasks' ) > -1 )
                    return {
                        "task.resource": val.resource
                    };
                return {
                    "project.resource": val.resource
                };
              } );
            }
            
            hoursQ.$or = _.uniq( hoursQ.$or, function( p ) {
                if (p[ "task.resource" ])
                    return p[ "task.resource" ];
                
                return p[ "project.resource" ];
            } );
          
          if (startDate && endDate ) {
            hoursQ.$and = [ { date: { $gte: startDate }}, { date: { $lte: endDate }}  ];
          }
      
          callback(null, hoursQ);
};

// gets all the data needed for hours report query
var prepareDataForReports = function(reportId, params, callback) {
  assignments.listAssignmentsByProjectResourcesAndTimePeriod( params.projectResources, params.timePeriod, function( err, assignments ) {
    if( err ) {
      callback( 500, "Error in getting assignment while generating report: " + err );
    } else {
      var fields = PEOPLE_FIELDS;
      dataAccess.listPeople({}, fields, function(err, people) {
        if(err) {
          callback("Error getting people while generating report: " + err, null);
        } else {
          dataAccess.listRoles({}, function(err, roles) {
            if(err) {
              callback("Error getting roles while generating report: " + err, null);
            } else {
              var projects = _.map(params.projectResources, function(p) {
                return { resource: p };
              });
      
              var projMapping = JSON.parse(params.projectMapping);
      
              var assignmentsMembers = [];
      
              if(assignments && assignments.members.length > 0) {
                assignmentsMembers = assignments.members;
              }
              
              var rolesMapping = {};
              for( i = 0; i < roles.members.length; i++ ) {
                var role = roles.members[ i ];
                var resource = role.resource;

                role.value = role.abbreviation.toLowerCase( );

                rolesMapping[ role.resource ] = role.value;
              }
          
              var peopleMap = {};
              var peopleList = _.map( people.members, function( m ) {
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
              
              callback(null, {
                reportId: reportId,
                params: params,
                projects: projects,
                projMapping: projMapping,
                assignmentsMembers: assignmentsMembers,
                people: people,
                roles: roles,
                peopleMap: peopleMap,
                rolesMapping: rolesMapping
              });
            }
          });
        }
      });
    }
  } );
};

// get hours and put result into memoryCache, return callback for /generate/ route
var generateHoursReportAsync = function(reportId, params, callback) {
  prepareDataForReports(reportId, params, function(err, data) {
    if(err) {
      callback("Error while getting data for hours report: " + err);
    } else {
      getHoursQuery(data.assignmentsMembers, data.params.reportPerson, data.projMapping, data.projects, data.people, data.roles, data.params.startDate, data.params.endDate, data.rolesMapping, data.peopleMap, function(err, hoursQ) {
        if(err) {
          callback("Error calculating hours query while generating report: " + err, null);
        } else {
          dataAccess.listHours(hoursQ, HOURS_FIELDS, function(err, hours) {
            if(err) {
              callback("Error getting hours while generating report: " + err, null);
            } else {
              var overallResult = {
                type: params.type,
                data: {
                  hours: hours,
                  people: data.people
                }
              };

              memoryCache.putObject(reportId, overallResult);
              callback(null, "Report " + reportId + " sucessfully generated");
            }
          });
        }
      });
    }
  });
};

var generateBillingAccuralsReportAsync = function(reportId, params, callback) {
  prepareDataForReports(reportId, params, function(err, data) {
    if(err) {
      callback("Error while getting data for billing accurals report: " + err);
    } else {
      dataAccess.listProjects({}, PROJECT_FIELDS, function(err, projects) {
        if(err) {
          callback("Error while getting projects for billing accurals report: " + err);
        } else {
          getBillingAccuralsHoursQuery(data.assignmentsMembers, data.params.reportPerson, data.projMapping, projects.data, data.people, data.roles, data.params.startDate, data.params.endDate, data.rolesMapping, data.peopleMap, data.params.targetType, function(err, hoursQ) {
            if(err) {
              callback("Error calculating hours query while generating report: " + err, null);
            } else {
              dataAccess.listHours(hoursQ, HOURS_FIELDS, function(err, hours) {
                if(err) {
                  callback("Error getting hours while generating billing accurals report: " + err, null);
                } else {
                  var overallResult = {
                    type: params.type,
                    data: {
                      hours: hours,
                      people: data.people
                    }
                  };

                  memoryCache.putObject(reportId, overallResult);
                  callback(null, "Report " + reportId + " sucessfully generated");
                }
              });
            }
          });
        }
      });
    }
  });
};

var getBillingAccuralsHoursQuery = function(assignments, reportPerson, projectMapping, projects, people, roles, startDate, endDate, rolesMapping, peopleMap, targetType, callback) {
  var persons = [ ];

            for( i = 0; i < assignments.length; i++ ) {
              if(assignments[ i ].members) {
                for( j = 0; j < assignments[ i ].members.length; j++ ) {

                    if( !reportPerson || reportPerson.resource == assignments[ i ].members[ j ].person.resource ) {
                        if( !projectMapping[ assignments[ i ].project.resource ] )
                            projectMapping[ assignments[ i ].project.resource ] = {};

                        if( !projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ] )
                            projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ] = [ ];

                        person = {
                            resource: assignments[ i ].members[ j ].person.resource,
                            hoursPerWeek: assignments[ i ].members[ j ].hoursPerWeek,
                            startDate: assignments[ i ].members[ j ].startDate,
                            endDate: assignments[ i ].members[ j ].endDate,
                            name: util.getPersonName(peopleMap[ assignments[ i ].members[ j ].person.resource ])
                        };

                        var project = _.find( projects, function( p ) {
                            return p.resource == assignments[ i ].project.resource;
                        } );
                        var now = moment( ).format( 'YYYY-MM-DD' );

                        startDate = project.terms.billingDate;
                        var prev = startDate;
                        
                        while( startDate < now ) {
                            prev = startDate;

                            if( targetType == 'monthly' )
                                startDate = moment( startDate ).add( 'month', 1 ).format( 'YYYY-MM-DD' );
                            else if( targetType == 'weekly' )
                                startDate = moment( startDate ).add( 'week', 1 ).format( 'YYYY-MM-DD' );
                            else if( targetType == 'quarterly' )
                                startDate = moment( startDate ).add( 'month', 3 ).format( 'YYYY-MM-DD' );
                        }

                        startDate = prev;

                        if( targetType == 'monthly' )
                            endDate = moment( startDate ).add( 'month', 1 ).format( 'YYYY-MM-DD' );
                        else if( targetType == 'weekly' )
                            endDate = moment( startDate ).add( 'week', 1 ).format( 'YYYY-MM-DD' );
                        else if( targetType == 'quarterly' )
                            endDate = moment( startDate ).add( 'month', 3 ).format( 'YYYY-MM-DD' );

                        projectMapping[ assignments[ i ].project.resource ][ assignments[ i ].members[ j ].role.resource ].push( person );

                        person.hours = person.hours ? person.hours : [ ];

                        person.startBillingDate = startDate;
                        person.endBillingDate = endDate;

                        if( person.startDate > person.startBillingDate )
                            person.startBillingDate = person.startDate;

                        if( person.endDate < person.endBillingDate )
                            person.endBillingDate = person.endDate;

                        persons.push( assignments[ i ].members[ j ].person.resource );
                    }
                }
              }
            }

            var hoursQ = {
                $or: [ ]
            };

            var prop;

            hoursQ.$or = _.map( projectMapping, function( val, key ) {
                if( key.indexOf( 'tasks' ) > -1 )
                    return {
                        "task.resource": key
                    };
                return {
                    "project.resource": key
                };
            } );
            hoursQ.$or = _.uniq( hoursQ.$or, function( p ) {
                return p[ "project.resource" ];
            } );
            
            callback(null, hoursQ);
};

var generatePeopleReport = function(reportId, params, callback) {
  dataAccess.listPeople({}, PEOPLE_FIELDS, function(err, people) {
        if(err) {
          callback("Error getting people while generating report: " + err, null);
        } else {
          dataAccess.listRoles({}, function(err, roles) {
            if(err) {
              callback("Error getting roles while generating report: " + err, null);
            } else {
              dataAccess.listProjects({}, PROJECT_FIELDS, function(err, projects) {
                if(err) {
                  callback("Error while getting projects for billing accurals report: " + err);
                } else {
                  var projectsQuery = _.map(projects.data, function(p) {
                    return { "project.resource": p.resource };
                  });
                  dataAccess.listHours({ $or: projectsQuery }, HOURS_FIELDS, function(err, hours) {
                    if(err) {
                      callback("Error getting hours while generating report: " + err, null);
                    } else {
                      var overallResult = {
                        type: params.type,
                        data: {
                          hours: hours,
                          people: people
                        }
                      };

                      memoryCache.putObject(reportId, overallResult);
                      callback(null, "Report " + reportId + " sucessfully generated");
                    }
                  });
                }
              });
            }
          });
        }
  });
};

module.exports.startGenerateReport = startGenerateReport;
module.exports.getReportFromMemoryCache = getReportFromMemoryCache;
module.exports.getStatusFromMemoryCache = getStatusFromMemoryCache;
module.exports.updateStatus = updateStatus;

module.exports.REPORT_IS_NOT_STARTED = REPORT_IS_NOT_STARTED;
module.exports.REPORT_IS_RUNNING = REPORT_IS_RUNNING;
module.exports.REPORT_IS_CANCELLED = REPORT_IS_CANCELLED;
module.exports.REPORT_IS_COMPLETED = REPORT_IS_COMPLETED;
