'use strict';

/**
 * People Service
 */
angular.module('Mastermind')
  .factory('RoleTypes', function (Restangular) {

    var RoleTypesRestangular = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setResponseInterceptor(function (data, operation) {
        var newData = data;

        if (operation === 'getList') {
          newData = data.members;
        }

        return newData;
      });
    });

    var Resource = RoleTypesRestangular.all('roles');

    /**
     * Service function for retrieving all role types.
     *
     * @returns {*}
     */
    function query(onSuccess) {
      return Resource.getList().then(onSuccess);
    }

    /**
     * Service function for retrieving a role type definition and member list.
     *
     * @returns {*}
     */
    function get(roleId, onSuccess) {
      return Resource.get(roleId).then(onSuccess);
    }

    return {
      query: query,
      get: get
    };
  });