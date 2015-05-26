(function () {
    angular
        .module('app.services')
        .service('TasksService', TasksService);

    TasksService.$inject = ['psafLogger', 'Restangular'];

    var path = 'tasks';
    function TasksService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Tasks = Restangular.all('/'+path);

        return {
            getTasks: getTasks,
            getTask: getTask,
            createTask: createTask,
            updateTask: updateTask,
            deleteTask: deleteTask
        };

        function getTasks(params) {
            logger.debug('TasksService', 'Getting Tasks with params:', params);
            return Tasks.getList(params);
        }
        function getTask(id){
            logger.debug('TasksService', 'Getting single Task with ID:', id);
            return Tasks.get(id);
        }
        function createTask(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('TasksService', 'createTask was called with an object that ' +
                                              'contained an ID. Calling updateTask instead.');
                return updateTask(id, obj);
            }
            logger.debug('TasksService', 'Creating a new Task:', obj);
            return Tasks.post(obj);
        }
        function updateTask(id, obj){
            logger.debug('TasksService', 'Updating the Task with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteTask(id){
            logger.debug('TasksService', 'Deleting the Task with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
