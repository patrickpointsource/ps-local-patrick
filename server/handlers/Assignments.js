var _ = require('underscore'),
    async = require('async'),
    securityResources = require( '../util/securityResources' ),
    sendJson = require('../util/sendJson'),
    util = require('../util/restUtils');

// Pausing on this implementation; Assignemnts aren't one-to-one in the DB :(

// var assignment = {
//     convertForRestAPI: function(access, doc){
//         var obj = {};
//         util.map(doc, obj, {
//             '_id': 'id'
//         });
//         util.mapStraight(doc, obj, ['description', 'type', 'status', 'days', 'comment', 'reason']);
//         util.mapStraightDates(util.FOR_REST, doc, obj, ['startDate', 'endDate']);
//         util.mapResources(util.FOR_REST, doc, obj, ['person', 'vacationManager'], access.PEOPLE_KEY);
//         if(obj.vacationManager){
//             obj.manager = obj.vacationManager;
//             delete obj.vacationManager;
//         }
//         return obj;
//     },
//     convertForDB: function(access, doc, expectNew){
//         var obj = {
//             form: access.ASSIGMENTS_KEY
//         };
//         util.map(doc, obj, {
//             'id': '_id'
//         });
//         util.mapStraight(doc, obj, ['description', 'type', 'status', 'days', 'comment', 'reason']);
//         util.mapStraightDates(util.FOR_DB, doc, obj, ['startDate', 'endDate']);
//         util.mapResources(util.FOR_DB, doc, obj, ['person', 'manager'], access.PEOPLE_KEY);
//         if(obj.manager){
//             obj.vacationManager = obj.manager;
//             delete obj.manager;
//         }
//         return obj;
//     },
//     validateAssignments: function(obj, access, callback){
//         // Check obj for invalid fields
//         // Note that spec-related validation has (theoretically) already occurred 
//         async.parallel([
//             function(callback){
//                 access.db.view('People', 'AllPeopleNames', { keys: [obj.person] }, function(err, docs){
//                     if(err){
//                         return callback(err);
//                     }
//                     if(docs.rows.length === 0){
//                         return callback('The indicated person doesn\'t exist.');
//                     }
//                     callback();
//                 });
//             },
//             function(callback){
//                 access.db.view('People', 'AllPeopleNames', { keys: [obj.manager] }, function(err, docs){
//                     if(err){
//                         return callback(err);
//                     }
//                     if(docs.rows.length === 0){
//                         return callback('The indicated manager doesn\'t exist.');
//                     }
//                     callback();
//                 });
//             }
//         ], callback);
//     }
// };
// 
// module.exports.getAssignments = util.generateCollectionGetHandler(
//     securityResources.assignments.resourceName, // resourceName
//     securityResources.assignments.permissions.viewAssignments, // permission
//     function(req, db, callback){ // doSearchIfNeededCallback
//         var q = '';
//         var toAdd;
//         if(req.query.people && req.query.people.length){
//             var people = req.query.people.split(',');
//             if(people.length > 1){
//                 toAdd = 'person:('+people.join(' OR ')+')';
//             }else{
//                 toAdd = 'person:'+people[0];
//             }
//             q = util.addToQuery(q, toAdd);
//         }
//         if(req.query.statuses && req.query.statuses.length){
//             var statuses = req.query.statuses.split(',');
//             if(statuses.length > 1){
//                 toAdd = 'status:('+statuses.join(' OR ')+')';
//             }else{
//                 toAdd = 'status:'+statuses[0];
//             }
//             q = util.addToQuery(q, toAdd);
//         }
//         if(req.query.manager){
//             q = util.addToQuery(q, 'manager:'+req.query.manager);
//         }
//         if(req.query.startDate){
//             q = util.addToQuery(q, 'numericStartDate:['+req.query.startDate.replace(/-/g, '')+' TO Infinity]');
//         }
//         if(req.query.endDate){
//             q = util.addToQuery(q, 'numericEndDate:[-Infinity TO '+req.query.endDate.replace(/-/g, '')+']');
//         }
//         if(q.length){
//             // Use the SearchAllAssignments index
//             db.search('Assignments', 'SearchAllAssignments', {
//                 q: q,
//                 include_docs: true
//             }, function(err, results){
//                 callback(results.rows);
//             });
//             return;
//         }
//         callback(false);
//     },
//     'Assignments', // ddoc
//     'AllAssignments', // allDocsViewName
//     assignment.convertForRestAPI //convertForRestAPI
// );
// 
// module.exports.createSingleAssignment = util.generateSingleItemCreateHandler(
//     securityResources.assignments.resourceName, // resourceName
//     securityResources.assignments.permissions.editAssignments, // permission
//     'assignment', // key
//     assignment.validateAssignments, // validate
//     assignment.convertForDB, // convertForDB
//     assignment.convertForRestAPI // convertForRestAPI
// );
// 
// module.exports.getSingleAssignment = util.generateSingleItemGetHandler(
//     securityResources.assignments.resourceName, // resourceName
//     securityResources.assignments.permissions.viewAssignments, // permission
//     'assignment', // key 
//     assignment.convertForRestAPI // convertForRestAPI
// );
// 
// module.exports.updateSingleAssignment = util.generateSingleItemUpdateHandler(
//     securityResources.assignments.resourceName, // resourceName
//     securityResources.assignments.permissions.editAssignments, // permission
//     'assignment', // key
//     assignment.validateAssignments, // validate
//     assignment.convertForDB, // convertForDB
//     assignment.convertForRestAPI // convertForRestAPI
// );
// 
// module.exports.deleteSingleAssignment = util.generateSingleItemDeleteHandler(
//     securityResources.assignments.resourceName, // resourceName
//     securityResources.assignments.permissions.editAssignments, // permission
//     'assignment' // key
// );
