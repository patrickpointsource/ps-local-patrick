'use strict';

angular.module('Mastermind')
  .service('DepartmentsService', ['$q', 'Resources', function ($q, Resources) {
    /**
     * Refresh the task list
     * 
     * project records that include the about or resource properties set
     */
    this.refreshDepartments = function(){
    	var deferred = $q.defer();

    	Resources.refresh('departments', {t: (new Date()).getMilliseconds()}).then(function(result){
    		
    		deferred.resolve(result.members);
    	});
    	
    	return deferred.promise;
    };
    
    this.searchDepartments = function(substr){
    	var deferred = $q.defer();

    	Resources.refresh('departments/search', {substr: substr}).then(function(result){
    		
    		deferred.resolve(result.members);
    	});
    	
    	return deferred.promise;
    };
    
    this.loadDepartmentCategories = function(){
    	return Resources.refresh("departmentCategories/").then(function(categories) {
    		categories.members = _.sortBy(categories.members, 'trimmedValue');
    		
    		if (categories.members)
	    		for (var k = 0; k < categories.members.length; k ++) {
	    			categories.members[k].name = (k * 1 + 1) + ' - ' + categories.members[k].name;
	    		}
    		
    		return categories;
    	});
    };
    
    this.addDepartmentCategory = function(departmentCategory){
		var deferred = $q.defer();
		
	    Resources.create('departmentCategories', departmentCategory).then(function(result){
	    	deferred.resolve(result);
	    });
	    
	    return deferred.promise;
   };
    
   /**
    * Update department category on backend
    */
   this.updateDepartmentCategory = function(departmentCategory){
 	  var deferred = $q.defer();
 	  
 	  Resources.update(departmentCategory).then(function(result){
 		  deferred.resolve(result);
 	  });
     
 	  return deferred.promise;
   };
   
   /**
    * Remove department category to the server
    */
   this.removeDepartmentCategory = function(departmentCategoryResource){
 	  var deferred = $q.defer();
 	  
 	  Resources.remove(departmentCategoryResource).then(function(result){
 		  deferred.resolve(result);
 	  });
     
 	  return deferred.promise;
   };
   
    this.loadDepartmentCodes = function(){
    	return Resources.refresh("departments/available/code");
    };
    
    this.loadAvailablePeople = function(substr){
    	return Resources.refresh("departments/available/people", {substr: substr});
    };
    
    this.unassignPeople = function(people) {
    	return Resources.refresh("departments/unassign/people", {people: people});
    };
    
    /*
     * Creates new department category on the backend
     * 
     * */
    this.addDepartment = function(department){
		var deferred = $q.defer();
		
	    Resources.create('departments', department).then(function(result){
	    	deferred.resolve(result);
	    });
	    
	    return deferred.promise;
   };

      /**
       * Update department on backend
       */
      this.updateDepartment = function(department){
    	  var deferred = $q.defer();
    	  
    	  Resources.update(department).then(function(result){
    		  deferred.resolve(result);
    	  });
        
    	  return deferred.promise;
      };
      
      /**
       * Remove department to the server
       */
      this.removeDepartment = function(departmentResource){
    	  var deferred = $q.defer();
    	  
    	  Resources.remove(departmentResource).then(function(result){
    		  deferred.resolve(result);
    	  });
        
    	  return deferred.promise;
      };
    
    
  }]);