var _ = require('underscore'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var projectPhase = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['project', 'name']);
        util.mapStraightDates(util.FOR_REST, doc, obj, ['startDate', 'endDate']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.PROJECT_PHASES_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['project', 'name']);
        util.mapStraightDates(util.FOR_DB, doc, obj, ['startDate', 'endDate']);
        return obj;
    },
    validateProjectPhase: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has (theoretically) already occurred 
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
};

module.exports.getProjectPhases = util.generateCollectionGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        var q = 'project:'+req.params.projectID;
        // Use the SearchAllProjectPhases index
        db.search('ProjectPhases', 'SearchAllProjectPhases', {
            q: q,
            include_docs: true
        }, function(err, results){
            callback(results.rows);
        });
    },
    'ProjectPhases', // ddoc
    'AllProjectPhases', // allDocsViewName
    projectPhase.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleProjectPhase = util.generateSingleItemCreateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectPhase', // key
    projectPhase.validateProjectPhase, // validate
    projectPhase.convertForDB, // convertForDB
    projectPhase.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleProjectPhase = util.generateSingleItemGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    'projectPhase', // key 
    projectPhase.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleProjectPhase = util.generateSingleItemUpdateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectPhase', // key
    projectPhase.validateProjectPhase, // validate
    projectPhase.convertForDB, // convertForDB
    projectPhase.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleProjectPhase = util.generateSingleItemDeleteHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'projectPhase' // key
);
