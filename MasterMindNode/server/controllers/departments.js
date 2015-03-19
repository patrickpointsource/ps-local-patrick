'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var util = require('../util/util');
var _ = require('underscore');

module.exports.listDepartments = function(callback) {
    dataAccess.listDepartments( function(err, body){
        if (err) {
            console.log(err);
            callback('error loading departments', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.listAvailablePeople = function(substr, callback) {
	 dataAccess.listDepartmentsAvailablePeople(substr, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading departments', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });  
};

module.exports.listAvailableCode = function(callback) {
	var list = [];
	
	for (var k = 1; k <= 9; k ++) {
		for (var i = 0; i < 30; i ++) {
			var letter = String.fromCharCode(97 + i);
			
			list.push({name: (k + letter).toUpperCase()});
		}
	}
	
	dataAccess.listDepartments( function(err, body){
       if (!err) {
           var usedCodes = _.map(body.members, function(c) { return c.departmentCode.name; });
           
           list = _.filter(list, function(item) { 
        	   return (_.filter(usedCodes, function(c) { return c == item.name})).length == 0;
    	   });
           
           callback(null, {members: list});
       }
	});  
};

module.exports.filterDepartments = function(code, manager, nickname, substr, callback) {
    dataAccess.filterDepartments( code, manager, nickname, substr, function(err, body){
        if (err) {
            console.log(err);
            callback('error filtering departments', null);
        } else {
            //console.log(body);
            callback(null, body);
        }
    });
};

module.exports.insertDepartment = function(obj, callback) {
	
	dataAccess.listDepartments( function(err, body){
	       if (!err) {
	           var usedNicknames = _.map(body.members, function(c) { return c.departmentNickname; });
	           
	          if ( (_.filter(usedNicknames, function(item) { return obj.departmentNickname == item;})).length > 0 ) {
	        	  obj.result = false;
	        	  obj.wrongField = 'departmentNickname';
	        	  
	        	  callback("Duplicate nickname", obj);
	          } else
	        	  dataAccess.insertItem(obj._id, obj, dataAccess.DEPARTMENTS_KEY, function(err, body){
	        	        if (err) {
	        	            console.log(err);
	        	            callback('error inserting department:' + JSON.stringify(err), null);
	        	        } else {
	        	            callback(null, body);
	        	        }
	        	    });
	           
	       }
	});  
	
    
};

module.exports.updateDepartment = function(id, obj, callback) {
	dataAccess.listDepartments( function(err, body){
	       if (!err) {
	           var usedNicknames = _.map(body.members, function(c) { return c.departmentNickname; });
	           
	          if ((_.filter(usedNicknames, function(item) { return obj.departmentNickname == item;})).length > 0) {
	        	  obj.result = false;
	        	  obj.wrongField = 'departmentNickname';
	        	  
	        	  callback("Duplicate nickname", obj);
	          } else
	        	  dataAccess.updateItem(id, obj, dataAccess.DEPARTMENTS_KEY, function(err, body){
	        	        if (err) {
	        	            console.log(err);
	        	            callback('error update department:' + JSON.stringify(err), null);
	        	        } else {
	        	            callback(null, _.extend(obj, body));
	        	        }
	        	    });
	           
	       }
		});  
	
    
};

module.exports.deleteDepartment = function(id, obj, callback) {
    dataAccess.deleteItem(id, obj._rev, dataAccess.DEPARTMENTS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getDepartment = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

