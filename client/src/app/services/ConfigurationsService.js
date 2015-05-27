(function () {
    angular
        .module('app.services')
        .service('ConfigurationsService', ConfigurationsService);

    ConfigurationsService.$inject = ['psafLogger', 'Restangular'];

    var path = 'configurations';
    function ConfigurationsService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Configurations = Restangular.all('/'+path);

        return {
            getConfigurations: getConfigurations,
            getConfiguration: getConfiguration,
            createConfiguration: createConfiguration,
            updateConfiguration: updateConfiguration,
            deleteConfiguration: deleteConfiguration
        };

        function getConfigurations(params) {
            logger.debug('ConfigurationsService', 'Getting Configurations with params:', params);
            return Configurations.getList(params);
        }
        function getConfiguration(id){
            logger.debug('ConfigurationsService', 'Getting single Configuration with ID:', id);
            return Configurations.get(id);
        }
        function createConfiguration(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('ConfigurationsService', 'createConfiguration was called with an object that ' +
                                                     'contained an ID. Calling updateConfiguration instead.');
                return updateConfiguration(id, obj);
            }
            logger.debug('ConfigurationsService', 'Creating a new Configuration:', obj);
            return Configurations.post(obj);
        }
        function updateConfiguration(id, obj){
            logger.debug('ConfigurationsService', 'Updating the Configuration with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteConfiguration(id){
            logger.debug('ConfigurationsService', 'Deleting the Configuration with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
