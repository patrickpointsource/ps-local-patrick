'use strict';

var config = require('../config/config.js');
var dbAccess = require( '../data/dbAccess.js' );
var tv4 = require("tv4");

var banUnknownProperties = config.dataValidation_BanUnknownProperties;

tv4.addSchema(require('../data/validationSchemas/Assignments.json'));
tv4.addSchema(require('../data/validationSchemas/Hours.json'));
tv4.addSchema(require('../data/validationSchemas/Roles.json'));
tv4.addSchema(require('../data/validationSchemas/SecurityRoles.json'));
tv4.addSchema(require('../data/validationSchemas/Tasks.json'));
tv4.addSchema(require('../data/validationSchemas/Links.json'));
tv4.addSchema(require('../data/validationSchemas/Notifications.json'));
tv4.addSchema(require('../data/validationSchemas/Vacations.json'));
tv4.addSchema(require('../data/validationSchemas/UserRoles.json'));
tv4.addSchema(require('../data/validationSchemas/Roles.json'));
tv4.addSchema(require('../data/validationSchemas/Projects.json'));
tv4.addSchema(require('../data/validationSchemas/People.json'));
tv4.addSchema(require('../data/validationSchemas/Configuration.json'));
tv4.addSchema(require('../data/validationSchemas/ReportFavorites.json'));

tv4.defineError('EMPTY_STRING_VALUE', 10002, 'Empty string is not allowed as a value: Schema: {param1}');
tv4.defineError('PROHIBITED_VALUE', 10003, 'Value "{param1}" is not allowed. ');

tv4.addFormat('date-time', function (data, schema) {
	return(typeof data === "string" && isValidDate(data))?(null):({message: 'Invalid date-time: ' + data});
});

var isValidDate = function(string_datetime) {
	return (new Date(string_datetime) !== "Invalid Date" && !isNaN(new Date(string_datetime)) );
};


/*============================================================
 *  custom Keyword. Validate if value is an empty string.
 */
tv4.defineKeyword('can_be_empty_string', function(data, value, schema) {
	if (value === "false"){
		if(typeof(data) === "string" && data.trim().length == 0){
			return {code: tv4.errorCodes.EMPTY_STRING_VALUE, message: {param1: schema}};
		}
	}
	return null;
});

/*============================================================
 * Custom Keyword.
 * Validate if value is in the list of prohibited values (array).
 */
tv4.defineKeyword('prohibited_values', function(data, value, schema) {
	var valid = null;

	value.some( function (v) {
		if (v == data.trim()) {
			valid = {code: tv4.errorCodes.PROHIBITED_VALUE, message: {param1: data, param2: schema}};
			return true;
		}
	});
	return (valid);
});


var validateDocument = function(doc) {
	var schema = null;
	var message;
	var messages = [];
	
	schema = tv4.getSchema(doc.form);
	
	if (schema) {
		console.log("jsonValidator.validateDocument() : _id:" + doc._id + " : Form:" + doc.form);
		console.log(JSON.stringify(doc));
		
		var validationResults = tv4.validateMultiple(doc, schema, false, banUnknownProperties);
		
		if (validationResults.errors.length > 0){
			console.log("jsonValidator.validateDocument() : _id:" + doc._id + " : Total " + validationResults.errors.length + " errors.");
			
			validationResults.errors.forEach( function (err) {
				message = "\nValidation Error: " + err.code + " " + err.message + " : Field:" + err.dataPath;
				messages.push(message);
			});	
		};
	} else {
		console.log("JSON Validation Schema is not found for form:" + doc.form);
	}
	return (messages);
};


module.exports.validateDocument = validateDocument;

