var winston = require('winston');
var _ = require('underscore');
var access = require('../dbAccess');
var db = access.db;

var security = require( '../../util/security' );
var securityResources = require( '../../util/securityResources' );

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

var convertTaskForDB = function(doc, expectNew){
    var obj = {
        form: access.TASKS_KEY
    };
    if(doc.name){
        obj.name = doc.name;
    }
    if(!expectNew && doc.id){
        obj._id = doc.id;
    }
    return obj;
}

module.exports.get = function(req, res, next){
    // Assess whether the user is allowed to access this resource
    // tasks:viewTasks
    security.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.viewTasks,

        function( allowed ) {
            if(allowed){
                if(req.swagger.params.name.value){
                    // Use the SearchAllTasks index
                    db.search('Tasks', 'SearchAllTasks', {
                        q: 'name:' + req.swagger.params.name.value + '*',
                        include_docs: true
                    }, function(err, results){
                        var docs = _.map(results.rows, function(row){
                            return convertTaskForRestAPI(row.doc);
                        });
                        access.sendJson(res, docs);
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
                        access.sendJson(res, docs);
                    });
                }
            }
        });
};

module.exports.post = function(req, res, next){
    security.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.editTasks,
        
        function(allowed){
            if(allowed){

                var objToPost = convertTaskForDB(req.swagger.params.task.value, true);
                db.insert(objToPost, function(err, doc){
                    if(err){
                        return access.sendJson(res, {'message': 'Error occurred while creating document.'}, 500);
                    }
                    winston.debug('did insert?', err);
                    winston.debug('if not err:', doc);
                    
                    db.get(doc.id, function(err, doc){
                        if(err){
                            return access.sendJson(res, {'message': 'Error occurred while retrieving newly created document.'}, 500);
                        }
                        access.sendJson(res, convertTaskForRestAPI(doc));
                    });
                });
            }
        });
};

module.exports.delete = function(req, res, next){
    security.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.editTasks,
        
        function(allowed){
            if(allowed){
                winston.debug('would delete task?', req.swagger.params.id.value);
                var docID = req.swagger.params.id.value;
                db.get(docID, function(err, doc){
                    if(err){
                        return access.sendJson(res, {'message': 'A task with the specified ID could not be found.'}, 404);
                    }
                    db.destroy(docID, doc._rev, function(err){
                        if(err){
                            return access.sendJson(res, {'message': 'Error occurred while deleting document.'}, 500);
                        }
                        res.status(200);
                        res.end();
                    });
                });
            }
        });
}

module.exports.getSingleTask = function(req, res, next){
    security.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.viewTasks,

        function( allowed ) {
            if(allowed){
                var docID = req.swagger.params.id.value;
                db.get(docID, function(err, doc){
                    if(err){
                        return access.sendJson(res, {'message': 'A task with the specified ID could not be found.'}, 404);
                    }
                    access.sendJson(res, convertTaskForRestAPI(doc));
                });
            }
        });
}

module.exports.put = function(req, res, next){
    security.isAllowed(
        req.user,
        res,
        securityResources.tasks.resourceName,
        securityResources.tasks.permissions.editTasks,
        
        function(allowed){
            if(allowed){
                var docID = req.swagger.params.id.value;
                var objToPost = convertTaskForDB(req.swagger.params.task.value, true);
                
                // Retrieve the existing doc by ID in order to get the current _rev
                db.get(docID, function(err, doc){
                    if(err){
                        return access.sendJson(res, {'message': 'A task with the specified ID could not be found.'}, 404);
                    }

                    // Put the _rev of the current doc on our data to insert
                    objToPost._rev = doc._rev;
                    db.insert(objToPost, docID, function(err, doc){
                        if(err){
                            return access.sendJson(res, {'message': 'Error occurred while updating document.'}, 500);
                        }
                        
                        // Retrieve the current state of the doc to accurately reflect what's in the DB
                        db.get(docID, function(err, doc){
                            if(err){
                                return access.sendJson(res, {'message': 'Error occurred while retrieving newly created document.'}, 500);
                            }
                            access.sendJson(res, convertTaskForRestAPI(doc));
                        });
                    });
                });
            }
        });
}