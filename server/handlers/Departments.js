var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var department = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['nickname', 'category', 'code', 'manager', 'people']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.DEPARTMENTS_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['nickname', 'category', 'code', 'manager', 'people']);
        return obj;
    }
};

module.exports.getDepartments = util.generateCollectionGetHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.viewDepartments, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        /*jshint camelcase: false */
        var q = '';
        if(req.query.code){
            q = util.addToQuery(q, 'code:'+req.query.code);
        }
        if(req.query.nickname){
            q = util.addToQuery(q, 'nickname:'+req.query.nickname);
        }
        if(req.query.manager){
            q = util.addToQuery(q, 'manager:'+req.query.manager);
        }
        if(q.length){
            // Use the SearchAllDepartments index
            db.search('Departments', 'SearchAllDepartments', {
                q: q,
                include_docs: true
            }, function(err, results){
                callback(results.rows);
            });
            return;
        }
        callback(false);
    },
    'Departments', // ddoc
    'AllDepartments', // allDocsViewName
    department.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleDepartment = util.generateSingleItemCreateHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.editDepartments, // permission
    'department', // key
    null, // validate
    department.convertForDB, // convertForDB
    department.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleDepartment = util.generateSingleItemGetHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.viewDepartments, // permission
    'department', // key
    department.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleDepartment = util.generateSingleItemUpdateHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.editDepartments, // permission
    'department', // key
    null, // validate
    department.convertForDB, // convertForDB
    department.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleDepartment = util.generateSingleItemDeleteHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.deleteDepartments, // permission
    'department' // key
);
