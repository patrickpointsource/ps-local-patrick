var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var client = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['name']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.CLIENTS_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['name']);
        return obj;
    }
};

module.exports.getClients = util.generateCollectionGetHandler(
    securityResources.clients.resourceName, // resourceName
    securityResources.clients.permissions.viewClients, // permission
    function(req, res, db, callback){ // doSearchIfNeededCallback
        // No searching in Clients
        callback(false);
    },
    'Clients', // ddoc
    'AllClients', // allDocsViewName
    client.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleClient = util.generateSingleItemCreateHandler(
    securityResources.clients.resourceName, // resourceName
    securityResources.clients.permissions.editClients, // permission
    'client', // key
    null, // validate
    client.convertForDB, // convertForDB
    client.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleClient = util.generateSingleItemGetHandler(
    securityResources.clients.resourceName, // resourceName
    securityResources.clients.permissions.viewClients, // permission
    'client', // key
    client.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleClient = util.generateSingleItemUpdateHandler(
    securityResources.clients.resourceName, // resourceName
    securityResources.clients.permissions.editClients, // permission
    'client', // key
    null, // validate
    client.convertForDB, // convertForDB
    client.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleClient = util.generateSingleItemDeleteHandler(
    securityResources.clients.resourceName, // resourceName
    securityResources.clients.permissions.editClients, // permission
    'client' // key
);
