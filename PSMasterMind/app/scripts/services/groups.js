'use strict';

/**
 * People Service
 */
angular.module('PSMasterMindApp')
  .factory('Groups',  [ '$resource', function ($resource) {
	  
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
    var GroupsResource = $resource('http://localhost:8080/MasterMindServer/rest/groups/:groupId', {
      userId: '@groupId'
    }, {
      query: {
        method: 'GET',
        headers: common_headers,
        isArray:false
      },
      get: {
    	method: 'GET',
        headers: common_headers,
      }
    });

    /**
     * Service function for retrieving all groups.
     *
     * @returns {*}
     */
    function query() {
      return GroupsResource.query();
    }
    
    /**
     * Service function for retrieving a group definition.
     *
     * @returns {*}
     */
    function get(groupId) {
      return GroupsResource.get({ groupId: groupId });
    }

    return {
    	query: query,
    	get: get
    };
  }]);