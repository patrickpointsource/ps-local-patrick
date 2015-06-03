/* global moment */
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
            deleteAssignment: deleteAssignment,

            // Convenience methods
            getCurrentAssignments: getCurrentAssignments
        };

        function getAssignments(params) {
            logger.debug('AssignmentsService', 'Getting Assignments with params:', params);
            return Assignments.getList(params);
        }
        function getAssignment(id){
            logger.debug('AssignmentsService', 'Getting single Assignment with ID:', id);
            return Assignments.get(id);
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

        function getCurrentAssignments(personID){
            var today = moment().format('YYYY-MM-DD');
            return getAssignments({
                person: personID,
                startingBefore: today,
                endingAfter: today
            });
        }
    }
})();
