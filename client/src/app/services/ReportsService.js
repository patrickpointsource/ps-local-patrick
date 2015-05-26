(function () {
    angular
        .module('app.services')
        .service('ReportsService', ReportsService);

    ReportsService.$inject = ['psafLogger', 'Restangular'];

    var path = 'reports';
    function ReportsService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Reports = Restangular.all('/'+path);

        return {
            getUtilizationReport: getUtilizationReport,
        };

        function getUtilizationReport(params){
            logger.debug('ReportsService', 'Getting Utilization Report with params:', params);
            return Reports.get('utilization', params);
        }
    }
})();
