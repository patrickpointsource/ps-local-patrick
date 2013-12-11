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

			var Resource = ResourcesRestangular.all('');

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
				if (query || fields) {
					resource = resource + '?';
				}

				if (query) {
					query = JSON.stringify(query);
					query = encodeURIComponent(query);
					resource = resource + 'query=' + query;
				}

				if (fields) {
					if (query)
						resource = resource + '&';
					fields = JSON.stringify(fields);
					fields = encodeURIComponent(fields);
					resource = resource + 'fields=' + fields;
				}

				Resource.get(resource).then(onSuccess);
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
						Resource.get(resource).then(function(newValue) {
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
			 * Resolve a Reference Object
			 */
			function resolve(resourceRef){
				var deferred = $q.defer();
				
				setTimeout(function() {
					var resource = resourceRef.resource;
				    get(resource).then(function(result){
				    	var ret = $.extend(true, resourceRef, result);
				    	
				    	console.log("Resolve: " + JSON.stringify(ret));
				    	
				    	deferred.resolve(ret);
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
				resolve: resolve,
				deepCopy: deepCopy
			};
		});