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

module.exports.defaultJobTitles = [
    { abbreviation: "ADMIN", title: "Administration" },
    { abbreviation: "BA", title: "Business Analyst" },
    { abbreviation: "BIZDEV", title: " Business Development" },
    { abbreviation: "CxD ", title: "Client Experience Director" },
    { abbreviation: "CD ", title: "Creative Director" },
    { abbreviation: "DD", title: "Development Director" },
    { abbreviation: "DxM", title: "Digital Experience Manager" },
    { abbreviation: "DMDE", title: "Director of Marketing and Digital Experience" },
    { abbreviation: "SALES", title: "Director of Sales and Business Development" },
    { abbreviation: "EXEC", title: "Executive Management" },
    { abbreviation: "EMS", title: "Executive Mobile Strategist" },
    { abbreviation: "ESA", title: "Executive Software Architect" },
    { abbreviation: "MKT", title: "Marketing Consultant" },
    { abbreviation: "MKI", title: "Marketing Intern" },
    { abbreviation: "MS", title: "Marketing Specialist" },
    { abbreviation: "PM", title: "Project Manager" },
    { abbreviation: "QAA", title: "QA Analyst" },
    { abbreviation: "QAT", title: "QA Tester" },
    { abbreviation: "RM", title: "Release Manager" },
    { abbreviation: "SBA", title: "Senior Business Analyst" },
    { abbreviation: "SCD", title: "Senior Content Developer" },
    { abbreviation: "SSA", title: "Senior Software Architect" },
    { abbreviation: "SSAO", title: "Senior Software Architect Offshore" },
    { abbreviation: "SSE", title: "Senior Software Engineer" },
    { abbreviation: "SSEO", title: "Senior Software Engineer Offshore" },
    { abbreviation: "SUXD", title: "Senior User Experience Designer" },
    { abbreviation: "SE", title: "Software Engineer" },
    { abbreviation: "Intern", title: "Software Engineer Intern" },
    { abbreviation: "SEO", title: "Software Engineer Offshore" },
    { abbreviation: "ST", title: "Software Tester" },
    { abbreviation: "SA", title: "Solution Architect" },
    { abbreviation: "SI", title: "Solution Integrator" },
    { abbreviation: "UXD", title: "User Experience Designer" },
    { abbreviation: "DUX", title: "UX Director" },
    { abbreviation: "VD", title: "Visual Designer" }
];
