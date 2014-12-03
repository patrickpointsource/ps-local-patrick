var dbAccess = require( '../data/dbAccess.js' );
var dataAccess = require( '../data/dataAccess.js' );
var memoryCache = require( '../data/memoryCache.js' );

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

var startGenerateReport = function(personId, type, callback) {
  
  // To do: migrate functionality from front-end
  
  var reportId = getReportId(personId, type);
  var result = { data: { hours: [], people: [] } };
  
  setTimeout(function() {
    memoryCache.putObject(reportId, result);
    callback(null, "Report " + reportId + " sucessfully generated");
  }, 15000);
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
