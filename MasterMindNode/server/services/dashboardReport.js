/**
 * Service to prepare data for people report output sections
 */

var dataAccess = require( '../data/dataAccess.js' );
var util = require( '../util/util.js' );
var _ = require('underscore');
var memoryCache = require( '../data/memoryCache.js' );
var moment = require('moment');
var reportsService = require( '../services/reportsService.js' );
var reportCalculations = require( '../services/reportCalculations.js' );

// generates report output object and calls callback when ready
module.exports.generate = function(person, params, callback) {
  var report = {};
  var reportId = util.getReportId(person._id, params.type);
  report.type = params.type;
  
  reportsService.prepareData(person, params, _.bind(function(err, data) {
	  if (!err) {
		  report.data = {};
		  report.data.hoursStatistics = reportCalculations.getHoursStatistics(data);
		  report.data.peopleStatistics = reportCalculations.getUtilizationDetails(data, this.params.startDate, this.params.endDate,  this.params.roles, new Date());
		  
		  memoryCache.putObject(reportId, report);
		  callback(null, "Project report generated.");
	  } else
		  callback(err);
   
  }, {params: params}));
};
