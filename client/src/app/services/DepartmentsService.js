(function () {
    angular
        .module('app.services')
        .service('DepartmentsService', DepartmentsService);

    DepartmentsService.$inject = ['psafLogger', 'Restangular'];

    var path = 'departments';
    function DepartmentsService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Departments = Restangular.all('/'+path);

        return {
            getDepartments: getDepartments,
            getDepartment: getDepartment,
            createDepartment: createDepartment,
            updateDepartment: updateDepartment,
            deleteDepartment: deleteDepartment
        };

        function getDepartments(params) {
            logger.debug('DepartmentsService', 'Getting Departments with params:', params);
            return Departments.getList(params);
        }
        function getDepartment(id){
            logger.debug('DepartmentsService', 'Getting single Department with ID:', id);
            return Departments.get(id);
        }
        function createDepartment(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('DepartmentsService', 'createDepartment was called with an object that ' +
                                                  'contained an ID. Calling updateDepartment instead.');
                return updateDepartment(id, obj);
            }
            logger.debug('DepartmentsService', 'Creating a new Department:', obj);
            return Departments.post(obj);
        }
        function updateDepartment(id, obj){
            logger.debug('DepartmentsService', 'Updating the Department with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteDepartment(id){
            logger.debug('DepartmentsService', 'Deleting the Department with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
