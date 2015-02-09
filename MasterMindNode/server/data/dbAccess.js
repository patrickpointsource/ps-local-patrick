'use strict';

// Data access layer for cloudant
var config = require('../config/config.js');
var _ = require('underscore');

module.exports = function(params) {
	// cloudant module
	var dbName = config.cloudant[params.env].db;
	var dbAccount = config.cloudant[params.env].account;
	var dbApiKey = config.cloudant[params.env].user;
	var dbPwd = config.cloudant[params.env].password;
	
	var dbConnParams = {account:dbAccount, key:dbApiKey,password:dbPwd}; 
	var Cloudant = require("cloudant")(dbConnParams);
	
	var insertItem = function(id, item, callback){
	    //var db = nano.db.use(database);
		var db = Cloudant.db.use(dbName);
	    db.insert(item, id, function(err, body){
	    	if (err) {
				callback(err, null);
			} else {
	        	callback(null, body);
			};
	    });
	};
	
	/**
	 * Update uses the same insert api - but it is improtant to have _rev setled
	 *  **/
	var updateItem = function(id, item, callback){
	    //var db = nano.db.use(database);
		var db = Cloudant.db.use(dbName);
	    db.insert(item, id, function(err, body){
	        if (err) {
	            callback(err, null);
	        } else {
	            callback(null, body);
	        }
	    });
	};
	
	var deleteItem = function(id, rev, callback){
	    //var db = nano.db.use(database);
		var db = Cloudant.db.use(dbName);
	    db.destroy(id, rev, function(err, body){
	    	if (err) {
				callback(err, null);
			} else {
	        	callback(null, body);
			}
	    });
	};
	
	var getItem = function(id, callback){
	    //var db = nano.db.use(database);
		var db = Cloudant.db.use(dbName);
	    db.get(id, function(err, body){
	    	if (err) {
				callback(err, null);
			} else {
	        	callback(null, body);
			}
	    });
	};
	
	//=============================================================================
	/*	New code (MM 10/20/14)
	 *  former method name: cloudantView
	 */
	var cloudantGetAllViewDocument = function(designName, viewName, params, callback){
		//var db = nano.db.use(database);
		var db = Cloudant.db.use(dbName);
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
	};
	
	
	/* 	new method.
	 *	PURPOSE: Retrieve document(s) by key or Array of keys.
	 *	INPUT: params - single value or Array of values.
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
	 *	PURPOSE: Retrieve document(s) by key or Array of keys.
	 *	INPUT: params - single value or Array of values.
	 *	RETURN: All documents that match the key(s).  
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
	
	
	/*=================================================================================
	 * Method performs QuerySearch over predefined indexes.
	 * INPUT: 	JSON object of search criteria. Works almost the same as MongoDB query.
	 * OUTPUT:	result.docs[]
	 */
	var cloudantQuerySearch = function(searchQuery, callback) {
//		searchQuery = {"form": "Hours", "person.resource" : "", "project.resource": {"$in" : ["projects/52b0a6c2e4b02565de24922d"]}, "date": {"$gt":"2014-10-01"}};
		//searchQuery = {"form": "Hours", "project.resource": {"$in" : ["projects/52b0a6c2e4b02565de24922d"]}, "date": {"$gt":"2014-10-01"}};
		var q = {selector : searchQuery};
		
		var db = Cloudant.db.use(dbName);
		db.find(q, function(err, result) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, result);
			}
		});
	};

	
	//=============================================================================
	var prepareResponse = function(data, about, valProp) {
	    var result = {};
	    
	    if(data) {
	      result.data = _.map(data.rows, function(val, key) {return val[valProp];});
	    };
	    
	    result.count = result && result.data ? result.data.length: 0;
	    result.about = about;
	    
	    return result;
	};
	
	//designName = "views"
	
	//viewName = "AllHoursInOne"
	//startKeys = ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-01"]
	//endKeys =   ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-31"]
	
	//console.log('dbAccess:' + JSON.stringify(module.exports));
	
	module.exports.listHoursByStartEndDates = function(start, end, callback) {
	    // MM cloudantSearchByRangeKeys('views', 'AllHoursInOne', start, end, function(err, body){
		cloudantGetDocumentsByRangeKeys('views', 'AllHoursInOne', start, end, true, function(err, body){
	        //callback(err, prepareResponse(body && body.results.length == 1 ? body.results[0]: {}, 'hours', 'doc'));
	    	callback(err, prepareResponse(body, 'hours', 'doc'));
	        //callback(err, body);
	    });
	};
	
	//console.log('dbAccess2:' + JSON.stringify(module.exports));
	
	module.exports.listHoursByProjects = function(projects, callback) {
	    var processedProjects = _.map(projects, function(val, ind){
	        return ["Project", val];
	    });
	    
	    //cloudantSearchByKeys('views', 'AllHoursInOne', processedProjects, null, function(err, body){
	    cloudantGetDocumentsByKeys('views', 'AllHoursInOne', processedProjects, true, function(err, body){
	         //callback(err, prepareResponse(body && body.results && body.results.length == 1 ? body.results[0]: {}, 'hours', 'doc'));
	    	callback(err, prepareResponse(body, 'hours', 'doc'));
	         //callback(err, body);
	    });
	};
	

	module.exports.listHoursByProjectsAndDates = function(projects, startDate, endDate, callback) {
	    /*
		var q = {
	    		"form": "Hours", 
	    		"project.resource": {"$in" : projects},
	    		"date": {"$gte": startDate, "$lte": endDate  } 
	    };

	    cloudantQuerySearch(q, function (err, body){
	    	callback(err, { data : body.docs } );
	    });
	    */
	    
		var projects = _.map(projects, function(val, ind){
	        return ["Project", val];
	    });
		
	    cloudantGetDocumentsByKeys('views', 'AllHoursInOne', projects, true, function(err, body){
	    	callback(err, prepareResponse(body, 'hours', 'doc'));
	    });
	};
	

	
	
	module.exports.listHoursByPerson = function(callback) {
	    cloudantGetAllViewDocument('views', 'HoursByPerson', null, function(err, body){
	         callback(err, prepareResponse(body, 'hours', 'doc'));
	    });
	};
	
	
	module.exports.listHoursByPersonDate = function(callback) {
	    cloudantGetAllViewDocument('views', 'testHoursByPersonDate', null, function(err, body){
	         callback(err, prepareResponse(body, 'hours', 'doc'));
	    });
	};
	/*
	this.listHours = function(q, callback) {
	    var start = ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-01"];
	    var end = ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-01"];
	    
	    cloudantSearchByRangeKeys('views', 'AllHoursInOne', start, end, function(err, body){
	         callback(err, prepareResponse(body.results.length == 1 ? body.results[0]: {}, 'hours', 'doc'));
	         //callback(err, body);
	    });
	};
	*/
	module.exports.listProjects = function(callback) {
	    cloudantGetAllViewDocument('views', 'Projects', null, function(err, body){
	        callback(err, prepareResponse(body, 'projects', 'value'));
	    });
	};
	
	module.exports.listPeople = function(callback) {
	    cloudantGetAllViewDocument('views', 'People', null, function(err, body){
	        callback(err, prepareResponse(body, 'people', 'value'));
	    });
	};
	
	module.exports.listTasks = function(callback) {
	    cloudantGetAllViewDocument('views', 'Tasks', null, function(err, body){
	         callback(err, prepareResponse(body, 'tasks', 'value'));
	    });
	};
	
	module.exports.listAssignments = function(callback) {
	    cloudantGetAllViewDocument('views', 'Assignments', null, function(err, body){
	        callback(err, prepareResponse(body, 'assignments', 'value'));
	    });
	};
	
	module.exports.listRoles = function(callback) {
	    cloudantGetAllViewDocument('views', 'Roles', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'roles', 'doc'));
	    });
	};
	
	module.exports.listSecurityRoles = function(callback) {
	    cloudantGetAllViewDocument('views', 'SecurityRoles', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'security_roles', 'doc'));
	    });
	};
	
	module.exports.listUserRoles = function(callback) {
	    cloudantGetAllViewDocument('views', 'UserRoles', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'user_roles', 'doc'));
	    });
	};
	
	module.exports.listLinks = function(callback) {
	    cloudantGetAllViewDocument('views', 'Links', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'links', 'doc'));
	    });
	};
	
	module.exports.listConfiguration = function(callback) {
	    cloudantGetAllViewDocument('views', 'Configuration', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'configuration', 'doc'));
	    });
	};
	
	module.exports.listSkills = function(callback) {
	    cloudantGetAllViewDocument('views', 'Skills', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'skills', 'doc'));
	    });
	};
	
	module.exports.listVacations = function(callback) {
	    cloudantGetAllViewDocument('views', 'Vacations', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'vacations', 'doc'));
	    });
	};
	
	module.exports.listNotifications = function(callback) {
	    cloudantGetAllViewDocument('views', 'Notifications', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'notifications', 'doc'));
	    });
	};
	
	module.exports.searchHoursByProjectsPeopleDate = function(query, callback){
		cloudantQuerySearch(query, function(err, body) {
			callback(err, prepareResponse(body, 'hours', 'doc'));
		});
	};
	
	module.exports.insertItem = insertItem;
	module.exports.updateItem = updateItem;
	module.exports.deleteItem = deleteItem;
	module.exports.getItem = getItem;
};

