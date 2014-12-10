/**
 * Service to prepare data for people report output sections
 */

var dataAccess = require( '../data/dataAccess.js' );
var util = require( '../util/util.js' );
var _ = require('underscore');
var memoryCache = require( '../data/memoryCache.js' );
var moment = require('moment');

var HOURS_FIELDS =  ["_id", "date", "description", "project", "person", "task", "hours"];
var PROJECT_FIELDS = ["resource", "name", "startDate", "endDate", "roles", "customerName", "committed", "type", "description", "terms"];
var PEOPLE_FIELDS = ["_id", "groups", "primaryRole", "name", "isActive", "resource", "lastSynchronized", "mBox", "phone", "about", "thumbnail" ];

// generates report output object and calls callback when ready
module.exports.generate = function(person, params, callback) {
  var report = {};
  var reportId = util.getReportId(person._id);
  report.type = params.type;
  
  prepareData(person, params, function(err, data) {
    report.summary = getSummarySection(data, params);
    report.peopleDetails = getPeopleDetailsSection(data, params);
    report.projectHours = getProjectHours(data, params);
    report.categoryHours = getCategoryHours(data, params);
    report.goals = getGoals(data, params);
    report.projections = getProjections(data, params);
    
    memoryCache.putObject(reportId, report);
    callback(null, "People report generated.");
  });
};

// gets needed data depend on input parameters
// TODO: rewrite using input parameters (now return all data in db)
// params:
//   profile:  profile of user that requested report
//   params:   input parameters of report, also have 'type' property
//   callback: function that is called when operation fail or success
var prepareData = function(profile, params, callback) {
  dataAccess.listPeople({}, PEOPLE_FIELDS, function(err, people) {
        if(err) {
          callback("Error getting people while generating report: " + err, null);
        } else {
          dataAccess.listRoles({}, function(err, roles) {
            if(err) {
              callback("Error getting roles while generating report: " + err, null);
            } else {
              dataAccess.listProjects({}, PROJECT_FIELDS, function(err, projects) {
                if(err) {
                  callback("Error getting projects while generating report: " + err);
                } else {
                  var projectsQuery = _.map(projects.data, function(p) {
                    return { "project.resource": p.resource };
                  });
                  dataAccess.listHours({ $or: projectsQuery }, HOURS_FIELDS, function(err, hours) {
                    if(err) {
                      callback("Error getting hours while generating report: " + err, null);
                    } else {
                      var data = {
                        profile: profile,
                        hours: hours.members,
                        people: people.members,
                        roles: roles.members,
                        projects: projects.members
                      };

                      callback(null, data);
                    }
                  });
                }
              });
            }
          });
        }
  });
};

// Not implemented (fake data)
var getSummarySection = function(data, params) {
  var created = moment();
  
  var reportStartDate = moment("September 9, 2014");
  var reportEndDate = moment("September 30, 2014");
  
  var person = data.profile;
  var hoursForTeam = 0;
  var hoursPerPerson = 0;
  for(var i in data.hours) {
	  var personReport = data.hours[i];
	  if (personReport.hours) {
		  if (personReport.person && personReport.person.resource == person.resource)
			  hoursPerPerson += personReport.hours;
		  hoursForTeam += personReport.hours;
	  }
  }
  
  var summarySection = {
    createdDate: created.format("MM/D/YYYY"),
    createdTime: created.format("H:mm:ss a"),
    reportName: "Bi-monthly Department with Graphs Report",
    createdBy: { name: util.getPersonName(data.profile, true, false) },
    reportStartDate: reportStartDate.format("MMM D, YYYY"),
    reportEndDate: reportEndDate.format("MMM D, YYYY"),
    workingDays: util.getBusinessDaysCount(reportStartDate, reportEndDate),
    workingHoursPerPerson: Math.round( hoursPerPerson ),
    workingHoursForTeam: Math.round( hoursForTeam )
  };
  
  return summarySection;
};

// Not implemented (fake data)
var getPeopleDetailsSection = function(data, params) {
  return {
    peopleOnClient: 35,
    peopleOnInvestment: 30,
    totalPeople: 65,
    
    utilizationByRole: [
      { name: "Software Engineer", value: "84" },
      { name: "Senior Software Architect", value: "22" },
      { name: "Senior Software Engineer", value: "78" },
    ]
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
