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
	var reportId = util.getReportId(person._id);
	report.type = params.type;
  
	reportsService.prepareData(person, params, function(err, data) {
		report.reportDetails = getReportDetails(data, params);
		report.assignmentsHours = getAssignmentsHours(data, params);
		memoryCache.putObject(reportId, report);
		callback(null, "Project report generated.");
  });
};

var getReportDetails = function (data, params) {
	var reportStartDate = moment(startDate);
	var reportEndDate = moment(endDate);
	var workingDays = util.getBusinessDaysCount(reportStartDate, reportEndDate);
	var peopleCount = data.people.length;
	var workingHoursPerPerson = 8 * workingDays;
	var workingHoursForProject = peopleCount * workingHoursPerPerson;
	
	var data = {
		reportStartDate : reportStartDate.format('MMMM DD, YYYY'),
		reportEndDate : reportEndDate.format('MMMM DD, YYYY'),
		workingDays : workingDays,
		workingHoursPerPerson : workingHoursPerPerson,
		workingHoursForProject : workingHoursForProject
	};
	
	return data;
}

var getAssignmentsHours = function(data, params) {
  
  var result = { people: [] };
  
  var people = data.allPeople;
  
  for(var i in people) {
    var person = {
      _id: people[i]._id,
      name: people[i].name,
      thumbnail: people[i].thumbnail,
      resource: people[i].resource,
      utilizationRate: 70,
      actualHours: 400,
      expectedHours: 500,
      projectedHours: 450,
      OOOHours: 12
    };
    
    if(people[i].primaryRole && people[i].primaryRole.name) {
      person.role = people[i].primaryRole.name;
    }
    
    result.people.push(person);
  }
  
  
  result.overallUtilizationRate = 78;
  result.hoursOOO = 250;
  result.actualHours = 700;
  result.expectedHours = 730;
  result.projectedHours = 715;
  
  return result;
};
