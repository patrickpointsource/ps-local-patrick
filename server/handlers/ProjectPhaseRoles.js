var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var projectPhaseRole = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['phase', 'coveredKMin', 'daysGap', 'hoursExtraCovered', 'hoursNeededToCover',
                                    'isCurrentRole', 'isFutureRole', 'isPastRole', 'percentageCovered', 'rate',
                                    'shore', 'originalAssignees', 'type']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.PROJECT_PHASE_ROLES_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['phase', 'coveredKMin', 'daysGap', 'hoursExtraCovered', 'hoursNeededToCover',
                                    'isCurrentRole', 'isFutureRole', 'isPastRole', 'percentageCovered', 'rate',
                                    'shore', 'originalAssignees', 'type']);
        return obj;
    },
    validateProjectPhaseRole: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has (theoretically) already occurred
        async.parallel([
            function(callback){
                access.db.view('ProjectPhases', 'AllProjectPhaseNames', { keys: [obj.phase] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0){
                        return callback('The indicated phase doesn\'t exist.');
                    }
                    callback();
                });
            },
            function(callback){
                access.db.view('Roles', 'AllRoleTitles', { keys: [obj.type] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0){
                        return callback('The indicated type (role) doesn\'t exist.');
                    }
                    callback();
                });
            }
        ], callback);
    }
};

module.exports.getProjectPhaseRoles = util.generateCollectionGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        /*jshint camelcase: false */
        var q = 'phase:'+req.params.phaseID;
        // Use the SearchAllProjectPhaseRoles index
        db.search('ProjectPhaseRoles', 'SearchAllProjectPhaseRoles', {
            q: q,
            include_docs: true
        }, function(err, results){
            callback(results.rows);
        });
    },
    'ProjectPhaseRoles', // ddoc
    'AllProjectPhaseRoles', // allDocsViewName
    projectPhaseRole.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleProjectPhaseRole = util.generateSingleItemCreateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectPhaseRole', // key
    projectPhaseRole.validateProjectPhaseRole, // validate
    projectPhaseRole.convertForDB, // convertForDB
    projectPhaseRole.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleProjectPhaseRole = util.generateSingleItemGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    'projectPhaseRole', // key
    projectPhaseRole.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleProjectPhaseRole = util.generateSingleItemUpdateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectPhaseRole', // key
    projectPhaseRole.validateProjectPhaseRole, // validate
    projectPhaseRole.convertForDB, // convertForDB
    projectPhaseRole.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleProjectPhaseRole = util.generateSingleItemDeleteHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectPhaseRole' // key
);
