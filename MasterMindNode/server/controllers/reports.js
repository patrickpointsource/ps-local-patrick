'use strict';

var reportAccess = require('../data/reportAccess');

/**
 * Returns report status of required type for required person
 * 
 * @param personId 
 * @param type ('people','project','custom')
 * @param callback ('Not started','Running','Cancelled','Completed')
 */
var getStatusByPersonIdAndType = function(personId, type, callback) {
	reportAccess.getStatusByPersonIdAndType(personId, type, function (err, status){
		if (err) {
			console.log(err);
			callback(err, null);
		}
		else {
			callback (null, status);
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
	reportAccess.getStatusByPersonIdAndType(personId, type, function (err, obj) {
		if (obj.status == reportAccess.REPORT_IS_RUNNING ) {
            callback(type + ' report for person/' + personId + ' is already running', null);
		}
		else {
		    reportAccess.generateReportByPersonIdAndType(personId, type, queryParams, function(err, status){
		        if (err) {
		            console.log(err);
		            callback('error generate ' + type + ' report for person/' + personId, null);
		        }
		        else {
		        	callback(null, status);
		        }
		    });
		}
	});
};

/**
 * Cancels report generation of required type for required person
 *
 * @param personId 
 * @param type ('people','project','custom')
 * @param callback 
 */
var cancelReportByPersonIdAndType = function(personId, type, callback) {
	reportAccess.getStatusByPersonIdAndType(personId, type, function (err, obj) {
		if (obj.status != reportAccess.REPORT_IS_RUNNING ) {
            callback(type + ' report for person/' + personId + ' can not be cancelled, because it is not running', null);
		}
		else {
			reportAccess.updateStatusByPersonIdAndType(personId, type, reportAccess.REPORT_IS_CANCELLED, function (err, result) {
				callback (err, result);
			});
		}
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
	reportAccess.getStatusByPersonIdAndType(personId, type, function (err, obj) {
		if (obj.status != reportAccess.REPORT_IS_COMPLETED ) {
            callback(type + ' report for person/' + personId + ' is not completed', null);
		}
		else {
			reportAccess.getReportByPersonIdAndType(personId, type, function(err, result){
		        if (err) {
		            console.log(err);
		            callback('error getting ' + type + ' report for person/' + personId, null);
		        }
		        else {
		        	callback(null, result);
		        }
		    });
		}
	});
	
	
};

module.exports.getStatusByPersonIdAndType = getStatusByPersonIdAndType;
module.exports.generateReportByPersonIdAndType = generateReportByPersonIdAndType;
module.exports.cancelReportByPersonIdAndType = cancelReportByPersonIdAndType;
module.exports.getReportByPersonIdAndType = getReportByPersonIdAndType;
