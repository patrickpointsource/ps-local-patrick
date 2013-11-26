'use strict';

/**
 * People Service
 */
angular.module('PSMasterMindApp')
  .factory('Groups',  [ '$resource', 'Restangular', function ($resource, Restangular) {

	 var common_headers =  {'Authorization': 'Bearer ' + localStorage['access_token']};

    var GroupsRestangular = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setResponseInterceptor(function (data, operation, what) {
        var newData = data;

        if (what === 'groups') {
          if (operation === 'getList') {
            newData = data.members;
          }
        }

        return newData;
      });
    });

    var Resource = GroupsRestangular.all('groups');

    /**
     * Service function for retrieving all groups.
     *
     * @returns {*}
     */
    function query() {
      return Resource.getList();
    }

    /**
     * Service function for retrieving a group definition.
     *
     * @returns {*}
     */
    function get(groupId) {
      return Resource.get(groupId);
    }

    return {
    	query: query,
    	get: get
    };
  }]);