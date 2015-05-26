(function () {
    angular.module('PeopleModule', []).
    service('PeopleService', PeopleService);

    PeopleService.$inject = ['psafLogger', 'Restangular'];

    function PeopleService(psafLogger, Restangular) {

        var logger = psafLogger.getInstance('mastermind');

        var People = Restangular.all('/people');

        return {
            getPerson: getPerson,
            getProfile: getProfile,
            getManager: getManager
            // savePerson: savePerson,
            // deletePerson: deletePerson,
            // newPerson: newPerson
        };

        function getPerson(id) {
            return People.get(id);
        }

        function getProfile() {
            return getPerson('me');
        }

        function getManager(id) {
            return People.get(id).get('manager');
        }

        // the person object being saved should have been retrieved using
            // Restangular so they'll have the Restangular methods available.
        function savePerson(person) {

        }

    }

})();
