(function () {
    angular
        .module('app.services')
        .service('UserRolesService', UserRolesService);

    UserRolesService.$inject = ['psafLogger', 'Restangular'];

    var path = 'userRoles';
    function UserRolesService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var UserRoles = Restangular.all('/'+path);

        return {
            getUserRoles: getUserRoles,
            getUserRole: getUserRole,
            createUserRole: createUserRole,
            updateUserRole: updateUserRole,
            deleteUserRole: deleteUserRole
        };

        function getUserRoles(params) {
            logger.debug('UserRolesService', 'Getting UserRoles with params:', params);
            return UserRoles.getList(params);
        }
        function getUserRole(id){
            logger.debug('UserRolesService', 'Getting single UserRole with ID:', id);
            return UserRoles.get(id);
        }
        function createUserRole(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('UserRolesService', 'createUserRole was called with an object that ' +
                                              'contained an ID. Calling updateUserRole instead.');
                return updateUserRole(id, obj);
            }
            logger.debug('UserRolesService', 'Creating a new UserRole:', obj);
            return UserRoles.post(obj);
        }
        function updateUserRole(id, obj){
            logger.debug('UserRolesService', 'Updating the UserRole with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteUserRole(id){
            logger.debug('UserRolesService', 'Deleting the UserRole with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
