(function () {
    angular
        .module('app.services')
        .service('SkillsService', SkillsService);

    SkillsService.$inject = ['psafLogger', 'Restangular'];

    var path = 'skills';
    function SkillsService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Skills = Restangular.all('/'+path);

        return {
            getSkills: getSkills,
            getSkill: getSkill,
            createSkill: createSkill,
            updateSkill: updateSkill,
            deleteSkill: deleteSkill
        };

        function getSkills(params) {
            logger.debug('SkillsService', 'Getting Skills with params:', params);
            return Skills.getList(params);
        }
        function getSkill(id){
            logger.debug('SkillsService', 'Getting single Skill with ID:', id);
            return Skills.get(id);
        }
        function createSkill(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('SkillsService', 'createSkill was called with an object that ' +
                                              'contained an ID. Calling updateSkill instead.');
                return updateSkill(id, obj);
            }
            logger.debug('SkillsService', 'Creating a new Skill:', obj);
            return Skills.post(obj);
        }
        function updateSkill(id, obj){
            logger.debug('SkillsService', 'Updating the Skill with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteSkill(id){
            logger.debug('SkillsService', 'Deleting the Skill with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
