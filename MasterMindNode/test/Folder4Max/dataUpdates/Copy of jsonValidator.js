'use strict';

var Q = require("q");
var config = require('../../../server/config/config.js');
//var dbAccess = require( '../../../server/data/dbAccess.js' );
var dbAccess = require( './dbUtils.js' );
var tv4 = require("tv4");

var assignmentsSchema = 	require('../../../server/data/validationSchemas/Assignments.json');
var hoursSchema = 	require('../../../server/data/validationSchemas/Hours.json');
var rolesSchema = 	require('../../../server/data/validationSchemas/Roles.json');
var secRolesSchema =require('../../../server/data/validationSchemas/SecurityRoles.json');
var tasksSchema = 	require('../../../server/data/validationSchemas/Tasks.json');
var banUnknownProperties = config.dataValidation_BanUnknownProperties;

//dbAccess.cloudantGetDocumentsByKeys('Admin', 'ByForm', "Roles", false, function(err, body){
//dbAccess.cloudantGetDocumentsByKeys('Admin', 'ByForm', "SecurityRoles", false, function(err, body){


var testFixHours = function(doc, e) {
	var deferred = Q.defer();

	console.log(e);
	return (deferred.resolve(doc));
};


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
		
		uniqueErrors.forEach(function(e) {console.log(e);});
	});	
};


/*
var generateJSONSchema = function(formName) {
	var path;
	var parentNodePath;
	var fieldType;
	
	var schemaTemplate = {
			"$schema": "http://json-schema.org/draft-04/schema",
			"type":"object",
			"required":true,
			"properties":{
				"_id": {
					"type":"string",
					"required":false
				},
				"_rev": {
					"type":"string",
					"required":false
				}
			}
	};
	schemaTemplate.id = formName;
	
	
	dbAccess.cloudantGetDocumentsByKeys('Admin', 'ByForm', formName, true, function(err, body){
		if (err) 
			{console.log(err);} 
		else {
			body.rows.forEach( function(d) {
//				var doc = d.value;
				var doc = d.doc; // if include_docs = true
				//console.log(doc);
				//doc = d.doc;
				//validateDocumentSchema(doc);
				var validationResults = tv4.validateMultiple(doc, schemaTemplate, false, true);
				if (validationResults.errors.length > 0){
					validationResults.errors.forEach( function (err) {
						console.log();
						//console.log(err);
						switch (err.code){
						case 1000:
							path = err.dataPath.substring(1).replace('/', '.');
							parentNodePath = path.substring(path.lastIndexOf('.'), 0);
							fieldType = typeof(doc.get(path));
							
							console.log("node:" + doc.get(path));
							console.log("nodePath:" + path);
							console.log("parentNodePath:" + parentNodePath);
							console.log("fieldType:" + fieldType);
							console.log("schemaPath:" + err.schemaPath);
							
							switch (fieldType) {
							case "object":
								if (Array.isArray(doc[path])) {
									schemaTemplate['properties'][path] = {"type" : "array", "required" : false, "items" : []};
								} else {
									schemaTemplate['properties'][path] = {"type" : fieldType, "required" : false, "properties" : {}};
								}
								break;
								
							case "string", "number":
								schemaTemplate['properties'][path] = {"type" : fieldType, "required" : false};
								break;
							}
							break;
							
						default:
							console.log(err);
						}
					});
					console.log("Validation Schema");
					console.log(schemaTemplate);
				}
			});
		}
		//console.log(body);
			console.log("Updated template");
			console.log(schemaTemplate);
	});
};
*/


var validateDocumentSchema = function(doc) {
	var schema = null;
	var message;
	var messages = [];
	
	if (doc.form) {
		switch(doc.form.toLowerCase()) {
		case "assignments":
			schema = assignmentsSchema;
			break;

		case "hours":
			schema = hoursSchema;
			break;

		case "securityroles":
			schema = secRolesSchema;
			break;
		
		case "roles":
			schema = rolesSchema;
			break;

		case "tasks":
			schema = tasksSchema;
			break;	
		}
		
		if (schema) {
			var validationResults = tv4.validateMultiple(doc, schema, false, banUnknownProperties);
			if (validationResults.errors.length > 0){
				console.log("\nDocument _id:" + doc._id);
				validationResults.errors.forEach( function (err) {
					message = "Error: " + err.code + " " + err.message + " : Field:" + err.dataPath;
					console.log(message);
					messages.push(message);
				});
				
				fixData(doc, validationResults.errors);	
			};
		} else {
			console.log("JSON Validation Schema is not found for form:" + doc.form);
		}
	} else {
		console.log("JSON SChema validation: Unknown form for docId:" + doc._id);
	}
	return (messages);
};



/*===============================================
 * MODULE for HOURS object fixes
 */
var fixDataHours = function(doc, e) {
	var deferred = Q.defer();
	
	switch (e.code){
	case 0:		//	invalid data type
		switch (e.dataPath){
			case ("/person/name"):
				if (e.params.type === 'object') {
					newValue = doc.person.name.fullName;
					delete doc.person.name;
					doc.person.name = newValue;
					return deferred.resolve(doc);
				}
				break;
			default:
				return deferred.resolve(doc);
		}
		break;
	
	case 302:	//	Missing required property
//					console.log("e.dataPath:" + e.dataPath);
//					console.log(e);
		switch (e.dataPath){
		case "/person":
			if (e.params.key == "name" && doc.person.resource){
				tmpId = doc.person.resource.split("/")[1];
				dbAccess.getItem(tmpId, function(err, persondoc){
					if (err) {console.log(err); return;}
					doc.person.name = persondoc.name.fullName;
					return deferred.resolve(doc);
					});	
			} else {
				return deferred.resolve(doc);
			}
			break;

		default:
			return deferred.resolve(doc);
		}
		break;
		
	case 1000:	//	Attribute not in schema
		switch (e.dataPath){
		case ("/person/name"):
			return deferred.resolve(doc);
			break;

		default:
			return deferred.resolve(doc);
		};
		break;

	default:
		return deferred.resolve(doc);
	};
	
	return deferred.promise;
};


/*================================================================
 * 
 */
var fixData = function(doc, errs) {
	fixDataFields(doc, errs).then( function(updatedDoc) 
		{
			console.log("Updated document");
			console.log(updatedDoc);
		
			dbAccess.updateItem(updatedDoc._id, updatedDoc, function(err, body){
	        if (err) {
	            console.log(err);
	        } else {
	        	console.log(body);
	        }
		});
	});	
};

/*================================================================
 * 	Common method for repeating functionality
 */
var fixDataIsResolved = function(doc, total, resolvedErrors, deferred) {
	console.log("resolved " + resolvedErrors);
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
	var otherd;
	var tmpId;
	var deferred = Q.defer();
	var resolvedErrors = 0;
	var totalErrors=0;
	
	var test;
	
	totalErrors = errs.length;
	
	errs.forEach(function(e) {
		switch (doc.form.toLowerCase()){
		case "hours":
//			fixDataHours(doc,e).then(function (doc) {
			testFixHours(doc, e).then(function (doc) {
				resolvedErrors = resolvedErrors + 1;
				fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);				
			});
			break;

		default:
			resolvedErrors = resolvedErrors + 1;
			fixDataIsResolved(doc, totalErrors, resolvedErrors, deferred);
		}		
	});
	
	return deferred.promise;	
};


/*
var forms = ['Assignments', 'Roles', 'SecurityRoles', 'Tasks', 'Hours', 'Links', 'Notifications', 'People', 'Projects', 'UserRoles', 'Vacations'];
forms.forEach(function(f) {
	validateDocumentCollection('Tasks');
});
*/

//generateJSONSchema('Tasks');
//generateJSONSchema('Assignments');
//validateDocumentCollection('Assignments');
//validateDocumentCollection('Hours');
//validateDocumentCollection('SecurityRoles');


dbAccess.getItem("5357bfe83004dbe1ec073b7c", function (err, doc) {
	if (err) {console.log(err);};
	console.log(doc);
	validateDocumentSchema(doc);	
});

/*
var test = function() {
	var people = ["52ab7005e4b0fd2a8d130003", "52ab7005e4b0fd2a8d130015", "52e12adee4b0a9efe8d7b5dc"];
	
	var doc = {};
		
		testUpdateFieldAsync(doc, people).then( function(d){
			doc = d;
			console.log("updated doc 2");
			console.log(doc);
//		});
//		console.log(uid + ": updated doc1");
//		console.log(doc);
	});
	
	console.log("Final doc:");
	console.log(doc);
	
};

var testUpdateFieldAsync = function(doc, people) {
	var deferred = Q.defer();
	var resolvedErrors = 0;
	
	people.forEach( function(uid) {
		console.log(uid + ": Start");
		console.log("\nProcessing " + uid);
		console.log(uid + ": current doc");
		console.log(doc);

		dbAccess.getItem(uid, function (err, userdoc) {
			if (err) {console.log(err);};
			doc[uid] = {"name" : userdoc.name.fullName};
			console.log(uid + ": uid name:" + userdoc.name.fullName);
			resolvedErrors = resolvedErrors + 1;
			testIsResolved(doc, people.length, resolvedErrors, deferred);
			
		});
		console.log(uid + ": Finish");
	});

	
	return deferred.promise;
};

var testIsResolved = function(doc, total, resolvedErrors, deferred) {
	console.log("resolved " + resolvedErrors);
	if (resolvedErrors == total){
		return (deferred.resolve(doc));	
	};
};

test();
*/