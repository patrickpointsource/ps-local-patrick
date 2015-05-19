var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var link = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapResources(util.FOR_REST, doc, obj, ['project'], access.PROJECTS_KEY);
        util.mapStraight(doc, obj, ['url', 'label', 'index', 'resource', 'icon']);
        _.each(['homePage', 'currentPlans', 'details', 'dashboard'], function(key){
            if(doc[key] && doc[key].resource){
                obj[key] = doc[key].resource;
            }
        });
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.LINKS_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapResources(util.FOR_DB, doc, obj, ['project'], access.PROJECTS_KEY);
        util.mapStraight(doc, obj, ['url', 'label', 'index', 'resource', 'icon']);
        _.each(['homePage', 'currentPlans', 'details', 'dashboard'], function(key){
            if(doc[key]){
                obj[key] = {
                    resource: doc[key]
                };
            }
        });
        return obj;
    },
    validateLink: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has (theoretically) already occurred 
        access.db.view('Projects', 'AllProjectNames', { keys: [obj.project] }, function(err, docs){
            if(err){
                return callback(err);
            }
            if(docs.rows.length === 0){
                return callback('The indicated project doesn\'t exist.');
            }
            callback(null, docs.rows[0]);
        });
    }
};

module.exports.getLinks = util.generateCollectionGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjectLinks, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        var q = '';
        if(req.query.project){
            q = util.addToQuery(q, 'project:'+req.query.project);
        }
        if(q.length){
            // Use the SearchAllHours index
            db.search('ProjectLinks', 'SearchAllLinks', {
                q: q,
                include_docs: true
            }, function(err, results){
                callback(results.rows);
            });
            return;
        }
        callback(false);
    },
    'ProjectLinks', // ddoc
    'AllLinks', // allDocsViewName
    link.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleLink = util.generateSingleItemCreateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjectLinks, // permission
    'link', // key
    null, // validate
    link.convertForDB, // convertForDB
    link.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleLink = util.generateSingleItemGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjectLinks, // permission
    'link', // key 
    link.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleLink = util.generateSingleItemUpdateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjectLinks, // permission
    'link', // key
    null, // validate
    link.convertForDB, // convertForDB
    link.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleLink = util.generateSingleItemDeleteHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjectLinks, // permission
    'link' // key
);
