var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var securityRole = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['name', 'resources']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.SECURITY_ROLES_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['name', 'resources']);
        return obj;
    }
};

module.exports.getSecurityRoles = util.generateCollectionGetHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.viewSecurityRoles, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        // No searching for SecurityRoles
        callback(false);
    },
    'SecurityRoles', // ddoc
    'AllSecurityRoles', // allDocsViewName
    securityRole.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleSecurityRole = util.generateSingleItemCreateHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.editSecurityRoles, // permission
    'securityRole', // key
    null, // validate
    securityRole.convertForDB, // convertForDB
    securityRole.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleSecurityRole = util.generateSingleItemGetHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.viewSecurityRoles, // permission
    'securityRole', // key 
    securityRole.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleSecurityRole = util.generateSingleItemUpdateHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.editSecurityRoles, // permission
    'securityRole', // key
    null, // validate
    securityRole.convertForDB, // convertForDB
    securityRole.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleSecurityRole = util.generateSingleItemDeleteHandler(
    securityResources.securityRoles.resourceName, // resourceName
    securityResources.securityRoles.permissions.editSecurityRoles, // permission
    'securityRole' // key
);
