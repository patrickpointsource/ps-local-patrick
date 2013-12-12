'use strict';

/**
 * Get any resource
 */
angular.module('Mastermind').factory(
		'Resources',
		function($q, Restangular) {
			var ResourcesRestangular = Restangular.withConfig(function(
					RestangularConfigurer) {
			});
			
			// Cache Constants
			var ONE_HOUR = 60 * 60 * 1000; /* ms */
			var MAX_TIME = ONE_HOUR;
			var TIME_PREFIX = 'time:';

			/**
			 * Service function for querying a resource member.
			 * 
			 * @returns {*}
			 */
			function query(resource, query, fields, onSuccess) {
				var Resource = ResourcesRestangular.one('',resource);

				var params = {};

				if (query) {
					query = JSON.stringify(query);
					//query = encodeURIComponent(query);
					params['query'] = query;
				}

				if (fields) {
					fields = JSON.stringify(fields);
					//fields = encodeURIComponent(fields);
					params['fields'] = fields;
				}

				Resource.get(params).then(onSuccess);
			}

			
			/**
			 * Service function for retrieving a resource member.
			 * 
			 * Gets the latest from the server to ensure the latest etag
			 * 
			 * @returns {*}
			 */
			function refresh(resource) {
				var deferred = $q.defer();
				
				setTimeout(function() {
					fetch(resource).then(function(newValue) {
						//Save to localStorage
						localStorage[resource] = JSON.stringify(newValue);
						localStorage[TIME_PREFIX + resource] = new Date();
						
						deferred.resolve(newValue);
					});
				 }, 1000);
				
				return deferred.promise;
			}
			
			/**
			 * Service function for retrieving a resource member.
			 * 
			 * @returns {*}
			 */
			function get(resource) {
				var deferred = $q.defer();
				
				setTimeout(function() {
				   
					// First check if we have this resource in cache
					var value = localStorage[resource];
					var time = localStorage[TIME_PREFIX + resource];
	
					var resolved = false;
					
					if (value && time) {
						time = Date.parse(time);
						if (((new Date) - time) < MAX_TIME) {
							value = JSON.parse(value);
							resolved = true;
						}
					}
	
					if(!resolved) {
						fetch(resource).then(function(newValue) {
							//Save to localStorage
							localStorage[resource] = JSON.stringify(newValue);
							localStorage[TIME_PREFIX + resource] = new Date();
							
							deferred.resolve(newValue);
						});
					}
					else{
						deferred.resolve(value);
					}
				 }, 1000);
				
				return deferred.promise;
			}
			
			/**
			 * Fetch a Resource form the server
			 */
			function fetch(resource){
				var route = '';
				var id = resource;
				var lastIndex = resource.indexOf('/');
				if(lastIndex != -1){
					route = resource.substr(0, lastIndex);
					id = resource.substr(lastIndex + 1);
				}
				
				var Resource = ResourcesRestangular.one(route,id);
				
				return Resource.get();
			}
			
			/**
			 * Resolve a Reference Object
			 */
			function resolve(resourceRef){
				var deferred = $q.defer();
				
				setTimeout(function() {
					var resource = resourceRef.resource;
				    get(resource).then(function(result){
				    	var ret = $.extend(true, resourceRef, result);
				    	
				    	deferred.resolve(ret);
				    });
				}, 1000);
				
				return deferred.promise;
			}
			
			/**
			 * Force Update
			 * 
			 * Pulls the latest version of the resource overwrites and changes passed in an updates the resource on the server
			 */
			function forceUpdate(resource){
				var deferred = $q.defer();
				
				setTimeout(function() {
					var resourceURL = resource.about?resource.about:resource.resource;
					
					var route = '';
					var id = resourceURL;
					var lastIndex = resourceURL.indexOf('/');
					if(lastIndex != -1){
						route = resourceURL.substr(0, lastIndex);
						id = resourceURL.substr(lastIndex + 1);
					}
					var Resource = ResourcesRestangular.one(route,id);
					
					Resource.get(resourceURL).then(function(result){
				    	//Remove the current etag
				    	delete resource.etag;
				    	var updated = $.extend(true, result, resource);
				    	
				    	result.customPUT(updated, id).then(function(newResult){
				    		deferred.resolve(newResult);
				    	});
				    });
				}, 1000);
				
				return deferred.promise;
			}
			
			/**
			 * Update
			 * 
			 * Updates the resource on the server
			 */
			function update(toUpdate){
				var deferred = $q.defer();
			
				setTimeout(function() {
					var resourceURL = toUpdate.about?toUpdate.about:toUpdate.resource;
					
					var route = '';
					var id = resourceURL;
					var lastIndex = resourceURL.indexOf('/');
					if(lastIndex != -1){
						route = resourceURL.substr(0, lastIndex);
						id = resourceURL.substr(lastIndex + 1);
					}
					var resource = ResourcesRestangular.all(route);
					
					resource.customPUT(toUpdate, id).then(function(newResult){
			    		deferred.resolve(newResult);
			    	});

				}, 1000);
				
				return deferred.promise;
			}
			
			/**
			 * Create a deep copy on an object
			 */
			function deepCopy(o) {
				var copy = $.extend(true, {}, o);
				return copy;
		    }

			return {
				query : query,
				get : get,
				refresh : refresh,
				resolve: resolve,
				deepCopy: deepCopy,
				update: update,
				forceUpdate: forceUpdate
			};
		});