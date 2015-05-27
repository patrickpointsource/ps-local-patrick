var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var holiday = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['name', 'date']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.HOLIDAYS_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['name', 'date']);
        return obj;
    }
};

module.exports.getHolidays = util.generateCollectionGetHandler(
    securityResources.holidays.resourceName, // resourceName
    securityResources.holidays.permissions.viewHolidays, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        // No searching in Holidays
        callback(false);
    },
    'Holidays', // ddoc
    'AllHolidays', // allDocsViewName
    holiday.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleHoliday = util.generateSingleItemCreateHandler(
    securityResources.holidays.resourceName, // resourceName
    securityResources.holidays.permissions.editHolidays, // permission
    'holiday', // key
    null, // validate
    holiday.convertForDB, // convertForDB
    holiday.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleHoliday = util.generateSingleItemGetHandler(
    securityResources.holidays.resourceName, // resourceName
    securityResources.holidays.permissions.viewHolidays, // permission
    'holiday', // key 
    holiday.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleHoliday = util.generateSingleItemUpdateHandler(
    securityResources.holidays.resourceName, // resourceName
    securityResources.holidays.permissions.editHolidays, // permission
    'holiday', // key
    null, // validate
    holiday.convertForDB, // convertForDB
    holiday.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleHoliday = util.generateSingleItemDeleteHandler(
    securityResources.holidays.resourceName, // resourceName
    securityResources.holidays.permissions.editHolidays, // permission
    'holiday' // key
);
