'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, groups and roles.
 */
angular.module('Mastermind').controller('AdminCtrl', ['$scope', '$state', '$filter', '$q', '$rootScope',
    'Resources', 'ngTableParams',
    function ($scope, $state, $filter, $q, $rootScope, Resources, TableParams) {

        $scope.navType = 'pills';

        // Table Parameters
        var params = {
            page: 1,            // show first page
            count: 100,           // count per page
            sorting: {
                title: 'asc'     // initial sorting
            }
        };

        /**
         * When the new role button is clicked
         */
        $scope.toggleNewRole = function () {
            //Cancel edit of new role
            if ($scope.editRoleIndex === null && $scope.editingRole) {
                $scope.cancelRole();
            }
            else {
                $scope.editRoleIndex = null;
                $scope.editingRole = true;
                $scope.newRole = {};
            }
        };

        /**
         * Run when an edit on a row is clicked
         */
        $scope.triggerEditRole = function (role, index) {
            if ($scope.editRoleIndex === index) {
                $scope.cancelRole();
            }
            else {
                $scope.editingRole = true;
                $scope.editRoleIndex = index;
                //Close the new role dialog instance
                if ($('#newRoleDialog').hasClass('in')) {
                    $('#newRoleDialog').collapse('hide');
                }
                $scope.newRole = role;
            }
        };

        /**
         * Fetch the list of roles
         */
        Resources.refresh('roles').then(function (result) {
            $scope.roles = result.members;
            $scope.rolesTableParams = new TableParams(params, {
                total: $scope.roles.length, // length of data
                getData: function ($defer, params) {
                    var data = $scope.roles;

                    var start = (params.page() - 1) * params.count();
                    var end = params.page() * params.count();

                    // use build-in angular filter
                    var orderedData = params.sorting() ?
                        $filter('orderBy')(data, params.orderBy()) : data;

                    var ret = orderedData.slice(start, end);
                    $defer.resolve(ret);
                }
            });
        });


        $scope.newRole = {};

        $scope.cancelRole = function () {
            if ($('#newRoleDialog').hasClass('in')) {
                $('#newRoleDialog').collapse('hide');
            }
            $scope.newRole = {};
            $scope.editingRole = false;
            $scope.editRoleIndex = null;

            //Clear New Role Form
            if ($scope.newRoleForm)
                $scope.newRoleForm.$setPristine();
        };

        /**
         * Add a new Role to the server
         */
        $scope.addRole = function () {
            Resources.create('roles', $scope.newRole).then(function () {
                Resources.refresh('roles').then(function (result) {
                    $scope.roles = result.members;
                    $scope.rolesTableParams.total($scope.roles.length);
                    $scope.rolesTableParams.reload();
                    $scope.cancelRole();
                });
            });
        };

        /**
         * Update a new Role to the server
         */
        $scope.saveRole = function () {
            Resources.update($scope.newRole).then(function () {
                Resources.refresh('roles').then(function (result) {
                    $scope.roles = result.members;
                    $scope.rolesTableParams.total($scope.roles.length);
                    $scope.rolesTableParams.reload();
                    $scope.cancelRole();
                });
            });
        };

        /**
         * Delete a role
         */
        $scope.deleteRole = function (roleURL) {
            Resources.remove(roleURL).then(function () {
                Resources.refresh('roles').then(function (result) {
                    $scope.roles = result.members;
                    $scope.rolesTableParams.total($scope.roles.length);
                    $scope.rolesTableParams.reload();
                });
            });
        };

        $scope.editMode = false;

        $scope.tabSelected = function (tabName) {
            $scope.selectedTab = tabName;

            $scope.$broadcast("admin:tab:selected", tabName);
        };

        $scope.commandTrigerred = function (commandName) {
            $scope.$broadcast("admin:" + $scope.selectedTab, commandName);
        };

        $scope.edit = function () {
            $scope.editMode = true;

            $scope.$broadcast("admin:edit");
        };

        $scope.save = function () {
            $scope.editMode = false;

            $scope.$broadcast("admin:save");
        };

        $scope.cancel = function () {
            $scope.editMode = false;

            $scope.$broadcast("admin:cancel");
        };

        $scope.$on("securitygroups:create", function () {
            $scope.editMode = true;
        });

        $scope.$on("securitygroups:editmode:false", function () {
            $scope.editMode = false;
        });

        $scope.$on("securitygroups:editmode:true", function () {
            $scope.editMode = true;
        });

        $scope.$on("securitygroups:delete", function () {
            $scope.editMode = false;
        });

        $rootScope.adminSaveButtonEnable = true;
    }]);
