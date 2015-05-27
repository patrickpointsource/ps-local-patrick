/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('PeopleModule')
        .controller('PersonController', PersonController);

    PersonController.$inject = ['psafLogger', 'PeopleService', '$stateParams'];

    function PersonController(psafLogger, PeopleService, $stateParams) {
        var people = this;
        var logs = psafLogger.getInstance('mastermind');
        var id = $stateParams.id;
        people.athing = 'athing';

        var Person = PeopleService.getPerson(id);

        Person.then(function(response) {
            people.person = response;
        });

    }

})();
