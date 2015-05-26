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

    }

})();
