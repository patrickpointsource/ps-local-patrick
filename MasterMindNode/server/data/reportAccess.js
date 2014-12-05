var dbAccess = require( '../data/dbAccess.js' );
var dataAccess = require( '../data/dataAccess.js' );
var memoryCache = require( '../data/memoryCache.js' );

var assignments = require( '../controllers/assignments' );
var util = require( '../util/util.js' );
var _ = require('underscore');

// Report types
var REPORT_TYPE_PEOPLE = "people";
var REPORT_TYPE_PROJECT = "project";
var REPORT_TYPE_CUSTOM = "custom";

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

// generate report id using personId
var getReportId = function (personId) {
	return REPORT_PREFIX + personId;
};

// method that checks type of report and start the process of report data generation
var startGenerateReport = function(personId, type, params, callback) {
  var reportId = getReportId(personId);
  params.type = type;
  
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
var getHoursQuery = function(assignments, reportPerson, projectMapping, projects, people, roles, startDate, endDate, callback) {
  var persons = [ ];
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
          
          for( i = 0; i < assignments.length; i++ ) {

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
      dataAccess.listPeople({}, function(err, people) {
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
      
              if(assignments && assignments.length > 0) {
                assignmentsMembers = assignments.members;
              }
              
              callback(null, {
                reportId: reportId,
                params: params,
                projects: projects,
                projMapping: projMapping,
                assignmentsMembers: assignmentsMembers,
                people: people,
                roles: roles 
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
      callback("Error while getting data for report: " + err);
    } else {
      getHoursQuery(data.assignmentsMembers, data.params.reportPerson, data.projMapping, data.projects, data.people, data.roles, data.params.startDate, data.params.endDate, function(err, hoursQ) {
        if(err) {
          callback("Error calculating hours query while generating report: " + err, null);
        } else {
          dataAccess.listHours(hoursQ, function(err, hours) {
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
  
};

module.exports.startGenerateReport = startGenerateReport;
module.exports.getReportFromMemoryCache = getReportFromMemoryCache;
module.exports.getStatusFromMemoryCache = getStatusFromMemoryCache;
module.exports.updateStatus = updateStatus;

module.exports.REPORT_IS_NOT_STARTED = REPORT_IS_NOT_STARTED;
module.exports.REPORT_IS_RUNNING = REPORT_IS_RUNNING;
module.exports.REPORT_IS_CANCELLED = REPORT_IS_CANCELLED;
module.exports.REPORT_IS_COMPLETED = REPORT_IS_COMPLETED;
