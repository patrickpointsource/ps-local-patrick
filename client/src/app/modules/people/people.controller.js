/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('PeopleModule')
        .controller('PeopleController', PeopleController);

    PeopleController.$inject = ['psafLogger', 'PeopleService'];

    function PeopleController(psafLogger, PeopleService) {
        var people = this;
        var logs = psafLogger.getInstance('mastermind');
        people.athing = 'athing';

        PeopleService.getList().then(function(response) {
            people.list = response;
        });

        logs.info(people.list);

    }

})();
