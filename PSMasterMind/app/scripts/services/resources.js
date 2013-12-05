'use strict';

/**
 * Get any resource
 */
angular.module('Mastermind')
  .factory('Resources', function (Restangular) {
    var ResourcesRestangular = Restangular.withConfig(function (RestangularConfigurer) {});

    var Resource = ResourcesRestangular.all('');

    /**
     * Service function for querying a resource member.
     *
     * @returns {*}
     */
    function query(resource, query, fields, onSuccess) {
      if(query || fields){
    	  resource = resource+'?';
      }	
    	
      if(query){
    	  query = JSON.stringify(query);
    	  query = encodeURIComponent(query);
    	  resource = resource+'query='+query;
      }	
      
      if(fields){
    	  if(query)resource = resource+'&';
    	  fields = JSON.stringify(fields);
    	  fields = encodeURIComponent(fields);
    	  resource = resource+'fields='+fields;
      }
    	
    	
      return Resource.get(resource).then(onSuccess);
    }
    
    
    /**
     * Service function for retrieving a resource member.
     *
     * @returns {*}
     */
    function get(resource, onSuccess) {
      return Resource.get(resource).then(onSuccess);
    }

    return {
      query: query,
      get: get
    };
  });