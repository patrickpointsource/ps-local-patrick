/**
 * Service for common report generation functions
 */

var dataAccess = require( '../data/dataAccess.js' );
var _ = require('underscore');
var moment = require('moment');

var HOURS_FIELDS =  ["_id", "date", "description", "project", "person", "task", "hours"];
var PROJECT_FIELDS = ["resource", "name", "startDate", "endDate", "roles", "customerName", "committed", "type", "description", "terms"];
var PEOPLE_FIELDS = ["_id", "groups", "primaryRole", "name", "isActive", "resource", "lastSynchronized", "mBox", "phone", "about", "thumbnail" ];

// gets needed data depend on input parameters
// params:
//   profile:  profile of user that requested report
//   params:   {startDate, endDate, roles}
//   callback: function that is called when operation fail or success
module.exports.prepareData = function(profile, params, callback) {
  
  var validationMessages = validateParams(params);
  
  if(validationMessages.length > 0) {
    callback(validationMessages.join(", "));
  }
  
  var selectedRoles = [];
  var selectedPeople = [];
  
  dataAccess.listPeople({}, PEOPLE_FIELDS, function(err, people) {
    if(err) {
      callback("Error getting people while generating report: " + err, null);
    } else {
      dataAccess.listRoles({}, function(err, roles) {
            if(err) {
              callback("Error getting roles while generating report: " + err, null);
            } else {
              
              if(params.roles && params.roles.length > 1) {
                selectedRoles = _.filter(roles.members, function(role) {
                  if(params.roles.indexOf(role.abbreviation) > -1) {
                    return true;
                  }
                  
                  return false;
                });
              } else {
                selectedRoles = roles.members;
              }
              
                var roleResources = _.map(selectedRoles, function(role) {
                  return role.resource;
                });
              
                selectedPeople = _.filter(people.members, function(person) {
                  if(person.primaryRole && roleResources.indexOf(person.primaryRole.resource) > -1) {
                    return true;
                  }
                  return false;
                });
                
                var peopleResources = _.map(selectedPeople, function(person) {
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
                        
                        hoursQ.$or = _.map(assignments, function(assignment) {
                            return { "project.resource": assignment.project.resource };
                        });
                        
                        if(params.startDate && params.endDate) {
                          params.startDate = moment.utc(JSON.parse(params.startDate)).format("YYYY-MM-DD");
                          params.endDate = moment.utc(JSON.parse(params.endDate)).format("YYYY-MM-DD");
                        }
                        
                        hoursQ.$and = [ { date: { $gte: params.startDate }}, { date: { $lte: params.endDate }}  ];
                        
                        dataAccess.listHours(hoursQ, HOURS_FIELDS, function(err, hours) {
                          if(err) {
                            callback("Error getting hours while generating report: " + err, null);
                          } else {
                            
                            var hoursFiltered = _.filter(hours.members, function(h) {
                              if(peopleResources.indexOf(h.person.resource) > -1) {
                                return true;
                              }
                              
                              return false;
                            });
                            
                            dataAccess.listVacations({}, function(err, vacations) {
                              if(err) {
                                callback("Error getting vacations while generating report: " + err, null);
                              } else {
                                var data = {
                                  profile: profile,
                                  hours: hoursFiltered,
                                  people: selectedPeople,
                                  roles: selectedRoles,
                                  projects: projects.data,
                                  assignments: assignments,
                                  allPeople: people.members,
                                  allRoles: roles.members,
                                  vacations: vacations.members
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
              
            }
          });
        }
  });
};

var validateParams = function(params) {
  
  var messages = [];
  
  if(!params.startDate) {
    messages.push("Start Date is required for report generation.");
  }
  
  if(!params.endDate) {
    messages.push("End Date is required for report generation.");
  }
  
  return messages;
};
