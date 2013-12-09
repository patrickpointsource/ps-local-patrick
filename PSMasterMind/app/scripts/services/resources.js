'use strict';

/**
 * Get any resource
 */
angular.module('Mastermind').factory(
		'Resources',
		function(Restangular) {
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
			function get(resource, onSuccess) {
				// First check if we have this resource in cache
				var value = localStorage[resource];
				var time = localStorage[TIME_PREFIX + resource];

				var resolved = false;
				
				if (value && time) {
					time = Date.parse(time);
					if (((new Date) - time) < MAX_TIME) {
						value = JSON.parse(value);
						if(onSuccess)onSuccess(value);
						resolved = true;
					}
				}

				if(!resolved) {
					return Resource.get(resource).then(function(value) {
						// Save to localStorage
						localStorage[resource] = JSON.stringify(value);
						localStorage[TIME_PREFIX + resource] = new Date();
						if(onSuccess)onSuccess(value);
						return value;
					});
				}
				else{
					return value;
				}
			}
			
			/**
			 * Resolve a Reference Object
			 */
			function resolve(resourceRef){
				var resource = resourceRef.resource;
				
			    return get(resource, function(result){
			    	var ret = $.extend(true, resourceRef, result);
					return ret;
			    });
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