var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var departmentCategory = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['name', 'trimmedValue', 'nicknames']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.DEPARTMENT_CATEGORY_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['name', 'trimmedValue', 'nicknames']);
        return obj;
    }
};

module.exports.getDepartmentCategories = util.generateCollectionGetHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.viewDepartments, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        // No searching in DepartmentCategories
        callback(false);
    },
    'DepartmentCategories', // ddoc
    'AllDepartmentCategories', // allDocsViewName
    departmentCategory.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleDepartmentCategory = util.generateSingleItemCreateHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.editDepartments, // permission
    'departmentCategory', // key
    null, // validate
    departmentCategory.convertForDB, // convertForDB
    departmentCategory.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleDepartmentCategory = util.generateSingleItemGetHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.viewDepartments, // permission
    'departmentCategory', // key
    departmentCategory.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleDepartmentCategory = util.generateSingleItemUpdateHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.editDepartments, // permission
    'departmentCategory', // key
    null, // validate
    departmentCategory.convertForDB, // convertForDB
    departmentCategory.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleDepartmentCategory = util.generateSingleItemDeleteHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.deleteDepartments, // permission
    'departmentCategory' // key
);
