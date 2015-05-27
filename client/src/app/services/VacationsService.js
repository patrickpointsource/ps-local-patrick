(function () {
    angular
        .module('app.services')
        .service('VacationsService', VacationsService);

    VacationsService.$inject = ['psafLogger', 'Restangular'];

    var path = 'vacations';
    function VacationsService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Vacations = Restangular.all('/'+path);

        return {
            getVacations: getVacations,
            getVacation: getVacation,
            createVacation: createVacation,
            updateVacation: updateVacation,
            deleteVacation: deleteVacation
        };

        function getVacations(params) {
            logger.debug('VacationsService', 'Getting Vacations with params:', params);
            return Vacations.getList(params);
        }
        function getVacation(id){
            logger.debug('VacationsService', 'Getting single Vacation with ID:', id);
            return Vacations.get(id);
        }
        function createVacation(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('VacationsService', 'createVacation was called with an object that ' +
                                              'contained an ID. Calling updateVacation instead.');
                return updateVacation(id, obj);
            }
            logger.debug('VacationsService', 'Creating a new Vacation:', obj);
            return Vacations.post(obj);
        }
        function updateVacation(id, obj){
            logger.debug('VacationsService', 'Updating the Vacation with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteVacation(id){
            logger.debug('VacationsService', 'Deleting the Vacation with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
