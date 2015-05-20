var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var vacation = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['description', 'type', 'status', 'days', 'comment', 'reason', 'person', 'manager']);
        util.mapStraightDates(util.FOR_REST, doc, obj, ['startDate', 'endDate']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.VACATIONS_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['description', 'type', 'status', 'days', 'comment', 'reason', 'person', 'manager']);
        util.mapStraightDates(util.FOR_DB, doc, obj, ['startDate', 'endDate']);
        return obj;
    },
    validateVacations: function(obj, access, callback){
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
                access.db.view('People', 'AllPeopleNames', { keys: [obj.manager] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0){
                        return callback('The indicated manager doesn\'t exist.');
                    }
                    callback();
                });
            }
        ], callback);
    }
};

module.exports.getVacations = util.generateCollectionGetHandler(
    securityResources.vacations.resourceName, // resourceName
    function(req, callback){
        var userService = services.get('user');
        userService.getUser(req.user.id, function(err, user){
            if(!err && req.body.person !== user._id){
                return callback(securityResources.vacations.permissions.viewVacations);
            }
            callback(securityResources.vacations.permissions.viewMyVacations);
        });
    }, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        var q = '';
        var toAdd;
        if(req.query.people && req.query.people.length){
            var people = req.query.people.split(',');
            if(people.length > 1){
                toAdd = 'person:('+people.join(' OR ')+')';
            }else{
                toAdd = 'person:'+people[0];
            }
            q = util.addToQuery(q, toAdd);
        }
        if(req.query.statuses && req.query.statuses.length){
            var statuses = req.query.statuses.split(',');
            if(statuses.length > 1){
                toAdd = 'status:('+statuses.join(' OR ')+')';
            }else{
                toAdd = 'status:'+statuses[0];
            }
            q = util.addToQuery(q, toAdd);
        }
        if(req.query.manager){
            q = util.addToQuery(q, 'manager:'+req.query.manager);
        }
        if(req.query.startDate){
            q = util.addToQuery(q, 'numericStartDate:['+req.query.startDate.replace(/-/g, '')+' TO Infinity]');
        }
        if(req.query.endDate){
            q = util.addToQuery(q, 'numericEndDate:[-Infinity TO '+req.query.endDate.replace(/-/g, '')+']');
        }
        if(q.length){
            // Use the SearchAllVacations index
            db.search('Vacations', 'SearchAllVacations', {
                q: q,
                include_docs: true
            }, function(err, results){
                callback(results.rows);
            });
            return;
        }
        callback(false);
    },
    'Vacations', // ddoc
    'AllVacations', // allDocsViewName
    vacation.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleVacation = util.generateSingleItemCreateHandler(
    securityResources.vacations.resourceName, // resourceName
    function(req, callback){
        var userService = services.get('user');
        userService.getUser(req.user.id, function(err, user){
            if(!err && req.body.person !== user._id){
                return callback(securityResources.vacations.permissions.editVacations);
            }
            callback(securityResources.vacations.permissions.editMyVacations);
        });
    }, // permission
    'vacation', // key
    vacation.validateVacations, // validate
    vacation.convertForDB, // convertForDB
    vacation.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleVacation = util.generateSingleItemGetHandler(
    securityResources.vacations.resourceName, // resourceName
    function(req, callback){
        var userService = services.get('user');
        userService.getUser(req.user.id, function(err, user){
            if(!err && req.body.person !== user._id){
                return callback(securityResources.vacations.permissions.viewVacations);
            }
            callback(securityResources.vacations.permissions.viewMyVacations);
        });
    }, // permission
    'vacation', // key 
    vacation.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleVacation = util.generateSingleItemUpdateHandler(
    securityResources.vacations.resourceName, // resourceName
    function(req, callback){
        var userService = services.get('user');
        userService.getUser(req.user.id, function(err, user){
            if(!err && req.body.person !== user._id){
                return callback(securityResources.vacations.permissions.editVacations);
            }
            callback(securityResources.vacations.permissions.editMyVacations);
        });
    }, // permission
    'vacation', // key
    vacation.validateVacations, // validate
    vacation.convertForDB, // convertForDB
    vacation.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleVacation = util.generateSingleItemDeleteHandler(
    securityResources.vacations.resourceName, // resourceName
    function(req, callback){
        var userService = services.get('user');
        userService.getUser(req.user.id, function(err, user){
            if(!err && req.body.person !== user._id){
                return callback(securityResources.vacations.permissions.editVacations);
            }
            callback(securityResources.vacations.permissions.editMyVacations);
        });
    }, // permission
    'vacation' // key
);
