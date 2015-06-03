(function () {
    angular
        .module('app.services')
        .service('HoursService', HoursService);

    HoursService.$inject = ['psafLogger', 'Restangular'];

    var path = 'hours';
    function HoursService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Hours = Restangular.all('/'+path);

        return {
            getHours: getHours,
            getOneHours: getOneHours,
            createHours: createHours,
            updateHours: updateHours,
            deleteHours: deleteHours,

            // Convenience functions
            getHoursRecordsForPersonAndBetweenDates: getHoursRecordsForPersonAndBetweenDates
        };

        function getHours(params) {
            logger.debug('HoursService', 'Getting Hours objects with params:', params);
            return Hours.getList(params);
        }
        function getOneHours(id){
            logger.debug('HoursService', 'Getting single Hours object with ID:', id);
            return Hours.get(id);
        }
        function createHours(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('HoursService', 'createHours was called with an object that ' +
                                            'contained an ID. Calling updateHours instead.');
                return updateHours(id, obj);
            }
            logger.debug('HoursService', 'Creating a new Hours object:', obj);
            return Hours.post(obj);
        }
        function updateHours(id, obj){
            logger.debug('HoursService', 'Updating the Hours document with ID:', id, obj);
            return Restangular.one(path, id).customPUT(obj);
        }
        function deleteHours(id){
            logger.debug('HoursService', 'Deleting the Hours document with ID:', id);
            return Restangular.one(path, id).remove();
        }

        function getHoursRecordsForPersonAndBetweenDates(personID, startDate, endDate){
            return getHours({
                person: personID,
                startDate: startDate,
                endDate: endDate
            });
        }
    }
})();
