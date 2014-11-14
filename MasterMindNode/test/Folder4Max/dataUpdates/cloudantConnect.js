'use strict';

var dbName = "mm_db_demo";
var dbAccount = "psdev1";
var dbApiKey = "tathendersheaderefortati";
var dbPwd = "e7wRT4nm0IgHGeWu07benG36";

var dbConnParams = {account:dbAccount, key:dbApiKey,password:dbPwd}; 
var Cloudant = require("cloudant")(dbConnParams); 

var cloudantView = function(designName, viewName, params, callback){
	var db = Cloudant.db.use(dbName);
//	getCloudantDb(dbConnParams, dbName)
//		.then(function (db) {
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
//		});
};


//================================================================
var getCloudantDb = function (dbConnParams, dbName) {
	var db = null;
	var deferred = Q.defer();
	
	Cloudant(dbConnParams, function(er, cloudant, reply) {
			if (er){
				console.log('Error connecting to Cloudant account: %s', er.message);
			} else {
				db = cloudant.db.use(dbName);
				console.log("Cloudant Connection Successful");
			};
			deferred.resolve(db);
		});
	return deferred.promise;
};



cloudantView('views', 'Projects', null, function(err, body){
	console.log(err);
	console.log(body);
});




