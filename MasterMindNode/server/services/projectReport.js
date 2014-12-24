/**
 * Service to prepare data for people report output sections
 */

var util = require( '../util/util.js' );
var _ = require('underscore');
var memoryCache = require( '../data/memoryCache.js' );
var moment = require('moment');
var reportsService = require( '../services/reportsService.js' );
var reportCalculations = require( '../services/reportCalculations.js' );

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
	var reportStartDate = moment(params.startDate);
	var reportEndDate = moment(params.endDate);
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
};

var getAssignmentsHours = function(data, params) {
  
  var result = { people: [] };
  var projectResources = [];
  
  if(_.isArray(params.projects)) {
    projectResources = _.map(params.projects, function(p) {
      return JSON.parse(p).resource;
    });
  } else {
    projectResources.push(JSON.parse(params.projects).resource);
  }
  
  var projects = _.filter(data.projects, function(proj) {
    if(projectResources.indexOf(proj.resource) > -1) {
      return true;
    }
    return false;
  });
  
  var people = reportCalculations.getProjectsPeople(projects, data.assignments, data.allPeople);
  
  var hoursOOO = 0 ;
  var actualHours = 0;
  var expectedHours = 0;
  var projectedHours = 0;
  
  for(var i in people) {
	var capacityByPerson = reportCalculations.calculateCapacity({people : [ people[i] ] }, params.startDate, params.endDate);
    var assignmentsStatisticsByPerson = reportCalculations.getAssignmentsStatistics(data, params.startDate, params.endDate, people[i].resource);
    var hoursStatisticsByPerson = reportCalculations.getHoursStatistics(data, people[i].resource);
    var utilizationRate = ( capacityByPerson > 0 ) ? Math.round( (hoursStatisticsByPerson.allHours / capacityByPerson ) * 100 ) : 0;

    hoursOOO += hoursStatisticsByPerson.outOfOffice;
    actualHours += hoursStatisticsByPerson.allHours;
    expectedHours += capacityByPerson;
    projectedHours += assignmentsStatisticsByPerson.allHours;
    
    var person = {
    	_id: people[i]._id,
    	name: people[i].name,
    	thumbnail: people[i].thumbnail,
    	resource: people[i].resource,
    	utilizationRate: utilizationRate,
    	actualHours: hoursStatisticsByPerson.allHours,
    	expectedHours: capacityByPerson,
    	projectedHours: assignmentsStatisticsByPerson.allHours,
    	OOOHours: hoursStatisticsByPerson.outOfOffice
    };
    
    if(people[i].primaryRole && people[i].primaryRole.name) {
        person.role = people[i].primaryRole.name;
    }
    
    result.people.push(person);
  }
  
  result.overallUtilizationRate = Math.round( (actualHours / expectedHours) * 100 );
  result.hoursOOO = hoursOOO;
  result.actualHours = actualHours;
  result.expectedHours = expectedHours;
  result.projectedHours = projectedHours;
  
  return result;
};
