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
    memoryCache.putObject(reportId, report);
    callback(null, "Project report generated.");
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
