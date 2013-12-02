'use strict';

/**
 * People Service
 */
angular.module('Mastermind')
  .factory('People', function (Restangular) {

    /*
     * Create a reference to a server side resource for People.
     *
     * The query method returns an object with a property 'data' containing
     * the list of projects.
     */
    var Resource = Restangular.all('people');

    /**
     * Service function for retrieving all people.
     *
     * @returns {*}
     */
    function query() {
      return Resource.getList();
    }

    function get(id) {
      return Resource.get(id);
    }

    return {
      query: query,
      get: get
    };
  });