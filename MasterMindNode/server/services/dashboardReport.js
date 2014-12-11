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
    report.data = data;
    memoryCache.putObject(reportId, report);
    callback(null, "Project report generated.");
  });
};

// gets needed data depend on input parameters
// params:
//   profile:  profile of user that requested report
//   params:   {startDate, endDate, roles}
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
               
              if(params.roles && params.roles.length > 1) {
                roles = _.filter(roles.members, function(role) {
                  if(params.roles.indexOf(role.abbreviation) > -1) {
                    return true;
                  }
                  
                  return false;
                });
              
                var roleResources = _.map(roles, function(role) {
                  return role.resource;
                });
              
                people = _.filter(people.members, function(person) {
                  if(person.primaryRole && roleResources.indexOf(person.primaryRole.resource) > -1) {
                    return true;
                  }
                  return false;
                });
                
                var peopleResources = _.map(people, function(person) {
                  return person.resource;
                });
                
                dataAccess.listAssignmentsByPeople(peopleResources, function(err, assignments) {
                  if(err) {
                    callback("Error getting assignments while generating report: " + err);
                  } else {
                    dataAccess.listProjects({}, PROJECT_FIELDS, function(err, projects) {
                      if(err) {
                        callback("Error getting projects while generating report: " + err);
                      } else {
                        var hoursQ = {};
                        
                        hoursQ.$or = _.map(projects.data, function(p) {
                            return { "project.resource": p.resource };
                        });
                        if(params.startDate && params.endDate) {
                          params.startDate = moment.utc(params.startDate).format("YYYY-MM-DD");
                          params.endDate = moment.utc(params.endDate).format("YYYY-MM-DD");
                        }
                        
                        hoursQ.$and = [ { date: { $gte: params.startDate }}, { date: { $lte: params.endDate }}  ];
                        
                        dataAccess.listHours(hoursQ, HOURS_FIELDS, function(err, hours) {
                          if(err) {
                            callback("Error getting hours while generating report: " + err, null);
                          } else {
                            var data = {
                              profile: profile,
                              hours: hours.members,
                              people: people,
                              roles: roles,
                              projects: projects.members,
                              assignments: assignments.members
                            };

                            callback(null, data);
                          }
                        });
                      }
                    });
                  }
                });
              }
            }
          });
        }
  });
};
