(function () {
    angular.module('UserModule', []).
    service('UserService', UserService);

    UserService.$inject = ['psafLogger'];

    var getMenu = function () {
        var menu =  [{
            'name': 'home',
            'label': 'Dashboard'
        }, {
            'name': 'projects',
            'label': 'Projects'
        }, {
            'name': 'people',
            'label': 'People'
        }];

        logger.log(menu);
        return menu;
    };

    function UserService(psafLogger) {

        var logger = psafLogger.getInstance('mastermind');

        return {
            getMenu: getMenu
        };
    }

})();
