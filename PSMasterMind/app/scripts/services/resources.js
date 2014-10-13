/* jshint unused: false */'use strict';

/**
 * Get any resource
 */
angular.module( 'Mastermind' ).factory( 'Resources', [ '$q', '$timeout', 'Restangular',
function( $q, $timeout, Restangular ) {
	var ResourcesRestangular = Restangular.withConfig( Util.fixRestAngularPathMethod( ) );

	// Cache Constants
	var ONE_HOUR = 60 * 60 * 1000;
	/* ms */
	var MAX_TIME = ONE_HOUR;
	var TIME_PREFIX = 'time:';

	var counter = 0;

	/**
	 * Service function for querying a resource member.
	 *
	 * @returns {*}
	 */
	function query( resource, queryString, fields, onSuccess, sort ) {
		var startDate = new Date( );
		//console.log( 'counter: query: ' + resource + ':' + JSON.stringify( queryString
		// ) + ':' + ( counter++ ) );

		var Resource = ResourcesRestangular.one( '', resource );

		var params = {};

		if( queryString ) {
			queryString = JSON.stringify( queryString );
			//query = encodeURIComponent(query);
			//console.log("resources.js queryString=",queryString);
			params.query = queryString;
		}

		if( fields ) {
			fields = JSON.stringify( fields );
			//fields = encodeURIComponent(fields);
			params.fields = fields;
		}

		if( sort ) {
			sort = JSON.stringify( sort );
			params.sort = sort;
		}

		if( onSuccess ) {
			Resource.get( params ).then( onSuccess )/*.then(function() {

			 console.log('end: ' + ((new Date()).getTime() - startDate.getTime()) + ': query:
			 ' + resource + ':' + JSON.stringify(queryString) + ':' + counter);
			 });*/
		} else
			return Resource.get( params )
		/*.then(function() {
		 console.log('end: ' + ((new Date()).getTime() - startDate.getTime()) + ': query:
		 ' + resource + ':' + JSON.stringify(queryString) + ':' + counter);
		 });*/
	}


	/**
	 * Service function for retrieving a resource member.
	 *
	 * Gets the latest from the server to ensure the latest etag
	 *
	 * @returns {*}
	 */
	function refresh( resource, params ) {
		//console.log( 'counter: refresh:' + resource + ':' + ( counter++ ) );
		var deferred = $q.defer( );

		$timeout( function( ) {
			fetch( resource, params ).then( function( newValue ) {
				//Save to localStorage
				localStorage[ resource ] = JSON.stringify( newValue );
				localStorage[ TIME_PREFIX + resource ] = new Date( );

				deferred.resolve( newValue );
			})
			.catch(function error(msg) {
				deferred.reject(msg);
			});
		}, 10 );

		return deferred.promise;
	}

	/**
	 * Service function for retrieving a resource member.
	 *
	 * @returns {*}
	 */
	function get( resource, params ) {
		//console.log( 'counter: get:' + resource + ':' + ( counter++ ) );
		var deferred = $q.defer( );

		$timeout( function( ) {

			var key = resource;
			if( params ) {
				key = key + '?' + JSON.stringify( params );
			}
			// First check if we have this resource in cache
			var value = localStorage[ key ];
			var time = localStorage[ TIME_PREFIX + key ];

			var resolved = false;

			if( value && time ) {
				time = Date.parse( time );
				if( ( ( new Date( ) ) - time ) < MAX_TIME ) {
					//console.log('LOCAL '+resource+'='+value);
					value = JSON.parse( value );
					resolved = true;
				}
			}

			if( !resolved ) {
				fetch( resource, params ).then( function( newValue ) {
					//Save to localStorage
					localStorage[ key ] = JSON.stringify( newValue );
					localStorage[ TIME_PREFIX + key ] = new Date( );

					//console.log('GET '+resource+'='+localStorage[resource]);

					deferred.resolve( newValue );
				} );
			} else {
				deferred.resolve( value );
			}
		}, 10 );

		return deferred.promise;
	}

	/**
	 * Internal Method Fetch a Resource form the server
	 */
	function fetch( resource, params ) {
		var route = '';
		var resourceURL = resource.about ? resource.about : resource;
		var id = resourceURL;
		var lastIndex = resourceURL.lastIndexOf( '/' );
		if( lastIndex !== -1 ) {
			route = resourceURL.substr( 0, lastIndex );
			id = resourceURL.substr( lastIndex + 1 );
		}

		var Resource = ResourcesRestangular.one( route, id, params );

        if (params)
		  return Resource.get(params );
		
		 return Resource.get( );
	}

	/**
	 * Resolve a Reference Object
	 */
	function resolve( resourceRef ) {
		var deferred = $q.defer( );

		setTimeout( function( ) {
			var resource = resourceRef.resource;
			get( resource ).then( function( result ) {
				var ret = $.extend( true, resourceRef, result );
				deferred.resolve( ret );
			} );
		}, 10 );

		return deferred.promise;
	}

	/**
	 * Force Update
	 *
	 * Pulls the latest version of the resource overwrites and changes passed in an
	 * updates the resource on the server
	 */
	function forceUpdate( resource ) {
		var deferred = $q.defer( );

		setTimeout( function( ) {
			var resourceURL = resource.about ? resource.about : resource.resource;

			var route = '';
			var id = resourceURL;
			var lastIndex = resourceURL.indexOf( '/' );
			if( lastIndex !== -1 ) {
				route = resourceURL.substr( 0, lastIndex );
				id = resourceURL.substr( lastIndex + 1 );
			}
			var Resource = ResourcesRestangular.one( route, id );

			Resource.get( resourceURL ).then( function( result ) {
				//Remove the current etag
				delete resource.etag;
				var updated = $.extend( true, result, resource );

				result.customPUT( updated, id ).then( function( newResult ) {
					//Save to localStorage
					localStorage[ resourceURL ] = JSON.stringify( newResult );
					localStorage[ TIME_PREFIX + resourceURL ] = new Date( );

					//console.log('PUT '+resourceURL+'='+localStorage[resourceURL]);
					deferred.resolve( newResult );
				} );
			} );
		}, 10 );

		return deferred.promise;
	}

	/**
	 * Update
	 *
	 * Updates the resource on the server
	 */
	function update( toUpdate ) {
		var deferred = $q.defer( );

		setTimeout( function( ) {
			var resourceURL = toUpdate.about ? toUpdate.about : toUpdate.resource;

			var route = '';
			var id = resourceURL;
			var lastIndex = resourceURL.indexOf( '/' );
			if( lastIndex !== -1 ) {
				route = resourceURL.substr( 0, lastIndex );
				id = resourceURL.substr( lastIndex + 1 );
			}
			var resource = ResourcesRestangular.all( route );

			resource.customPUT( toUpdate, id ).then( function( newResult ) {
				//Save to localStorage
				localStorage[ resourceURL ] = JSON.stringify( newResult );
				localStorage[ TIME_PREFIX + resourceURL ] = new Date( );

				//console.log('PUT '+resourceURL+'='+localStorage[resourceURL]);
				deferred.resolve( newResult );
			}, function( reason ) {
				deferred.reject( reason );
			} );

		}, 10 );

		return deferred.promise;
	}

	/**
	 * Create a new resource in a collection
	 */
	function create( collection, toCreate ) {
		var resource = ResourcesRestangular.all( collection );
		return resource.post( toCreate );
	}

	/**
	 * Create a new resource in a collection
	 */
	function remove( resourceURL, params ) {
		var route = '';
		var id = resourceURL;
		var lastIndex = resourceURL.indexOf( '/' );
		if( lastIndex !== -1 ) {
			route = resourceURL.substr( 0, lastIndex );
			id = resourceURL.substr( lastIndex + 1 );
		}
		var resource = ResourcesRestangular.all( route );
		return resource.customDELETE( id, params );
	}

	/**
	 * Create a deep copy on an object
	 */
	function deepCopy( o ) {
		var copy = $.extend( true, {}, o );
		return copy;
	}

	function cleanLocalStorageIfNeeded( ) {
		var latestTime = localStorage[ "LATEST_LOCAL_STORAGE_CHECK" ];
		var now = new Date( );
		var ONE_DAY = CONSTS.ONE_DAY;
		var ONE_HOUR = CONSTS.ONE_HOUR;

		if( !latestTime )
			localStorage[ "LATEST_LOCAL_STORAGE_CHECK" ] = now.toString( );

		//if( !latestTime || ( ( now.getTime( ) - ( new Date( latestTime ) ).getTime( ) ) > 0 ) ) {
	    var now = new Date();
	    
		var currentSize = unescape( encodeURIComponent( JSON.stringify( localStorage ) ) ).length;

		// if greater than 1mb
		if( currentSize > 1024 * 1024 ) {
			// clean half of cached properties
			var countOfProps = (       _.map( localStorage, function( l ) {
					return l
				} ) ).length;

			var i = 0, prop;

			for( prop in localStorage ) {
				delete localStorage[ prop ];
				i += 1;

				if( i > ( countOfProps / 2 ) )
					break;
			};

		}
			
		//console.log('storage: time:' + ((new Date()).getTime() - now.getTime()) + ':size:' + currentSize);
		//}
	}

	cleanLocalStorageIfNeeded( );

	return {
		create: create,
		query: query,
		get: get,
		refresh: refresh,
		resolve: resolve,
		deepCopy: deepCopy,
		update: update,
		forceUpdate: forceUpdate,
		remove: remove
	};
} ] );
