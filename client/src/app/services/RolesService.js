(function() {
    angular
        .module('app.services')
        .service('RolesService', RolesService);

    RolesService.$inject = ['psafLogger', 'Restangular'];

    var path = 'roles';

    function RolesService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Roles = Restangular.all('/' + path);

        return {
            getRoles: getRoles,
            getRole: getRole,
            createRole: createRole,
            updateRole: updateRole,
            deleteRole: deleteRole
        };

        function getRoles(params, refresh) {
            logger.debug('RolesService', 'Getting Roles with params:', params);
            if (refresh) {
                return Roles.getList(params);
            }
            return Roles.withHttpConfig({cache: true}).getList(params);
        }

        function getRole(id, refresh) {
            logger.debug('RolesService', 'Getting single Role with ID:', id);
            if (refresh) {
                return Roles.get(id);
            }
            return Roles.withHttpConfig({cache: true}).get(id);
        }

        function createRole(obj) {
            if (obj.id) {
                var id = obj.id;
                delete obj.id;
                logger.warn('RolesService', 'createRole was called with an object that ' +
                    'contained an ID. Calling updateRole instead.');
                return updateRole(id, obj);
            }
            logger.debug('RolesService', 'Creating a new Role:', obj);
            return Roles.post(obj);
        }

        function updateRole(id, obj) {
            logger.debug('RolesService', 'Updating the Role with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }

        function deleteRole(id) {
            logger.debug('RolesService', 'Deleting the Role with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
