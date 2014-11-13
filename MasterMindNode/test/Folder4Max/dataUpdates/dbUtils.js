'use strict';

//var dbAccount = "psdev1";
//var dbApiKey = "tathendersheaderefortati";
//var dbPwd = "e7wRT4nm0IgHGeWu07benG36";
var dbConnParams;
var dbName;

var dev = {"account": "psdev1", "key" : "tathendersheaderefortati", "password": "e7wRT4nm0IgHGeWu07benG36"};
var stage = {"account": "psprod1", "key" : "istraustandivillownedome", "password": "uuVXxmARXdpLYkU7X1T0yS7D"};
var prod = {"account": "psprod1", "key" : "beentorestoldiseandeamed", "password": "mXuflwvgb3G003jjKnraqasb"};

var env = "dev";

switch (env) {
	case "dev":
		dbName = "mm_db_demo";
		dbConnParams = dev;	
		break;
		
	case "stage":
		dbName = "mm_db_stage";
		dbConnParams = stage;	
		break;
		
	case "prod":
		dbName = "mm_db_prod";
		dbConnParams = prod;		
		break;
}

var Cloudant = require("cloudant")(dbConnParams); 

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



var deleteAllViewDocs = function() {
	var bulkDocs = [];
	var doc;
	var db = Cloudant.db.use(dbName);
	
	cloudantGetAllViewDocument('Admin', 'docs2delete', {"include_docs" : true }, function(err, body) {
		if (err) {console.log(err);}
		else {
			body.rows.forEach( function (row){
				doc = row.doc;
				doc._deleted = true;
				bulkDocs.push(doc);
			})	;
			db.bulk({"docs" : bulkDocs}, {}, function(err, body) {
				if (err) {console.log(err);}
				console.log(body);
			});
		};
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
module.exports.cloudantGetAllViewDocument = cloudantGetAllViewDocument;
module.exports.cloudantGetDocumentsByKeys = cloudantGetDocumentsByKeys;
module.exports.cloudantGetDocumentsByRangeKeys = cloudantGetDocumentsByRangeKeys;
module.exports.cloudantQuerySearch = cloudantQuerySearch;

//deleteAllViewDocs();
//cloudantQuerySearch({});