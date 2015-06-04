/* Copyright © 2015 PointSource, LLC. All rights reserved. */
(function () {
    'use strict';

    angular
        .module('PeopleModule')
        .controller('PeopleController', PeopleController);

    PeopleController.$inject = ['psafLogger', 'PeopleService', 'RolesService', 'AssignmentsService'];

    function PeopleController(psafLogger, PeopleService, RolesService, AssignmentsService) {
        var people = this;
        var logs = psafLogger.getInstance('mastermind');

        RolesService.getRoles().then(function(response) {
            var roles = response;
            people.roles = {};
            angular.forEach(roles, function(role) {
                if (!role.abbreviation) {
                    role.abbreviation = 'admin';
                }
                people.roles[role.id] = role;
            });

            PeopleService.getPeople().then(function(response) {
                people.list = response;
                angular.forEach(people.list, function(person) {
                    person.role = people.roles[person.primaryRole];
                    person.utilization = Math.floor(Math.random() * 100);
                });
            });
        });

        var currentAssignments = [];

        AssignmentsService.getAssignments().then(function(response) {
            angular.forEach(response, function(assignment) {
                if (assignment.isCurrent) {
                    currentAssignments.push(assignment);
                }
            });
            console.log('Assignments ---->', currentAssignments);
        });

        people.sorter = 'name.familyName';
        people.sortReverse = false;
        people.sorting = '';

        people.sortFilter = function(sortParam) {
            switch(sortParam) {
                case 'name':
                    people.sorter = 'name.familyName';
                    people.sortReverse = false;
                    break;
                case 'name-desc':
                    people.sorter = 'name.familyName';
                    people.sortReverse = true;
                    break;
                case 'role':
                    people.sorter = 'role.name';
                    people.sortReverse = false;
                    break;
                case 'utilization':
                    people.sorter = 'utilization';
                    people.sortReverse = false;
                    break;
                case 'utilization-desc':
                    people.sorter = 'utilization';
                    people.sortReverse = true;
                    break;
                default:
                    people.sorter = 'name.familyName';
                    people.sortReverse = false;
            }
        };
    }


})();
