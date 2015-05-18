/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('mastermind')
        .service('PeopleService', PeopleService);

    PeopleService.$inject = ['$http'];

    function PeopleService($http) {
        var get = function() {
            return [
                {name: 'Andy', 'title': 'King Knucklehead'},
                {name: 'Ben', 'title': 'Knucklehead'},
                {name: 'Erin', 'title': 'Knucklehead'},
                {name: 'Nate', 'title': 'Prince Knucklehead'},
                {name: 'Patrick', 'title': 'Prince Knucklehead'},
                {name: 'Robbie', 'title': 'Knucklehead'},
                {name: 'Sean', 'title': 'Knucklehead'}
            ];
        };

        return {
            get: get
        };
    }
})();
