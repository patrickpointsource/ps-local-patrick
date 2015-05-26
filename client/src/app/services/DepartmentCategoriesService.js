(function () {
    angular
        .module('app.services')
        .service('DepartmentCategoriesService', DepartmentCategoriesService);

    DepartmentCategoriesService.$inject = ['psafLogger', 'Restangular'];

    var path = 'departments/categories';
    function DepartmentCategoriesService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var DepartmentCategories = Restangular.all('/'+path);

        return {
            getDepartmentCategories: getDepartmentCategories,
            getDepartmentCategory: getDepartmentCategory,
            createDepartmentCategory: createDepartmentCategory,
            updateDepartmentCategory: updateDepartmentCategory,
            deleteDepartmentCategory: deleteDepartmentCategory
        };

        function getDepartmentCategories(params) {
            logger.debug('DepartmentCategoriesService', 'Getting DepartmentCategories with params:', params);
            return DepartmentCategories.getList(params);
        }
        function getDepartmentCategory(id){
            logger.debug('DepartmentCategoriesService', 'Getting single DepartmentCategory with ID:', id);
            return DepartmentCategories.get(id);
        }
        function createDepartmentCategory(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn(
                    'DepartmentCategoriesService', 
                    'createDepartmentCategory was called with an object that ' +
                    'contained an ID. Calling updateDepartmentCategory instead.');
                return updateDepartmentCategory(id, obj);
            }
            logger.debug('DepartmentCategoriesService', 'Creating a new DepartmentCategory:', obj);
            return DepartmentCategories.post(obj);
        }
        function updateDepartmentCategory(id, obj){
            logger.debug('DepartmentCategoriesService', 'Updating the DepartmentCategorie with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteDepartmentCategory(id){
            logger.debug('DepartmentCategoriesService', 'Deleting the DepartmentCategory with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
