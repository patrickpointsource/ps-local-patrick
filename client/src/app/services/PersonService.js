(function () {
    angular.module('PersonModule', []).
    service('PersonService', PersonService);

    PersonService.$inject = ['psafLogger', 'Restangular'];

    function PersonService(psafLogger, Restangular) {

        var logger = psafLogger.getInstance('mastermind');

        var Person = Restangular.all('/people');

        return {
            getPerson: getPerson,
            getProfile: getProfile,
            getManager: getManager
        };

        function getPerson(id) {
            return;
        }

        function getProfile(id) {
            return Person.get(id);
        }

        function getManager(id) {
            return Person.get(id).get('manager');
        }

    }

})();
