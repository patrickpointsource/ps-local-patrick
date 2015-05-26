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

        people.counter = 0;
        people.countUp = function() {
            logs.log(people.counter++);
        };

        people.countUp();

        people.list = PeopleService.get();

        logs.info(people.list);

    }

})();
