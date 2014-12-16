/**
 * Service to prepare data for people report output sections
 */

var util = require( '../util/util.js' );
var _ = require('underscore');
var memoryCache = require( '../data/memoryCache.js' );
var moment = require('moment');
var reportsService = require( '../services/reportsService.js' );

var WORKING_HOURS_IN_DAY = 8;

// generates report output object and calls callback when ready
module.exports.generate = function(person, params, callback) {
  var report = {};
  var reportId = util.getReportId(person._id);
  report.type = params.type;
  
  reportsService.prepareData(person, params, function(err, data) {
    
    if(err || !data) {
      callback("Error getting data while generating report: " + err);
      return;
    }
    
    report.summary = getSummarySection(data, params);
    report.peopleDetails = getPeopleDetailsSection(data, params);
    report.projectHours = getProjectHours(data, params);
    report.categoryHours = getCategoryHours(data, params);
    report.goals = getGoals(data, params);
    report.projections = getProjections(data, params);
    
    report.rawData = data;
    
    memoryCache.putObject(reportId, report);
    callback(null, "People report generated.");
  });
};

// Not implemented (fake data)
var getSummarySection = function(data, params) {
  var created = moment();
  
  var reportStartDate = moment(params.startDate);
  var reportEndDate = moment(params.endDate);
  var businessDaysCount = util.getBusinessDaysCount(reportStartDate, reportEndDate);
  var hoursForTeam = businessDaysCount * WORKING_HOURS_IN_DAY * data.people.length;
  var hoursPerPerson = businessDaysCount * WORKING_HOURS_IN_DAY / data.people.length;
  
  var summarySection = {
    createdDate: created.format("MM/D/YYYY"),
    createdTime: created.format("H:mm:ss a"),
    reportName: "Bi-monthly Department with Graphs Report",
    createdBy: { name: util.getPersonName(data.profile, true, false) },
    reportStartDate: reportStartDate.format("MMM D, YYYY"),
    reportEndDate: reportEndDate.format("MMM D, YYYY"),
    workingDays: businessDaysCount,
    workingHoursPerPerson: Math.round( hoursPerPerson ),
    workingHoursForTeam: Math.round( hoursForTeam )
  };
  
  return summarySection;
};

// Not implemented (fake data)
var getPeopleDetailsSection = function(data, params) {

	var totalPeople = data.people.length;
	var peopleOnClient = [];
	var peopleOnInvestment = [];
	var utilizationByRole = [];
	var peopleByRoles = {};
	
	for (var i in data.assignments) {
		var members = data.assignments[i].members;
		var project = _.findWhere(data.projects, {resource: data.assignments[i].project.resource});
		if (project) {
			for (var j in members) {
				var person = members[j].person;
				if ( (project.type == "paid" || project.type == "poc") && !_.contains(peopleOnClient, person.resource) )
					peopleOnClient.push(person.resource);
				if ( project.type == "invest" && !_.contains(peopleOnInvestment, person.resource) )
					peopleOnInvestment.push(person.resource);
			}
		}
	}
	
	for (var i in params.roles) {		
		var role = _.findWhere(data.roles, { abbreviation: params.roles[i] }) ;
		if ( role.utilizationRate )
			utilizationByRole.push({ name: role.title, value: role.utilizationRate });
		
		for (var i in data.people) {
			var person = data.people[i];
			if ( person.primaryRole.resource == role.resource ) {
				if ( peopleByRoles[person.primaryRole.resource] )
					peopleByRoles[person.primaryRole.resource].members
							.push(person);
				else {
					peopleByRoles[person.primaryRole.resource] = {
						role: role,
						members : [ person ]
					};
				}
			}
		}
	}	
		
	return {
		peopleByRoles: peopleByRoles,
		peopleOnClient: peopleOnClient.length,
		peopleOnInvestment: peopleOnInvestment.length,
		totalPeople: totalPeople,
		utilizationByRole: utilizationByRole,
		availableHours: 10920,
		totalWorkingHours: 8800,
		totalOOOHours: 181,
		utilizationClient: 68,
		utilizationInvest: 73,
		utilizationTotal: 70
	};
};

// Not implemented (fake data)
var getProjectHours = function(data, params) {
  var projectHours = {
    capacity: 10920,
    estimatedClientHours: 4100,
    estimatedInvestHours: 3430,
    actualClientHours: 3979,
    actualInvestHours: 3668,
    estimatedClient: 72,
    estimatedInvest: 69,
    estimatedAverage: 70,
    estimatedAllUtilization: 70,
    actualClient: 68,
    actualInvest: 73,
    actualAverage: 70,
    actualAllUtilization: 70,
  };
  
  projectHours.totalHoursEstimated = projectHours.estimatedClientHours + projectHours.estimatedInvestHours;
  projectHours.totalActualHours = projectHours.actualClientHours + projectHours.actualInvestHours;
  
  return projectHours;
};

// Not implemented (fake data)
var getCategoryHours = function(data, params) {
  var categoryHours = {
     estimatedOOOHours: 36,
     estimatedOHHours: 0,
     actualOOOHours: 48,
     actualOHHours: 133,
     percentClientHours: 35,
     percentInvestHours: 34,
     percentOOO: 0.4,
     percentOH: 1.2,
     percentHoursUnaccounted: 29.4
  };
  
  categoryHours.totalOOOOHHoursEstimated = categoryHours.estimatedOOOHours + categoryHours.estimatedOHHours;
  categoryHours.totalOOOOHHoursActual = categoryHours.actualOOOHours + categoryHours.actualOHHours;
  
  return categoryHours;
};

// Not implemented (fake data)
var getGoals = function(data, params) {
  return {
    clientUtilization: 80,
    investmentUtilization: 75,
    teamUtilization: 71
  };
};

// Not implemented (fake data)
var getProjections = function(data, params) {
  return projections = {
    firstMonth: { 
      name: "October",
      actual: {
        capacity: 10920,
        clientHours: 4100,
        investHours: 3430,
        totalHours: 7530,
        OOO: 36,
        utilization: 70
      },
      estimated: {
        capacity: 10920,
        clientHours: 3979,
        investHours: 3668,
        totalHours: 7465,
        OOO: 48,
        utilization: 70
      }
    },
    months: [
      {
        name: "November",
        capacity: 11520,
        clientHours: 6160,
        investHours: 5280,
        totalHours: 11440,
        OOO: 80,
        utilization: 68
      },
      {
        name: "December",
        capacity: 11520,
        clientHours: 6660,
        investHours: 6020,
        totalHours: 12680,
        OOO: 360,
        utilization: 68
      }
    ]
  };
};
