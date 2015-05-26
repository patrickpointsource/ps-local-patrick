(function () {
    angular
        .module('HoursModule', [])
        .service('HoursService', HoursService);

    HoursService.$inject = ['psafLogger', 'Restangular'];

    function HoursService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Hours = Restangular.all('/hours');

        return {
            getHours: getHours,
            getOneHours: getOneHours,
            createHours: createHours,
            updateHours: updateHours,
            deleteHours: deleteHours
        };

        function getHours(params) {
            logger.debug('HoursService', 'Getting Hours objects with params:', params);
            return Hours.getList(params);
        }
        function getOneHours(id){
            logger.debug('HoursService', 'Getting single Hours object with ID:', id);
            return Hours.get(id);
        }
        function createHours(hoursObject){
            if(hoursObject.id){
                var id = hoursObject.id;
                delete hoursObject.id;
                logger.warn('HoursService', 'createHours was called with an object that contained an ID. Calling updateHours instead.');
                return updateHours(id, hoursObject);
            }
            logger.debug('HoursService', 'Creating a new Hours object:', hoursObject);
            return Hours.post(hoursObject);
        }
        function updateHours(id, hoursObject){
            logger.debug('HoursService', 'Updating the Hours document with ID:', id, hoursObject);
            return Restangular.one('hours', id).put(hoursObject);
        }
        function deleteHours(id){
            logger.debug('HoursService', 'Deleting the Hours document with ID:', id);
            return Restangular.one('hours', id).remove();
        }
    }
})();
