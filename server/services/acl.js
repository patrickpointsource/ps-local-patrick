// var dataAccess = require('../data/dataAccess.js');

var ACL = require('acl'),
    q = require('q'),
    async = require('async'),
    _ = require('underscore');

var acl = new ACL(new ACL.memoryBackend());
var _logger;
var _dbAccess;

var DEFAULT_ROLES = {
    EXECUTIVES: 'Execs',
    MANAGEMENT: 'Managers',
    PM: 'PM',
    MINION: 'Employee',
    SALES: 'Sales',
    ADMIN: 'Admin',
    SSA: 'SSA'
};

module.exports.DEFAULT_ROLES = DEFAULT_ROLES;

module.exports.init = function(logger, dbAccess) {
    _logger = logger;
    _dbAccess = dbAccess;
    doInitialization();
};

module.exports.reInit = function(){
    doInitialization(true);
};

module.exports.isAllowed = function(userId, response, resource, permissions, callback, notAllowedCallback, preventNotAllowedInResponse) {

    // acl.allowedPermissions(userId, resource, function(err, permissions){
    //     _logger.info('permissions for', userId, resource, permissions);
    // });

    acl.isAllowed(userId, resource, permissions, function(err, allowed){

        if (err) {
            response.json(500, err);
        } else if (!allowed) {
            if(notAllowedCallback) {
                notAllowedCallback();
            } else {
                callback(false);

                if (!preventNotAllowedInResponse){
                    response.json(401, 'Content ' + resource + ' is not allowed');
                }
            }
        } else {
            callback(true);
        }
    });
};

module.exports.allowedPermissions = function(userId, resources, callback) {
    acl.allowedPermissions(userId, resources, function(err, obj){
        if (err) {
            _logger.info(err);
        }
        callback(err, obj);
    });
};

// false - start up call, true - reinitialization
var doInitialization = function(isReinitialization){
    _logger.info('initialize:Initializing security. Reinitialization: ' + isReinitialization);
    var errStr = [];
    
    // TODO: Assess whether this is needed
    // // to prevent from applying "corrupted" security roles from memory cache - clean memory cache
    // dataAccess.clearCacheForSecurityRoles();

    _dbAccess.executeView('SecurityRoles', 'AllSecurityRoles', function(err, securityRoles){
        if(err || !securityRoles){
            return _logger.error('Error loading security roles', err, securityRoles);
        }
        
        initializeSecurityRoles(securityRoles, isReinitialization, function() {
            /*acl.allowedPermissions("110740462676845328422", "projects", function(err, permissions){
                _logger.info("Daniil allows on project after initSecurityRoles: " + permissions["projects"]);
            });*/
            _dbAccess.executeView('UserRoles', 'AllUserRoles', function(err, userRoles){
                if ( err ) {
                    _logger.info('Initializing security: Error in giving user roles ' + err);
                    return err;
                }
                // var userRoles = roles.members;
                var roleNames;
                var targetRoleIds;
                var i;
                var k;
                var userId;
                var targetUserIds = {};
            
                // build {group}-{userIds} map
                _.each(userRoles, function(userRole){
                    _.each(userRole.roles, function(role){
                        var name = role.name;
                        if(name.toLowerCase() === 'minion'){
                            name = 'Employee';
                        }
                        if(!targetUserIds[name]){
                            targetUserIds[name] = [];
                        }
                        targetUserIds[name].push(userRole.userId);
                    });
                });
            
                var processedGroupsMap = {};
                var userToRolesMap = {};

                var addUserRoleToMap = function(uId, rNameAr) {
                    if (!userToRolesMap[uId]){
                        userToRolesMap[uId] = [];
                    }
                
                    userToRolesMap[uId] = userToRolesMap[uId].concat(rNameAr);
                };

                var targetUsers;
                var t;
            
                // find and process nested groups
                for (i=0; i < userRoles.length; i++) {
                    userId = userRoles[i].userId;

                    roleNames = getRoleNames(userRoles[i].roles);
                    //targetRoleIds = _.map(userRoles[i].roles, function(r) { return r.resource;});
                
                    //_logger.info('\r\nlistUserRoles:' + i + ':' + JSON.stringify(userRoles[i]));
                
                
                    // give permissions to each member of group
                    var groupId = userRoles[i].groupId;
                    var group = _.find(securityRoles, function(r) { return r.resource === groupId; });

                    if (groupId){
                        var roles = userRoles[i].roles;
                  
                        roles = _.filter(roles, function(r) {
                            return r.resource;
                        });

                        roles = _.uniq(roles, function(r) {
                            return r.name;
                        });

                        // build sequence of all nested roles
                        var extractedRoles = [];

                        // add as first element "root" parents of hierarchy - hierarchy works like in roles 
                        // collection are all "mother and fathers" of current userRoles[i] entry
                        extractedRoles.push(_.map(roles, function(r) {
                            return r.name;
                        }));
                  
                        for (k = 0; roles && k < roles.length; k ++) {
                            extractNestedPermissionGroups(roles[k].resource,  [group.name], userRoles, securityRoles, extractedRoles);
                        }
                  
                        // filter duplicates from nested roles - start from the end
                        var j;
                        for (k =  extractedRoles.length - 1; k >= 0; k --) {
                            for (j = 0; j < extractedRoles[k].length; j ++){
                                if (extractedRoles[k][j].toLowerCase() === 'minion'){
                                    extractedRoles[k][j] = 'Employee';
                                }
                            }
                        }
                        for (k = extractedRoles.length - 1; k >= 0; k --) {

                            for (j = (k - 1); j >= 0; j --) {

                                var found = false;
                                // compare each entry which can be array


                                for (t = extractedRoles[j].length - 1; t >= 0; t --) {
                                    for (var l = extractedRoles[k].length - 1; l >= 0; l --) {
                                        if (extractedRoles[k][l] === extractedRoles[j][t]) {
                                            extractedRoles[k].splice(l, 1);
                                        }
                                    }
                                }
                            }
                        }

                        extractedRoles = _.filter(extractedRoles, function(entry) {
                            return entry.length > 0;
                        });
                  
                        // in case when "root" elements has childs
                        if (extractedRoles.length > 1) {
                            for (k = 0; k < extractedRoles[0].length; k ++) {
                                targetUsers =  targetUserIds[ extractedRoles[0][k] ];
                          
                                // starts iterating from end of hierarchy from most simple roles and assign to users apropriate access roles
                                for (j = extractedRoles.length - 1; targetUsers && j >= 0; j --) {
                                    for (t = 0; t < targetUsers.length; t ++){
                                        addUserRoleToMap(targetUsers[t], extractedRoles[j], isReinitialization);
                                    }
                                }
                          
                                processedGroupsMap[ extractedRoles[0][k] ] = true;
                            }     
                        }
      
                    }
                
                }
            
            
                // assign all other roles-users access roles
                for (var role in targetUserIds) {
                    if (!processedGroupsMap[role]) {
                        targetUsers = targetUserIds[role];
                      
                        for (t = 0; t < targetUsers.length; t ++){
                            //addRole(targetUsers[t], [role], isReinitialization);
                            addUserRoleToMap(targetUsers[t], [role], isReinitialization);
                        }
                      
                        processedGroupsMap[role] = true;
                    }
                }
              
                for (var uId in userToRolesMap) {
                    addRole(uId, _.uniq(userToRolesMap[uId]), isReinitialization);
                }
              
                _logger.info('initialize:' + (
                    _.map(targetUserIds, function(val, key){
                        return (key + ':' + val.length);
                    })
                ).join(','));
            });

        });


    });
};

var initializeSecurityRoles = function(securityRoles, isReinitialization, callback) {
    if(isReinitialization) {
        async.each(securityRoles, function(securityRole, callback){
            acl.removeRole(securityRole.name, callback);
        }, function(){
            initializeAllows(securityRoles, callback);
        });
    } else {
        initializeAllows(securityRoles, callback);
    }
};

var initializeAllows = function(securityRoles, callback) {
    //_logger.info('\r\ninitializeAllows:start')

    //_logger.info('initializeAllows:'
            
    var allAllowsCount = 0; //* fullResourcesMap.length;
    
    for(var s = 0; s < securityRoles.length; s++) {
        allAllowsCount += securityRoles[s].resources.length;
    }
    //_logger.info("all allows" + allAllowsCount);

    for (var i=0; i < securityRoles.length; i++) {
        var allowsCount = 0;
        var resources = securityRoles[i].resources;
        for (var k=0; k < resources.length; k++) {
            _logger.info('initializeAllows:name=' + securityRoles[i].name + ':' + securityRoles[i]._id + ':resource=' + resources[k].name + ':permissions=' + resources[k].permissions.join(','));

            allow(securityRoles[i].name, resources[k].name, resources[k].permissions, function(err) {
                if(err) {
                    _logger.info('initializeAllows:Error while allowing permissions for groups: ' + err);
                }
                allowsCount++;
                if(allowsCount === allAllowsCount) {
                    /*acl.allowedPermissions("110740462676845328422", "projects", function(err, permissions){
                    _logger.info("Daniil allows on project before new allowing: " + permissions["projects"]);
                    });*/
                    _logger.info('(Re-)Allowing security roles completed.');
                    callback();
                }
            });
        }
    }
};

// module.exports.getUserRoles = function(user, callback) {
//     
//     dataAccess.listUserRolesByGoogleId(user.googleId, function(err, body) {
//         var userRoles;
//         if (err) {
//             _logger.info(err);
//             callback('error loading getUserRoles', null);
//         } else {
//             userRoles = body.members.length >= 1 ? body.members[0]: {'roles':[]};
//         }
// 
//         callback(err, userRoles);
//     });
// };

var getRoleNames = function(roles) {
    var roleNames = [];
    if(roles) {
        for(var j = 0; j < roles.length; j++) {
            roleNames.push(roles[j].name);
        }
    }

    return roleNames;
};

var extractNestedPermissionGroups = function(groupId, roleNames, userRoles, securityRoles, extractedRoles) {
    if (!extractedRoles){
        extractedRoles = [];
    }
        
    if(groupId) {
        // persist extratced roles
        extractedRoles.push(roleNames);

        var usersFromGroupMember = [];
        var groupsFromGroupMember = [];
        
        //_logger.info('\r\nextractNestedPermissionGroups:groupId:' + groupId + ':userRoles:' + JSON.stringify(userRoles) + ':roleNames:' + JSON.stringify(roleNames))
        
        var getRolesInfoFromGroups = function(groups, isId) {
            var res = [];
            var tmp;
            
            for (var l = 0; l < groups.length; l ++) {
                tmp = _.find(securityRoles, function(s) {
                    return s.resource === groups[l].resource || s.resource === groups[l].groupId;
                });
                
                if (tmp && !isId){
                    res.push(tmp.name);
                } else if (tmp && isId){
                    res.push(tmp.resource);
                }
            }
                    
                    
            return res;
                    
        };
            
        for(var i = 0; i < userRoles.length; i++) {
            var userRole = userRoles[i];
          
          
            if(_.find(userRole.roles, function(r) { 
                return _.indexOf(roleNames, r.name) > -1;
            })) {
                if(userRole.userId) {
                    usersFromGroupMember.push(userRole);
                }
                if(userRole.groupId) {
                    groupsFromGroupMember.push(userRole);
                }
            }
        }
        
        if(groupsFromGroupMember && groupsFromGroupMember.length > 0) {
            for(var u = 0; u < groupsFromGroupMember.length; u++) {
                extractNestedPermissionGroups(groupsFromGroupMember[u].groupId,  getRolesInfoFromGroups(groupsFromGroupMember), userRoles, securityRoles, extractedRoles);
            }
          
        }
    }
};

// var createDefaultRoles = function(callback) {
//     _logger.info('Creating default roles.');
//     dataAccess.listSecurityRoles( function(err, body) {
//         var securityGroups = body.members;
// 
//         // check for 5 default roles (Management, Executives, PM, Sales, Minion)
//         var executivesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.EXECUTIVES });
//         var managementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MANAGEMENT });
//         var projectManagementGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.PM });
//         var salesGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.SALES });
//         var employee = _.findWhere(securityGroups, { name: DEFAULT_ROLES.MINION });
//         var adminGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.ADMIN });
//         var ssaGroup = _.findWhere(securityGroups, { name: DEFAULT_ROLES.SSA });
// 
//         if(!executivesGroup) {
//             createGroup(DEFAULT_ROLES.EXECUTIVES);
//         }
//         if(!managementGroup) {
//             createGroup(DEFAULT_ROLES.MANAGEMENT);
//         }
//         if(!projectManagementGroup) {
//             createGroup(DEFAULT_ROLES.PM);
//         }
//         if(!salesGroup) {
//             createGroup(DEFAULT_ROLES.SALES);
//         }
//         if(!adminGroup) {
//             createGroup(DEFAULT_ROLES.ADMIN);
//         }
//         if(!ssaGroup) {
//             createGroup(DEFAULT_ROLES.SSA);
//         }
//         // create userRoles for those who dont have it yet.
//         if(!employee) {
//             _logger.info('Creating Employee group.');
//             createGroup(DEFAULT_ROLES.MINION, function(body) {
//                 _logger.info('Employee group just created.');
//                 var minionGroup = { name: DEFAULT_ROLES.MINION, resource: 'securityroles/' + body.id };
//                 _logger.info('Employee group object to insert into userRoles: { name: ' + minionGroup.name + ', resource: "' + minionGroup.resource + '" }');
//                 createMinionUserRoles(callback, minionGroup);
//             });
//         } else {
//             var minionGroup = { name: DEFAULT_ROLES.MINION, resource: employee.resource };
//             _logger.info('Employee group already created.');
//             createMinionUserRoles(callback, minionGroup);
//         }
//     });
// };

// module.exports.createDefaultRoles = createDefaultRoles;

// var createGroup = function(name, actionAfter) {
//     var group = {
//         name: name,
//         resources: fullResourcesMap
//     };
// 
//     if(group.name === DEFAULT_ROLES.MINION) {
//         group.resources = minionResouresMap;
//     }
// 
//     dataAccess.insertItem(null, group, dataAccess.SECURITY_ROLES_KEY, function(err, body){
//         if (err) {
//             _logger.info('Error in creating default security group: ' + group.name + '. Error: ' + err);
//         } else {
//             if(actionAfter) {
//                 actionAfter(body);
//             }
//             _logger.info('Added default security group: ' + group.name);
//         }
//     });
// };

// var createMinionUserRoles = function(callback, minionRole) {
//     _logger.info('Creating Employee default roles.');
//     dataAccess.listPeople(null, function(err, peopleBody) {
//         if(!err) {
//             var people = peopleBody.members;
// 
//             dataAccess.listUserRoles( null, function(err, userRolesBody) {
//                 var userRoles = userRolesBody.members;
// 
//                 var countChecked = 0;
//                 _logger.info('People length: ' + people.length);
// 
//                 for(var i = 0; i < people.length; i++) {
//                     var person = people[i];
// 
//                     var userRole = _.findWhere(userRoles, { userId: person.googleId });
// 
//                     if(!userRole) {
//                         var uRole = { userId: person.googleId, roles: [minionRole]};
//                         dataAccess.insertItem(null, uRole, dataAccess.USER_ROLES_KEY, function(err, body){
//                             if (err) {
//                                 _logger.info('Error in creating default userRole: ' + err);
//                             } else {
//                                 _logger.info('Added default userRole: ' + body.id);
//                             }
// 
//                             countChecked++;
//                             if(callback && countChecked === people.length) {
//                                 _logger.info('CALLBACK REACHED!');
//                                 callback(null, true);
//                             }
//                         });
//                     } else {
//                         if(!userRole.roles || userRole.roles.length === 0) {
//                             userRole.roles = [minionRole];
// 
//                             dataAccess.insertItem(userRole.id, userRole, dataAccess.USER_ROLES_KEY, function(err, body){
//                                 if (err) {
//                                     _logger.info('Error in updating userRole: ' + err);
//                                 } else {
//                                     _logger.info('Updated default userRole: ' + body.id);
//                                 }
// 
//                                 countChecked++;
//                                 if(callback && countChecked === people.length) {
//                                     _logger.info('Every person has at least "Employee" permissions now.');
//                                     callback(null, true);
//                                 }
//                             });
//                         } else {
//                             countChecked++;
//                             if(callback && countChecked === people.length) {
//                                 _logger.info('Every person now has at least "Employee" permissions now.');
//                                 callback(null, true);
//                             }
//                         }
//                     }
//                 }
//             });
//         }
//     });
// };

// module.exports.createMinionUserRoles = createMinionUserRoles;

var allow = function(role, resource, permission, callback) {
    acl.allow(role, resource, permission, function(err){
        if (err) {
            _logger.info(err);
        }

        callback(err);
    });
};

var removeRoles = function(securityRoles) {
    for(var i = 0; i < securityRoles.length; i++) {
        acl.removeRole(securityRoles[i].name, function(err) {
            if(err) {
                _logger.info('Cannot delete "' + securityRoles[i].name + '" role.');
            }
        });
    }
};

module.exports.removeRole = function(role, callback) {
    acl.removeRole(role, function(err) {
        _logger.info('Cannot delete "' + role + '" role.');
    });
};

/**
 * Loads from acl permissions map by passed list of roles
 * @param roles
 * @param resource
 * @returns
 */
// module.exports.getPermissions = function(roles) {
//     var deferred = q.defer();
//     
//     var resourcePermissionsMap = {};
//     
//     acl._rolesResources(roles).then(function(resources) {
//         
//         resources = _.uniq(resources);
//         
//         var errrorOccured = false;
//         
//         var ind = 0;
//         
//         var promise = q.fcall(_.bind(function(){
//             return acl._resourcePermissions(roles, resources[this.ind]);
//         }, {ind: ind}));
//         
//         for (var k = 1; k < resources.length; k ++){
//             promise = promise.then(_.bind(function(result){
//                 resourcePermissionsMap[resources[this.ind - 1]] = [].concat(result);
//                 
//                 return acl._resourcePermissions(roles, resources[this.ind]);
//             }, {ind: k}));
//         }
//         
//         promise.catch(function(err) {
//             deferred.reject(err);
//             errrorOccured = true;
//             
//         }).done(function(result){
//             if (!errrorOccured) {
//                 resourcePermissionsMap[resources[resources.length - 1]] = [].concat(result);
//             
//                 deferred.resolve(resourcePermissionsMap);
//             }
//         });
//         
//     });
//     return deferred.promise;
// };

var addRole = function(userId, roles, isReinitialization, callback) {
    //_logger.info('\r\naddRole:userId:' + userId + ':roles:' + JSON.stringify(roles) + ':isReinitialization=' + isReinitialization);
    
    if(isReinitialization) {
        acl.userRoles( userId, function(err, actualRoles) {
            /*if(userId == "110740462676845328422") {
            _logger.info("Daniil role: " + actualRoles);
            }*/
            if(!err) {
                acl.removeUserRoles( userId, actualRoles, function(err) {
                    if(!err) {
                        acl.addUserRoles(userId, roles, function(err){
                            if (err) {
                                _logger.info(err);
                                callback(err);
                            }
                        });
                    }
                });
            }
        });
    } else {
        acl.addUserRoles(userId, roles, function(err){
            if (err) {
                _logger.info(err);
                callback(err);
            }
        });
    }
};

var minionResouresMap = [
    {
        'name': 'tasks',
        'permissions': [
            'viewTasks'
        ]
    },
    {
        'name': 'assignments',
        'permissions': [
            'viewAssignments'
        ]
    },
    {
        'name': 'configuration',
        'permissions': [
        ]
    },
    {
        'name': 'hours',
        'permissions': [
            'viewHours',
            'deleteMyHours',
            'editMyHours'
        ]
    },
    {
        'name': 'people',
        'permissions': [
            'viewPeople',
            'viewProfile',
            'viewMyProfile',
            'editMyProfile',
            'viewPersonnelData',
            'viewMyRoleTitle',
            'viewMySecondaryRole'
        ]
    },
    {
        'name': 'projects',
        'permissions': [
            'viewProjects',
            'editProjects',
            'viewProjectLinks'
        ]
    },
    {
        'name': 'vacations',
        'permissions': [
            'viewVacations',
            'viewMyVacations',
            'editMyVacations'
        ]
    },
    {
        'name': 'notifications',
        'permissions': [
            'viewNotifications',
            'editNotifications',
            'deleteNotifications'
        ]
    },
    {
        'name': 'upgrade',
        'permissions': [
        ]
    },
    {
        'name': 'securityRoles',
        'permissions': [
        ]
    },
    {
        'name': 'reports',
        'permissions': [
        ]
    },
    {
        'name': 'departments',
        'permissions': [
        ]
      }
];

var fullResourcesMap = [
    {
        'name': 'tasks',
        'permissions': [
            'viewTasks',
            'editTasks'
        ]
    },
    {
        'name': 'assignments',
        'permissions': [
            'viewAssignments',
            'editAssignments'
        ]
    },
    {
        'name': 'configuration',
        'permissions': [
            'viewConfiguration',
            'editConfiguration'
        ]
    },
    {
        'name': 'hours',
        'permissions': [
            'viewHours',
            'editHours',
            'deleteMyHours',
            'editMyHours',
            'viewHoursReportsAndCSV'
        ]
    },
    {
        'name': 'people',
        'permissions': [
            'viewPeople',
            'viewProfile',
            'editProfile',
            'viewMyProfile',
            'editMyProfile',
            'viewPersonnelData',
            'editPersonnelData',
            'viewGroups',
            'editGroups',
            'viewMyRoleTitle',
            'viewMySecondaryRole',
            'viewOthersRoleTitle',
            'viewOthersSecondaryRole',
            'editRolesTitles',
            'viewMySecurityRoles',
            'viewOthersSecurityRoles',
            'editProfileSecurityRoles'
        ]
    },
    {
        'name': 'projects',
        'permissions': [
            'viewProjects',
            'addProjects',
            'editProjects',
            'deleteProjects',
            'viewProjectLinks',
            'editProjectLinks',
            'viewRoles',
            'editRoles'
        ]
    },
    {
        'name': 'vacations',
        'permissions': [
            'viewVacations',
            'viewMyVacations',
            'editVacations',
            'editMyVacations'
        ]
    },
    {
        'name': 'notifications',
        'permissions': [
            'viewNotifications',
            'editNotifications',
            'deleteNotifications'
        ]
    },
    {
        'name': 'upgrade',
        'permissions': [
            'executeUpgrade'
        ]
    },
    {
        'name': 'securityRoles',
        'permissions': [
            'viewSecurityRoles',
            'editSecurityRoles'
        ]
    },
    {
        'name': 'reports',
        'permissions': [
            'viewReports'
        ]
    },
    {
        'name': 'departments',
        'permissions': [
              'viewDepartments',
              'editDepartments',
              'deleteDepartments'
        ]
    }
];
