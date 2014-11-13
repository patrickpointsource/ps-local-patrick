'use strict';

// Data access layer for cloudant
var config = require('../config/config.js');
var _ = require('underscore');
//var nano = require('nano')(config.cloudant.url);
//var Cloudant = require("cloudant"); 

// nano module
//var database = config.db;

// cloudant module
var dbName = config.db;
var dbAccount = config.cloudant.account;
var dbApiKey = config.cloudant.user;
var dbPwd = config.cloudant.password;
var dbConnParams = {account:dbAccount, key:dbApiKey,password:dbPwd}; 
var Cloudant = require("cloudant")(dbConnParams);


// New code (MM 10/20/14)
var cloudantView = function(designName, viewName, params, callback){
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




var insertItem = function(id, item, callback){
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


//======================================================================================
var cloudantSearchByRangeKeys = function(designName, viewName, startKeys, endKeys, callback){
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

    //var db = nano.db.use(database);
	var db = Cloudant.db.use(dbName);
    var query = '{}';
    
    if (startKeys && endKeys)
        query = '{ "queries" : [ {"startkey" :  ' + JSON.stringify(startKeys) + ', "endkey" :    ' + JSON.stringify(endKeys) + ', "include_docs" : true}]}';
    else
        //query = JSON.stringify({queries: [{keys: startKeys}]});
    	query =  '{"keys": ' + JSON.stringify(startKeys) + '}';
    	//query = '{ "keys" : [' + JSON.stringify(startKeys) + '], "include_docs" : true]}';
    
    //nano.request({ db: database,
    Cloudant.request({ db: dbName,
            method : 'post',
            path : '/_design/' + designName + '/_view/' + viewName + '?include_docs=true',
            body : JSON.parse(query)
               }, function(err, body){
            if (err) {
                callback(err, null);
            } else {
              callback(null, body);
            }});

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



//=============================================================================
var prepareResponse = function(data, about, valProp) {
    var result = {};
    
    if(data) {
      result.data = _.map(data.rows, function(val, key) {return val[valProp]});
    }
    
    result.count = result && result.data ? result.data.length: 0;
    result.about = about;
    
    return result;
};

//designName = "views"

//viewName = "AllHoursInOne"
//startKeys = ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-01"]
//endKeys =   ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-31"]

module.exports.listHoursByStartEndDates = function(start, end, callback) {
    // MM cloudantSearchByRangeKeys('views', 'AllHoursInOne', start, end, function(err, body){
	cloudantGetDocumentsByRangeKeys('views', 'AllHoursInOne', start, end, true, function(err, body){
        //callback(err, prepareResponse(body && body.results.length == 1 ? body.results[0]: {}, 'hours', 'doc'));
    	callback(err, prepareResponse(body, 'hours', 'doc'));
        //callback(err, body);
    });
};

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




module.exports.listHoursByPerson = function(callback) {
    cloudantView('views', 'HoursByPerson', null, function(err, body){
         callback(err, prepareResponse(body, 'hours', 'doc'));
    });
};


module.exports.listHoursByPersonDate = function(callback) {
    cloudantView('views', 'testHoursByPersonDate', null, function(err, body){
         callback(err, prepareResponse(body, 'hours', 'doc'));
    });
};
/*
module.exports.listHours = function(q, callback) {
    var start = ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-01"];
    var end = ["ProjectPersonDate", "projects/52aba189e4b0fd2a8d13002e", "people/52ab7005e4b0fd2a8d130017", "2014-01-01"];
    
    cloudantSearchByRangeKeys('views', 'AllHoursInOne', start, end, function(err, body){
         callback(err, prepareResponse(body.results.length == 1 ? body.results[0]: {}, 'hours', 'doc'));
         //callback(err, body);
    });
};
*/
module.exports.listProjects = function(callback) {
    cloudantView('views', 'Projects', null, function(err, body){
        callback(err, prepareResponse(body, 'projects', 'value'));
    });
};

module.exports.listPeople = function(callback) {
    cloudantView('views', 'People', null, function(err, body){
        callback(err, prepareResponse(body, 'people', 'value'));
    });
};

module.exports.listTasks = function(callback) {
    cloudantView('views', 'Tasks', null, function(err, body){
         callback(err, prepareResponse(body, 'tasks', 'value'));
    });
};

module.exports.listAssignments = function(callback) {
    cloudantView('views', 'Assignments', null, function(err, body){
        callback(err, prepareResponse(body, 'assignments', 'value'));
    });
};

module.exports.listRoles = function(callback) {
    cloudantView('views', 'Roles', {include_docs : true}, function(err, body){
         callback(err, prepareResponse(body, 'roles', 'doc'));
    });
};

module.exports.listSecurityRoles = function(callback) {
    cloudantView('views', 'SecurityRoles', {include_docs : true}, function(err, body){
         callback(err, prepareResponse(body, 'security_roles', 'doc'));
    });
};

module.exports.listUserRoles = function(callback) {
    cloudantView('views', 'UserRoles', {include_docs : true}, function(err, body){
         callback(err, prepareResponse(body, 'user_roles', 'doc'));
    });
};

module.exports.listLinks = function(callback) {
    cloudantView('views', 'Links', {include_docs : true}, function(err, body){
         callback(err, prepareResponse(body, 'links', 'doc'));
    });
};

module.exports.listConfiguration = function(callback) {
    cloudantView('views', 'Configuration', {include_docs : true}, function(err, body){
         callback(err, prepareResponse(body, 'configuration', 'doc'));
    });
};

module.exports.listSkills = function(callback) {
    cloudantView('views', 'Skills', {include_docs : true}, function(err, body){
         callback(err, prepareResponse(body, 'skills', 'doc'));
    });
};

module.exports.listVacations = function(callback) {
    cloudantView('views', 'Vacations', {include_docs : true}, function(err, body){
         callback(err, prepareResponse(body, 'vacations', 'doc'));
    });
};

module.exports.listNotifications = function(callback) {
    cloudantView('views', 'Notifications', {include_docs : true}, function(err, body){
         callback(err, prepareResponse(body, 'notifications', 'doc'));
    });
};

module.exports.insertItem = insertItem;
module.exports.updateItem = updateItem;
module.exports.deleteItem = deleteItem;
module.exports.getItem = getItem;

