var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

// TODO: adjust permissions based on logged-in user

var people = {
    convertForRestAPI: function(access, doc){
        var obj = {};
        util.map(doc, obj, {
            '_id': 'id'
        });
        util.mapStraight(doc, obj, ['accounts', 'googleId', 'groups', 'isActive', 'jazzHubId', 'lastSynchronized', 'mBox', 'manager', 'name', 'phone', 'primaryRole', 'skypeId', 'thumbnail', 'vacationCapacity', 'skills', 'jobTitle', 'secondaryRoles', 'partTimeHours', 'partTime']);
        return obj;
    },
    convertForDB: function(access, doc, expectNew){
        var obj = {
            form: access.PEOPLE_KEY
        };
        util.map(doc, obj, {
            'id': '_id'
        });
        util.mapStraight(doc, obj, ['accounts', 'googleId', 'groups', 'isActive', 'jazzHubId', 'lastSynchronized', 'mBox', 'manager', 'name', 'phone', 'primaryRole', 'skypeId', 'thumbnail', 'vacationCapacity', 'skills', 'jobTitle', 'secondaryRoles', 'partTimeHours', 'partTime']);
        return obj;
    },
    validatePerson: function(obj, access, callback){
        // Check obj for invalid fields
        // Note that spec-related validation has (theoretically) already occurred 
        
        // TODO:
        // primaryRole, secondaryRoles, skills
        async.parallel([
            function(callback){
                var roles = [];
                if(obj.primaryRole){
                    roles.push(obj.primaryRole);
                }
                if(obj.secondaryRoles && obj.secondaryRoles.length){
                    roles = roles.concat(obj.secondaryRoles);
                }
                if(roles.length == 0){
                    return callback();
                }
                access.db.view('Roles', 'AllRoleTitles', { keys: roles }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length !== roles.length){
                        return callback('One of the indicated roles doesn\'t exist.');
                    }
                    callback();
                });
            },
            function(callback){
                var skills = [];
                if(obj.skills && obj.skills.length){
                    _.each(obj.skills, function(skill){
                        skills.push(skill.type);
                    });
                }
                if(skills.length === 0){
                    return callback();
                }
                access.db.view('Skills', 'AllSkillTitles', { keys: skills }, function(err, docs){
                    if(err){
                        return callback(err);
                    }
                    if(docs.rows.length !== skills.length){
                        return callback('One of the indicated skills doesn\'t exist.');
                    }
                    callback();
                });
            },
        ], callback);
    }
};

module.exports.getPeople = util.generateCollectionGetHandler(
    securityResources.people.resourceName, // resourceName
    securityResources.people.permissions.viewPeople, // permission
    function(req, db, callback){ // doSearchIfNeededCallback
        // TODO: 
        // hasAssignment
        // hasCurrentAssignment
        // departmentCategories
        // sameAssignmentAs
        var q = '';
        if(req.query.primaryRole){
            q = util.addToQuery(q, 'primaryRole:'+req.query.primaryRole);
        }
        var toAdd;
        if(req.query.roles && req.query.roles.length){
            var roles = req.query.roles.split(',');
            if(roles.length > 1){
                toAdd = '(primaryRole:('+roles.join(' OR ')+') OR secondaryRoles:('+roles.join(' OR ')+'))';
            }else{
                toAdd = '(primaryRole:'+roles[0]+' OR secondaryRoles:'+roles[0]+')';
            }
            q = util.addToQuery(q, toAdd);
        }
        if(req.query.isActive !== undefined){
            q = util.addToQuery(q, 'isActive:'+req.query.isActive);
        }
        if(q.length){
            // Use the SearchAllPeople index
            db.search('People', 'SearchAllPeople', {
                q: q,
                include_docs: true
            }, function(err, results){
                callback(results.rows);
            });
            return;
        }
        callback(false);
    },
    'People', // ddoc
    'AllPeople', // allDocsViewName
    people.convertForRestAPI //convertForRestAPI
);

module.exports.createSinglePerson = util.generateSingleItemCreateHandler(
    securityResources.people.resourceName, // resourceName
    securityResources.people.permissions.editProfile, // permission
    'person', // key
    people.validatePerson, // validate
    people.convertForDB, // convertForDB
    people.convertForRestAPI // convertForRestAPI
);

module.exports.getSinglePerson = util.generateSingleItemGetHandler(
    securityResources.people.resourceName, // resourceName
    securityResources.people.permissions.viewPeople, // permission
    'person', // key 
    people.convertForRestAPI, // convertForRestAPI
    function(doc, callback){
        var acl = services.get('acl');
        acl.allAllowedPermissions(doc.googleId, function(err, permissions){
            doc.permissions = permissions;
            callback(doc);
        });
    }
);

module.exports.updateSinglePerson = util.generateSingleItemUpdateHandler(
    securityResources.people.resourceName, // resourceName
    securityResources.people.permissions.editProfile, // permission
    'person', // key
    people.validatePerson, // validate
    people.convertForDB, // convertForDB
    people.convertForRestAPI // convertForRestAPI
);

module.exports.deleteSinglePerson = util.generateSingleItemDeleteHandler(
    securityResources.people.resourceName, // resourceName
    securityResources.people.permissions.editProfile, // permission
    'person' // key
);

module.exports.getSinglePersonByGoogleID = function(req, res, next){
    var acl = services.get('acl');
    var access = services.get('dbAccess');
    var db = access.db;
    util.doAcl(
        req,
        res,
        securityResources.people.resourceName,
        securityResources.people.permissions.viewProfile, 
        function(allowed){
            if(allowed){
                var googleID = req.params.id;
                access.db.view('People', 'AllPeopleByGoogleId', { keys: [googleID] }, function(err, docs){
                    if(err){
                        return sendJson(res, {'message': 'An error occurred attempting to find a person with the specified Google ID.', 'detail': err}, 500);
                    }
                    if(docs.rows.length === 0){
                        return sendJson(res, {'message': 'A person with the specified Google ID could not be found.', 'detail': err}, 404);
                    }
                    
                    db.get(docs.rows[0].id, function(err, doc){
                        if(err && err.message != 'missing'){
                            return sendJson(res, {'message': 'An error occurred attempting to find a person with the specified Google ID.', 'detail': err}, 500);
                        }
                        if(!doc){
                            return sendJson(res, {'message': 'A person with the specified Google ID could not be found.', 'detail': err}, 404);
                        }
                        sendJson(res, people.convertForRestAPI(access, doc));
                    });
                });
            }
    });
};

module.exports.getSinglePersonLoggedIn = function(req, res, next){
    var acl = services.get('acl');
    var access = services.get('dbAccess');
    var db = access.db;
    util.doAcl(
        req,
        res,
        securityResources.people.resourceName,
        securityResources.people.permissions.viewMyProfile, 
        function(allowed){
            if(allowed){
                var googleID = req.user.id;
                access.db.view('People', 'AllPeopleByGoogleId', { keys: [googleID] }, function(err, docs){
                    if(err){
                        return sendJson(res, {'message': 'An error occurred attempting to find the logged in person.', 'detail': err}, 500);
                    }
                    if(docs.rows.length === 0){
                        return sendJson(res, {'message': 'The logged in person could not be found.', 'detail': err}, 404);
                    }
                    
                    db.get(docs.rows[0].id, function(err, doc){
                        if(err && err.message != 'missing'){
                            return sendJson(res, {'message': 'An error occurred attempting to find the logged in person.', 'detail': err}, 500);
                        }
                        if(!doc){
                            return sendJson(res, {'message': 'The logged in person could not be found.', 'detail': err}, 404);
                        }
                        sendJson(res, people.convertForRestAPI(access, doc));
                    });
                });
            }
    });
};

module.exports.getManagerOfPerson = function(req, res, next){
    var acl = services.get('acl');
    var access = services.get('dbAccess');
    var db = access.db;
    util.doAcl(
        req,
        res,
        securityResources.people.resourceName,
        securityResources.people.permissions.viewProfile, 
        function(allowed){
            if(allowed){
                var id = req.params.id;
                db.get(id, function(err, doc){
                    if(err && err.message != 'missing'){
                        return sendJson(res, {'message': 'An error occurred attempting to find a person with the specified ID.', 'detail': err}, 500);
                    }
                    if(!doc){
                        return sendJson(res, {'message': 'A person with the specified ID could not be found.', 'detail': err}, 404);
                    }
                    if(!doc.manager){
                        // The user doesn't have a manager
                        return sendJson(res, {}, 200);
                    }
                    var managerID = doc.manager.resource.replace('people/', '');
                    db.get(managerID, function(err, doc){
                        if(err && err.message != 'missing'){
                            return sendJson(res, {'message': 'An error occurred attempting to find a person (the manager) with the specified ID.', 'detail': err}, 500);
                        }
                        if(!doc){
                            return sendJson(res, {'message': 'A person (the manager) with the specified ID could not be found.', 'detail': err}, 404);
                        }
                        sendJson(res, people.convertForRestAPI(access, doc));
                    });
                });
            }
    });
};

module.exports.getAccessRightsOfPerson = function(req, res, next){
    var acl = services.get('acl');
    var access = services.get('dbAccess');
    var db = access.db;
    util.doAcl(
        req,
        res,
        securityResources.people.resourceName,
        securityResources.people.permissions.viewProfile, 
        function(allowed){
            if(allowed){
                var personService = services.get('person');
                personService.getPersonAccessRights(req.params.id, function(err, accessRights){
                    if(err){
                        return sendJson(res, {'message': 'An error occurred attempting to determine the access rights.', 'detail': err}, 500);
                    }
                    return sendJson(res, accessRights);
                });
            }
    });
};

module.exports.getGoogleProfileOfPerson = function(req, res, next){
    var acl = services.get('acl');
    var access = services.get('dbAccess');
    var db = access.db;
    util.doAcl(
        req,
        res,
        securityResources.people.resourceName,
        securityResources.people.permissions.viewProfile, 
        function(allowed){
            if(allowed){
                var id = req.params.id;
                db.get(id, function(err, doc){
                    if(err && err.message != 'missing'){
                        return sendJson(res, {'message': 'An error occurred attempting to find a person with the specified ID.', 'detail': err}, 500);
                    }
                    if(!doc){
                        return sendJson(res, {'message': 'A person with the specified ID could not be found.', 'detail': err}, 404);
                    }
                    var googleID = doc.googleId;
                    
                    var personService = services.get('person');
                    personService.getPersonGoogleProfile(googleID, function(err, accessRights){
                        if(err){
                            return sendJson(res, {'message': 'An error occurred attempting to determine the access rights.', 'detail': err}, 500);
                        }
                        return sendJson(res, accessRights);
                    });
                });
            }
    });
};