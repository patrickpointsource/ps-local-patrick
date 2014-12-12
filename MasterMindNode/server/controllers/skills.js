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
    
	//12/11/14 MM     var validationMessages = validation.validate(obj, dataAccess.SKILLS_KEY);
	//12/11/14 MM     if(validationMessages.length > 0) {
	//12/11/14 MM       callback( validationMessages.join(', '), {} );
	//12/11/14 MM       return;
	//12/11/14 MM     }
    
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