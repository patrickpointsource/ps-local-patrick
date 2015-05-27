var _ = require('underscore'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var role = {
    convertForRestAPI: function(access, doc){
        var obj = {
            id: doc._id,
            name: doc.title
        };
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.ROLES_KEY
        };
        if(doc.title){
            obj.title = doc.title;
        }
        if(!expectNew && doc.id){
            obj._id = doc.id;
        }
        return obj;
    }
};

module.exports.getRoles = util.generateCollectionGetHandler(
    securityResources.roles.resourceName, // resourceName
    securityResources.roles.permissions.viewRoles, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        // No searching for Roles
        callback(false);
    },
    'Roles', // ddoc
    'AllRoles', // allDocsViewName
    role.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleRole = util.generateSingleItemCreateHandler(
    securityResources.roles.resourceName, // resourceName
    securityResources.roles.permissions.editRoles, // permission
    'role', // key
    null, // validate
    role.convertForDB, // convertForDB
    role.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleRole = util.generateSingleItemGetHandler(
    securityResources.roles.resourceName, // resourceName
    securityResources.roles.permissions.viewRoles, // permission
    'role', // key
    role.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleRole = util.generateSingleItemUpdateHandler(
    securityResources.roles.resourceName, // resourceName
    securityResources.roles.permissions.editRoles, // permission
    'role', // key
    null, // validate
    role.convertForDB, // convertForDB
    role.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleRole = util.generateSingleItemDeleteHandler(
    securityResources.roles.resourceName, // resourceName
    securityResources.roles.permissions.editRoles, // permission
    'role' // key
);
