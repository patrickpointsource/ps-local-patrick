'use strict';

/**
 * People Service
 */
angular.module('PSMasterMindApp')
  .factory('RoleTypes',  [ '$resource', function ($resource) {
	  
	 var common_headers =  {'Authorization': 'Bearer ' + localStorage['access_token']};
	 
    var RolesResource = $resource('http://localhost:8080/MasterMindServer/rest/roles/:roleId', {
    	roleId: '@roleId'
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
     * Service function for retrieving all role types.
     *
     * @returns {*}
     */
    function query(onSuccess) {
      return RolesResource.query(onSuccess);
    }
    
    /**
     * Service function for retrieving a role type definition and member list.
     *
     * @returns {*}
     */
    function get(roleId, onSuccess) {
      return RolesResource.get({ roleId: roleId }, onSuccess);
    }

    return {
    	query: query,
    	get: get
    };
  }]);