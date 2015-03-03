/**
 * Service to prepare data for people report output sections
 */

var util = require( '../util/util.js' );
var _ = require('underscore');
var memoryCache = require( '../data/memoryCache.js' );
var moment = require('moment');
var reportsService = require( '../services/reportsService.js' );

// generates report output object and calls callback when ready
module.exports.generate = function(person, params, callback) {
  var report = {};
  var reportId = util.getReportId(person._id, params.type);
  report.type = params.type;
  
  reportsService.prepareData(person, params, function(err, data) {
    memoryCache.putObject(reportId, report);
    callback(null, "Custom report generated.");
  });
};
