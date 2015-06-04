var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var userRole = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['userId', 'roles']);
        // Skipping groupId as we don't have any examples of its usage right now
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.USER_ROLES_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['userId', 'roles']);
        // Skipping groupId as we don't have any examples of its usage right now
        return obj;
    },
    validateUserRoles: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has (theoretically) already occurred
        async.parallel([
            function(callback){
                access.db.view('People', 'AllPeopleByGoogleId', { keys: [obj.userId] }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0){
                        return callback('The indicated user doesn\'t exist.');
                    }
                    callback(null, docs.rows[0]);
                });
            },
            function(callback){
                access.db.view('SecurityRoles', 'AllSecurityRoles', { keys: obj.roles }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length === 0 || docs.rows.length !== obj.roles.length){
                        return callback('An indicated role doesn\'t exist.');
                    }
                    callback();
                });
            }
        ], callback);
    }
};

module.exports.getUserRoles = util.generateCollectionGetHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.viewSecurityRoles, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        // No searching for UserRoles
        callback(false);
    },
    'UserRoles', // ddoc
    'AllUserRoles', // allDocsViewName
    userRole.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleUserRole = util.generateSingleItemCreateHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.editSecurityRoles, // permission
    'userRole', // key
    userRole.validateUserRoles, // validate
    userRole.convertForDB, // convertForDB
    userRole.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleUserRole = util.generateSingleItemGetHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.viewSecurityRoles, // permission
    'userRole', // key
    userRole.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleUserRole = util.generateSingleItemUpdateHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.editSecurityRoles, // permission
    'userRole', // key
    userRole.validateUserRoles, // validate
    userRole.convertForDB, // convertForDB
    userRole.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleUserRole = util.generateSingleItemDeleteHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.editSecurityRoles, // permission
    'userRole' // key
);
