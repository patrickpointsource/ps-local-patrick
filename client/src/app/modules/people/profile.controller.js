/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function() {
    'use strict';

    angular
        .module('mastermind')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['psafLogger', 'PeopleService', 'HoursService'];

    function ProfileController(psafLogger, PeopleService, HoursService) {
        var logs = psafLogger.getInstance('mastermind');
        var profile = this;

        var Person = PeopleService.getProfile('me');

        Person.then(function(response) {
            profile.person = response;
        });

        HoursService.getHours({
            startDate: '2015-01-01',
            endDate: '2015-12-31'
        }).then(function(){
            logs.log('Got hours?', arguments);
        });

    }

})();
