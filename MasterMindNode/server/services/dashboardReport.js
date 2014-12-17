/**
 * Service to prepare data for people report output sections
 */

var dataAccess = require( '../data/dataAccess.js' );
var util = require( '../util/util.js' );
var _ = require('underscore');
var memoryCache = require( '../data/memoryCache.js' );
var moment = require('moment');
var reportsService = require( '../services/reportsService.js' );

// generates report output object and calls callback when ready
module.exports.generate = function(person, params, callback) {
  var report = {};
  var reportId = util.getReportId(person._id);
  report.type = params.type;
  
  reportsService.prepareData(person, params, function(err, data) {
    report.data = data;
    memoryCache.putObject(reportId, report);
    callback(null, "Project report generated.");
  });
};