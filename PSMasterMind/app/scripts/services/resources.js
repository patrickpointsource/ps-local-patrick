/* jshint unused: false */
'use strict';

/**
 * Get any resource
 */
angular.module('Mastermind').factory(
    'Resources',['$q','$timeout','Restangular',
    function($q, $timeout, Restangular) {
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
      function query(resource, queryString, fields, onSuccess, sort) {
        var Resource = ResourcesRestangular.one('',resource);

        var params = {};

        if (queryString) {
          queryString = JSON.stringify(queryString);
          //query = encodeURIComponent(query);
          //console.log("resources.js queryString=",queryString);
          params.query = queryString;
        }

        if (fields) {
          fields = JSON.stringify(fields);
          //fields = encodeURIComponent(fields);
          params.fields = fields;
        }

        if(sort) {
          sort = JSON.stringify(sort);
          params.sort = sort;
        }

        if(onSuccess) {
        	Resource.get(params).then(onSuccess);
        } else
        	return Resource.get(params);
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

        $timeout(function() {
          fetch(resource).then(function(newValue) {
            //Save to localStorage
            localStorage[resource] = JSON.stringify(newValue);
            localStorage[TIME_PREFIX + resource] = new Date();

            deferred.resolve(newValue);
          });
        }, 10);

        return deferred.promise;
      }

      /**
       * Service function for retrieving a resource member.
       *
       * @returns {*}
       */
      function get(resource) {
        var deferred = $q.defer();

        $timeout(function() {

          // First check if we have this resource in cache
          var value = localStorage[resource];
          var time = localStorage[TIME_PREFIX + resource];

          var resolved = false;

          if (value && time) {
            time = Date.parse(time);
            if (((new Date()) - time) < MAX_TIME) {
              //console.log('LOCAL '+resource+'='+value);

              value = JSON.parse(value);
              resolved = true;
            }
          }

          if(!resolved) {
            fetch(resource).then(function(newValue) {
              //Save to localStorage
              localStorage[resource] = JSON.stringify(newValue);
              localStorage[TIME_PREFIX + resource] = new Date();

              //console.log('GET '+resource+'='+localStorage[resource]);

              deferred.resolve(newValue);
            });
          }
          else{
            deferred.resolve(value);
          }
        }, 10);

        return deferred.promise;
      }

      /**
       * Internal Method Fetch a Resource form the server
       */
      function fetch(resource){
        var route = '';
        var id = resource;
        var lastIndex = resource.lastIndexOf('/');
        if(lastIndex !== -1){
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
        }, 10);

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
          if(lastIndex !== -1){
            route = resourceURL.substr(0, lastIndex);
            id = resourceURL.substr(lastIndex + 1);
          }
          var Resource = ResourcesRestangular.one(route,id);

          Resource.get(resourceURL).then(function(result){
            //Remove the current etag
            delete resource.etag;
            var updated = $.extend(true, result, resource);

            result.customPUT(updated, id).then(function(newResult){
              //Save to localStorage
              localStorage[resourceURL] = JSON.stringify(newResult);
              localStorage[TIME_PREFIX + resourceURL] = new Date();

              //console.log('PUT '+resourceURL+'='+localStorage[resourceURL]);
              deferred.resolve(newResult);
            });
          });
        }, 10);

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
          if(lastIndex !== -1){
            route = resourceURL.substr(0, lastIndex);
            id = resourceURL.substr(lastIndex + 1);
          }
          var resource = ResourcesRestangular.all(route);

          resource.customPUT(toUpdate, id).then(function(newResult){
            //Save to localStorage
            localStorage[resourceURL] = JSON.stringify(newResult);
            localStorage[TIME_PREFIX + resourceURL] = new Date();

            //console.log('PUT '+resourceURL+'='+localStorage[resourceURL]);
            deferred.resolve(newResult);
          });

        }, 10);

        return deferred.promise;
      }

      /**
       * Create a new resource in a collection
       */
      function create(collection, toCreate){
        var resource = ResourcesRestangular.all(collection);
        return resource.post(toCreate);
      }


      /**
       * Create a new resource in a collection
       */
      function remove(resourceURL){
        var route = '';
        var id = resourceURL;
        var lastIndex = resourceURL.indexOf('/');
        if(lastIndex !== -1){
          route = resourceURL.substr(0, lastIndex);
          id = resourceURL.substr(lastIndex + 1);
        }
        var resource = ResourcesRestangular.all(route);
        return resource.customDELETE(id);
      }


      /**
       * Create a deep copy on an object
       */
      function deepCopy(o) {
        var copy = $.extend(true, {}, o);
        return copy;
      }

      return {
        create: create,
        query : query,
        get : get,
        refresh : refresh,
        resolve: resolve,
        deepCopy: deepCopy,
        update: update,
        forceUpdate: forceUpdate,
        remove: remove
      };
    }]);