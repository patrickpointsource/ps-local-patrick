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
    	var deferred = $q.defer();
    	
    	setTimeout(function() {
    		deferred.resolve([{name: 'Executives', value: 'Executives'},
    		                  {name: 'Management', value: 'Management'},
    		                  {name: 'Admin', value: 'Admin'},
    		                  {name: 'Digital', value: 'Digital'}, 
    		                  {name: 'Development', value: 'Development'},
    		                  {name: 'Delivery Services', value: 'Delivery Services'},
    		                  {name: 'Sales', value: 'Sales'},
    		                  {name: 'Other', value: 'Other'}]);
    	}, 100);
    	
    	
    	return deferred.promise;
    };
    
    this.loadDepartmentCodes = function(){
    	//var deferred = $q.defer();
    	
    	return Resources.refresh("departments/available/code");
    	
    	
    	//return deferred.promise;
    };
    
    this.loadAvailablePeople = function(substr){
    	//var deferred = $q.defer();
    	
    	return Resources.refresh("departments/available/people", {substr: substr});
    	
    	
    	//return deferred.promise;
    };
    
    this.addDepartment = function(department){
    	var deferred = $q.defer();
    	
        Resources.create('departments', department).then(function(result){
        	deferred.resolve(result);
        });
        
        return deferred.promise;
      };

      /**
       * Update department to the server
       */
      this.updateDepartment = function(department){
    	  var deferred = $q.defer();
    	  
    	  Resources.update(department).then(function(result){
    		  deferred.resolve(result);
    	  });
        
    	  return deferred.promise;
      };
      
      /**
       * Update department to the server
       */
      this.removeDepartment = function(departmentResource){
    	  var deferred = $q.defer();
    	  
    	  Resources.remove(departmentResource).then(function(result){
    		  deferred.resolve(result);
    	  });
        
    	  return deferred.promise;
      };
    
    
  }]);