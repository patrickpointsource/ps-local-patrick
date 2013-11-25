'use strict';

/**
 * People Service
 */
angular.module('PSMasterMindApp')
  .factory('People',  [ '$resource', function ($resource) {
	  
	 var common_headers =  {'Authorization': 'Bearer ' + localStorage['access_token']};
	 
	 /*
     * Create a reference to a server side resource for People.
     *
     * The query method returns an object with a property 'data' containing
     * the list of projects.
     *
     * TODO: Change the hardcoded address to localhost:8080/MasterMindServer
     * TODO: Change the hardcoded access_token query parameter
     */
    var PeopleResource = $resource('http://localhost:8080/MasterMindServer/rest/people/:userId', {
      userId: '@userId'
    }, {
      query: {
        method: 'GET',
        headers: common_headers,
        isArray:false
      }
    });

    /**
     * Service function for retrieving all people.
     *
     * @returns {*}
     */
    function query() {
      return PeopleResource.query();
    }

    return {
    	query: query
    };
  }]);