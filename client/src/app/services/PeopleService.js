(function() {
    angular
        .module('app.services')
        .service('PeopleService', PeopleService);

    PeopleService.$inject = ['psafLogger', 'Restangular'];

    var path = 'people';

    function PeopleService(psafLogger, Restangular) {

        var logger = psafLogger.getInstance('mastermind');

        var People = Restangular.all('/' + path);

        return {
            getPeople: getPeople,
            getPerson: getPerson,
            createPerson: createPerson,
            updatePerson: updatePerson,
            deletePerson: deletePerson,

            getProfile: getProfile,
            getManager: getManager
        };

        function getPeople(params, refresh) {
            logger.debug('PeopleService', 'Getting People with params:', params);
            if (refresh) {
                return People.getList(params);
            }
            return People.withHttpConfig({cache: true}).getList(params);
        }

        function getPerson(id, refresh) {
            logger.debug('PeopleService', 'Getting single Person with ID:', id);
            if (refresh) {
                return People.get(id);
            }
            return People.withHttpConfig({cache: true}).get(id);
        }

        function createPerson(obj) {
            if (obj.id) {
                var id = obj.id;
                delete obj.id;
                logger.warn('PeopleService', 'createPerson was called with an object that ' +
                    'contained an ID. Calling updatePerson instead.');
                return updatePerson(id, obj);
            }
            logger.debug('PeopleService', 'Creating a new Person:', obj);
            return People.post(obj);
        }

        function updatePerson(id, obj) {
            logger.debug('PeopleService', 'Updating the Person with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }

        function deletePerson(id) {
            logger.debug('PeopleService', 'Deleting the Person with ID:', id);
            return Restangular.one(path, id).remove();
        }

        function getProfile() {
            return getPerson('me');
        }

        function getManager(id) {
            return People.get(id).get('manager');
        }

    }

})();
