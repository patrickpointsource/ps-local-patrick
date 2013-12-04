'use strict';

/**
 * Get any resource
 */
angular.module('Mastermind')
  .factory('Resources', function (Restangular) {
    var ResourcesRestangular = Restangular.withConfig(function (RestangularConfigurer) {});

    var Resource = ResourcesRestangular.all('');

    /**
     * Service function for retrieving a resource member.
     *
     * @returns {*}
     */
    function get(resource, onSuccess) {
      return Resource.get(resource).then(onSuccess);
    }

    return {
      get: get
    };
  });