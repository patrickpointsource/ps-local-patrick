'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listSkills = function(callback) {
    dataAccess.listSkills( function(err, body){
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
    
    var validationMessages = validation.validate(obj, dataAccess.SKILLS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.SKILLS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert skill', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteSkill = function(id, callback) {
    dataAccess.deleteItem(id, null, dataAccess.SKILLS_KEY, function(err, body){
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