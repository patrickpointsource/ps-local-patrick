'use strict';

/* Directives */


angular.module('hoursApp.directives', []).
directive('appVersion', ['version',
    function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }
]).

directive('task', function($compile) {
    var linker = function(scope, element, attrs) {
        var template = '<div ng-click="select(content)" class="listSlot"><div class="listName">' +
'<div class="projTaskIcon"><i class="fa" ng-class="checkType(content)"></i></div>{{content.name}}</div></div>'+
        '<div style="height:1px;"></div>';
        element.html(template);
        $compile(element.contents())(scope);
    };
    // Runs during compile
    return {
        restrict: 'E',
        replace: true,
        link: linker,
        controller: function($scope, $rootScope) {
            $scope.checkType = function(content) {
                if (content.name === 'Administration') {
                    return 'fa-cogs';
                } else if (content.name === 'Design') {
                    return 'fa-lightbulb-o';
                } else if (content.name === 'Documentation') {
                    return 'fa-folder-o';
                } else if (content.name === 'Marketing') {
                    return 'fa-bar-chart-o';
                } else if (content.name === 'Meetings') {
                    return 'fa-comments-o';
                } else if (content.name === 'Pre-sales support') {
                    return 'fa-phone';
                } else if (content.name === 'Sales') {
                    return 'fa-usd';
                } else if (content.name === 'Sick time') {
                    return 'fa-ambulance';
                } else if (content.name === 'Training') {
                    return 'fa-bolt';
                } else {
                    //search proj list for name and get type
                    var i;
                    // for (i = 0; i < $rootScope.user.loggableEvents.projects.length; i++) {
                    //     if ($rootScope.user.loggableEvents.projects[i].name === content.name) {
                    //         if ($rootScope.user.loggableEvents.projects[i].type === 'invest') {
                    //             return 'fa-flask';
                    //         } else {
                    //             return 'fa-rocket';
                    //         }
                    //     }
                    // }
                    return 'fa-rocket';
                }
            };

            $scope.select = function(item) {
                $rootScope.user.showMenu = '';
                $rootScope.user.toSubmit.task = {};
                $rootScope.user.toSubmit.task.resource = item.resource;
                $rootScope.user.toSubmit.task.name = item.name;
                $rootScope.toSubmitName = item.name;
            };
        },
        scope: {
            content: '='
        }
    };
});