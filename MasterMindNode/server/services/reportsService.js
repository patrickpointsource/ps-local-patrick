/**
 * Service for common report generation functions
 */

var dataAccess = require( '../data/dataAccess.js' );
var dataFilter = require('../data/dataFilter.js');
var _ = require('underscore');
var moment = require('moment');
var util = require('../util/util.js');

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
    return;
  }
  
  var selectedRoles = [];
  var selectedPeople = [];
  
  dataAccess.listPeople(PEOPLE_FIELDS, function(err, people) {
    if(err) {
      callback("Error getting people while generating report: " + err, null);
    } else {
      dataAccess.listTasks( function(err, tasks) {
        if(err) {
          callback("Error getting tasks while generating report: " + err, null);
        } else {
          dataAccess.listRoles( function(err, roles) {
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
                    dataAccess.listProjects( PROJECT_FIELDS, function(err, projects) {
                      if(err) {
                        callback("Error getting projects while generating report: " + err);
                      } else {
                        if(params.startDate && params.endDate) {
                          params.startDate = params.startDate.indexOf("\"") > -1 ? moment.utc(JSON.parse(params.startDate)).format("YYYY-MM-DD"): params.startDate;
                          params.endDate = params.endDate.indexOf("\"") > -1 ? moment.utc(JSON.parse(params.endDate)).format("YYYY-MM-DD"): params.endDate;
                        }
                        
                        var selectedPeopleIds = _.map(selectedPeople, function(p) {
                          return p._id;
                        });
                        
                        dataAccess.cloudantSearchHours(selectedPeopleIds, null, params.startDate, params.endDate, function(err, hoursObj) {
                          if(err) {
                            callback("Error getting hours while generating report: " + err, null);
                          } else {
                            var hoursFiltered = _.map(hoursObj, function(h) {
                              var hour = {
                                  id: h.id,
                                  hours: h.fields.hours,
                                  person: { resource: h.fields["person.resource"], name: h.fields["person.name"] },
                                  date: h.fields.date
                              };
                              
                              if(h.fields["task.resource"]) {
                                hour.task = { resource: h.fields["task.resource"], name: h.fields["task.name"] };
                              }
                              
                              if(h.fields["project.resource"]) {
                                hour.project = { resource: h.fields["project.resource"], name: h.fields["project.name"] };
                              }
                              
                              return hour;
                            });
                            
                            dataAccess.listVacations( function(err, vacations) {
                              if(err) {
                                callback("Error getting vacations while generating report: " + err, null);
                              } else {
                                var filteredVacations = dataFilter.filterVacationsByDates(params.startDate, params.endDate, vacations.members);
                                
                                var data = {
                                  profile: profile,
                                  hours: hoursFiltered,
                                  people: selectedPeople,
                                  roles: selectedRoles,
                                  projects: projects.data,
                                  assignments: assignments,
                                  allPeople: people.members,
                                  allRoles: roles.members,
                                  vacations: filteredVacations,
                                  tasks: tasks.members
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
    }
  });
};

// gets needed for project report data depend on input parameters
// params:
//   profile:  profile of user that requested report
//   params:   {startDate, endDate, roles}
//   callback: function that is called when operation fail or success
module.exports.prepareProjectData = function(profile, params, callback) {
  
  var validationMessages = validateParams(params);
  
  if(validationMessages.length > 0) {
    callback(validationMessages.join(", "));
    return;
  }
  
  var selectedRoles = [];
  var selectedPeople = [];
  
  dataAccess.listPeople( PEOPLE_FIELDS, function(err, people) {
    if(err) {
      callback("Error getting people while generating report: " + err, null);
    } else {
      dataAccess.listTasks( function(err, tasks) {
        if(err) {
          callback("Error getting tasks while generating report: " + err, null);
        } else {
          dataAccess.listRoles( function(err, roles) {
            if(err) {
              callback("Error getting roles while generating report: " + err, null);
            } else {
                selectedRoles = roles.members;

                var projectResources = [];
                if(_.isArray(params.projects)) {
                  projectResources = _.map(params.projects, function(p) {
                    return JSON.parse(p).resource;
                  });
                } else {
                  projectResources.push(JSON.parse(params.projects).resource);
                }
                
                dataAccess.listAssignmentsByProjects(projectResources, function(err, assignments) {
                  if(err) {
                    callback("Error getting assignments while generating report: " + err);
                  } else {
                    dataAccess.listProjects( PROJECT_FIELDS, function(err, projects) {
                      if(err) {
                        callback("Error getting projects while generating report: " + err);
                      } else {
                        var selectedProjects = _.filter(projects.data, function(project) {
                          if(projectResources.indexOf(project.resource) > -1) {
                            return true;
                          }
                          return false;
                        });
                          
                        if(params.startDate && params.endDate) {
                          params.startDate = params.startDate.indexOf("\"") > -1 ? moment.utc(JSON.parse(params.startDate)).format("YYYY-MM-DD"): params.startDate;
                          params.endDate = params.endDate.indexOf("\"") > -1 ? moment.utc(JSON.parse(params.endDate)).format("YYYY-MM-DD"): params.endDate;
                        }
                        
                        var projectIds = _.map(projectResources, function(pr) {
                          return util.getId(pr);
                        });
                        
                        // add vacation task to hours query
                        var vacationTaskResources = util.getTaskResourcesByName ( "Vacation", tasks.members );
                        var vacationTaskIds = _.map(vacationTaskResources, function(res) {
                          return util.getId(res);
                        });
                        projectIds = projectIds.concat(vacationTaskIds);
                        
                        dataAccess.cloudantSearchHours(null, projectIds, params.startDate, params.endDate, function(err, hoursObj) {
                          if(err) {
                            callback("Error getting hours while generating report: " + err, null);
                          } else {
                            var hoursFiltered = _.map(hoursObj, function(h) {
                              var hour = {
                                  id: h.id,
                                  hours: h.fields.hours,
                                  person: { resource: h.fields["person.resource"], name: h.fields["person.name"] },
                                  date: h.fields.date
                              };
                              
                              if(h.fields["task.resource"]) {
                                hour.task = { resource: h.fields["task.resource"], name: h.fields["task.name"] };
                              }
                              
                              if(h.fields["project.resource"]) {
                                hour.project = { resource: h.fields["project.resource"], name: h.fields["project.name"] };
                              }
                              
                              return hour;
                            });
                            
                            var selectedPeople = getSelectedPeopleByQueriedHours(people.members, hoursFiltered);
                            
                            dataAccess.listVacations( function(err, vacations) {
                              if(err) {
                                callback("Error getting vacations while generating report: " + err, null);
                              } else {
                                var filteredVacations = dataFilter.filterVacationsByDates(params.startDate, params.endDate, vacations.members);
                                
                                var data = {
                                  profile: profile,
                                  hours: hoursFiltered,
                                  people: selectedPeople,
                                  roles: selectedRoles,
                                  projects: selectedProjects,
                                  assignments: assignments,
                                  allPeople: people.members,
                                  allRoles: roles.members,
                                  vacations: filteredVacations,
                                  tasks: tasks.members
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
    }
  });
};

var getSelectedPeopleByQueriedHours = function(allPeople, hours) {
  var selectedPeopleResources = [];
  
  _.each(hours, function(hour) {
    var resource = hour.person.resource;
    if(selectedPeopleResources.indexOf(resource) < 0) {
      selectedPeopleResources.push(resource);
    }
  });
  
  var selectedPeople = [];
  
  return _.filter(allPeople, function(person) {
    if(selectedPeopleResources.indexOf(person.resource) > -1) {
      return true;
    }
    
    return false;
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