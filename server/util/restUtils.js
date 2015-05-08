var _ = require('underscore');
var sendJson = require('../util/sendJson');

var FOR_DB = module.exports.FOR_DB = 'in';
var FOR_REST = module.exports.FOR_REST = 'out'

// Map a set of fields straight from `doc` to `out`, if they exist on `doc`
module.exports.mapStraight = function(doc, out, fields){
    if(!_.isArray(fields)){
        fields = [fields];
    }
    _.each(fields, function(key){
        if(doc[key]){
            out[key] = doc[key];
        }
    });
};

// Map a set of fields, while possibly renaming the key, from `doc` to `out`
module.exports.map = function(doc, out, fields){
    if(!_.isObject(fields)){
        return;
    }
    _.each(fields, function(value, key){
        if(doc[key]){
            out[value] = doc[key];
        }
    });
};

// Map a set of fields as dates, putting them in the right format for the given direction
module.exports.mapStraightDates = function(direction, doc, out, fields){
    if(!_.isArray(fields)){
        fields = [fields];
    }
    
    if(direction === FOR_DB){
        // From REST to database
        _.each(fields, function(key){
            if(doc[key]){
                var d = new Date(doc[key]);
                if(d){
                    out[key] = d.toString();
                }
            }
        });
    }else if(direction === FOR_REST){
        // From database to REST
        _.each(fields, function(key){
            if(doc[key]){
                var d = new Date(doc[key]);
                if(d){
                    out[key] = d.toISOString();
                }
            }
        });
    }
};

// Map a set of fields as resources, stripping or adding key+'/' depending on the direction
module.exports.mapResources = function(direction, doc, out, fields, replacementKey){
    if(!_.isArray(fields)){
        fields = [fields];
    }

    if(direction === FOR_DB){
        // From REST to database
        _.each(fields, function(key){
            if(doc[key]){
                out[key] = {
                    resource: key.toLowerCase()+'/'+doc[key]
                }
            }
        });
    }else if(direction === FOR_REST){
        // From database to REST
        _.each(fields, function(key){
            if(doc[key] && doc[key].resource){
                out[key] = doc[key].resource.replace(replacementKey.toLowerCase()+'/', '');
            }
        });
    }
};

// Generate a REST handler for retrieving a collection
module.exports.generateCollectionGetHandler = function(resourceName, permission, doSearchIfNeededCallback, ddoc, allDocsViewName, convertForRestAPI){

    return function(req, res, next){
        var acl = services.get('acl');
        var access = services.get('dbAccess');
        var db = access.db;
        // Assess whether the user is allowed to access this resource
        acl.isAllowed(
            req.user.id,
            res,
            resourceName,
            permission,

            function( allowed ) {
                if(allowed){
                    doSearchIfNeededCallback(req, db, function(docsFromSearch){
                        if(docsFromSearch){
                            var docs = _.map(docsFromSearch, function(row){
                                return convertForRestAPI(access, row.doc);
                            });
                            sendJson(res, docs);
                        }else{
                            // Use the all documents view
                            db.view(ddoc, allDocsViewName, function(err, allDocs){
                                if(err){
                                    return res.json(500);
                                }
                                var docs = _.map(allDocs.rows, function(row){
                                    return convertForRestAPI(access, row.value);
                                });
                                sendJson(res, docs);
                            });
                        }
                    });
                }
            });
    };

};

module.exports.generateSingleItemGetHandler = function(resourceName, permission, key, convertForRestAPI){

    return function(req, res, next){
        var acl = services.get('acl');
        var access = services.get('dbAccess');
        var db = access.db;
        acl.isAllowed(
            req.user.id,
            res,
            resourceName,
            permission,

            function( allowed ) {
                if(allowed){
                    var docID = req.params.id;
                    db.get(docID, function(err, doc){
                        if(err || !doc){
                            return sendJson(res, {'message': 'A '+key+' with the specified ID could not be found.'}, 404);
                        }
                        sendJson(res, convertForRestAPI(access, doc));
                    });
                }
            });
    };

};

module.exports.generateSingleItemCreateHandler = function(resourceName, permission, key, validate, convertForDB, convertForRestAPI){

    return function(req, res, next){
        var acl = services.get('acl');
        var access = services.get('dbAccess');
        var db = access.db;
        acl.isAllowed(
            req.user.id,
            res,
            resourceName,
            permission,
            
            function(allowed){
                if(allowed){

                    var objToPost = convertForDB(access, req.body, true);
                    var proceed = function(){
                        db.insert(objToPost, function(err, doc){
                            if(err){
                                return sendJson(res, {'message': 'Error occurred while creating '+key+'.'}, 500);
                            }
                            
                            db.get(doc.id, function(err, doc){
                                if(err){
                                    return sendJson(res, {'message': 'Error occurred while retrieving newly created '+key+'.'}, 500);
                                }
                                sendJson(res, convertForRestAPI(access, doc));
                            });
                        });
                    };

                    var err;
                    if(validate){
                        validate(req.body, access, function(err){
                            if(err){
                                return sendJson(res, {'message': err}, 400);
                            }
                            proceed();
                        });
                    }else{
                        proceed();
                    }
                }
            });
    };

};

module.exports.generateSingleItemUpdateHandler = function(resourceName, permission, key, validate, convertForDB, convertForRestAPI){

    return function(req, res, next){
        var acl = services.get('acl');
        var access = services.get('dbAccess');
        var db = access.db;
        acl.isAllowed(
            req.user.id,
            res,
            resourceName,
            permission,
            
            function(allowed){
                if(allowed){
                    var docID = req.params.id;
                    var objToPost = convertForDB(access, req.body, true);

                    var proceed = function(){
                        // Retrieve the existing doc by ID in order to get the current _rev
                        db.get(docID, function(err, doc){
                            if(err){
                                return sendJson(res, {'message': 'A '+key+' with the specified ID could not be found.'}, 404);
                            }

                            // Put the _rev of the current doc on our data to insert
                            objToPost._rev = doc._rev;
                            db.insert(objToPost, docID, function(err, doc){
                                if(err){
                                    return sendJson(res, {'message': 'Error occurred while updating '+key+'.'}, 500);
                                }
                                
                                // Retrieve the current state of the doc to accurately reflect what's in the DB
                                db.get(docID, function(err, doc){
                                    if(err){
                                        return sendJson(res, {'message': 'Error occurred while retrieving newly updated '+key+'.'}, 500);
                                    }
                                    sendJson(res, convertForRestAPI(access, doc));
                                });
                            });
                        });
                    };

                    var err;
                    if(validate){
                        validate(req.body, access, function(err){
                            if(err){
                                return sendJson(res, {'message': err}, 400);
                            }
                            proceed();
                        });
                    }else{
                        proceed();
                    }
                }
            });
    };

};

module.exports.generateSingleItemDeleteHandler = function(resourceName, permission, key){

    return function(req, res, next){
        var acl = services.get('acl');
        var access = services.get('dbAccess');
        var db = access.db;
        acl.isAllowed(
            req.user.id,
            res,
            resourceName,
            permission,
            
            function(allowed){
                if(allowed){
                    var docID = req.params.id;
                    db.get(docID, function(err, doc){
                        if(err){
                            return sendJson(res, {'message': 'A '+key+' with the specified ID could not be found.'}, 404);
                        }
                        db.destroy(docID, doc._rev, function(err){
                            if(err){
                                return sendJson(res, {'message': 'Error occurred while deleting '+key+'.'}, 500);
                            }
                            res.status(200);
                            res.end();
                        });
                    });
                }
            });
    };

};