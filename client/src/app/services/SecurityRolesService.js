(function () {
    angular
        .module('app.services')
        .service('SecurityRolesService', SecurityRolesService);

    SecurityRolesService.$inject = ['psafLogger', 'Restangular'];

    var path = 'securityRoles';
    function SecurityRolesService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var SecurityRoles = Restangular.all('/'+path);

        return {
            getSecurityRoles: getSecurityRoles,
            getSecurityRole: getSecurityRole,
            createSecurityRole: createSecurityRole,
            updateSecurityRole: updateSecurityRole,
            deleteSecurityRole: deleteSecurityRole
        };

        function getSecurityRoles(params) {
            logger.debug('SecurityRolesService', 'Getting SecurityRoles with params:', params);
            return SecurityRoles.getList(params);
        }
        function getSecurityRole(id){
            logger.debug('SecurityRolesService', 'Getting single SecurityRole with ID:', id);
            return SecurityRoles.get(id);
        }
        function createSecurityRole(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('SecurityRolesService', 'createSecurityRole was called with an object that ' +
                                              'contained an ID. Calling updateSecurityRole instead.');
                return updateSecurityRole(id, obj);
            }
            logger.debug('SecurityRolesService', 'Creating a new SecurityRole:', obj);
            return SecurityRoles.post(obj);
        }
        function updateSecurityRole(id, obj){
            logger.debug('SecurityRolesService', 'Updating the SecurityRole with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteSecurityRole(id){
            logger.debug('SecurityRolesService', 'Deleting the SecurityRole with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
