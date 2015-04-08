'use strict';

var dataAccess = require('../data/dataAccess');
var people = require('./people.js');
var util = require('../util/util');
var _ = require('underscore');


module.exports.listCategories = function(callback) {
	 dataAccess.listDepartmentCategories(function(err, body){
      if (err) {
          console.log(err);
          callback('error loading department\'s categories', null);
      } else {
          //console.log(body);
          callback(null, body);
      }
  });  
};

module.exports.insertDepartmentCategory = function(obj, callback) {
	
	dataAccess.listDepartmentCategories( function(err, body){
	       if (!err) {
	           var usedCats = _.map(body.members, function(c) { return c.value; });
	           
	          if ( (_.filter(usedCats, function(item) { return obj.value == item;})).length > 0 ) {
	        	  obj.result = false;
	        	  obj.wrongField = 'departmentCategory';
	        	  
	        	  callback("Duplicate category", obj);
	          } else
	        	  dataAccess.insertItem(obj._id, obj, dataAccess.DEPARTMENT_CATEGORY_KEY, function(err, body){
	        	        if (err) {
	        	            console.log(err);
	        	            callback('error inserting department category:' + JSON.stringify(err), null);
	        	        } else {
	        	            callback(null, body);
	        	        }
	        	    });
	           
	       }
	});  
	
    
};

module.exports.updateDepartment = function(id, obj, callback) {
	dataAccess.listDepartmentCategories( function(err, body){
	       if (!err) {
	    	   var usedCats = _.map(body.members, function(c) { return c.value; });
	           
	          if ( (_.filter(usedCats, function(item) { return obj.value == item;})).length > 0 ) {
	        	  obj.result = false;
	        	  obj.wrongField = 'departmentCategory';
	        	  
	        	  callback("Duplicate category", obj);
	          } else
	        	  dataAccess.updateItem(id, obj, dataAccess.DEPARTMENT_CATEGORY_KEY, function(err, body){
	        	        if (err) {
	        	            console.log(err);
	        	            callback('error update department category:' + JSON.stringify(err), null);
	        	        } else {
	        	            callback(null, _.extend(obj, body));
	        	        }
	        	    });
	           
	       }
		});  
	
    
};

module.exports.deleteDepartmentCategory = function(id, obj, callback) {
    dataAccess.deleteItem(id, obj._rev, dataAccess.DEPARTMENT_CATEGORY_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getDepartmentCategory = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, body);
        }
    });
};