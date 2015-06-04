var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var projectRole = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['project', 'coveredKMin', 'daysGap', 'hoursExtraCovered', 'hoursNeededToCover',
                                    'isCurrentRole', 'isFutureRole', 'isPastRole', 'percentageCovered', 'rate',
                                    'shore', 'originalAssignees', 'type']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.PROJECT_ROLES_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['project', 'coveredKMin', 'daysGap', 'hoursExtraCovered', 'hoursNeededToCover',
                                    'isCurrentRole', 'isFutureRole', 'isPastRole', 'percentageCovered', 'rate',
                                    'shore', 'originalAssignees', 'type']);
        return obj;
    },
    validateProjectRole: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has (theoretically) already occurred
        async.parallel([
            function(callback){
                access.db.view('Projects', 'AllProjectNames', { keys: [obj.project] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0){
                        return callback('The indicated project doesn\'t exist.');
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

module.exports.getProjectRoles = util.generateCollectionGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        /*jshint camelcase: false */
        var q = 'project:'+req.params.projectID;
        // Use the SearchAllProjectRoles index
        db.search('ProjectRoles', 'SearchAllProjectRoles', {
            q: q,
            include_docs: true
        }, function(err, results){
            callback(results.rows);
        });
    },
    'ProjectRoles', // ddoc
    'AllProjectRoles', // allDocsViewName
    projectRole.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleProjectRole = util.generateSingleItemCreateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectRole', // key
    projectRole.validateProjectRole, // validate
    projectRole.convertForDB, // convertForDB
    projectRole.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleProjectRole = util.generateSingleItemGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    'projectRole', // key
    projectRole.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleProjectRole = util.generateSingleItemUpdateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectRole', // key
    projectRole.validateProjectRole, // validate
    projectRole.convertForDB, // convertForDB
    projectRole.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleProjectRole = util.generateSingleItemDeleteHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectRole' // key
);
