'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listSkills = function(q, callback) {
    dataAccess.listSkills(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading skills', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.insertSkill = function(obj, callback) {
    dataAccess.insertItem(obj._id, obj, dataAccess.SKILLS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert skill', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteSkill = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.SKILLS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getSkill = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};