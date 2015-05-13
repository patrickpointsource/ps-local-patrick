var _ = require('underscore');
var securityResources = require( '../util/securityResources' );
var sendJson = require('../util/sendJson');
var util = require('../util/restUtils');

var task = {
    convertForRestAPI: function(access, doc){
        var obj = {
            id: doc._id,
            name: doc.name,
        };
        if(doc.created){
            var created = new Date(doc.created);
            if(created){
                obj.created = created.toISOString();
            }
        }
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.TASKS_KEY
        };
        if(doc.name){
            obj.name = doc.name;
        }
        if(!expectNew && doc.id){
            obj._id = doc.id;
        }
        obj.created = (expectNew ? (new Date()) : (new Date(doc.created))).toString();
        return obj;
    }
};

module.exports.getTasks = util.generateCollectionGetHandler(
    securityResources.tasks.resourceName, // resourceName
    securityResources.tasks.permissions.viewTasks, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        if(req.query.name){
            // Use the SearchAllProjects index
            db.search('Tasks', 'SearchAllTasks', {
                q: 'name:' + req.query.name + '*',
                include_docs: true
            }, function(err, results){
                callback(results.rows);
            });
            return;
        }
        callback(false);
    },
    'Tasks', // ddoc
    'AllTasks', // allDocsViewName
    task.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleTask = util.generateSingleItemCreateHandler(
    securityResources.tasks.resourceName, // resourceName
    securityResources.tasks.permissions.editTasks, // permission
    'task', // key
    null, // validate
    task.convertForDB, // convertForDB
    task.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleTask = util.generateSingleItemGetHandler(
    securityResources.tasks.resourceName, // resourceName
    securityResources.tasks.permissions.viewTasks, // permission
    'task', // key 
    task.convertForRestAPI // convertForRestAPI
);

module.exports.updateSingleTask = util.generateSingleItemUpdateHandler(
    securityResources.tasks.resourceName, // resourceName
    securityResources.tasks.permissions.editTasks, // permission
    'task', // key
    null, // validate
    task.convertForDB, // convertForDB
    task.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleTask = util.generateSingleItemDeleteHandler(
    securityResources.tasks.resourceName, // resourceName
    securityResources.tasks.permissions.editTasks, // permission
    'task' // key
);
