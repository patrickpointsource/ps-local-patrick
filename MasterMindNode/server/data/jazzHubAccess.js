'use strict';

var request = require('request');
var _ = require('underscore');
var parseString = require('xml2js').parseString;

var SERVICE = "service";
var PROCESS_WEB_UI_SERVICE = "com.ibm.team.process.internal.service.web.IProcessWebUIService";
var ALL_PROJECT_AREAS = "allProjectAreas";
var SOAPENV_ENVELOPE_TAG = "soapenv:Envelope";
var SOAPENV_BODY_TAG = "soapenv:Body";
var RESPONSE_TAG = "response";
var RETURN_VALUE_TAG = "returnValue";
var VALUES_TAG = "values";

var getJazzHubProjects = function (serverUrl, userId, password, callback ) {
	var auth = "Basic " + new Buffer(userId + ":" + password).toString("base64"); 
	var opts = {
		url : serverUrl + SERVICE + '/' + PROCESS_WEB_UI_SERVICE + '/' + ALL_PROJECT_AREAS + '?userId=' + userId,
		headers : { "Authorization" : auth }
	}
	
	request( opts, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			  parseString(body, function (err, result) {
				  if (err) {
					  callback(err, null);
				  } else {
					  var values = result[SOAPENV_ENVELOPE_TAG][SOAPENV_BODY_TAG][0][RESPONSE_TAG][0][RETURN_VALUE_TAG][0][VALUES_TAG];
					  callback(null, generateProjectsFromValues(values, serverUrl));
				  }
				});
			  
		  }
		  else {
			  callback ( 'statusCode: ' + response.statusCode + ',error: ' + error, null );
		  }
	});
	
}

var generateProjectsFromValues = function (values, serverUrl) {
	var result = [];
	_.each(values, function(value) {
		if (value.myProjectArea && value.myProjectArea == 'true') {
			var itemId = value.itemId;
			var webUrl = value.webUrl;
			var name = value.name.toString();
			var project = {};
			project.title = name;
			project.details = { resource : webUrl + "/process/project-areas/" + itemId };
			project.currentPlans = { resource : webUrl + "#action=com.ibm.team.apt.search&predef=current" };
			project.dashboard = { resource : webUrl + "#action=com.ibm.team.dashboard.viewDashboard" };
			project.resource = serverUrl + "oslc/contexts/" + itemId + "/workitems/services.xml";
			var parts = name.split("|");
			if (parts.length >= 2) {
				var userPart = parts[0].trim();
				var projPart = parts[1].trim();
				project.homepage = { resource : "https://hub.jazz.net/project/" + userPart + "/" + projPart };
			}
			
			result.push(project);
		}
	});
	return result;
}

module.exports.getJazzHubProjects = getJazzHubProjects;