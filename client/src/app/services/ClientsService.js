(function () {
    angular
        .module('app.services')
        .service('ClientsService', ClientsService);

    ClientsService.$inject = ['psafLogger', 'Restangular'];

    var path = 'clients';
    function ClientsService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Clients = Restangular.all('/'+path);

        return {
            getClients: getClients,
            getClient: getClient,
            createClient: createClient,
            updateClient: updateClient,
            deleteClient: deleteClient
        };

        function getClients(params) {
            logger.debug('ClientsService', 'Getting Clients with params:', params);
            return Clients.getList(params);
        }
        function getClient(id){
            logger.debug('ClientsService', 'Getting single Client with ID:', id);
            return Clients.get(id);
        }
        function createClient(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('ClientsService', 'createClient was called with an object that ' +
                                              'contained an ID. Calling updateClient instead.');
                return updateClient(id, obj);
            }
            logger.debug('ClientsService', 'Creating a new Client:', obj);
            return Clients.post(obj);
        }
        function updateClient(id, obj){
            logger.debug('ClientsService', 'Updating the Client with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteClient(id){
            logger.debug('ClientsService', 'Deleting the Client with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
