var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var configuration = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraightDates(util.FOR_REST, doc, obj, 'created');
        util.mapStraight(doc, obj, ['config', 'properties']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.CONFIGURATION_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['config', 'properties']);
        obj.created = (expectNew ? (new Date()) : (new Date(doc.created))).toString();
        return obj;
    }
};

module.exports.getConfigurations = util.generateCollectionGetHandler(
    securityResources.configuration.resourceName, // resourceName
    securityResources.configuration.permissions.viewConfiguration, // permission
    function(req, res, db, callback){ // doSearchIfNeededCallback
        // No searching in Configurations
        callback(false);
    },
    'Configurations', // ddoc
    'AllConfigurations', // allDocsViewName
    configuration.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleConfiguration = util.generateSingleItemCreateHandler(
    securityResources.configuration.resourceName, // resourceName
    securityResources.configuration.permissions.editConfiguration, // permission
    'configuration', // key
    null, // validate
    configuration.convertForDB, // convertForDB
    configuration.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleConfiguration = util.generateSingleItemGetHandler(
    securityResources.configuration.resourceName, // resourceName
    securityResources.configuration.permissions.viewConfiguration, // permission
    'configuration', // key
    configuration.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleConfiguration = util.generateSingleItemUpdateHandler(
    securityResources.configuration.resourceName, // resourceName
    securityResources.configuration.permissions.editConfiguration, // permission
    'configuration', // key
    null, // validate
    configuration.convertForDB, // convertForDB
    configuration.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleConfiguration = util.generateSingleItemDeleteHandler(
    securityResources.configuration.resourceName, // resourceName
    securityResources.configuration.permissions.editConfiguration, // permission
    'configuration' // key
);
