/* global moment, _ */
(function(){
    angular
        .module('app.dashboard.widgets.hours')
        .service('HoursEntryService', HoursEntryService);


    HoursEntryService.$inject = ['psafLogger'];

    function HoursEntryService(logger){
        return {
            createNewHoursRow: function(date){
                logger.debug('createNewHoursRow:', date);
            },
            updateHoursCount: function(date){
                logger.debug('updateHoursCount:', date);
            }
        };
    }
})();
