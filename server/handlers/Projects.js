var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

var project = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['name', 'committed', 'customerName', 'description', 'primaryContact', 'state',
                                    'type', 'terms', 'executiveSponsor', 'salesSponsor']);
        util.mapStraightDates(util.FOR_REST, doc, obj, ['initStartDate', 'initEndDate', 'startDate', 'endDate']);

        if(obj.description){
            obj.description = decodeURIComponent(obj.description);
        }
        if(doc.created){
            obj.created = {};
            if(doc.created.date){
                var created = new Date(doc.created.date);
                if(created){
                    obj.created.date = created.toISOString();
                }
            }
            if(doc.created.by){
                obj.created.by = doc.created.by;
            }
        }
        if(doc.modified){
            obj.modified = {};
            if(doc.modified.date){
                var modified = new Date(doc.modified.date);
                if(modified){
                    obj.modified.date = modified.toISOString();
                }
            }
            if(doc.modified.by){
                obj.modified.by = doc.modified.by;
            }
        }
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.PROJECTS_KEY
        };
        if(!expectNew){
            util.map(doc, obj, {
                'id': '_id'
            });
        }
        util.mapStraight(doc, obj, ['name', 'committed', 'customerName', 'description', 'primaryContact', 'state',
                                    'type', 'terms', 'executiveSponsor', 'salesSponsor']);
        util.mapStraightDates(util.FOR_DB, doc, obj, ['initStartDate', 'initEndDate', 'startDate', 'endDate']);

        if(doc.description){
            obj.description = encodeURIComponent(doc.description);
        }

        if(!obj.created){
            obj.created = {};
        }
        if(expectNew){
            obj.created.date = (new Date()).toString();
        }else if(doc.created && doc.created.date){
            obj.created.date = (new Date(doc.created.date)).toString();
        }
        if(doc.created && doc.created.by){
            obj.created.by = doc.created.by;
        }
        if(!obj.modified){
            obj.modified = {};
        }
        obj.modified.date = (new Date()).toString();
        // TODO: Make this be the current user!
        obj.modified.by = '';
        return obj;
    },
    validateProject: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has already occurred
        // (required fields are present, values are limited to those from an enum, etc.)
        // The intention of this validation function is to check for things that are more specific than
        // the spec can check for. In the case of projects, for example, we should make sure that the
        // ID specified for executiveSponsor is an actual / proper ID

        async.parallel([
            function(callback){
                // We can assume executiveSponsor is available since the spec requires it
                var keysToFind = 0;
                if(obj.executiveSponsor){
                    keysToFind.push(obj.executiveSponsor);
                }
                if(obj.salesSponsor){
                    keysToFind.push(obj.salesSponsor);
                }
                if(keysToFind.length === 0){
                    return callback();
                }
                access.db.view('People', 'AllPeopleNames', { keys: keysToFind }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length !== keysToFind.length){
                        // The executiveSponsor doesn't exist
                        return callback('The indicated salesSponsor or executiveSponsor doesn\'t exist.');
                    }

                    callback();
                });
            },
            function(callback){
                access.db.view('ProjectPhases', 'AllProjectPhaseNames', { keys: obj.phases }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length !== obj.phases.length){
                        // One of the phases doesn't exist
                        return callback('One of the indicated phases doesn\'t exist.');
                    }

                    callback();
                });
            }
        ], callback);

    }
};

module.exports.getProjects = util.generateCollectionGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    function(req, res, db, callback){ // doSearchIfNeededCallback
        /*jshint camelcase: false */
        var q = '';
        if(req.query.startingAfter){
            q = util.addToQuery(q, 'numericStartDate:['+req.query.startingAfter.replace(/-/g, '')+' TO Infinity]');
        }
        if(req.query.endingBefore){
            q = util.addToQuery(q, 'numericEndDate:[-Infinity TO '+req.query.endingBefore.replace(/-/g, '')+']');
        }
        if(req.query.startingBefore){
            q = util.addToQuery(q, 'numericStartDate:[-Infinity TO '+req.query.startingBefore.replace(/-/g, '')+']');
        }
        if(req.query.endingAfter){
            q = util.addToQuery(q, 'numericEndDate:['+req.query.endingAfter.replace(/-/g, '')+' TO Infinity]');
        }
        var toAdd;
        if(req.query.types && req.query.types.length){
            var types = req.query.types.split(',');
            if(types.length > 1){
                toAdd = 'type:('+types.join(' OR ')+')';
            }else{
                toAdd = 'type:'+types[0];
            }
            q = util.addToQuery(q, toAdd);
        }
        if(req.query.committed !== undefined){
            q = util.addToQuery(q, 'committed:'+req.query.committed);
        }
        if(req.query.ids && req.query.ids.length){
            var ids = req.query.ids.split(',');
            if(ids.length > 1){
                toAdd = 'id:('+ids.join(' OR ')+')';
            }else{
                toAdd = 'id:'+ids[0];
            }
            q = util.addToQuery(q, toAdd);
        }
        if(req.query.executiveSponsor){
            q = util.addToQuery(q, 'executiveSponsor:'+req.query.executiveSponsor);
        }
        if(q.length){
            // Use the SearchAllProjects index
            db.search('Projects', 'SearchAllProjects', {
                q: q,
                include_docs: true
            }, function(err, results){
                if(err || !results){
                    return sendJson(res, {'message': 'Could not search Projects.', 'detail': err}, 500);
                }
                callback(results.rows);
            });
            return;
        }
        callback(false);
    },
    'Projects', // ddoc
    'AllProjects', // allDocsViewName
    project.convertForRestAPI //convertForRestAPI
);

module.exports.createSingleProject = util.generateSingleItemCreateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.addProjects, // permission
    'project', // key
    project.validateProject, // validate
    project.convertForDB, // convertForDB
    project.convertForRestAPI // convertForRestAPI
);

module.exports.getSingleProject = util.generateSingleItemGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    'project', // key
    project.convertForRestAPI //convertForRestAPI
);

module.exports.updateSingleProject = util.generateSingleItemUpdateHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.editProjects, // permission
    'project', // key
    project.validateProject, // validate
    project.convertForDB, // convertForDB
    project.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSingleProject = util.generateSingleItemDeleteHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.deleteProjects, // permission
    'project' // key
);
