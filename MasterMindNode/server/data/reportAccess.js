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

/**
 * Returns report status of required type for required person
 * 
 * @param personId 
 * @param type ('people','project','custom')
 * @param callback ('Not started','Running','Cancelled','Completed')
 */
var getStatusByPersonIdAndType = function(personId, type, callback) {
	var statusId = getReportId(personId, type) + STATUS_SUFFIX;
    dataAccess.getItem(statusId, function(err, status){
        if (err || !status) {
        	status = {status : REPORT_IS_NOT_STARTED};
            callback(null, status);
        } else {
            callback(null, status);
        }
    });
};

/**
 * Generates report of required type for required person
 * 
 * @param personId 
 * @param type ('people','project','custom')
 * @param queryParams
 * @param callback 
 */
var generateReportByPersonIdAndType = function(personId, type, queryParams, callback) {
	updateStatusByPersonIdAndType(personId, type, REPORT_IS_RUNNING, function (err, result){
		callback(err, result);
	});
};

/**
 * Returns report object of required type for required person
 *
 * @param personId 
 * @param type ('people','project','custom')
 * @param callback 
 */
var getReportByPersonIdAndType = function(personId, type, callback) {
	var reportId = getReportId(personId, type);
    dataAccess.getItem(reportId, function(err, result){
        if (err) {
            console.log(err);
            callback('error getting ' + type + ' report for person/' + personId, null);
        }
        else {
        	callback(null, result);
        }
    });
};

/**
 * Updates report status of required type for required person
 *
 * @param personId 
 * @param type ('people','project','custom')
 * @param status ('Not started','Running','Cancelled','Completed')
 * @param callback 
 */
var updateStatusByPersonIdAndType = function (personId, type, status, callback) {
	var statusId = getReportId(personId, type) + STATUS_SUFFIX;
    dataAccess.getItem(statusId, function(err, obj){
        if (err) {
        	//callback(err, null);
        	if(!obj) {
        	  obj = { status: status };
        	}
        	dataAccess.insertItem(statusId, obj, null, function(err, result){
                callback(err, result);
            });
        }
        else {
        	obj.status = status;
            dataAccess.updateItem(statusId, obj, null, function(err, result){
            	callback(err, result);
            });
        }
    });
};

var getReportId = function (personId, type) {
	return REPORT_PREFIX + personId + "_" + type;
};

var startGenerateReport = function(personId, type, params, callback) {
  
  // To do: migrate functionality from front-end
  
  var reportId = getReportId(personId, type);
  var result = { data: { hours: [], people: [] } };
  
  assignments.listAssignmentsByProjectResourcesAndTimePeriod( params.projectResources, params.timePeriod, function( err, assignments ) {
    if( err ) {
      callback( 500, "Error in getting assignment while generating report: " + err );
    } else {
      // hours query
      
      var projects = _.map(params.projectResources, function(p) {
        return { resource: p };
      });
      
      var projMapping = JSON.parse(params.projectMapping);
      
      getPeopleAndHoursQuery(
        assignments,
        params.reportPerson,
        projMapping,
        projects,
        params.startDate,
        params.endDate,
        function(err, hoursQAndPeople) {
          if(err) {
            callback("Error calculating hours query while generating report: " + err, null);
          } else {
            
            var query = {};
            
            if(hoursQAndPeople.hoursQ.$or.length > 0){ 
              query = hoursQAndPeople.hoursQ;
            }
            
            dataAccess.listHours(hoursQAndPeople.hoursQ, function(err, hours) {
              if(err) {
                callback("Error getting hours while generating report: " + err, null);
              } else {
                var overallResult = {
                  data: {
                    hours: hours,
                    people: hoursQAndPeople.people
                  }
                };
                
                memoryCache.putObject(reportId, overallResult);
                callback(null, "Report " + reportId + " sucessfully generated");
              }
            });
          }
        }
      );
    }
  } );
};

var getReportFromMemoryCache = function(personId, type, callback) {
  var reportId = getReportId(personId, type);
  callback(null, memoryCache.getObject(reportId));
};

var getStatusFromMemoryCache = function(personId, type) {
  var reportId = getReportId(personId, type) + STATUS_SUFFIX;
  var status = memoryCache.getObject(reportId);
  if(!status) {
    status = REPORT_IS_NOT_STARTED;
  }
  return status;
};

var updateStatus = function(personId, type, status) {
  var reportId = getReportId(personId, type) + STATUS_SUFFIX;
  memoryCache.putObject(reportId, status);
};

var getPeopleAndHoursQuery = function(assignments, reportPerson, projectMapping, projects, startDate, endDate, callback) {
  var persons = [ ];
  
  dataAccess.listPeople({}, function(err, people) {
    if(err) {
      callback("Error getting people while generating report: " + err, null);
    } else {
      dataAccess.listRoles({}, function(err, roles) {
        if(err) {
          callback("Error getting roles while generating report: " + err, null);
        } else {
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
          
          assignments = assignments.members;
          
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
      
          callback(null, { hoursQ: hoursQ, people: people });
        }
      });
    }
  });
};

module.exports.getStatusByPersonIdAndType = getStatusByPersonIdAndType;
module.exports.generateReportByPersonIdAndType = generateReportByPersonIdAndType;
module.exports.getReportByPersonIdAndType = getReportByPersonIdAndType;
module.exports.updateStatusByPersonIdAndType = updateStatusByPersonIdAndType;
module.exports.startGenerateReport = startGenerateReport;
module.exports.getReportFromMemoryCache = getReportFromMemoryCache;
module.exports.getStatusFromMemoryCache = getStatusFromMemoryCache;
module.exports.updateStatus = updateStatus;

module.exports.REPORT_IS_NOT_STARTED = REPORT_IS_NOT_STARTED;
module.exports.REPORT_IS_RUNNING = REPORT_IS_RUNNING;
module.exports.REPORT_IS_CANCELLED = REPORT_IS_CANCELLED;
module.exports.REPORT_IS_COMPLETED = REPORT_IS_COMPLETED;
