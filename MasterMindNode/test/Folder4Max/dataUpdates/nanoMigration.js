'use strict';

var config = require('../../../server/config/config.js');
var _ = require('underscore');
var Q = require("q");
var nano = require('nano')(config.cloudant.url);
//var Cloudant = require("cloudant")(config.cloudant.url); 
var dbAccess = require( './dbAccess_Copy.js' );

//var db = nano.db.use(dbName);
var database = config.db;
var dbName = config.db;
var dbAccount = config.cloudant.account;
var dbApiKey = config.cloudant.user;
var dbPwd = config.cloudant.password;

var dbConnParams = {account:dbAccount, key:dbApiKey,password:dbPwd}; 
var Cloudant = require("cloudant")(dbConnParams); 

/*
 Cloudant(
	dbConnParams, function(er, cloudant, reply) {
		if (er){
			return console.log('Error connecting to Cloudant account %s: %s', config.cloudant.account, er.message);
		} else {
			//console.log('Connected to Cloudant: Server version = %s', reply.version);
			var cloudantDB = cloudant.db.use(dbName);

			//===================================================
			console.log("NEW function");
			cloudantViewNEW(cloudantDB, 'views', 'Projects', null, function(err, body) {
				console.log(body);
			});

			console.log("OLD function");
			dbAccess.cloudantView('views', 'Projects', null, function(err, body) {
				console.log(body);
			}); 
		}
	}
);
*/

// version 1 (short)
/*
var cloudantView = function(designName, viewName, params, callback){
	getCloudantDb(dbConnParams, dbName)
		.then(function (db) {
			//cloudantViewOriginal(db, designName, viewName, params, callback);
			if (params){
		        db.view(designName, viewName, params, function(err, body){
		            if (err) {
		                callback(err, null);
		            } else {
		              callback(null, body);
		            }
		        });
			}
		    else {
		        db.view(designName, viewName, function(err, body){
		            if (err) {
		                callback(err, null);
		            } else {
		              callback(null, body);
		            }
		        });
		    }
		});
};
*/

//version 2 
var cloudantView = function(designName, viewName, params, callback){
	var db = Cloudant.db.use(dbName);
//	getCloudantDb(dbConnParams, dbName)
//		.then(function (db) {
			//cloudantViewOriginal(db, designName, viewName, params, callback);
			if (params){
				console.log(typeof(params));
				if (typeof(params) === "object") {
					params = {"keys": params};
					console.log(params);
				};
				
		        db.view(designName, viewName, params, function(err, body){
		            if (err) {
		                callback(err, null);
		            } else {
		              callback(null, body);
		            }
		        });
			}
		    else {
		        db.view(designName, viewName, function(err, body){
		            if (err) {
		                callback(err, null);
		            } else {
		              callback(null, body);
		            }
		        });
		    }
//		});
};


/* 	new method.
 *	PURPOSE: Retrieve document(s) by key or Array of keys.
 *	INPUT: 
 *		params - single value or Array of values.
 *		include_docs - return full documents (true/false). Default TRUE
 *	RETURN: All documents that match the key(s).  
 */
var cloudantGetDocumentsByKeys = function(designName, viewName, params, include_docs, callback){
	console.log("cloudantGetDocumentsByKeys");
	var db = Cloudant.db.use(dbName);

	if (! include_docs) {
		include_docs = false;
	}
	
	if (params){
		if (! Array.isArray(params)) {
			params = new Array(params);
		}
		
		params = {"keys": params, "include_docs" : include_docs};
		//console.log(params);
		db.view(designName, viewName, params, function(err, body){
            if (err) {
                callback(err, null);
            } else {
              callback(null, body);
            }
        });
	}
};


/* 	new method.
 *	PURPOSE: Retrieve document(s) by range of key(s).
 *	INPUT: 
 * 		startKeys	- single value or Array of values.
 * 		endKeys		- single value or Array of values.
 *		include_docs - return full documents or not (true/false). Default TRUE
 *	RETURN: All documents between start and end keys.  
 */
var cloudantGetDocumentsByRangeKeys = function(designName, viewName, startKeys, endKeys, include_docs, callback){
	console.log("cloudantGetDocumentsByRangeKeys");
	var db = Cloudant.db.use(dbName);
	
	if (! include_docs) {
		include_docs = true;
	}
	
	if (startKeys){
		if (! Array.isArray(startKeys)) {
			startKeys = new Array(startKeys);
		}
	}		

	if (endKeys){
		if (! Array.isArray(endKeys)) {
			endKeys = new Array(endKeys);
		}
	}		

	var params = {"startkey": startKeys, "endkey" : endKeys, "include_docs" : include_docs};
	//console.log(params);
	db.view(designName, viewName, params, function(err, body){
        if (err) {
            callback(err, null);
        } else {
          callback(null, body);
        }
    });

};


//======================================================================================
var cloudantSearchByRangeKeysOriginal = function(designName, viewName, startKeys, endKeys, callback){
    /*
    *   startKeys and endKeys are Arrays. First parameter is always a key Name.
    *   Number of parameters should be equal to number of params in a key name plus one.
    *   Ex.: if you want to get data based on Project, Person, and Date, in January
    *   you need to provide keys ["ProjectPersonDate", project, person, date]: 
    *   StartKeys = ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-01"]
    *   EndKeys =   ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-31"]
    *
    *   Current valid key Names for Hours records: 
        *   "Person";
    *   "PersonDate";
        *   "PersonProject";
        *   "PersonProjectDate";
        *   "ProjectPerson";
        *   "PersonDate";
        *   "ProjectPersonDate";
        *   "DateProjectPerson";
        *   "DatePersonProject";
        *   "DatePerson";
        *   "DateProject";
    */

	console.log("cloudantSearchByRangeKeysOriginal");
	
    //var db = nano.db.use(database);
	var db = Cloudant.db.use(dbName);
    var query = '{}';
    
    if (startKeys && endKeys)
        query = '{ "queries" : [ {"startkey" :  ' + JSON.stringify(startKeys) + ', "endkey" :    ' + JSON.stringify(endKeys) + ', "include_docs" : true}]}';
    else
        //query = JSON.stringify({queries: [{keys: startKeys}]});
        //query = JSON.stringify({keys: startKeys});
        query =  '{"keys": ' + JSON.stringify(startKeys) + '}';
       
    console.log(query);
    //nano.request({ db: database,
    Cloudant.request({ db: dbName,
            method : 'post',
            //path : '/_design/' + designName + '/_view/' + viewName + '?include_docs=true',
            path : '/_design/' + designName + '/_view/' + viewName,
            body : JSON.parse(query)
               }, function(err, body){
            if (err) {
                callback(err, null);
            } else {
              callback(null, body);
            }});

};

/*
//======================================================================================
var cloudantSearchByKeys = function(designName, viewName, startKeys, endKeys){
	var db = Cloudant.db.use(dbName);
	var query;
	
    if (startKeys && endKeys)
        query = '{ "queries" : [ {"startkey" :  ' + JSON.stringify(startKeys) + ', "endkey" :    ' + JSON.stringify(endKeys) + ', "include_docs" : true}]}';
    else
        //query = JSON.stringify({queries: [{keys: startKeys}]});
        query = JSON.stringify({keys: startKeys});
	
	
	cloudantView('views', 'AllHoursInOne', query, function(err, body) {
	    console.log(err);
	    console.log(body);
	});
};
*/

//var cloudantView = function(designName, viewName, params, callback){
//cloudantView('views', 'Projects', [["Project", "f56c5f8f6f9d7864ee76e9638b495559"],["Project", "edfe8feef74a93fc0b16f48cdd6855c0"]], function(err, body){
//cloudantGetDocumentsByRangeKeys('views', 'AllHoursInOne', ["Date", "2014-08-01"], ["Date", "2014-08-14"], true, function(err, body){
//cloudantGetDocumentsByKeys('views', 'People', ["52ab7005e4b0fd2a8d12ffe7"], function(err, body){
//cloudantView('views', 'Projects', ["f56c5f8f6f9d7864ee76e9638b495559", "edfe8feef74a93fc0b16f48cdd6855c0"], function(err, body){
cloudantGetDocumentsByRangeKeys('views', 'AllHoursInOne', ["Project", "projects/47ad7f3ed51ecc254f45f223e42f7620"],["Project", "projects/47ad7f3ed51ecc254f45f223e42f7620"], true, function(err, body){
//cloudantGetDocumentsByKeys('views', 'AllHoursInOne', ["Project", "projects/47ad7f3ed51ecc254f45f223e42f7620"],["Project", "projects/47ad7f3ed51ecc254f45f223e42f7620"], true, function(err, body){
//cloudantSearchByRangeKeysOriginal('views', 'AllHoursInOne', ["Project", "projects/47ad7f3ed51ecc254f45f223e42f7620"],["Project", "projects/47ad7f3ed51ecc254f45f223e42f7620"], function(err, body){
	if (err) {console.log(err);};
	console.log(body);
	console.log(body.results);
});


/*
cloudantSearchByKeys('views', 'AllHoursInOne', '2014-01-01', '2014-05-01', function(err, body){
//cloudantSearchByKeysOriginal('views', 'AllHoursInOne', '2014-01-01', '2014-05-01', function(err, body){
    console.log(err);
    console.log(body);
});
*/

