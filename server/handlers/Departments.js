var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var department = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id',
            'departmentNickname': 'nickname'
        });
        if(doc.departmentCategory && doc.departmentCategory.resource){
            obj.category = doc.departmentCategory.resource.replace('departmentcategories/', '');
        }
        if(doc.departmentCode && doc.departmentCode.name){
            obj.code = doc.departmentCode.name;
        }
        if(doc.departmentManager && doc.departmentManager.resource){
            obj.manager = doc.departmentManager.resource.replace('people/', '');
        }
        if(doc.departmentPeople){
            obj.people = [];
            _.each(doc.departmentPeople, function(person){
                obj.people.push(person.replace('people/', ''));
            });
        }
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.DEPARTMENTS_KEY
        };
        util.map(doc, obj, {
            'id': '_id',
            'nickname': 'departmentNickname'
        });
        if(doc.category){
            obj.departmentCategory = {
                resource: 'departmentcategories/'+doc.category
            };
        }
        if(doc.code){
            obj.departmentCode = {
                name: doc.code
            };
        }
        if(doc.manager){
            obj.departmentManager = {
                resource: 'people/'+doc.manager
            };
        }
        if(doc.people){
            obj.people = [];
            _.each(doc.people, function(person){
                obj.people.push('people/'+person);
            });
        }
        return obj;
    }
};

module.exports.getDepartments = util.generateCollectionGetHandler(
    securityResources.departments.resourceName, // resourceName
    securityResources.departments.permissions.viewDepartments, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
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
