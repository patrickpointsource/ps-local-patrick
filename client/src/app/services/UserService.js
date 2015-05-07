(function () {
    angular.module('UserModule', []).
    service('UserService', UserService);

    UserService.$inject = [];

    function UserService() {
        return {
            getMenu: function () {
                return [
                    {'name': 'home', 'label': 'Dashboard'},
                    {'name': 'projects', 'label': 'Projects'},
                    {'name': 'people', 'label': 'People'}
                ];
            }
        };
    }


})();
