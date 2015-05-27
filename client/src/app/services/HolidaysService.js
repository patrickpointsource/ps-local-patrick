(function () {
    angular
        .module('app.services')
        .service('HolidaysService', HolidaysService);

    HolidaysService.$inject = ['psafLogger', 'Restangular'];

    var path = 'holidays';
    function HolidaysService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Holidays = Restangular.all('/'+path);

        return {
            getHolidays: getHolidays,
            getHoliday: getHoliday,
            createHoliday: createHoliday,
            updateHoliday: updateHoliday,
            deleteHoliday: deleteHoliday
        };

        function getHolidays(params) {
            logger.debug('HolidaysService', 'Getting Holidays with params:', params);
            return Holidays.getList(params);
        }
        function getHoliday(id){
            logger.debug('HolidaysService', 'Getting single Holiday with ID:', id);
            return Holidays.get(id);
        }
        function createHoliday(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('HolidaysService', 'createHoliday was called with an object that ' +
                                               'contained an ID. Calling updateHoliday instead.');
                return updateHoliday(id, obj);
            }
            logger.debug('HolidaysService', 'Creating a new Holiday:', obj);
            return Holidays.post(obj);
        }
        function updateHoliday(id, obj){
            logger.debug('HolidaysService', 'Updating the Holiday with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteHoliday(id){
            logger.debug('HolidaysService', 'Deleting the Holiday with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
