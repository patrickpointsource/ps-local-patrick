'use strict';


var reportAccess = require('../data/reportAccess');
var session = require('../util/session');

var getStatus = function(personId) {
  var status = reportAccess.getStatusFromMemoryCache(personId);
  
  return { status: status };
};

var generateReport = function(person, type, params, reqSession, callback) {
  var status = reportAccess.getStatusFromMemoryCache(person._id);
  if(status == reportAccess.REPORT_IS_RUNNING) {
    callback("Report generation is already running.", null);
  } else {
    reportAccess.updateStatus(person._id, reportAccess.REPORT_IS_RUNNING);
    
    reportAccess.startGenerateReport(person, type, params, function(err, result) {
      if(err) {
        reportAccess.updateStatus(person._id, reportAccess.REPORT_IS_CANCELLED);
        callback(err, null);
      } else {
        reportAccess.updateStatus(person._id, reportAccess.REPORT_IS_COMPLETED);
        callback(null, { status: reportAccess.REPORT_IS_COMPLETED });
      }
    });
  }
};

var cancelReport = function(personId) {
  reportAccess.updateStatus(personId, reportAccess.REPORT_IS_CANCELLED);
  return { status: reportAccess.REPORT_IS_CANCELLED };
};

var getReport = function(personId, callback) {
  reportAccess.getReportFromMemoryCache(personId, function(err, result) {
    if(err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

module.exports.getStatus = getStatus;
module.exports.generateReport = generateReport;
module.exports.cancelReport = cancelReport;
module.exports.getReport = getReport;
