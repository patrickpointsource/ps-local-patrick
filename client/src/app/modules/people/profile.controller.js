/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function() {
    'use strict';

    angular
        .module('mastermind')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['psafLogger', 'PeopleService'];

    function ProfileController(psafLogger, PeopleService) {
        var logs = psafLogger.getInstance('mastermind');
        var profile = this;

        var Person = PeopleService.getProfile('me');

        Person.then(function(response) {
            profile.person = response;
        });


    }

})();
