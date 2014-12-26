'use strict';


var reportAccess = require('../data/reportAccess');
var session = require('../util/session');

var getStatus = function(personId) {
  var statusObj = reportAccess.getStatusFromMemoryCache(personId);
  
  return statusObj;
};

var generateReport = function(person, type, params, reqSession, callback) {
  var statusObj = reportAccess.getStatusFromMemoryCache(person._id);
  if(statusObj && statusObj.status == reportAccess.REPORT_IS_RUNNING) {
    callback("Report generation is already running.", null);
  } else {
    reportAccess.updateStatus(person._id, reportAccess.REPORT_IS_RUNNING, type);
    
    reportAccess.startGenerateReport(person, type, params, function(err, result) {
      if(err) {
        reportAccess.updateStatus(person._id, reportAccess.REPORT_IS_CANCELLED, type);
        callback(err, null);
      } else {
        var statusObj = reportAccess.updateStatus(person._id, reportAccess.REPORT_IS_COMPLETED, type);
        callback(null, statusObj);
      }
    });
  }
};

var cancelReport = function(personId) {
  var statusObj = reportAccess.updateStatus(personId, reportAccess.REPORT_IS_CANCELLED);
  return statusObj;
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
