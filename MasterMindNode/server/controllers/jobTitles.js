'use strict';

var dataAccess = require('../data/dataAccess');
var util = require('../util/util');
var _ = require('underscore');

module.exports.listJobTitles = function(callback) {
    dataAccess.listJobTitles( function(err, body){
        if (err) {
            console.log(err);
            callback('error loading job titles', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertJobTitle = function(obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.JOB_TITLE_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading roles:' + JSON.stringify(err), null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.udpateJobTitle = function(id, obj, callback) {
    dataAccess.updateItem(id, obj, dataAccess.JOB_TITLE_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error update role:' + JSON.stringify(err), null);
        } else {
            callback(null, _.extend(obj, body));
        }
    });
};

module.exports.deleteJobTitle = function(id, obj, callback) {
    dataAccess.deleteItem(id, obj._rev, dataAccess.JOB_TITLE_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getJobTitle = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getNameByResource = function(resource, callback) {
	if (!resource) {
		callback('No resource', null);
	}
	else {
		util.getIDfromResource(resource, function (err, ID) {
			if (err) {
				callback (err, null);
			}
			else {
				dataAccess.getItem(ID, function(err, item) {
					if (!err) {
						callback(null, item.title);
					}
					else {
						callback(err, null);
					}
				});
			}
		});
	}
			
};
