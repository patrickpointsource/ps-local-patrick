/* global moment, _ */
(function () {
    angular
        .module('app.services')
        .service('ProjectsService', ProjectsService);

    ProjectsService.$inject = [
        'psafLogger',
        'Restangular',
        '$q'
    ];

    var path = 'projects';
    var phasesPath = 'phases';
    var rolesPath = 'roles';
    function ProjectsService(psafLogger, Restangular, $q) {
        var logger = psafLogger.getInstance('mastermind');
        var Projects = Restangular.all('/'+path);

        return {
            getProjects: getProjects,
            getProject: getProject,
            createProject: createProject,
            updateProject: updateProject,
            deleteProject: deleteProject,

            getProjectPhases: getProjectPhases,
            getProjectPhase: getProjectPhase,
            createProjectPhase: createProjectPhase,
            updateProjectPhase: updateProjectPhase,
            deleteProjectPhase: deleteProjectPhase,

            getProjectPhaseRoles: getProjectPhaseRoles,
            getProjectPhaseRole: getProjectPhaseRole,
            createProjectPhaseRole: createProjectPhaseRole,
            updateProjectPhaseRole: updateProjectPhaseRole,
            deleteProjectPhaseRole: deleteProjectPhaseRole,

            // Convenience methods
            getOngoingProjects: getOngoingProjects
        };

        function getProjects(params) {
            logger.debug('ProjectsService', 'Getting Projects with params:', params);
            return Projects.getList(params);
        }
        function getProject(id){
            logger.debug('ProjectsService', 'Getting single Project with ID:', id);
            return Projects.get(id);
        }
        function createProject(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('ProjectsService', 'createProject was called with an object that ' +
                                              'contained an ID. Calling updateProject instead.');
                return updateProject(id, obj);
            }
            logger.debug('ProjectsService', 'Creating a new Project:', obj);
            return Projects.post(obj);
        }
        function updateProject(id, obj){
            logger.debug('ProjectsService', 'Updating the Project with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteProject(id){
            logger.debug('ProjectsService', 'Deleting the Project with ID:', id);
            return Restangular.one(path, id).remove();
        }


        function getProjectPhases(projectID, params) {
            logger.debug('ProjectsService', 'Getting ProjectPhases for Project with ID:', projectID,
                                            'and with params:', params);
            return Restangular.one(path, projectID).all(phasesPath).getList(params);
        }
        function getProjectPhase(projectID, id){
            logger.debug('ProjectsService', 'Getting single ProjectPhase for Project with ID:', projectID,
                                            'and with ID:', id);
            return Projects.one(path, projectID).all(phasesPath).get(id);
        }
        function createProjectPhase(projectID, obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('ProjectsService', 'createProjectPhase was called with an object that ' +
                                               'contained an ID. Calling updateProjectPhase instead.');
                return updateProjectPhase(projectID, id, obj);
            }
            logger.debug('ProjectsService', 'Creating a new ProjectPhase:', obj);
            return Projects.one(path, projectID).all(phasesPath).post(obj);
        }
        function updateProjectPhase(projectID, id, obj){
            logger.debug('ProjectsService', 'Updating the ProjectPhase with ID:', id, obj);
            return Restangular.one(path, projectID).one(phasesPath, id).put(obj);
        }
        function deleteProjectPhase(projectID, id){
            logger.debug('ProjectsService', 'Deleting the ProjectPhase with ID:', id);
            return Restangular.one(path, projectID).one(phasesPath, id).remove();
        }


        function getProjectPhaseRoles(projectID, phaseID, params) {
            logger.debug('ProjectsService', 'Getting ProjectPhaseRoles with params:', params);
            return Projects.one(path, projectID).one(phasesPath, phaseID).all(rolesPath).getList(params);
        }
        function getProjectPhaseRole(projectID, phaseID, id){
            logger.debug('ProjectsService', 'Getting single ProjectPhaseRole with ID:', id);
            return Projects.one(path, projectID).one(phasesPath, phaseID).all(rolesPath).get(id);
        }
        function createProjectPhaseRole(projectID, phaseID, obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('ProjectsService', 'createProjectPhaseRole was called with an object that ' +
                                               'contained an ID. Calling updateProjectPhaseRole instead.');
                return updateProjectPhaseRole(id, obj);
            }
            logger.debug('ProjectsService', 'Creating a new ProjectPhaseRole:', obj);
            return Projects.one(path, projectID).one(phasesPath, phaseID).all(rolesPath).post(obj);
        }
        function updateProjectPhaseRole(projectID, phaseID, id, obj){
            logger.debug('ProjectsService', 'Updating the ProjectPhaseRole with ID:', id, obj);
            return Restangular.one(path, projectID).one(phasesPath, phaseID).one(rolesPath, id).put(obj);
        }
        function deleteProjectPhaseRole(projectID, phaseID, id){
            logger.debug('ProjectsService', 'Deleting the ProjectPhaseRole with ID:', id);
            return Restangular.one(path, projectID).one(phasesPath, phaseID).one(rolesPath, id).remove();
        }


        function getOngoingProjects(){
            var deferred = $q.defer();
            getProjects({
                types: 'invest,poc,paid',
                endingAfter: moment().format('YYYY-MM-DD')
            }).then(function(projects){
                // Filter out paid but uncommitted projects
                projects = _.filter(projects, function(project){
                    if(project.type === 'paid' && !project.committed){
                        return false;
                    }
                    return true;
                });
                deferred.resolve(projects);
            }, function(err){
                deferred.reject(err);
            });
            return deferred.promise;
        }
    }
})();
