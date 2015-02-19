'use strict';

// Data access layer for cloudant
var config = require('../config/config.js');
var _ = require('underscore');
var validation = require( '../data/validation.js' );

module.exports = function(params) {
	// cloudant module
	var dbName = config.cloudant[params.env].db;
	var dbAccount = config.cloudant[params.env].account;
	var dbApiKey = config.cloudant[params.env].user;
	var dbPwd = config.cloudant[params.env].password;
	
	var dbConnParams = {account:dbAccount, key:dbApiKey,password:dbPwd}; 
	var Cloudant = require("cloudant")(dbConnParams);
	
	var insertItem = function(id, item, callback){
		var validationMessages = validation.validate(item, item.form);
		
	    if(validationMessages.length > 0) {
	      callback( validationMessages.join(', '), null );
	    } else {
			var db = Cloudant.db.use(dbName);
		    db.insert(item, id, function(err, body){
		    	if (err) {
					callback(err, null);
				} else {
		        	callback(null, body);
				};
		    });	
	    };
	};
	
	/**
	 * Update uses the same insert api - but it is improtant to have _rev setled
	 *  **/
	var updateItem = function(id, item, callback){
	    var validationMessages = validation.validate(item, item.form);
	    
	    if(validationMessages.length > 0) {
	      callback( validationMessages.join(', '), null );
	    } else {
			var db = Cloudant.db.use(dbName);
		    db.insert(item, id, function(err, body){
		        if (err) {
		            callback(err, null);
		        } else {
		            callback(null, body);
		        }
		    });
	    };
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

	
	//================================================================
	/* Configuration of different types of Lucine Search indexes
	 * At this moment we have only Hours.
	 */
	function cloudantLucineSearchConfig(Type)
	{
		var dbobj = {};
		switch(Type)
		{
		case "Hours":	dbobj.ddoc = 'LuceneSearch';
				dbobj.lindex = 'HoursByProjectPersonDate';
				dbobj.func = paramsToLucineQueryHours;
				dbobj.iserr = false;
				break;

		default:	dbobj.ddoc = null;
				dbobj.lindex = null;
				dbobj.func = null;
				dbobj.iserr = true;
				break;
		}
		return dbobj;
	}

	//================================================================
	function ArrayToLucineString(pArray)
	{
		if(pArray)
			if(Array.isArray(pArray))
				return "(\"" + pArray.join("\" OR \"") + "\")";
			else
			if(typeof(pArray) == "string")
				return "\"" + pArray + "\"";
		return "";
	}
	
	
	/*================================================================
	 * HOURS-specific conversion of params into Lucine query
	 */
	function paramsToLucineQueryHours(params){
		var query = ""; 
		var tquery = "";
		var fand = false;
		
		var sday = (params.startDate)?(new Date(params.startDate).getTime()):(0);
		var eday = (params.endDate)?(new Date(params.endDate).getTime()):(new Date().getTime());
		

		if(params.startDate || params.endDate)
		{
			fand = true;
			query = "doc_date:[" + sday + " TO " + eday + "]";
		}
		if(params.Persons && params.Persons.length > 0)
		{
			if(fand) query += " AND ";
			fand = true;
			query += "person.resource:" + ArrayToLucineString(params.Persons);
		}

		if(params.Projects && params.Projects.length > 0)
		{
			if(fand) query += " AND ";
			tquery = ArrayToLucineString(params.Projects);
			query += "(project.resource:" + tquery + " OR task.resource:" + tquery + ")";
		}
		return query;
	}

	
	
	/*================================================================
	 * Lucine-specific logic. Don't bother with understanding.
	 * Used for chunked retrieval of data.
	 */
	var cloudantLucinePrepareQuery = function(user_params, params, dbobj)
	{
		var pquery = {};
		
		(params.isIncludeDocs)?(pquery.include_docs = true):(pquery.include_docs = false);

		if(params.limit && parseInt(params.limit) == params.limit && params.limit > 0 && params.limit <= 200)
			pquery.limit = params.limit;
		if(params.bookmark && typeof(params.bookmark) == "string")
			pquery.bookmark = params.bookmark;
		if(user_params && dbobj && !dbobj.iserr)
			pquery.q = dbobj.func(user_params); 

		return pquery;
	};


	/* =====================================================================================
	 * Search via Lucine full-text index
	 * PARAMS:
	 * 	user_params: JSON object with list of user-specific input query params (person, project, date, ...) 
	 * 		For different types of query we may have different number of input params.
	 * 		Parameters can be Arrays, strings, or dates. 
	 * 	params: cloudant-specific search params.
	 *	dbobj:	specifies which index to use for search
	 *
	 * RETURN: Array of records
	 * 
	 * COMMENT: By default Lucine search returns only first 25 records. 
	 * 		This behavior can be increased up to 200 (params.limit).
	 * 		In order to get all records we need to chunk data in 200 rows increments.
	 */
	var cloudantLucineSearch = function(user_params, params, dbobj, callback) {
		var db = Cloudant.db.use(dbName);
		var tdocs = new Array();
		
		if(!params.limit) 
			params.limit = 200;
		if(!dbobj || dbobj.iserr)
			dbobj = cloudantLucineSearchConfig(user_params.Type);

		if(dbobj.iserr)
			callback("Error: Lucene Index is not specified.", null);
		else
		{
			if(!params.query) params.query = cloudantLucinePrepareQuery(user_params, params, dbobj);
			if(params.bookmark) params.query.bookmark = params.bookmark;
		
//			console.log(params.query);
			db.search(dbobj.ddoc, dbobj.lindex, params.query, function(err, doc) {
				if(err)		
					callback(err, null);
				else
				{
					if(doc.rows.length > 0)
					{
						params.bookmark = doc.bookmark;
						cloudantLucineSearch(user_params, params, dbobj, function(new_err, new_docs) {
							if(new_err)
								callback(new_err, null);
							else
								callback(null, new_docs.concat(doc.rows));
						});
					}
					else
						callback(null, doc.rows);
				}
			});
		}
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
	    
		var projects = _.map(projects, function(val, ind){
	        return ["Project", val];
	    });
		
	    cloudantGetDocumentsByKeys('views', 'AllHoursInOne', projects, true, function(err, body){
	    	callback(err, prepareResponse(body, 'hours', 'doc'));
	    });
	   
	    
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
	    } );
	};
	
	module.exports.listPeople = function(callback) {
	    cloudantGetAllViewDocument('views', 'People', null, function(err, body){
	        callback(err, prepareResponse(body, 'people', 'value'));
	    });
	};

	/* ==============================================================
	 * Method performs a view lookup for an ACTIVE People record based on different key(s)
	 * VALID keyNames: googleId, fullName, resource, primaryRole, groups
	 * 
	 * More keys can be added upon request (@Max Moroz)
	 * 
	 * Input: String or array
	 * Output: Array of docs (according to prepareResponse format). 
	 */
	module.exports.listActivePeopleByKeys = function(keyName, originalKeys, include_docs, callback) {
		var keys;
		
		if(Array.isArray(originalKeys)) {
			keys = _.map(originalKeys, function(val){
		        return [keyName, val];
		    });
		} else {
			keys = [[keyName, originalKeys]];
		}

		cloudantGetDocumentsByKeys('lookupViews', 'PeopleActive', keys, include_docs, function(err, body){
	        callback(err, prepareResponse(body, 'people', 'doc'));
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
	
	var listRoles = function(callback) {
	    cloudantGetAllViewDocument('views', 'Roles', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'roles', 'doc'));
	    });
	};
	
	var listSecurityRoles = function(callback) {
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
	
	module.exports.listReportFavorites = function(callback) {
	    cloudantGetAllViewDocument('views', 'ReportFavorites', {include_docs : true}, function(err, body){
	         callback(err, prepareResponse(body, 'reports/favorites', 'doc'));
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
	module.exports.cloudantLucineSearch = cloudantLucineSearch; 
};
