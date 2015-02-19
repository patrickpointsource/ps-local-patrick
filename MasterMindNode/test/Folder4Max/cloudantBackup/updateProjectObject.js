/*
1. Store object name with “resource” fields.

"executiveSponsor": {
"resource": "people/52ab7005e4b0fd2a8d130004"
},
"created": {
"resource": "people/52ab7005e4b0fd2a8d130025"
},
"modified": {
"resource": "people/52e12adee4b0a9efe8d7b5dc"
}
*/
/*
 * Set of functions required for Cloudant DB Replicas (Backups) creation. 
 */

var config = require('../../server/config/config.js');
var nano = require('nano')('https://mmoroz76:notapassw0rd@mmoroz76.cloudant.com/');
var db = nano.db.use('mm_bogdan');
//var nano = require('nano');


function doSomething(callback) {
//	var db = nano.db.use('mm_db_demo');
	var params = {};
	var name = "";
	var bulkDocs = [];
	
	console.log(new Date().toString() + " Start. Getting data from Cloudant.");
	db.view ('views', 'Projects?include_docs=true', params, function(err, body){
        if (err) {
            console.log(err);
        } else {
        	console.log(new Date().toString() + " Got data from Cloudant. Parsing records.");
        	body.rows.forEach( function(record) {
				name = "";
				doc = record.value;
				//console.log("");
				console.log("Checking document:" + doc._id + " :: Form: " + doc.form);
				
				// updateResource
				//getResourceNameById('created', 'people', doc, function(o) {originalDoc = o;});
				//getResourceNameById('modified', 'people', doc, function(o) {originalDoc = o;});
				//getResourceNameById('executiveSponsor', 'people', doc, function(o) {originalDoc = o; bulkDocs.push(originalDoc);});

				isUpdated = 0;
				getResourceNameById('created', 'people', doc, function(o1, needsUpdate){
					isUpdated =+ needsUpdate;
					getResourceNameById('modified', 'people', o1, function(o2, needsUpdate) {
						isUpdated =+ needsUpdate;
						getResourceNameById('executiveSponsor', 'people', o2, function(o3, needsUpdate) {
							isUpdated =+ needsUpdate;
							//console.log("isUpdated=" + isUpdated);
//							console.log("Final updated document:");
//							console.log(o3);
//							bulkDocs.push(o3);
							if (isUpdated > 0) {
								db.insert(o3, o3._id, function(err, body){
							        if (err) {
							            console.log(err);
							        } else {
							            console.log("Document is updated:" + o3._id);
										//console.log("SAVE CREATED");
										//console.log(o3.created);
										//console.log("SAVE MODIFIED");
										//console.log(o3.modified);
										//console.log("SAVE EXECUTIVE SPONSOR");
										//console.log(o3.executiveSponsor);
							        }
								});	
							};
						});						
					});
				});
        	});
        	//callback();
        }
	});	
};

//function getResourceNameById(resourcePath, resourceType, originalDoc, callback) {
function getResourceNameById(resourcePath, resourceType, originalDoc, callback) {
	var name = "";

	//console.log("2.1. getResourceNameById:" + resourcePath);
	//console.log(originalDoc[resourcePath]);

	if (originalDoc[resourcePath] && (! originalDoc[resourcePath].name)) {
		docId = originalDoc[resourcePath].resource.substring(originalDoc[resourcePath].resource.indexOf("/") + 1);
		
		//console.log("2.2. getResourceNameById: Get Resource DocumentById:" + docId);
		doc = db.get(docId, function(err, body) {
			if(err) {
				console.log(err);
			} else {
				resourceDoc = body;
				if (resourceDoc) {
					switch(resourceType) {
					 case "people":
						//console.log("Looking for People resource name:" + docId);
						name = resourceDoc.name.fullName;
						originalDoc[resourcePath].name = name;
						break;
					default:
						console.log("Default case");
					}
				}
			};
			//callback(name, originalDoc);
			//console.log("2.3. getResourceNameById:" + resourcePath);
			//console.log(originalDoc[resourcePath]);
			callback(originalDoc, 1);
		});		
	} else {
		//console.log("Nothing to update.");
		callback(originalDoc, 0);		
	}
}

//=============================================================================
function updateResourceName(resourceName, resourcePath, originalDoc) {
	originalDoc[resourcePath].name = resourceName;
}


doSomething();

