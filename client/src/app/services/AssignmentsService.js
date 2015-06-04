(function () {
    angular
        .module('app.services')
        .service('AssignmentsService', AssignmentsService);

    AssignmentsService.$inject = ['psafLogger', 'Restangular'];

    var path = 'assignments';
    function AssignmentsService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Assignments = Restangular.all('/'+path);

        return {
            getAssignments: getAssignments,
            getAssignment: getAssignment,
            createAssignment: createAssignment,
            updateAssignment: updateAssignment,
            deleteAssignment: deleteAssignment
        };

        function getAssignments(params, refresh) {
            logger.debug('AssignmentsService', 'Getting Assignments with params:', params);
            if (refresh) {
                return Assignments.getList(params);
            }
            return Assignments.withHttpConfig({cache: true}).getList(params);

        }
        function getAssignment(id, refresh){
            logger.debug('AssignmentsService', 'Getting single Assignment with ID:', id);
            if (refresh) {
                return Assignments.get(id);
            }
            return Assignments.withHttpConfig({cache: true}).get(id);
        }
        function createAssignment(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('AssignmentsService', 'createAssignment was called with an object that ' +
                                              'contained an ID. Calling updateAssignment instead.');
                return updateAssignment(id, obj);
            }
            logger.debug('AssignmentsService', 'Creating a new Assignment:', obj);
            return Assignments.post(obj);
        }
        function updateAssignment(id, obj){
            logger.debug('AssignmentsService', 'Updating the Assignment with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteAssignment(id){
            logger.debug('AssignmentsService', 'Deleting the Assignment with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
