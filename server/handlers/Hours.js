/* global services */

var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var hour = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['description', 'hours', 'person', 'task', 'project', 'date']);
        util.mapStraightDates(util.FOR_REST, doc, obj, ['created']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.HOURS_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['description', 'hours', 'person', 'task', 'project', 'date']);
        obj.created = (expectNew ? (new Date()) : (new Date(doc.created))).toString();
        return obj;
    },
    validateHours: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has (theoretically) already occurred
        async.parallel([
            function(callback){
                access.db.view('People', 'AllPeopleNames', { keys: [obj.person] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0){
                        return callback('The indicated person doesn\'t exist.');
                    }
                    callback();
                });
            },
            function(callback){
                if(!obj.task){
                    return callback();
                }
                access.db.view('Tasks', 'AllTaskNames', { keys: [obj.task] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0){
                        return callback('The indicated task doesn\'t exist.');
                    }
                    callback();
                });
            },
            function(callback){
                if(!obj.project){
                    return callback();
                }
                access.db.view('Projects', 'AllProjectNames', { keys: [obj.project] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0){
                        return callback('The indicated project doesn\'t exist.');
                    }
                    callback();
                });
            }
        ], callback);
    }
};

module.exports.getHours = util.generateCollectionGetHandler(
    securityResources.hours.resourceName, // resourceName
    securityResources.hours.permissions.viewHours, // permission
    function(req, res, db, callback){ // doSearchIfNeededCallback
        /*jshint camelcase: false */
        var q = '';
        if(req.query.startDate){
            q = util.addToQuery(q, 'numericDate:['+req.query.startDate.replace(/-/g, '')+' TO Infinity]');
        }
        if(req.query.endDate){
            q = util.addToQuery(q, 'numericDate:[-Infinity TO '+req.query.endDate.replace(/-/g, '')+']');
        }
        if(req.query.person){
            q = util.addToQuery(q, 'person:'+req.query.person);
        }
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
        if(req.query.tasks && req.query.tasks.length){
            var tasks = req.query.tasks.split(',');
            if(tasks.length > 1){
                toAdd = 'task:('+tasks.join(' OR ')+')';
            }else{
                toAdd = 'task:'+tasks[0];
            }
            q = util.addToQuery(q, toAdd);
        }
        if(q.length){
            // Use the SearchAllHours index
            db.search('Hours', 'SearchAllHours', {
                q: q,
                include_docs: true
            }, function(err, results){
                if(err || !results){
                    return sendJson(res, {'message': 'Could not search Hours.', 'detail': err}, 500);
                }
                callback(results.rows);
            });
            return;
        }
        callback(false);
    },
    'Hours', // ddoc
    'AllHours', // allDocsViewName
    hour.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleHour = util.generateSingleItemCreateHandler(
    securityResources.hours.resourceName, // resourceName
    function(req, callback){
        var personService = services.get('person');
        personService.getPersonByGoogleID(req.user.id, function(err, user){
            if(!err && req.body.person !== user._id){
                return callback(securityResources.hours.permissions.editHours);
            }
            callback(securityResources.hours.permissions.editMyHours);
        });
    }, // permission
    'hour', // key
    hour.validateHours, // validate
    hour.convertForDB, // convertForDB
    hour.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleHour = util.generateSingleItemGetHandler(
    securityResources.hours.resourceName, // resourceName
    securityResources.hours.permissions.viewHours, // permission
    'hour', // key
    hour.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleHour = util.generateSingleItemUpdateHandler(
    securityResources.hours.resourceName, // resourceName
    securityResources.hours.permissions.editHours, // permission
    'hour', // key
    hour.validateHours, // validate
    hour.convertForDB, // convertForDB
    hour.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleHour = util.generateSingleItemDeleteHandler(
    securityResources.hours.resourceName, // resourceName
    function(req, callback){
        var personService = services.get('person');
        personService.getPersonByGoogleID(req.user.id, function(err, user){
            if(!err && req.body.person !== user._id){
                return callback(securityResources.hours.permissions.editHours);
            }
            callback(securityResources.hours.permissions.deleteMyHours);
        });
    }, // permission
    'hour' // key
);

module.exports.getMostRecent = function(req, res){
    var access = services.get('dbAccess');
    var db = access.db;
    util.doAcl(
        req,
        res,
        securityResources.hours.resourceName,
        securityResources.hours.permissions.viewHours,
        function(allowed){
            if(allowed){
                var personService = services.get('person');
                personService.getPersonByGoogleID(req.user.id, function(err, user){
                    if(err || !user){
                        return sendJson(res, {
                            'message': 'Could not find currently logged-in person',
                            'detail': err
                        }, 500);
                    }
                    // Use the SearchAllHours index
                    // Knock one day of the provided date
                    var searchableDate = String(Number(req.query.date.replace(/-/g, '')) - 1);
                    /*jshint camelcase: false */
                    db.search('Hours', 'SearchAllHours', {
                        q: 'person:'+user.id+' AND numericDate:[-Infinity TO '+searchableDate+']',
                        sort: '"-numericDate"',
                        include_docs: true
                    }, function(err, results){
                        if(err || !results){
                            return sendJson(res, {'message': 'Could not search Hours.', 'detail': err}, 500);
                        }
                        var firstDate = null;
                        var rows = _.filter(results.rows, function(row){
                            if(!firstDate){
                                firstDate = row.doc.date;
                                return true;
                            }
                            return row.doc.date === firstDate;
                        });
                        rows = _.pluck(rows, 'doc');
                        return sendJson(res, rows);
                    });
                });
            }
        });
};
