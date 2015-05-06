// Run via `node server/v3/designDocuments/test.js dev`
var stripJsonComments = require('strip-json-comments');
var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var moment = require('moment');

if(process.argv.length != 3){
    console.log('usage: node load.js {stage,prod,demo,dev,test}');
    process.exit(1);
}
var env = process.argv[2];
var config;

var loadConfig = function(filename){
    var data = fs.readFileSync(__dirname + filename);
    var defaults = {};
    if(data){
        defaults = JSON.parse(stripJsonComments(data.toString()));
    }
    return defaults;
};
if(env == 'dev'){
    env = 'default';
    config = loadConfig('/../../config/default.json');
}else{
    config = loadConfig('/../../config/'+env+'.json');
}
var dbName = config.cloudant.db;
var dbAccount = config.cloudant.account;
var dbApiKey = config.cloudant.user;
var dbPwd = config.cloudant.password;

var dbConnParams = {
    account: dbAccount,
    key: "blehrietherieldstlyievio",
    password: "yU1lWnVqAqfKEKu2ywLI4Wok",
    request_defaults: {
        maxSockets: 30
    }
}; 
var Cloudant = require('cloudant')(dbConnParams);
var db = Cloudant.db.use(dbName);

var avg = function(vals){
    var sum = 0;
    for(var i=0; i<vals.length; i++){
        sum += vals[i];
    }
    return sum / vals.length;
};

var starting = Date.now();
db.view('UserRoles', 'AllUserRoles', function(err, allUserRoles){
    console.log('got all user roles?', err, allUserRoles.rows, Date.now() - starting);
});

// var testTasks = function(callback){
//     var search = 'time';
//     var runSearch = function(n, callback){
//         var starting = Date.now();
// 
//         db.search('Tasks', 'SearchAllTasks', {
//             q: 'name:'+search+'*',
//             include_docs: true
//         }, function(err, results){
//             results = _.map(results.rows, function(result){
//                 return result.doc;
//             });
//             // console.log('runSearch result', results);
//             callback(null, Date.now() - starting);
//         });
//     };
// 
//     var runFind = function(n, callback){
//         var starting = Date.now();
//         db.find({
//             selector: {
//                 form: 'Tasks',
//                 name: {
//                     '$regex': search
//                 }
//             }
//         }, function(err, results){
//             // console.log('runFind result', results.docs);
//             callback(null, Date.now() - starting);
//         });
//     };
// 
//     var manualFind = function(n, callback){
//         var starting = Date.now();
//         // Use the AllTasks view
//         db.view('Tasks', 'AllTasks', function(err, allTasks){
//         	var result = [];	
//         	var regex = new RegExp(search, 'gi');
//         	_.each(allTasks.rows, function(res) {
//                 var task = res.value;
//         		//if (task.name && task.name.toLowerCase().indexOf(name.toLowerCase()) > -1) {
//         		if (task.name && regex.exec(task.name)) {
//         			result.push(task);
//         		}
//         	});
//             // console.log('manualFind result', result);
//         	callback(null, Date.now() - starting);
//         });
//     };
// 
//     var test = function(iterations, callback){
//         console.log('\nrunning', iterations, 'times concurrently...');
//         async.parallel([
//             function(callback){
//                 async.times(iterations, runSearch, function(err, searched){
//                     console.log('search (Cloudant Lucene Search) took, on average, ', avg(searched), 'ms');
//                     callback();
//                 });
//             },
//             function(callback){
//                 async.times(iterations, runFind, function(err, finded){
//                     console.log('find (Cloudant Query) took, on average, ', avg(finded), 'ms');
//                     callback();
//                 });
//             },
//             function(callback){
//                 async.times(iterations, manualFind, function(err, finded){
//                     console.log('manual find (existing implementation) took, on average, ', avg(finded), 'ms');
//                     callback();
//                 });
//             }
//         ], callback);
//     };
//     console.log('\nTrying tasks:');
//     db.view('Tasks', 'AllTasks', function(err, allTasks){
//         console.log('(', allTasks.rows.length, ' tasks in the collection )');
//         test(10, function(){
//             test(100, function(){
//                 test(1000, function(){
//                     console.log('all done!');
//                     callback();
//                 });
//             });
//         });
//     });
// };
// var testProjects = function(callback){
//     var search = 'Master';
//     var runSearch = function(n, callback){
//         var starting = Date.now();
// 
//         db.search('Projects', 'SearchAllProjects', {
//             q: 'name:'+search+'*',
//             include_docs: true
//         }, function(err, results){
//             results = _.map(results.rows, function(result){
//                 return result.doc;
//             });
//             // console.log('runSearch result', results);
//             callback(null, Date.now() - starting);
//         });
//     };
// 
//     var runFind = function(n, callback){
//         var starting = Date.now();
//         db.find({
//             selector: {
//                 form: 'Projects',
//                 name: {
//                     '$regex': search
//                 }
//             }
//         }, function(err, results){
//             // console.log('runFind result', results.docs);
//             callback(null, Date.now() - starting);
//         });
//     };
// 
//     var manualFind = function(n, callback){
//         var starting = Date.now();
//         // Use the AllTasks view
//         db.view('Projects', 'AllProjects', function(err, allProjects){
//         	var result = [];	
//         	var regex = new RegExp(search, 'gi');
//         	_.each(allProjects.rows, function(res) {
//                 var task = res.value;
//         		//if (task.name && task.name.toLowerCase().indexOf(name.toLowerCase()) > -1) {
//         		if (task.name && regex.exec(task.name)) {
//         			result.push(task);
//         		}
//         	});
//             // console.log('manualFind result', result);
//         	callback(null, Date.now() - starting);
//         });
//     };
// 
//     var test = function(iterations, callback){
//         console.log('\nrunning', iterations, 'times concurrently...');
//         async.parallel([
//             function(callback){
//                 async.times(iterations, runSearch, function(err, searched){
//                     console.log('search (Cloudant Lucene Search) took, on average, ', avg(searched), 'ms');
//                     callback();
//                 });
//             },
//             function(callback){
//                 async.times(iterations, runFind, function(err, finded){
//                     console.log('find (Cloudant Query) took, on average, ', avg(finded), 'ms');
//                     callback();
//                 });
//             },
//             function(callback){
//                 async.times(iterations, manualFind, function(err, finded){
//                     console.log('manual find (existing implementation) took, on average, ', avg(finded), 'ms');
//                     callback();
//                 });
//             }
//         ], callback);
//     };
//     console.log('\nTrying projects:');
//     db.view('Projects', 'AllProjects', function(err, allProjects){
//         console.log('(', allProjects.rows.length, ' projects in the collection )');
//         test(10, function(){
//             test(100, function(){
//                 test(1000, function(){
//                     console.log('all done!');
//                     callback();
//                 });
//             });
//         });
//     });
// };
// var testProjectsByDate = function(callback){
//     var startDate = '2015-03-31';
//     var endDate = null;
//     var types = null;
//     var isCommitted = null;
//     var runSearch = function(n, callback){
//         var starting = Date.now();
// 
//         var q = 'numericStartDate:['+startDate.replace(/-/g, '')+' TO Infinity]';
//         db.search('Projects', 'SearchAllProjects', {
//             q: q,
//             limit: 200,
//             include_docs: true
//         }, function(err, results){
//             results = _.map(results.rows, function(result){
//                 // return result;
//                 return result.doc.startDate+' : '+result.doc.name;
//             });
//             results = results.sort(function (a, b) {
//                 if (a < b) return 1;
//                 if (b < a) return -1;
//                 return 0;
//             });
//             // console.log('runSearch result', results, results.length);
//             callback(null, Date.now() - starting);
//         });
//     };
// 
//     var runFind = function(n, callback){
//         var starting = Date.now();
//         db.find({
//             selector: {
//                 form: 'Projects',
//                 startDate: {
//                     '$gte': startDate
//                 }
//             }
//         }, function(err, results){
//             results = _.map(results.docs, function(result){
//                 // return result;
//                 return result.startDate+' : '+result.name+' : '+result._id;
//             });
//             results = results.sort(function (a, b) {
//                 if (a < b) return 1;
//                 if (b < a) return -1;
//                 return 0;
//             });
//             // console.log('runFind result', results, results.length);
//             callback(null, Date.now() - starting);
//         });
//     };
// 
//     var manualFind = function(n, callback){
//         var starting = Date.now();
//         // Use the AllTasks view
//         db.view('Projects', 'AllProjects', function(err, allProjects){
//             var result = [];
//         	_.each(allProjects.rows, function(res) {
//                 var project = res.value;
//         		if (	
//         			(startDate == null  || project.startDate >= startDate) && 
//         				(endDate == null || project.endDate < endDate) && 
//         					( types == null || types.toString().indexOf(project.type) != -1) &&
//         						(isCommitted == null || project.commited == isCommitted)
//         					 ) { 
//         			result.push(project);
//         		}
//         	});
//             result = _.map(result, function(result){
//                 // return result;
//                 return result.startDate+' : '+result.name;
//             });
//             // console.log('manualFind result', result, result.length);
//         	callback(null, Date.now() - starting);
//         });
//     };
// 
//     var test = function(iterations, callback){
//         console.log('\nrunning', iterations, 'times concurrently...');
//         async.parallel([
//             function(callback){
//                 async.times(iterations, runSearch, function(err, searched){
//                     console.log('search (Cloudant Lucene Search) took, on average, ', avg(searched), 'ms');
//                     callback();
//                 });
//             },
//             function(callback){
//                 async.times(iterations, runFind, function(err, finded){
//                     console.log('find (Cloudant Query) took, on average, ', avg(finded), 'ms');
//                     callback();
//                 });
//             },
//             function(callback){
//                 async.times(iterations, manualFind, function(err, finded){
//                     console.log('manual find (existing implementation) took, on average, ', avg(finded), 'ms');
//                     callback();
//                 });
//             }
//         ], callback);
//     };
//     console.log('\nTrying projects with a startDate after '+startDate+':');
//     db.view('Projects', 'AllProjects', function(err, allProjects){
//         console.log('(', allProjects.rows.length, ' projects in the collection )');
//         test(10, function(){
//             test(100, function(){
//                 test(1000, function(){
//                     console.log('all done!');
//                     callback();
//                 });
//             });
//         });
//     });
// };
// var testProjectsByDateAndTypeAndCommitted = function(callback){
//     var startDate = '2014-01-01';
//     var endDate = null;
//     var types = ['invest'];
//     var isCommitted = true;
//     var runSearch = function(n, callback){
//         var starting = Date.now();
// 
//         var q = '';
//         if(startDate){
//             if(q.length != 0){
//                 q += ' AND ';
//             }
//             q += 'numericStartDate:['+startDate.replace(/-/g, '')+' TO Infinity]';
//         }
//         if(endDate){
//             if(q.length != 0){
//                 q += ' AND ';
//             }
//             q += 'numericEndDate:[-Infinity TO '+startDate.replace(/-/g, '')+']';
//         }
//         if(types && types.length){
//             if(q.length != 0){
//                 q += ' AND ';
//             }
//             if(types.length > 1){
//                 q += 'type:('+types.join(' OR ')+')';
//             }else{
//                 q += 'type:'+types[0];
//             }
//         }
//         if(isCommitted != null){
//             if(q.length != 0){
//                 q += ' AND ';
//             }
//             q += 'committed:'+isCommitted;
//         }
//         db.search('Projects', 'SearchAllProjects', {
//             q: q,
//             limit: 200,
//             include_docs: true
//         }, function(err, results){
//             results = _.map(results.rows, function(result){
//                 // return result;
//                 return result.doc.startDate+' : '+result.doc.name + ' : ' + result.doc.type;
//             });
//             results = results.sort(function (a, b) {
//                 if (a < b) return 1;
//                 if (b < a) return -1;
//                 return 0;
//             });
//             // console.log('runSearch result', results, results.length);
//             callback(null, Date.now() - starting);
//         });
//     };
// 
//     var runFind = function(n, callback){
//         var starting = Date.now();
//         db.find({
//             selector: {
//                 form: 'Projects',
//                 startDate: {
//                     '$gte': startDate
//                 },
//                 type: {
//                     '$in': types
//                 },
//                 committed: isCommitted
//             }
//         }, function(err, results){
//             results = _.map(results.docs, function(result){
//                 // return result;
//                 return result.startDate+' : '+result.name+' : '+result._id;
//             });
//             results = results.sort(function (a, b) {
//                 if (a < b) return 1;
//                 if (b < a) return -1;
//                 return 0;
//             });
//             // console.log('runFind result', results, results.length);
//             callback(null, Date.now() - starting);
//         });
//     };
// 
//     var manualFind = function(n, callback){
//         var starting = Date.now();
//         // Use the AllTasks view
//         db.view('Projects', 'AllProjects', function(err, allProjects){
//             var result = [];
//         	_.each(allProjects.rows, function(res) {
//                 var project = res.value;
//         		if (	
//         			(startDate == null  || project.startDate >= startDate) && 
//         				(endDate == null || project.endDate < endDate) && 
//         					( types == null || types.toString().indexOf(project.type) != -1) &&
//         						(isCommitted == null || project.committed == isCommitted)
//         					 ) { 
//         			result.push(project);
//         		}
//         	});
//             result = _.map(result, function(result){
//                 // return result;
//                 return result.startDate+' : '+result.name;
//             });
//             // console.log('manualFind result', result, result.length);
//         	callback(null, Date.now() - starting);
//         });
//     };
// 
//     var test = function(iterations, callback){
//         console.log('\nrunning', iterations, 'times concurrently...');
//         async.parallel([
//             function(callback){
//                 async.times(iterations, runSearch, function(err, searched){
//                     console.log('search (Cloudant Lucene Search) took, on average, ', avg(searched), 'ms');
//                     callback();
//                 });
//             },
//             function(callback){
//                 async.times(iterations, runFind, function(err, finded){
//                     console.log('find (Cloudant Query) took, on average, ', avg(finded), 'ms');
//                     callback();
//                 });
//             },
//             function(callback){
//                 async.times(iterations, manualFind, function(err, finded){
//                     console.log('manual find (existing implementation) took, on average, ', avg(finded), 'ms');
//                     callback();
//                 });
//             }
//         ], callback);
//     };
//     console.log('\nTrying projects with a startDate after '+startDate+' of type '+types+' and committed='+isCommitted+' :');
//     db.view('Projects', 'AllProjects', function(err, allProjects){
//         console.log('(', allProjects.rows.length, ' projects in the collection )');
//         test(10, function(){
//             test(100, function(){
//                 test(1000, function(){
//                     console.log('all done!');
//                     callback();
//                 });
//             });
//         });
//     });
// };
// 
// 
// async.series([
//     testTasks,
//     testProjects,
//     testProjectsByDate,
//     testProjectsByDateAndTypeAndCommitted
// ], function(){
//     console.log('all done!');
// });
