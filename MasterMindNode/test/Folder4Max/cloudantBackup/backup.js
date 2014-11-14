/*
 * Set of functions required for Cloudant DB Replicas (Backups) creation. 
 */

var config = require('../../server/config/config.js');
var nano = require('nano')(config.cloudant.url);
//var nano = require('nano');

function doBackup(sourceDbName, targetServer) {
	/*	INPUT:
	 *  sourceDbName : Name of the DB to be backed up. String. Nullable.
	 *				   if sourceDbName is not provided, current db from the config will be used.
	 * 	targetServer :	URL of the destination Cloudant server. String. Nullable.
	 * 	 description :  DB Replica can be created on server in different region.
	 * 					If targetServer is not provided, then current Cloudant server will be used for backup. 
	 * 					This is a placeholder for future extention. Not utilized yet.
	 * 				   	target db name, and authentication credentials should be passed. 	
	 */	
	
	daysToRetain = 17;
	
	if (sourceDbName === null) {
		sourceDbName = config.db;		
	}
	
	createBackup(sourceDbName, targetServer);
	deleteOldBackups(sourceDbName, daysToRetain, targetServer);
};



function createBackup(sourceDbName, targetServer) {
	var backupNameSuffix;
    //var sourceDb = nano.db.use(sourceDbName);
    
    if(targetServer === null) {
    	targetServer = config.cloudant.url;
    };
    
	backupNameSuffix = new Date().toISOString().replace(/\..+/, '').replace(/[T\- \:]/g, '');
	targetDbName = sourceDbName + '_autobackup_' + backupNameSuffix;

	requestBody = {
		  "source": {
		    "url": config.cloudant.url + "/" + sourceDbName
		  },
		  "create_target": true,
		  "target": {
		    "url": targetServer + "/" + targetDbName
		  }
		}; 

	console.log("source url:" + config.cloudant.url + "/" + sourceDbName);
	console.log("target url:" + targetServer + "/" + targetDbName);
	
    nano.request({
            "method" : "post",
            "path" : "_replicator",    		
    		"body" : requestBody
    		}, 
    		function (error, response, body) {
  			if (error) {
    			console.log(error);
    			console.log(response);
  			} else {
  				console.log("Backup " + targetDbName + " successfully created.");
  				console.log(response);
  				console.log(body);
  			};
  	});	
};


deleteOldBackups = function(dbName, daysToRetain) {
	var allDbs;
	
	
	
};


doBackup(null, null);

