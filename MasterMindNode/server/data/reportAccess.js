var dbAccess = require( '../data/dbAccess.js' );
var dataAccess = require( '../data/dataAccess.js' );

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
        	callback(err, null);
        }
        else {
        	obj.status = status;
            dataAccess.updateItem(statusId, obj, null, function(err, result){
            	callback(err, result);
            });
        }
    });
} 

var getReportId = function (personId, type) {
	return REPORT_PREFIX + personId + "_" + type;
}


module.exports.getStatusByPersonIdAndType = getStatusByPersonIdAndType;
module.exports.generateReportByPersonIdAndType = generateReportByPersonIdAndType;
module.exports.getReportByPersonIdAndType = getReportByPersonIdAndType;
module.exports.updateStatusByPersonIdAndType = updateStatusByPersonIdAndType;

module.exports.REPORT_IS_NOT_STARTED = REPORT_IS_NOT_STARTED;
module.exports.REPORT_IS_RUNNING = REPORT_IS_RUNNING;
module.exports.REPORT_IS_CANCELLED = REPORT_IS_CANCELLED;
module.exports.REPORT_IS_COMPLETED = REPORT_IS_COMPLETED;
