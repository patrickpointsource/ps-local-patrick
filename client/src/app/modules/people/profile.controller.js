/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function() {
    'use strict';

    angular
        .module('mastermind')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['psafLogger', 'PersonService'];

    function ProfileController(psafLogger, PersonService) {
        var logs = psafLogger.getInstance('mastermind');
        var profile = this;

        var Person = PersonService.getProfile('me');

        Person.then(function(response) {
            profile.person = response;

            var resourceId = profile.person.manager.resource.split('/')[1];
            var Manager = PersonService.getProfile(resourceId);

            Manager.then(function(response2) {
                profile.manager = response2;
                console.log(profile.manager);
            });
        });


    }

})();
