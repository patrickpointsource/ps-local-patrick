'use strict';

var Cloudant = require("cloudant"); 

var cloudDBName = 'mm_db_demo';

var dbAccount = "psdev1";
var dbApiKey = "tathendersheaderefortati";
var dbPwd = "e7wRT4nm0IgHGeWu07benG36";

var dbConnParams = {account:dbAccount, key:dbApiKey,password:dbPwd}; 


 Cloudant(
	dbConnParams, function(er, cloudant, reply) {
		if (er){
			return console.log('Error connecting to Cloudant account %s: %s', config.cloudant.account, er.message);
		} else {
			//console.log('Connected to Cloudant: Server version = %s', reply.version);
			var cloudantDB = cloudant.db.use(cloudDBName);

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



var getCloudantConnection = function (dbConnParams, callback) {
	var db = null;
	
	Cloudant(dbConnParams, function(er, cloudant, reply) {
			if (er){
				console.log('Error connecting to Cloudant account: %s', er.message);
			} else {
				db = cloudant;
				console.log("Cloudant Connection Successful");
				callback(db);
			};
//			callback(db);
		});
}


var cloudantViewNew3 = function (db) {
	var testDb = getCloudantConnection(dbConnParams);	
}


var getListProjects = function( callback ) {
	dbListProjects( function( err, body ) {
		if( !err ) {
			console.log("got list of Projects");
		}

		callback( err, body );
	} );
};


dbListProjects(function( err, body ) {
	if( !err ) {
		console.log(body);
	}
});

//cloudantView('views', 'Projects', null, function(err, body){
//callback(err, prepareResponse(body, 'projects', 'value'));
//});



