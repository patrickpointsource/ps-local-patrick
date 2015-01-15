/**
 * Module for report data calculations
 */

var util = require( '../util/util.js' );
var _ = require('underscore');
var moment = require('moment');

var UNDETERMINED_ROLE = 'undetermined_role';
var WORKING_HOURS_PER_WEEK = 40;
var WORKING_HOURS_PER_DAY = 8;
var TASK_TITLE = {
        VACATION: "Vacation",
        SALES: "Sales",
        MARKETING: "Marketing",
        SICK: "Sick time",
        SALES: "Sales",
        MARKETING: "Marketing",
        SITE_HOLIDAY: "Site Holiday"
};

var getTaskByName = function ( taskName, tasks ) {
    var task = _.findWhere(tasks, { name : taskName });
    if ( !task )
        task = {};
    return task;
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
  var marketingHours = 0;
  var salesHours = 0;
  var allHours = 0;
  var vacationTasks = util.getTaskResourcesByName ( TASK_TITLE.VACATION, data.tasks );
  var marketingTasks = util.getTaskResourcesByName ( TASK_TITLE.MARKETING, data.tasks );
  var salesTasks = util.getTaskResourcesByName ( TASK_TITLE.SALES, data.tasks );
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
            } else if ( salesTasks && salesTasks.length > 0 && salesTasks.indexOf(record.task.resource) > -1  ) {
                salesHours += record.hours;
            } else if ( marketingTasks && marketingTasks.length > 0 && marketingTasks.indexOf(record.task.resource) > -1  ) {
            	marketingHours += record.hours;
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
    marketing: marketingHours,
    salesHours: salesHours,
    overhead: overhead,
    allHours: allHours
  };
};

var getAssignmentsStatistics = function (data, startDate, endDate, personResource) {
	var reportStartDate = moment(startDate);
	var reportEndDate = moment(endDate);

	var projectedClientHours = 0;
	var projectedInvestHours = 0;
	var allHours = 0;
	
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
					var projectedHours = calculateProjectedHours(initStartDate, initEndDate, member.hoursPerWeek);
						
					if (isClientProject(project)) {
						projectedClientHours += projectedHours;
						peopleOnClient++;
					}
					if (isInvestProject(project)) {
						projectedInvestHours += projectedHours;
						peopleOnInvestment++;
					}
					allHours += projectedHours;
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
		totalProjectedHours : projectedClientHours + projectedInvestHours,
		allHours : allHours
	};
	
};

var getUtilizationDetails = function(data, startDate, endDate, roles, today) {
	
	var rolesInput = [];
	if ( _.isArray( roles ) )
		rolesInput = roles;
	else
		rolesInput = roles ? [ roles ] : [];

	var capacity = calculateCapacity(data, startDate, endDate);
    var utilizationDetails = [];
    
	for ( var r in rolesInput ) {
		var actualHours = 0;
		var expectedHours = 0;
		var tdHours = 0;
		var role = _.findWhere(data.allRoles, {	abbreviation : rolesInput[r] });
		var roleMembers = [];
		
		if (role) {
			for ( var i in data.people ) {
				var person = data.people[i];
							
				var hoursStatistics = getHoursStatistics( data, person.resource );
				var assignmentsStatistics = getAssignmentsStatistics( data, startDate, endDate,  person.resource );
				var assignmentsStatisticsTD = null;
				
				if (today) {
					today = moment(today).format( 'YYYY-MM-DD' );
					
					if (today >= startDate && today <= endDate)
						assignmentsStatisticsTD = getAssignmentsStatistics( data, startDate, today,  person.resource );
					else if (today > endDate)
						assignmentsStatisticsTD = getAssignmentsStatistics( data, startDate, endDate,  person.resource );
					else if (today < startDate)
						assignmentsStatisticsTD = getAssignmentsStatistics( data, startDate, startDate,  person.resource );
						
				}
				
				person.capacity = calculateCapacity( data, startDate, endDate, person.resource );
				person.hours = {
						assigned : assignmentsStatistics.projectedClientHours + assignmentsStatistics.projectedInvestHours,
						spent : hoursStatistics.actualClientHours + hoursStatistics.actualInvestHours,
						assignedTD: assignmentsStatisticsTD ? (assignmentsStatisticsTD.projectedClientHours + assignmentsStatisticsTD.projectedInvestHours): 0,
						OOO : hoursStatistics.outOfOffice,
						OH : hoursStatistics.overhead,
						projectedClient: assignmentsStatistics.projectedClientHours,
						projectedInvest: assignmentsStatistics.projectedInvestHours
					};
				person.projectsHours = getProjectsHours( data, startDate, endDate, person.resource, today );
				person.utilization = Math.round(( person.hours.spent / person.capacity ) * 100);
				person.goal = Math.round(( person.hours.assigned / person.capacity ) * 100);
			    if (person.primaryRole.resource == role.resource) {
					roleMembers.push(person);
				}
			    
			    actualHours += person.hours.spent + hoursStatistics.outOfOffice + hoursStatistics.overhead;
			    expectedHours += person.hours.assigned;
			    tdHours += person.hours.assignedTD;
			}
			
			role.expectedUtilization = Math.round( ( expectedHours / capacity ) * 100);
			role.actualUtilization = Math.round( (Math.abs(actualHours) / capacity) * 100);
			role.tdUtilization = Math.round( (Math.abs(tdHours) / capacity) * 100);
			
			utilizationDetails.push({
				role : role,
				members : roleMembers
			});
		}
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
        capacity += days * WORKING_HOURS_PER_DAY;
      }
    }
  }
  
  return capacity;
};

var calculateProjectedHours = function (startDate, endDate, hoursPerWeek) {
	var workingDays = util.getBusinessDaysCount(startDate, endDate);
	var weeks = workingDays / 5;
	var weekHours = hoursPerWeek ? hoursPerWeek : WORKING_HOURS_PER_WEEK;
	var projectedHours = weeks * weekHours;
	return projectedHours;
};

var isClientProject = function (project) {
    return ( project && ( project.type == "paid" || project.type == "poc") ) ? true : false;
};

var isInvestProject = function (project) {
    return ( project && ( project.type == "invest" ) ) ? true : false;
};

var getProjectsPeople = function(projects, assignments, allPeople) {
  var people = [];
  
  var projectResources = _.map(projects, function(p) {
    return p.resource;
  });
  
  var filteredAssignments = _.filter(assignments, function(a) {
    if(projectResources.indexOf(a.project.resource) > -1) {
      return true;
    }
    return false;
  });
  
  for(var i in filteredAssignments) {
    for(var j in filteredAssignments[i].members) {
      var personResource = filteredAssignments[i].members[j].person.resource;
      var person = _.findWhere(allPeople, { resource: personResource});
      people.push(person);
    }
  }
  return people;
};

var getProjectsHours = function(data, startDate, endDate, personResource, today) {
	var projectsHours = [];
	_.each(data.hours, function (record) {
	      if( record.hours && record.project && record.person.resource == personResource ) {
	    	  var person = _.findWhere(data.people, { resource: record.person.resource});
	    	  var project = _.findWhere(data.projects, { resource: record.project.resource });
	    	  if ( person && project ) {
	    		  	var projectedHours = 0;
	    		  	var spentHours = record.hours;
	    		  	var assignedTDHours = today && ( moment(today).isAfter(moment(record.date)) || moment(today).isSame(moment(record.date)) )  
	    		  							? record.hours : 0;
	    		  	
	    		  	_.each(data.assignments, function (assignment) {
	    		  			if (project.resource == assignment.project.resource) {
	    		  				_.each(assignment.members, function (member) {
	    		  					if ( person.resource == member.resource ) {
	    		  						projectedHours += calculateProjectedHours(startDate, endDate, member.hoursPerWeek);
	    		  					}
	    		  				});
	    		  			}
	    		  	});
	    		  	
	    		  	if (projectsHours[project.resource]) {
	    		  		projectsHours[project.resource].assignedHours += projectedHours;	
	    		  		projectsHours[project.resource].spentHours += spentHours;	
	    		  		projectsHours[project.resource].assignedTDHours += assignedTDHours;	
	    		  	} else {
	    		  		projectsHours[project.resource] = {
	    		  				project: {
	    		  					name: project.name,
	    		  					resource: project.resource
	    		  				},
	    		  				assignedHours: projectedHours,
	    		  				spentHours: spentHours,
	    		  				assignedTDHours: assignedTDHours
	    		  		};	
	    		  	}
	    	  }
	     }
	});
	
	var result = [];
	for (var i in projectsHours) {
		result.push(projectsHours[i]);
	};
	
	return result;
};

module.exports.isClientProject = isClientProject;
module.exports.isInvestProject = isInvestProject;
module.exports.getHoursStatistics = getHoursStatistics;
module.exports.getAssignmentsStatistics = getAssignmentsStatistics;
module.exports.calculateCapacity = calculateCapacity;
module.exports.getUtilizationDetails = getUtilizationDetails;
module.exports.getProjectsPeople = getProjectsPeople;