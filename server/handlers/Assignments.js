var _ = require('underscore'),
    moment = require('moment'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var assignment = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['hoursPerWeek', 'isCurrent', 'isFuture', 'isPast', 'percentage', 'project', 'person', 'role']);
        util.mapStraightDates(util.FOR_REST, doc, obj, ['startDate', 'endDate']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.ASSIGMENTS_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['hoursPerWeek', 'isCurrent', 'isFuture', 'isPast', 'percentage', 'project', 'person', 'role']);
        util.mapStraightDates(util.FOR_DB, doc, obj, ['startDate', 'endDate']);
        return obj;
    },
    validateAssignments: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has (theoretically) already occurred 
        async.parallel([
            function(callback){
                access.db.view('People', 'AllPeopleNames', { keys: [obj.person] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length !== 2){
                        return callback('The indicated person doesn\'t exist.');
                    }
                    callback();
                });
            }
        ], callback);
    }
};

module.exports.getAssignments = util.generateCollectionGetHandler(
    securityResources.assignments.resourceName, // resourceName
    securityResources.assignments.permissions.viewAssignments, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        var q = '';
        var toAdd;
        if(req.query.projects && req.query.projects.length){
            var projects = req.query.projects.split(',');
            if(projects.length > 1){
                toAdd = 'project:('+projects.join(' OR ')+')';
            }else{
                toAdd = 'project:'+projects[0];
            }
            q = util.addToQuery(q, toAdd);
        }
        if(req.query.person){
            q = util.addToQuery(q, 'person:'+req.query.person);
        }
        if(req.query.startDate){
            q = util.addToQuery(q, 'numericStartDate:['+req.query.startDate.replace(/-/g, '')+' TO Infinity]');
        }
        if(req.query.endDate){
            q = util.addToQuery(q, 'numericEndDate:[-Infinity TO '+req.query.endDate.replace(/-/g, '')+']');
        }
        if(req.query.timePeriod){
            var date = moment();
            switch(req.query.timePeriod){
                case 'past': 
                    q = util.addToQuery(q, 'numericEndDate:[-Infinity TO '+date.format('YYYYMMDD')+']');
                    break;
                case 'present':
                    q = util.addToQuery(q, 'numericStartDate:[-Infinity TO '+date.format('YYYYMMDD')+']');
                    q = util.addToQuery(q, 'numericEndDate:['+date.format('YYYYMMDD')+' TO Infinity]');
                    break;
                case 'future':
                    q = util.addToQuery(q, 'numericStartDate:['+date.format('YYYYMMDD')+' TO Infinity]');
                    break;
            }
        }
        if(q.length){
            // Use the SearchAllAssignments index
            db.search('ProjectAssignments', 'SearchAllProjectAssignments', {
                q: q,
                include_docs: true
            }, function(err, results){
                callback(results.rows);
            });
            return;
        }
        callback(false);
    },
    'ProjectAssignments', // ddoc
    'AllProjectAssignments', // allDocsViewName
    assignment.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleAssignment = util.generateSingleItemCreateHandler(
    securityResources.assignments.resourceName, // resourceName
    securityResources.assignments.permissions.editAssignments, // permission
    'assignment', // key
    assignment.validateAssignments, // validate
    assignment.convertForDB, // convertForDB
    assignment.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleAssignment = util.generateSingleItemGetHandler(
    securityResources.assignments.resourceName, // resourceName
    securityResources.assignments.permissions.viewAssignments, // permission
    'assignment', // key 
    assignment.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleAssignment = util.generateSingleItemUpdateHandler(
    securityResources.assignments.resourceName, // resourceName
    securityResources.assignments.permissions.editAssignments, // permission
    'assignment', // key
    assignment.validateAssignments, // validate
    assignment.convertForDB, // convertForDB
    assignment.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleAssignment = util.generateSingleItemDeleteHandler(
    securityResources.assignments.resourceName, // resourceName
    securityResources.assignments.permissions.editAssignments, // permission
    'assignment' // key
);
