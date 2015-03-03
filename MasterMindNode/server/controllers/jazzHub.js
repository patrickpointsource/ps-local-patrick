'use strict';

var jazzHubAccess = require('../data/jazzHubAccess');
var dataAccess = require('../data/dataAccess');

var JAZZ_HUB_USER_ID = "jazz.hub.userid";
var JAZZ_HUB_PASSWORD = "jazz.hub.password";
var JAZZ_HUB_SERVERS = "jazz.hub.servers";

var _ = require('underscore');

module.exports.getJazzHubProjects = function(callback) {
	dataAccess.listConfiguration(null, function (err, configuration) {
		if (err) {
			callback (err, null);
		} else {
	    	var props = decodeProperties(configuration.members[0].properties);
	    	var userId = getPropertyValueByName(JAZZ_HUB_USER_ID, props);
	    	var password = getPropertyValueByName(JAZZ_HUB_PASSWORD, props);
	    	var serverUrls = getPropertyValueByName(JAZZ_HUB_SERVERS, props).split(",");
	    	
	    	var result = [];
	    	var error = [];
	        var updatedCallback = _.after(serverUrls.length, callback);
	    	_.each(serverUrls, function(serverUrl) {
	    		jazzHubAccess.getJazzHubProjects( serverUrl, userId, password, function(err, initArray){
	    	        if (err) {
	    	            error.push(err);
	    	        } else {
	    	        	if (initArray) {
	    	        		_.each(initArray, function(item) {
	    		        		result.push(item);
	    	        		});
	    	        	}
	    	        }
	    	        updatedCallback(error.length == 0 ? error.toString() : null, dataAccess.prepareRecords(result, "members", "links/"));
	    		});
	     	});
		}
	});
};

var decodeProperties = function (properties) {
	for (var propertyIndex in properties) {
		var property = properties[propertyIndex];
		var regex = new RegExp("%2E", 'g');
		property.name = property.name.replace(regex, ".");
		property.value = property.value.replace(regex, ".");
	}
	return properties;
};

var getPropertyValueByName = function (propertyName, properties) {
	var res;
	_.each(properties, function(property) {
		if (property.name == propertyName) {
			res = property.value;
		}
	});
	return res;
}