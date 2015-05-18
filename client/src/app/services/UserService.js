(function () {
    angular.module('UserModule', []).
    service('UserService', UserService);

    UserService.$inject = ['psafLogger', '$http'];

    var User = {};

    var getMenu = function (logger) {
        var menu = [{
            'name': 'home',
            'label': 'Dashboard'
        }, {
            'name': 'projects',
            'label': 'Projects'
        }, {
            'name': 'people',
            'label': 'People'
        }];

        if (logger) {
            logger.log(menu);
        }
        return menu;
    };


    function UserService(psafLogger, $http) {

        var logger = psafLogger.getInstance('mastermind');

        return {
            getMenu: getMenu,
            getUserProfile: getUserProfile
        };

        function getUserProfile($http) {

            var url = 'https://www.googleapis.com/plus/v1/people/me?key=';
            // var url = 'https://www.googleapis.com/plus/v1/people/me';
            var apiKey = 'ABQIAAAAKSiLiNwCxOW479xGFqHoTBTsMh9mumH-zfDa0AhzI7RTmmqoCRTv2C11J43hXCK7vZguPC7CgGDcNQ';
            // var apiKey = '';

            var result = $http.get(url + apiKey);

            return result;

        }

    }

})();
