'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listConfiguration = function(q, callback) {
    dataAccess.listConfiguration(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading configuration', null);
        } else {
            //console.log(body);
        	for (var memberIndex in body.members) {
        		decodeConfig(body.members[memberIndex]);
        	}
            callback(null, body);
        }
    });
};

module.exports.insertConfiguration = function(obj, callback) {
    
    var validationMessages = validation.validate(obj, dataAccess.CONFIGURATION_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
	encodeConfig(obj);
    dataAccess.insertItem(obj._id, obj, dataAccess.CONFIGURATION_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert configuration', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteConfiguration = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.CONFIGURATION_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getConfiguration = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
        	decodeConfig(body);
        	body.about = "config/" + body._id;
            callback(null, body);
        }
    });
};

module.exports.getConfigurationByName = function(q, sectionName, callback) {
    dataAccess.listConfiguration(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading configuration', null);
        } else {
        	var configSection;
        	for (var index in body.members) {
        		if (body.members[index].config == sectionName)
        			configSection = body.members[index];
        	}
        	decodeConfig(configSection);
        	configSection.about = "config/" + configSection._id;
        	callback(null, configSection);
        }
    });
};


var decodeConfig = function (config) {
	for (var propertyIndex in config.properties) {
		var property = config.properties[propertyIndex];
		var regex = new RegExp("%2E", 'g');
		property.name = property.name.replace(regex, ".");
		property.value = property.value.replace(regex, ".");
	}
};

var encodeConfig = function (config) {
	for (var propertyIndex in config.properties){
		var property = config.properties[propertyIndex];
		property.name = property.name.replace(/\./g, "%2E");
		property.value = property.value.replace(/\./g, "%2E");
	}
};