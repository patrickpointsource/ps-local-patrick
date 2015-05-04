'use strict';

/*
 * Handles application state in regards to the currently accessed Projects.
 */
angular.module('Mastermind.services.projects')
    .service('JazzHubService', ['Resources', function (Resources) {

        /**
         * Return a list of all Jazz accessible JazzHub projects
         */
        this.getJazzHubProjects = function () {
            return Resources.get('jazzHub');
        };
    }]);
