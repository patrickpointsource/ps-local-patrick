var logger = services.get('logger');
var acl = services.get('acl');

var _ = require('underscore');
var securityResources = require( '../util/securityResources' );
var sendJson = require('../util/sendJson');
var util = require('../util/restUtils');

var projectRole = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.mapStraight(doc, obj, ['type', 'rate', 'shore', 'isPastRole', 'isFutureRole', 'isCurrentRole', 'percentageCovered', 'hoursExtraCovered', 'hoursNeededToCover', 'daysGap', 'coveredKMin']);
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraightDates(util.FOR_REST, doc, obj, ['startDate', 'endDate']);

        if(obj.type && obj.type.id){
            obj.type.name = obj.type.id;
            delete obj.type.id;
        }
        if(obj.type && obj.type.resource){
            obj.type.id = obj.type.resource.replace(access.ROLES_KEY.toLowerCase()+'/', '');
            delete obj.type.resource;
        }
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {};
        util.mapStraight(doc, obj, ['type', 'rate', 'shore', 'isPastRole', 'isFutureRole', 'isCurrentRole', 'percentageCovered', 'hoursExtraCovered', 'hoursNeededToCover', 'daysGap', 'coveredKMin']);
        if(!expectNew){
            util.map(doc, obj, {
                'id': '_id'
            });
        }
        util.mapStraightDates(util.FOR_DB, doc, obj, ['startDate', 'endDate']);

        if(obj.type && obj.type.id){
            obj.type.resource = access.ROLES_KEY.toLowerCase()+'/'+obj.type.id;
            delete obj.type.id;
        }
        if(obj.type && obj.type.name){
            obj.type.id = obj.type.name;
            delete obj.type.name;
        }
        return obj;
    }
};

var project = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['name', 'committed', 'customerName', 'description', 'primaryContact', 'state', 'type', 'terms']);
        util.mapStraightDates(util.FOR_REST, doc, obj, ['initStartDate', 'initEndDate', 'startDate', 'endDate']);
        util.mapResources(util.FOR_REST, doc, obj, ['executiveSponsor', 'salesSponsor'], access.PEOPLE_KEY);
        
        if(obj.description){
            obj.description = decodeURIComponent(obj.description);
        }
        if(doc.roles && doc.roles.length){
            obj.roles = [];
            _.each(doc.roles, function(role){
                obj.roles.push(projectRole.convertForRestAPI(access, role));
            });
        }
        if(doc.created){
            obj.created = {};
            if(doc.created.date){
                var created = new Date(doc.created.date);
                if(created){
                    obj.created.date = created.toISOString();
                }
            }
            if(doc.created.resource){
                obj.created.by = doc.created.resource.replace(access.PEOPLE_KEY.toLowerCase()+'/', '');
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
            if(doc.modified.resource){
                obj.modified.by = doc.modified.resource.replace(access.PEOPLE_KEY.toLowerCase()+'/', '');
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
        util.mapStraight(doc, obj, ['name', 'committed', 'customerName', 'description', 'primaryContact', 'state', 'type', 'terms']);
        util.mapStraightDates(util.FOR_DB, doc, obj, ['initStartDate', 'initEndDate', 'startDate', 'endDate']);
        util.mapResources(util.FOR_DB, doc, obj, ['executiveSponsor', 'salesSponsor'], access.PEOPLE_KEY);
        
        if(doc.description){
            obj.description = encodeURIComponent(doc.description);
        }
        if(doc.roles && doc.roles.length){
            obj.roles = [];
            _.each(doc.roles, function(role){
                obj.roles.push(projectRole.convertForDB(access, role, expectNew));
            });
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
            obj.created.resource = access.PEOPLE_KEY.toLowerCase()+'/'+doc.created.by;
        }
        if(!obj.modified){
            obj.modified = {};
        }
        obj.modified.date = (new Date()).toString();
        obj.modified.resource = '';
        return obj;
    },
    validateProject: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has already occurred 
        // (required fields are present, values are limited to those from an enum, etc.)
        // The intention of this validation function is to check for things that are more specific than
        // the spec can check for. In the case of projects, for example, we should make sure that the 
        // ID specified for executiveSponsor is an actual / proper ID
        
        // We can assume executiveSponsor is available since the spec requires it
        access.db.view('People', 'AllPeopleNames', { keys: [obj.executiveSponsor] }, function(err, docs){
            if(err){
                return callback(err);
            }
            if(docs.rows.length === 0){
                // The executiveSponsor doesn't exist
                return callback('The indicated executiveSponsor doesn\'t exist.');
            }

            callback();
        });
        
    }
};

module.exports.getProjects = util.generateCollectionGetHandler(
    securityResources.projects.resourceName, // resourceName
    securityResources.projects.permissions.viewProjects, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        
        var q = '';
        if(req.query.startDate){
            if(q.length != 0){
                q += ' AND ';
            }
            q += 'numericStartDate:['+req.query.startDate.replace(/-/g, '')+' TO Infinity]';
        }
        if(req.query.endDate){
            if(q.length != 0){
                q += ' AND ';
            }
            q += 'numericEndDate:[-Infinity TO '+req.query.startDate.replace(/-/g, '')+']';
        }
        if(req.query.types && req.query.types.length){
            var types = req.query.types.split(',');
            if(q.length != 0){
                q += ' AND ';
            }
            if(types.length > 1){
                q += 'type:('+types.join(' OR ')+')';
            }else{
                q += 'type:'+types[0];
            }
        }
        if(req.query.committed != null){
            if(q.length != 0){
                q += ' AND ';
            }
            q += 'committed:'+req.query.committed;
        }
        if(req.query.ids && req.query.ids.length){
            var ids = req.query.ids.split(',');
            if(q.length != 0){
                q += ' AND ';
            }
            if(ids.length > 1){
                q += 'id:('+ids.join(' OR ')+')';
            }else{
                q += 'id:'+ids[0];
            }
        }
        if(req.query.executiveSponsor){
            if(q.length != 0){
                q += ' AND ';
            }
            q += 'executiveSponsor:'+req.query.executiveSponsor;
        }
        if(q.length){
            // Use the SearchAllProjects index
            logger.debug('using q:', q);
            db.search('Projects', 'SearchAllProjects', {
                q: q,
                include_docs: true
            }, function(err, results){
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