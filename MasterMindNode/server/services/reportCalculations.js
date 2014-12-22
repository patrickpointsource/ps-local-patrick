/**
 * Module for report data calculations
 */

var util = require( '../util/util.js' );
var _ = require('underscore');
var moment = require('moment');

var UNDETERMINED_ROLE = 'undetermined_role';
var WORKING_HOURS_PER_DAY = 8;
var TASK_TITLE = {
        VACATION: "Vacation",
        SALES: "Sales",
        MARKETING: "Marketing",
        SICK: "Sick time",
        SITE_HOLIDAY: "Site Holiday"
};

var getTaskByName = function ( taskName, tasks ) {
    var task = _.findWhere(tasks, { name : taskName });
    if ( !task )
        task = {};
    return task;
};

var getTaskResourcesByName = function ( taskName, tasksList ) {
    var tasks = _.map(tasksList, function(t) {
      if(t.name == taskName){
        return t.resource;
      }
    });
    if ( !tasks )
        tasks = [];
    return tasks;
};

// Calculates:
//   actual Client Hours
//   actual Invest Hours
//   overhead hours
//   out of office hours
//   all hours
var getHoursStatistics = function( data, personResource ) {
  var actualClientHours = 0;
  var actualInvestHours = 0;
  var outOfOffice = 0;
  var overhead = 0;
  var allHours = 0;
  var vacationTasks = getTaskResourcesByName ( TASK_TITLE.VACATION, data.tasks );
  var siteHolidayTask = getTaskByName ( TASK_TITLE.SITE_HOLIDAY, data.tasks );
  
  _.each(data.hours, function (record){
      if( record.hours && (!personResource || record.person.resource == personResource) ) {
        if ( record.project ) {
            var project = _.findWhere(data.projects, {resource: record.project.resource});
            if (isClientProject(project)) {
                actualClientHours += record.hours;
            }
            if (isInvestProject(project)) {
                actualInvestHours += record.hours;
            }
        }
        if ( record.task ) {
            if ( ( vacationTasks && vacationTasks.length > 0 && vacationTasks.indexOf(record.task.resource) > -1 ) || 
                    ( siteHolidayTask && record.task.resource == siteHolidayTask.resource ) ) {
                outOfOffice += record.hours;
            }
            else {
                overhead += record.hours;
            }
        }
        
        allHours += record.hours;
      }
  });
    
  return {
    actualClientHours: actualClientHours,
    actualInvestHours: actualInvestHours,
    outOfOffice: outOfOffice,
    overhead: overhead,
    allHours: allHours
  };
};

var getAssignmentsStatistics = function (data, startDate, endDate, personResource) {
	var reportStartDate = moment(startDate);
	var reportEndDate = moment(endDate);
	
	var projectedClientHours = 0;
	var projectedInvestHours = 0;
	
	var peopleOnClient = 0;
	var peopleOnInvestment = 0;
	
	_.each(data.assignments, function (assignment){
		var project = _.findWhere(data.projects, {resource: assignment.project.resource});
		_.each(assignment.members, function (member){
			if ( !personResource || personResource == member.person.resource ) {
				var memberStartDate = moment(member.startDate);
				var memberEndDate = moment(member.endDate);
				var initStartDate = (memberStartDate > reportStartDate ) ? memberStartDate : reportStartDate;
				var initEndDate = (memberEndDate < reportEndDate) ? memberEndDate : reportEndDate;
				if (initStartDate < initEndDate) {
					var workingDays = util.getBusinessDaysCount(initStartDate, initEndDate);
					var weeks = workingDays / 5;
					var projectedHours = weeks * member.hoursPerWeek;
							
					if (isClientProject(project)) {
						projectedClientHours += projectedHours;
						peopleOnClient++;
					}
					if (isInvestProject(project)) {
						projectedInvestHours += projectedHours;
						peopleOnInvestment++;
					}
				}
			}
		});
	});
	
	projectedClientHours = Math.round(projectedClientHours); 
	projectedInvestHours = Math.round(projectedInvestHours); 
	
	return {
		peopleOnClient: peopleOnClient,
		peopleOnInvestment: peopleOnInvestment,
		projectedClientHours: projectedClientHours,
		projectedInvestHours: projectedInvestHours,
		totalProjectedHours : projectedClientHours + projectedInvestHours
	};
	
};

var getUtilizationDetails = function(data, startDate, endDate, roles) {
	
	var rolesInput = [];
	if ( _.isArray( roles ) )
		rolesInput = roles;
	else
		rolesInput = roles ? [ params.roles ] : [];

    var utilizationDetails = [];
    
	for ( var i in rolesInput ) {
		var role = _.findWhere(data.allRoles, {	abbreviation : rolesInput[i] });
		var roleMembers = [];
		for ( var i in data.people ) {
			var person = data.people[i];
						
			var hoursStatistics = getHoursStatistics( data, person.resource );
			var assignmentsStatistics = getAssignmentsStatistics( data, startDate, endDate,  person.resource );
			
			person.capacity = calculateCapacity( data, startDate, endDate, person.resource );
			person.hours = {
					assigned : assignmentsStatistics.projectedClientHours + assignmentsStatistics.projectedInvestHours,
					spent : hoursStatistics.actualClientHours + hoursStatistics.actualInvestHours,
					OOO : hoursStatistics.outOfOffice,
					OH : hoursStatistics.overhead
				};
			person.utilization = Math.round(( person.hours.spent / person.capacity ) * 100);
			person.goal = Math.round(( person.hours.assigned / person.capacity ) * 100);
		    if (person.primaryRole.resource == role.resource) {
				roleMembers.push(person);
			}
		}
		utilizationDetails.push({
			role : role,
			members : roleMembers
		});
	}
	
	return utilizationDetails;
};

var calculateCapacity = function(data, startDate, endDate) {
  var capacity = 0;
  for(var i in data.people) {
    if(data.people[i] && data.people[i].isActive) {
      var days = util.getBusinessDaysCount(startDate, endDate);
      if(data.people[i] && data.people[i].partTime && data.people[i].partTimeHours) {
        capacity += days * parseInt(data.people[i].partTimeHours);
      } else {
        capacity += days * 8;
      }
    }
  }
  
  return capacity;
};

var isClientProject = function (project) {
    return ( project && ( project.type == "paid" || project.type == "poc") ) ? true : false;
};

var isInvestProject = function (project) {
    return ( project && ( project.type == "invest" ) ) ? true : false;
};

module.exports.isClientProject = isClientProject;
module.exports.isInvestProject = isInvestProject;
module.exports.getHoursStatistics = getHoursStatistics;
module.exports.getAssignmentsStatistics = getAssignmentsStatistics;
module.exports.calculateCapacity = calculateCapacity;
module.exports.getUtilizationDetails = getUtilizationDetails;