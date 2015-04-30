'use strict';


var reportAccess = require('../data/reportAccess');
var dataAccess = require('../data/dataAccess');
var dataFilter = require('../data/dataFilter');
var session = require('../util/session');
var winston = require('winston');

var getStatus = function(personId, type) {
  var statusObj = reportAccess.getStatusFromMemoryCache(personId, type);
  
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

var cancelReport = function(personId, type) {
  var statusObj = reportAccess.updateStatus(personId, reportAccess.REPORT_IS_CANCELLED, type);
  return statusObj;
};

var getReport = function(personId, type, callback) {
  reportAccess.getReportFromMemoryCache(personId, type, function(err, result) {
    if(err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

var listFavorites = function(callback) {
    dataAccess.listReportFavorites( function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading report favorites', null);
        } else {
            //winston.info(body);
            callback(null, body);
        }
    });
};

var listFavoritesByPerson = function(person, callback) {
    dataAccess.listReportFavoritesByPerson( person, function(err, body){
        if (err) {
            winston.info(err);
            callback('error loading report favorites', null);
        } else {
            callback(null, body);
        }
    });
};

var getFavorite = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            winston.info(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

var insertFavorite = function(obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.REPORT_FAVORITES_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback('error inserting report favorite:' + JSON.stringify(err), null);
        } else {
            callback(null, body);
        }
    });
};

var updateFavorite = function(id, obj, callback) {
    dataAccess.updateItem(id, obj, dataAccess.REPORT_FAVORITES_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback('error update report favorite:' + JSON.stringify(err), null);
        } else {
            callback(null, _.extend(obj, body));
        }
    });
};

var deleteFavorite = function(id, obj, callback) {
    dataAccess.deleteItem(id, obj._rev, dataAccess.REPORT_FAVORITES_KEY, function(err, body){
        if (err) {
            winston.info(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getStatus = getStatus;
module.exports.generateReport = generateReport;
module.exports.cancelReport = cancelReport;
module.exports.getReport = getReport;

// Report favorites
module.exports.listFavorites = listFavorites;
module.exports.getFavorite = getFavorite;
module.exports.insertFavorite = insertFavorite;
module.exports.updateFavorite = updateFavorite;
module.exports.deleteFavorite = deleteFavorite;
module.exports.listFavoritesByPerson = listFavoritesByPerson;

