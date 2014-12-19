/**
 * Module for report data calculations
 */

var util = require( '../util/util.js' );
var _ = require('underscore');
var moment = require('moment');

var UNDETERMINED_ROLE = 'undetermined_role';
var WORKING_HOURS_IN_DAY = 8;
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
module.exports.getHoursStatistics = function(data) {
  var actualClientHours = 0;
  var actualInvestHours = 0;
  var outOfOffice = 0;
  var overhead = 0;
  var allHours = 0;
  var vacationTasks = getTaskResourcesByName ( TASK_TITLE.VACATION, data.tasks );
  var siteHolidayTask = getTaskByName ( TASK_TITLE.SITE_HOLIDAY, data.tasks );
  
  _.each(data.hours, function (record){
      if(record.hours) {
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

module.exports.calculateCapacity = function(data, startDate, endDate) {
  var days = util.getBusinessDaysCount(startDate, endDate);
  return days * 8;
};

var isClientProject = function (project) {
    return ( project && ( project.type == "paid" || project.type == "poc") ) ? true : false;
};

var isInvestProject = function (project) {
    return ( project && ( project.type == "invest" ) ) ? true : false;
};

module.exports.isClientProject = isClientProject;
module.exports.isInvestProject = isInvestProject;