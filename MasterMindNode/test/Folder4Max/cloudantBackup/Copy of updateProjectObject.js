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


function doSomething() {
//	var db = nano.db.use('mm_db_demo');
	var params = {};
	var name = "";

	console.log(new Date().toString() + "Start. Getting data from Cloudant.");
	db.view ('views', 'Projects?include_docs=true&limit=2', params, function(err, body){
        if (err) {
            console.log(err);
        } else {
        	console.log(new Date().toString() + "Got data from Cloudant. Parsing records.");
        	body.rows.forEach( function(record) {
				name = "";
				doc = record.value;
				console.log("Checking document:" + doc._id + " : Form:" + doc.form);
				if (doc.created && (!doc.created.name)) {
					resourceId = doc.created.resource.substring(doc.created.resource.indexOf("/") + 1);
					//getNameById(resourceId, 'people', doc, function(nameIn) {
					getResourceNameById(resourceId, 'people', doc, updateResource);
				} else {
					console.log("Nothing to update.");
				}
			});
        }
	});	
};

function getResourceNameById(docId, resourceType, originalDoc, callback) {
	var name = "";

	console.log("Get Resource DocumentById:" + docId);
	doc = db.get(docId, function(err, body) {
		if(err) {
			console.log(err);
		} else {
			doc = body;
//			console.log("docById:");
//			console.log(doc);
			if (doc) {
				switch(resourceType) {
				 case "people":
					console.log("Looking for People resource name:" + docId);
					name = doc.name.fullName;
					break;
				default:
					console.log("Default case");
				}
			}
		};
		callback(name, originalDoc);
	});
//	console.log(doc);
//	console.log("Name 1:" + name);
//	callback(name);
	//return(name);
	
}

function updateResource(nameIn, doc){
	console.log("updateResource::doc:");
	console.log(doc);
	doc.created.name = nameIn;
	db.insert(doc, doc._id, function(err, body){
        if (err) {
            console.log(err);
        } else {
            console.log("Document is updated:" + doc._id);
        }
	});
}


doSomething();

