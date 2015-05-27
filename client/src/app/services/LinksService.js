(function () {
    angular
        .module('app.services')
        .service('LinksService', LinksService);

    LinksService.$inject = ['psafLogger', 'Restangular'];

    var path = 'links';
    function LinksService(psafLogger, Restangular) {
        var logger = psafLogger.getInstance('mastermind');
        var Links = Restangular.all('/'+path);

        return {
            getLinks: getLinks,
            getLink: getLink,
            createLink: createLink,
            updateLink: updateLink,
            deleteLink: deleteLink
        };

        function getLinks(params) {
            logger.debug('LinksService', 'Getting Links with params:', params);
            return Links.getList(params);
        }
        function getLink(id){
            logger.debug('LinksService', 'Getting single Link with ID:', id);
            return Links.get(id);
        }
        function createLink(obj){
            if(obj.id){
                var id = obj.id;
                delete obj.id;
                logger.warn('LinksService', 'createLink was called with an object that ' +
                                              'contained an ID. Calling updateLink instead.');
                return updateLink(id, obj);
            }
            logger.debug('LinksService', 'Creating a new Link:', obj);
            return Links.post(obj);
        }
        function updateLink(id, obj){
            logger.debug('LinksService', 'Updating the Link with ID:', id, obj);
            return Restangular.one(path, id).put(obj);
        }
        function deleteLink(id){
            logger.debug('LinksService', 'Deleting the Link with ID:', id);
            return Restangular.one(path, id).remove();
        }
    }
})();
