'use strict';

var Q = require("q");
var config = require('../../../server/config/config.js');
//var dbAccess = require( '../../../server/data/dbAccess.js' );
var dbAccess = require( './dbUtils.js' );
var tv4 = require("tv4");

var banUnknownProperties = config.dataValidation_BanUnknownProperties;

tv4.addSchema(require('../../../server/data/validationSchemas/Assignments.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/Hours.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/Roles.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/SecurityRoles.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/Tasks.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/Links.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/Notifications.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/Vacations.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/UserRoles.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/Roles.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/Projects.json'));
tv4.addSchema(require('../../../server/data/validationSchemas/People.json'));


var validateDocumentCollection = function(formName) {
	console.log("Processing form " + formName);
	console.log("Ban unknown properties:" + banUnknownProperties);
	var errs = [];
	var uniqueErrors = [];
	
	dbAccess.cloudantGetDocumentsByKeys('Admin', 'ByForm', formName, true, function(err, body){
		if (err) 
			{console.log(err);} 
		else {
			errs = [];
			body.rows.forEach( function(d) {
				//console.log(d);
				var doc = d.doc;
				//console.log(doc);
//				doc = d.doc;
				errs = validateDocumentSchema(doc);
				errs.forEach(function (err) {
					if (uniqueErrors.indexOf(err) == -1){
						uniqueErrors.push(err);	
					};
				});
			});	
		};
		
		console.log("\n\nUnique Errors:");
		uniqueErrors.forEach(function(e) {console.log(e);});
	});	
};


var validateDocumentSchema = function(doc) {
	var schema = null;
	var message;
	var messages = [];
	
	schema = tv4.getSchema(doc.form);
		
	if (schema) {
		console.log("\nDocument _id:" + doc._id);
		var validationResults = tv4.validateMultiple(doc, schema, false, banUnknownProperties);
		if (validationResults.errors.length > 0){
			console.log("\nDocument _id:" + doc._id + " : Total " + validationResults.errors.length + " errors.");
			
			validationResults.errors.forEach( function (err) {
				message = "Error: " + err.code + " " + err.message + " : Field:" + err.dataPath;
				console.log(message);
				messages.push(message);
			});
			
			//fixData(doc, validationResults.errors);	
		};
	} else {
		console.log("JSON Validation Schema is not found for form:" + doc.form);
	}

	return (messages);
};


/*================================================================
 * 
 */
var fixData = function(doc, errs) {
	//console.log("fixData Start.");
	var andSave = false;
	
	fixDataFields(doc, errs).then( function(updatedDoc) 
		{
			console.log("Updated document");
			console.log(updatedDoc);
			//console.log("fixData End.");
			
			if (andSave) {
				dbAccess.updateItem(updatedDoc._id, updatedDoc, function(err, body){
			        if (err) {
			            console.log(err);
			        } else {
			        	console.log(body);
			        }				
				});
			}
	});	
};

/*================================================================
 * 	Common method for repeating functionality
 */
var fixDataIsResolved = function(doc, total, resolvedErrors, deferred) {
	console.log("resolved " + resolvedErrors + "/" + total);
	if (resolvedErrors == total){
		return (deferred.resolve(doc));	
	};
};


/* ===================================================================
 * INPUT: Document and Array of errors.
 * OUTPUT: Updated document
 * Method returns PROMISE. 
 * All fixes are hardcoded, and are specific to Application/Collection 
 */
var fixDataFields = function(doc, errs) {
	var newValue;
	var resourceDoc;
	var tmpId;
	var resolvedErrors = 0;
	var totalErrors=0;
	var tmpArr = [];
	var tmpNode;
	
	var deferred = Q.defer();
	totalErrors = errs.length;

	//console.log("fixDataFields:: Total errors:" + totalErrors);
	
	errs.forEach(function(e) {
		console.log("Fixing error:: Form:" + doc.form.toLowerCase() + " : e.code:" + e.code + ": dataPath:" + e.dataPath);
		
		switch (doc.form.toLowerCase()){
		//	HOURS OBJECT
		case "hours":
			switch (e.code){
			case 0:		//	invalid data type
				switch (e.dataPath){
				case ("/person/name"):
					if (e.params.type === 'object') {
						newValue = doc.person.name.fullName;
						delete doc.person.name;
						doc.person.name = newValue;
						resolvedErrors = resolvedErrors + 1;
						fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					}
					break;
				
				case ("/hours"):
					if (e.params.type === 'null' && e.params.expected == "number") {
						doc.hours = 0;
					}
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					break;

					
				default:
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
				}
				break;
			
			case 302:	//	Missing required property
//							console.log("e.dataPath:" + e.dataPath);
//							console.log(e);
				switch (e.dataPath){
				case "/person":
					if (e.params.key == "name" && doc.person.resource){
						tmpId = doc.person.resource.split("/")[1];
						dbAccess.getItem(tmpId, function(err, persondoc){
							if (err) {console.log(err); return;}
							doc.person.name = persondoc.name.fullName;
							resolvedErrors = resolvedErrors + 1;
							fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
							});	
					} else {
						resolvedErrors = resolvedErrors + 1;
						fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					}
					break;
				case "/task":
					if (e.params.key == "name" && doc.task.resource){
						tmpId = doc.task.resource.split("/")[1];
						dbAccess.getItem(tmpId, function(err, resourceDoc){
							if (err) {console.log(err); return;}
							doc.task.name = resourceDoc.name;
							//console.log("Resource Name:" + resourceDoc.name);
							resolvedErrors = resolvedErrors + 1;
							fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
							});	
					} else {
						resolvedErrors = resolvedErrors + 1;
						fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					}
					break;
					
				case "/project":
					if (e.params.key == "name" && doc.project.resource){
						tmpId = doc.project.resource.split("/")[1];
						dbAccess.getItem(tmpId, function(err, resourceDoc){
							if (err) {console.log(err); return;}
							doc.project.name = resourceDoc.name;
							//console.log("Resource Name:" + resourceDoc.name);
							resolvedErrors = resolvedErrors + 1;
							fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
							});	
					} else {
						resolvedErrors = resolvedErrors + 1;
						fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					}
					break;
					
				default:
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
				}
				break;
				
			case 1000:	//	Attribute not in schema
				switch (e.dataPath){
				case ("/person/name"):
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					break;
					
				default:
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
				};
				break;
				
			default:
				resolvedErrors = resolvedErrors + 1;
				fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
			};
			break;
		
		//	ASSIGNMENTS OBJECT
		case "assignments":
			switch (e.code){
			case 1000:		//	Attribute not in schema
				tmpArr = e.dataPath.split("/");
				if ((tmpArr.length == 4) && (tmpArr[1] == "members") && ((tmpArr[3] == "_id") || (tmpArr[3] == "about"))){
					tmpNode = doc.members[tmpArr[2]];
					delete tmpNode.about;
					delete tmpNode._id;
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
				}
				break;
			}	
			break;
		
		//	PROJECTS OBJECT
		case "projects":
			switch (e.code) {
			case 0:	// invalid data type
				switch (e.dataPath){
				case "/terms/fixedBidServicesRevenue":
					if (e.params.type == "string" && e.params.expected == "number") {
						newValue = parseInt(doc.terms.fixedBidServicesRevenue);
						console.log(doc.terms.fixedBidServicesRevenue + " -> " + newValue);
						if (!isNaN(newValue)) {
							doc.terms.fixedBidServicesRevenue = newValue;
						} else {
							console.log("Problem with converting string to number.");
						}
					}
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					break;
				
				case "/terms/softwareEstimate":
					if (e.params.type == "string" && e.params.expected == "number") {
						newValue = parseInt(doc.terms.softwareEstimate);
						console.log(doc.terms.softwareEstimate + " -> " + newValue);
						if (!isNaN(newValue)) {
							doc.terms.softwareEstimate = newValue;
						} else {
							console.log("Problem with converting string to number.");
						}
					}
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					break;

				case "/executiveSponsor/name":
					if (e.params.type === 'object') {
						newValue = doc.executiveSponsor.name.fullName;
						delete doc.executiveSponsor.name;
						doc.executiveSponsor.name = newValue;
						resolvedErrors = resolvedErrors + 1;
						fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					}
					break;
					
				case "/created/name":
					if (e.params.type === 'object') {
						newValue = doc.created.name.fullName;
						delete doc.created.name;
						doc.created.name = newValue;
						resolvedErrors = resolvedErrors + 1;
						fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					}					
					break;

				case "/modified/name":
					if (e.params.type === 'object') {
						newValue = doc.modified.name.fullName;
						delete doc.modified.name;
						doc.modified.name = newValue;
						resolvedErrors = resolvedErrors + 1;
						fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
					}					
					break;
					
				default:
					resolvedErrors = resolvedErrors + 1;
					fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
				};
				break;
			
			case 1000:
				tmpArr = e.dataPath.split("/");
				if ((tmpArr.length >= 4) && (tmpArr[1] == "roles") && ((tmpArr[3] == "assignees") || (tmpArr[3] == "assignee") || (tmpArr[3] == "originalAssignees"))){
					delete doc.roles[tmpArr[2]][tmpArr[3]];
				}
				resolvedErrors = resolvedErrors + 1;
				fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);					
				break;

			default:
				resolvedErrors = resolvedErrors + 1;
				fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);				
			}
			break;
			
		default:
			resolvedErrors = resolvedErrors + 1;
			fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
		};		
	});
	
	return deferred.promise;	
};



/*
var test = function() {
	var doc = { "a" : null, "b" : 2, "c" : "3"};
//	var doc = { "b": 2, "c" : "3"};
//	var doc = { "a": 1, "c" : "3"};
	var message;
	
	var schema = {
		"$schema": "http://json-schema.org/draft-04/schema",
		"type":"object",
		"id": "test",
		"properties":{
			"a" : {"type" : ["null", "number"]},
			"b" : {"type" : "number"},
			"c" : {"type" : "string"}
		}
//		,"required": ["c"],
//		,"oneOf": [
//           {	"type":"object",
//        		"$schema": "http://json-schema.org/draft-04/schema",
//        		"properties":{"a" : {"type" : "number"}},
//        		"required": ["a"]
//           }, 
//           {"type":"object",
//       		"$schema": "http://json-schema.org/draft-04/schema",
//       		"properties":{"b" : {"type" : "number"}},
//        	"required": ["b"]
//          }]
	};
	
	var validationResults = tv4.validateMultiple(doc, schema, false, true);
	if (validationResults.errors.length > 0){
		console.log("Total " + validationResults.errors.length + " errors.");
		
		validationResults.errors.forEach( function (err) {
			message = "Error: " + err.code + " " + err.message + " : Field:" + err.dataPath;
			console.log(message);
			if (err.code == 12) {
				console.log(err);
			}
		});
	} else {
		console.log("Validation successful");
	};
};

test();
*/

/*
var forms = ['Assignments', 'Roles', 'SecurityRoles', 'Tasks', 'Hours', 'Links', 'Notifications', 'People', 'Projects', 'UserRoles', 'Vacations'];
forms.forEach(function(f) {
	validateDocumentCollection('Tasks');
});
*/

// STAGE(PROD)
//+S validateDocumentCollection('Assignments');// synced with validation.js
//+S validateDocumentCollection('SecurityRoles');
//-S validateDocumentCollection('Links');
//+S validateDocumentCollection('Notifications');
//+S validateDocumentCollection('Tasks');
//+S validateDocumentCollection('Vacations');
//-S validateDocumentCollection('UserRoles');
//+S validateDocumentCollection('Roles');
//+D+S validateDocumentCollection('Hours');	// synced with validation.js 
//+D+S validateDocumentCollection('Projects');
//-S 
validateDocumentCollection('People');


/*
//Projects
//dbAccess.getItem("52aba189e4b0fd2a8d13002e", function (err, doc) {
dbAccess.getItem("52b06ca5e4b02565de24922b", function (err, doc) {
	if (err) {console.log(err);};
	console.log("\nOriginal Doc");
	console.log(doc);
	validateDocumentSchema(doc);	
});
*/
