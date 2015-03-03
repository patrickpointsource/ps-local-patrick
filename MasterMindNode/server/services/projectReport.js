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
	var reportId = util.getReportId(person._id, params.type);
	report.type = params.type;
  
	reportsService.prepareProjectData(person, params, function(err, data) {
		report.reportDetails = getReportDetails(data, params);
		report.assignmentsHours = getAssignmentsHours(data, params);
		report.rawData = data;
		memoryCache.putObject(reportId, report);
		callback(null, "Project report generated.");
	});
};

var getReportDetails = function (data, params) {
	var reportStartDate = moment(params.startDate);
	var reportEndDate = moment(params.endDate);
	var created = moment();
	var workingDays = util.getBusinessDaysCount(reportStartDate, reportEndDate);
	var peopleCount = data.people.length;
	var workingHoursPerPerson = 8 * workingDays;
	var workingHoursForProject = peopleCount * workingHoursPerPerson;
	var projects = _.map(data.projects, function(proj) {
	  return proj.name;
	});
	
	var projectsLine = projects.join(", ");
	if(projects.length > 3) {
	  var others = projects.length - 3;
	  var threeProjects = [ projects[0], projects[1], projects[2] ];
	  projectsLine = threeProjects.join(", ") + " and " + others + " more.";
	}
	
	var data = {
	    reportName: projectsLine,
		reportStartDate : reportStartDate.format('MMMM DD, YYYY'),
		reportEndDate : reportEndDate.format('MMMM DD, YYYY'),
		createdDate: created.format("MM/D/YYYY"),
		createdTime: created.format("H:mm:ss a"),
		createdBy : {
            name : util.getPersonName(data.profile, true, false)
        },
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
  
  var fields = params.fields;
  var assignmentRollUpHours = fields.assignmentRollUpHours;
  var assignmentBreakdownHours = fields.assignmentBreakdownHours;
  
  for(var i in people) {
	var capacityByPerson = reportCalculations.calculateCapacity({people : [ people[i] ] }, params.startDate, params.endDate);
    var assignmentsStatisticsByPerson = reportCalculations.getAssignmentsStatistics(data, params.startDate, params.endDate, people[i].resource);
    var hoursStatisticsByPerson = reportCalculations.getHoursStatistics(data, people[i].resource);
    var utilizationRate = ( capacityByPerson > 0 ) ? Math.round( (hoursStatisticsByPerson.allHours / capacityByPerson ) * 100 ) : 0;
    
    var role;
    if(people[i].primaryRole && people[i].primaryRole.name) {
    	role  = _.findWhere(data.allRoles, { resource : people[i].primaryRole.resource });
    }

	if (fields.all || 
    		( assignmentRollUpHours && assignmentRollUpHours.all ) || 
    			( role && assignmentRollUpHours.selectedAssignedRoles[role.abbreviation] ) ) {
    	
        var person = {
            	_id: people[i]._id,
            	name: people[i].name,
            	thumbnail: people[i].thumbnail,
            	resource: people[i].resource,
            	expectedHours: capacityByPerson
        };
        
        if(people[i].primaryRole && people[i].primaryRole.name) {
            person.role = people[i].primaryRole.name;
        }
         
        if (fields.all || (assignmentBreakdownHours && assignmentBreakdownHours.projectedHours)) {
        	person.projectedHours =  assignmentsStatisticsByPerson.allHours;
        }
        if (fields.all || (assignmentBreakdownHours && assignmentBreakdownHours.actualHours)) {
        	person.actualHours = hoursStatisticsByPerson.allHours;
        }
        if (fields.all || (assignmentBreakdownHours && assignmentBreakdownHours.oooDetails)) {
        	person.OOOHours = hoursStatisticsByPerson.outOfOffice;
        }
        if (fields.all || (assignmentBreakdownHours && assignmentBreakdownHours.utilization)) {
        	person.utilizationRate = hoursStatisticsByPerson.utilizationRate;
        }

        hoursOOO += hoursStatisticsByPerson.outOfOffice;
        actualHours += hoursStatisticsByPerson.allHours;
        expectedHours += capacityByPerson;
        projectedHours += assignmentsStatisticsByPerson.allHours;

        result.people.push(person);

    }

  }
  
  result.expectedHours = expectedHours;

  if (fields.all || (assignmentRollUpHours && assignmentRollUpHours.projectedHours)) {
	result.projectedHours = projectedHours;
  }
  if (fields.all || (assignmentRollUpHours && assignmentRollUpHours.actualHours)) {
	result.actualHours = actualHours;
  }
  if (fields.all || (assignmentRollUpHours && assignmentRollUpHours.oooDetails)) {
	result.hoursOOO = hoursOOO;
  }
  if (fields.all || (assignmentRollUpHours && assignmentRollUpHours.utilization)) {
    result.overallUtilizationRate = Math.round( (actualHours / expectedHours) * 100 );
  }
  
  return result;
};
