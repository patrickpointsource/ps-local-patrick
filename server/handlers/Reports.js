var _ = require('underscore'),
    async = require('async'),
    moment = require('moment'),
    util = require('../util/restUtils'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson');

var computeUtilizationReportFromResults = function(results, res){
    var people = {};
    var projectHours = 0;
    var projects = {};
    var projectTypes = {};
    var projectClients = {};
    var taskHours = 0;
    var tasks = {};
    _.each(results, function(row){
        var person = row.key[0];
        if(!people[person]){
            people[person] = {
                hours: {},
                actualHours: 0
            };
        }
        if(row.key[2] === 0){
            // Hours!
            var key;
            if(row.doc.project){
                key = row.doc.project.resource.replace('projects/', '');
                
                if(!projects[key]){
                    projects[key] = {
                        hours: 0
                    };
                }
                projectHours += row.doc.hours;
                projects[key].hours += row.doc.hours;
            }else if(row.doc.task){
                key = row.doc.task.resource.replace('tasks/', '');
                
                if(!tasks[key]){
                    tasks[key] = {
                        hours: 0
                    };
                }
                taskHours += row.doc.hours;
                tasks[key].hours += row.doc.hours;
            }
            
            if(!people[person].hours[key]){
                people[person].hours[key] = {};
            }
            if(!people[person].hours[key].hours){
                people[person].hours[key].hours = 0;
            }
            people[person].hours[key].hours += row.doc.hours;
            people[person].actualHours += row.doc.hours;
        }else if(row.key[2] === 1){
            // Project
            if(!projects[row.doc._id]){
                projects[row.doc._id] = {
                    hours: 0
                };
            }
            projects[row.doc._id].name = row.doc.name;
            projects[row.doc._id].type = row.doc.type;
            projects[row.doc._id].client = row.doc.client;

            if(!people[person].hours[row.doc._id]){
                people[person].hours[row.doc._id] = {};
            }
            people[person].hours[row.doc._id].name = row.doc.name;
            people[person].hours[row.doc._id].type = 'project';
        }else if(row.key[2] === 2){
            // Task
            if(!tasks[row.doc._id]){
                tasks[row.doc._id] = {
                    hours: 0
                };
            }
            tasks[row.doc._id].name = row.doc.name;
            
            if(!people[person].hours[row.doc._id]){
                people[person].hours[row.doc._id] = {};
            }
            people[person].hours[row.doc._id].name = row.doc.name;
            people[person].hours[row.doc._id].type = 'task';
        }else if(row.key[2] === 3){
            // Person
            people[person].name = row.doc.name.fullName;
        }
    });
    people = _.values(people);
    _.each(people, function(person){
        person.hours = _.values(person.hours);
    });
    projects = _.values(projects);
    tasks = _.values(tasks);

    return {
        hours: {
            taskHours: {
                hours: taskHours,
                tasks: tasks
            },
            projectHours: {
                hours: projectHours,
                projects: projects
            }
        },
        people: people
    };
};

var computeAndPopulateExpectedHours = function(startDate, endDate, holidays, people){
    startDate = moment(startDate, 'YYYY-MM-DD');
    endDate = moment(endDate, 'YYYY-MM-DD');
    var endDateWasInFuture = false;
    if(endDate.isAfter(moment())){
        endDateWasInFuture = true;
        endDate = moment();
    }
    if(!endDate.isBefore(startDate)){
        var numberOfWeekendDays = (endDate.week() - startDate.week()) * 2;
        var numberOfWorkDays = endDate.diff(startDate, 'days') - numberOfWeekendDays;
        if(endDateWasInFuture){
            // Add in today
            numberOfWorkDays += 1;
        }
        
        _.each(holidays, function(holiday){
            holiday = moment(holiday, 'YYYYMMDD');
            if( holiday.isSame(startDate) || 
                holiday.isSame(endDate) || 
                (holiday.isAfter(startDate) && holiday.isBefore(endDate))
            ){
                numberOfWorkDays--;
            }
        });
        var expectedHours = numberOfWorkDays * 8;
        _.each(people, function(person){
            person.expectedHours = expectedHours;
            person.difference = expectedHours - person.actualHours;
        });
    }
    return people;
};

var transformProjectsWithClients = function(projects, clientNames){
    projects = _.values(projects);
    var types = {};
    _.each(projects, function(project){
        var type = project.type;
        delete project.type;

        if(!types[type]){
            types[type] = {
                hours: 0,
                name: type,
                projects: []
            };
        }

        types[type].hours += project.hours;
        types[type].projects.push(project);
    });
    _.each(types, function(type){
        var clients = {};
        _.each(type.projects, function(project){
            var client = project.client;
            delete project.client;

            if(!clients[client]){
                clients[client] = {
                    hours: 0,
                    name: clientNames[client],
                    projects: []
                };
            }
            
            clients[client].hours += project.hours;
            clients[client].projects.push(project);
        });
        delete type.projects;
        type.clients = _.values(clients);
    });
    return _.values(types);
};

module.exports.getUtilizationReport = function(req, res, next){
    var acl = services.get('acl');
    var access = services.get('dbAccess');
    var db = access.db;
    util.doAcl(
        req,
        res,
        securityResources.reports.resourceName,
        securityResources.reports.permissions.viewReports, 
        function(allowed){
            if(allowed){
                var startDate = req.query.startDate.replace(/-/g, '');
                var endDate = req.query.endDate.replace(/-/g, '');
                var holidays = null;
                var clients = null;
                var hourResults = null;
                async.parallel([
                    function(callback){
                        db.view('Holidays', 'AllHolidaysByDate', {
                            startkey: startDate,
                            endkey: endDate,
                            include_docs: true
                        }, function(err, results){
                            if(!err && results.rows.length){
                                holidays = [];
                                _.each(results.rows, function(row){
                                    holidays.push(row.key);
                                });
                            }
                            callback(err);
                        });
                    },
                    function(callback){
                        db.view('Clients', 'AllClientNames', function(err, results){
                            if(!err && results.rows.length){
                                clients = {};
                                _.each(results.rows, function(row){
                                    clients[row.key] = row.value;
                                });
                            }
                            callback(err);
                        });
                    },
                    function(callback){
                        if(req.query.person){
                            db.view('Reports', 'HoursAndProjectsForPerson', {
                                startkey: [
                                    req.query.person,
                                    startDate
                                ],
                                endkey: [
                                    req.query.person,
                                    endDate,
                                    {}
                                ],
                                include_docs: true
                            }, function(err, results){
                                if(err){
                                    return callback('An error occurred attempting to retrieve the requested documents.');
                                }
                                hourResults = computeUtilizationReportFromResults(results.rows, res);
                                callback();
                            });
                            return;
                        }else if(req.query.department){
                            db.view('People', 'AllPeopleByDepartment', {
                                key: req.query.department
                            }, function(err, results){
                                if(err){
                                    return callback('An error occurred attempting to retrieve the people in a department.');
                                }
                                var queries = [];
                                var aggregateResults = [];
                                _.each(results.rows, function(row){
                                    queries.push(function(callback){
                                        db.view('Reports', 'HoursAndProjectsForPerson', {
                                            startkey: [
                                                row.value,
                                                startDate
                                            ],
                                            endkey: [
                                                row.value,
                                                endDate,
                                                {}
                                            ],
                                            include_docs: true
                                        }, function(err, results){
                                            if(err){
                                                return callback('An error occurred attempting to retrieve the requested documents.');
                                            }
                                            aggregateResults = aggregateResults.concat(results.rows);
                                            callback();
                                        });
                                        return;
                                    });
                                });
                                async.parallel(queries, function(err){
                                    if(err){
                                        return callback('An error occurred attempting to run the queries for each person.');
                                    }
                                    hourResults = computeUtilizationReportFromResults(aggregateResults, res);
                                    callback();
                                });
                            });
                            return;
                        }
                        console.error('unhandled case!');
                        callback('This case isn\'t handled');
                    }
                ], function(err){
                    if(!err){
                        // Compute the expected number of hours between 
                        // startDate and endDate, removing weekends and holidays
                        // (and ignoring dates in the future)
                        hourResults.people = computeAndPopulateExpectedHours(startDate, endDate, holidays, hourResults.people);
                        hourResults.hours.projectHours.types = transformProjectsWithClients(hourResults.hours.projectHours.projects, clients);
                        delete hourResults.hours.projectHours.projects;
                        sendJson(res, {hours: hourResults.hours, people: hourResults.people});
                    }else{
                        sendJson(res, {err: err}, 500);
                    }
                });
            }
        }
    );
};

// Test person: 3a0af5ecdf8766fa85c0f4262aa4211f
// or: 53adda0ce4b0e8fc69c5c873

// Departments:
// ESAs: 3ae0b327c7b0d2e13607c1d7a657b074
// Design?: 9d7806509e0140fe7c81023bd6c0764e