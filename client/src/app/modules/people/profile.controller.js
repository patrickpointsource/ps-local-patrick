/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function() {
    'use strict';

    angular
        .module('mastermind')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['psafLogger', 'PeopleService', 'UserService'];

    function ProfileController(psafLogger, PeopleService, UserService) {
        var logs = psafLogger.getInstance('mastermind');
        var profile = this;

        var Person = UserService.getUser();

        Person.then(function(response) {
            profile.person = response;
        });


    }

})();
