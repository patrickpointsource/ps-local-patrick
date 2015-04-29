angular.module('Mastermind').controller('MyProjectsCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'AssignmentService', 'ProjectsService',
    function ($scope, $state, $rootScope, Resources, AssignmentService, ProjectsService) {

        /**
         * Get the list of projects kicking off
         */
        /**
         * Set up the projects to be added to the hours entry drop down
         */
        ProjectsService.getOngoingProjects(function (result) {

            $scope.ongoingProjects = result.data;

            AssignmentService.getMyCurrentAssignments($scope.me).then(function (assignments) {
                $scope.myProjects = [];
                $scope.myAssignments = [];

                _.each(assignments, function (assign) {
                    $scope.myProjects.push(assign.project);
                    $scope.myAssignments.push(assign);
                });

                if ($scope.myProjects.length > 0) {
                    $rootScope.hasActiveProjects = true;
                }

                var myProjects = [];
                for (var m = 0; m < $scope.myProjects.length; m++) {
                    var myProj = $scope.myProjects[m];
                    var found = undefined;
                    myProj.title = myProj.customerName + ': ' + myProj.name;
                    myProjects.push(myProj);

                    //Check if you have an assignment to flag that you have an assignment on the project
                    //and not that you are an exec or sales sponsor
                    if (myProj && myProj.status && myProj.status.hasAssignment) {
                        $scope.hasAssignment = true;
                    }

                    for (var n = 0; n < $scope.ongoingProjects.length; n++) {
                        var proj = $scope.ongoingProjects[n];
                        if (proj.resource == myProj.resource) {
                            $scope.ongoingProjects.splice(n, 1);
                            break;
                        }
                    }
                }

                myProjects.sort(function (item1, item2) {
                    if (item1.title < item2.title)
                        return -1;
                    if (item1.title > item2.title)
                        return 1;
                    return 0;
                });

                var otherProjects = [];
                while ($scope.ongoingProjects.length > 0) {
                    var myProj = $scope.ongoingProjects.pop();
                    myProj.title = myProj.customerName + ': ' + myProj.name;
                    otherProjects.push(myProj);
                }

                otherProjects.sort(function (item1, item2) {
                    if (item1.title < item2.title)
                        return -1;
                    if (item1.title > item2.title)
                        return 1;
                    return 0;
                });

                $scope.hoursProjects = myProjects.concat(otherProjects);

                Resources.get('roles').then(function (result) {
                    var roleGroups = {};
                    //Save the list of role types in the scope
                    $scope.rolesFilterOptions = result.members;
                    //Get list of roles to query members
                    for (var i = 0; i < result.members.length; i++) {
                        var role = result.members[i];
                        var resource = role.resource;
                        roleGroups[resource] = role;
                    }
                    $scope.roleGroups = roleGroups;
                });

            });
        });


    }
]);
