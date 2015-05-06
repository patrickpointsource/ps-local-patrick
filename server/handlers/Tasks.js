var logger = services.get('logger');
var acl = services.get('acl');

var _ = require('underscore');
var securityResources = require( '../util/securityResources' );
var sendJson = require('../util/sendJson');

var convertTaskForRestAPI = function(doc){
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
};

var convertTaskForDB = function(access, doc, expectNew){
    var obj = {
        form: access.TASKS_KEY
    };
    if(doc.name){
        obj.name = doc.name;
    }
    if(!expectNew && doc.id){
        obj._id = doc.id;
    }
    if(expectNew){
        obj.created = (new Date()).toString();
    }else if(doc.created){
        obj.created = (new Date(doc.created)).toString();
    }
    return obj;
}

module.exports.getTasks = function(req, res, next){
    var access = services.get('dbAccess');
    var db = access.db;
    // Assess whether the user is allowed to access this resource
    // tasks:viewTasks
    acl.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.viewTasks,

        function( allowed ) {
            if(allowed){
                if(req.query.name){
                    // Use the SearchAllTasks index
                    db.search('Tasks', 'SearchAllTasks', {
                        q: 'name:' + req.query.name + '*',
                        include_docs: true
                    }, function(err, results){
                        var docs = _.map(results.rows, function(row){
                            return convertTaskForRestAPI(row.doc);
                        });
                        sendJson(res, docs);
                    });
                }else{
                    // Use the AllTasks view
                    db.view('Tasks', 'AllTasks', function(err, allTasks){
                        if(err){
                            return res.json(500);
                        }
                        var docs = _.map(allTasks.rows, function(row){
                            return convertTaskForRestAPI(row.value);
                        });
                        sendJson(res, docs);
                    });
                }
            }
        });
};

module.exports.createSingleTask = function(req, res, next){
    var access = services.get('dbAccess');
    var db = access.db;
    acl.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.editTasks,
        
        function(allowed){
            if(allowed){

                var objToPost = convertTaskForDB(access, req.body, true);
                db.insert(objToPost, function(err, doc){
                    if(err){
                        return sendJson(res, {'message': 'Error occurred while creating document.'}, 500);
                    }
                    
                    db.get(doc.id, function(err, doc){
                        if(err){
                            return sendJson(res, {'message': 'Error occurred while retrieving newly created document.'}, 500);
                        }
                        sendJson(res, convertTaskForRestAPI(doc));
                    });
                });
            }
        });
};

module.exports.getSingleTask = function(req, res, next){
    var access = services.get('dbAccess');
    var db = access.db;
    acl.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.viewTasks,

        function( allowed ) {
            if(allowed){
                var docID = req.params.id;
                db.get(docID, function(err, doc){
                    if(err || !doc){
                        return sendJson(res, {'message': 'A task with the specified ID could not be found.'}, 404);
                    }
                    sendJson(res, convertTaskForRestAPI(doc));
                });
            }
        });
};

module.exports.updateSingleTask = function(req, res, next){
    var access = services.get('dbAccess');
    var db = access.db;
    acl.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.editTasks,
        
        function(allowed){
            if(allowed){
                var docID = req.params.id;
                var objToPost = convertTaskForDB(access, req.body, true);
                
                // Retrieve the existing doc by ID in order to get the current _rev
                db.get(docID, function(err, doc){
                    if(err){
                        return sendJson(res, {'message': 'A task with the specified ID could not be found.'}, 404);
                    }

                    // Put the _rev of the current doc on our data to insert
                    objToPost._rev = doc._rev;
                    db.insert(objToPost, docID, function(err, doc){
                        if(err){
                            return sendJson(res, {'message': 'Error occurred while updating document.'}, 500);
                        }
                        
                        // Retrieve the current state of the doc to accurately reflect what's in the DB
                        db.get(docID, function(err, doc){
                            if(err){
                                return sendJson(res, {'message': 'Error occurred while retrieving newly updated document.'}, 500);
                            }
                            sendJson(res, convertTaskForRestAPI(doc));
                        });
                    });
                });
            }
        });
};

module.exports.deleteSingleTask = function(req, res, next){
    var access = services.get('dbAccess');
    var db = access.db;
    acl.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.editTasks,
        
        function(allowed){
            if(allowed){
                var docID = req.params.id;
                db.get(docID, function(err, doc){
                    if(err){
                        return sendJson(res, {'message': 'A task with the specified ID could not be found.'}, 404);
                    }
                    db.destroy(docID, doc._rev, function(err){
                        if(err){
                            return sendJson(res, {'message': 'Error occurred while deleting document.'}, 500);
                        }
                        res.status(200);
                        res.end();
                    });
                });
            }
        });
};
