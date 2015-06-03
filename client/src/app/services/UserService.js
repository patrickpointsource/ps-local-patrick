(function() {
    angular.module('app.services').
    factory('UserService', UserService);

    UserService.$inject = ['psafLogger', 'PeopleService', 'AuthService', '$interval', '$q'];

    function UserService(psafLogger, PeopleService, AuthService, $interval, $q) {

        var logger = psafLogger.getInstance('mastermind');
        var User = User || {};

        AuthService.init();

        return {
            PERMISSIONS: {
                VIEW_TASKS_PERMISSION: 'viewTasks',
                EDIT_TASKS_PERMISSION: 'editTasks',
                VIEW_ASSIGNMENTS_PERMISSION: 'viewAssignments',
                EDIT_ASSIGNMENTS_PERMISSION: 'editAssignments',
                VIEW_CONFIGURATION_PERMISSION: 'viewConfiguration',
                EDIT_CONFIGURATION_PERMISSION: 'editConfiguration',
                VIEW_HOURS_PERMISSION: 'viewHours',
                EDIT_HOURS_PERMISSION: 'editHours',
                DELETE_MY_HOURS_PERMISSION: 'deleteMyHours',
                EDIT_MY_HOURS_PERMISSION: 'editMyHours',
                VIEW_HOURS_REPORTS_CSV_PERMISSION: 'viewHoursReportsAndCSV',
                VIEW_PEOPLE: 'viewPeople',
                VIEW_PROFILE: 'viewProfile',
                EDIT_PROFILE: 'editProfile',
                VIEW_MY_PROFILE: 'viewMyProfile',
                EDIT_MY_PROFILE: 'editMyProfile',
                VIEW_PERSONNEL_DATA: 'viewPersonnelData',
                EDIT_PERSONNEL_DATA: 'editPersonnelData',
                VIEW_GROUPS: 'viewGroups',
                EDIT_GROUPS: 'editGroups',
                VIEW_PROJECTS: 'viewProjects',
                ADD_PROJECTS: 'addProjects',
                EDIT_PROJECTS: 'editProjects',
                DELETE_PROJECTS: 'deleteProjects',
                VIEW_PROJECT_LINKS: 'viewProjectLinks',
                EDIT_PROJECT_LINKS: 'editProjectLinks',
                VIEW_ROLES: 'viewRoles',
                EDIT_ROLES: 'editRoles',
                VIEW_VACATIONS: 'viewVacations',
                VIEW_MY_VACATIONS: 'viewMyVacations',
                EDIT_VACATIONS: 'editVacations',
                EDIT_MY_VACATIONS: 'editMyVacations',
                VIEW_NOTIFICATIONS: 'viewNotifications',
                EDIT_NOTIFICATIONS: 'editNotifications',
                DELETE_NOTIFICATIONS: 'deleteNotifications',
                EXECUTE_UPGRADE: 'executeUpgrade',
                VIEW_SECURITY_ROLES: 'viewSecurityRoles',
                EDIT_SECURITY_ROLES: 'editSecurityRoles',
                VIEW_MY_ROLE_TITLE: 'viewMyRoleTitle',
                VIEW_MY_SECONDARY_ROLE: 'viewMySecondaryRole',
                VIEW_OTHERS_ROLE_TITLE: 'viewOthersRoleTitle',
                VIEW_OTHERS_SECONDARY_ROLE: 'viewOthersSecondaryRole',
                EDIT_ROLES_TITLES: 'editRolesTitles',
                VIEW_MY_SECURITY_ROLES: 'viewMySecurityRoles',
                VIEW_OTHERS_SECURITY_ROLES: 'viewOthersSecurityRoles',
                EDIT_PROFILE_SECURITY_ROLES: 'editProfileSecurityRoles',
                VIEW_MY_PUBLIC_PERSONNELDATA: 'viewMyPublicPersonnelData',
                VIEW_OTHERS_PUBLIC_PERSONNELDATA: 'viewOthersPublicPersonnelData',
                VIEW_MY_PRIVATE_PERSONNELDATA: 'viewMyPrivatePersonnelData',
                VIEW_OTHERS_PRIVATE_PERSONNELDATA: 'viewOthersPrivatePersonnelData'
            },

            getUser: getUser,
            checkForPermission: checkForPermission
        };

        function getUser(refresh) {
            if (refresh || !angular.isDefined(User.id)) {
                refreshUser();
            }

            if (logger) {
                logger.log(User);
            }

            return User;
        }

        function refreshUser() {
            if (AuthService.isLoggedIn && !angular.isDefined(User.id)) {
                User = PeopleService.getProfile();
            }
            else {
                var authTimer = $interval(function() {
                    if (AuthService.isLoggedIn) {
                        User = PeopleService.getProfile();
                        $interval.cancel(authTimer);
                        authTimer = undefined;
                    }
                }, 3000, 20);
            }
        }

        function checkForPermission(permissionName) {
            if (!permissionName) {
                throw 'Unknown permission passed:' + permissionName;
            }

            var deferred = $q.defer();
            getUser().then(function(user){
                var permissionGroups = user.permissions;
                var found = _.find(permissionGroups, function(permissionGroup, groupKey){
                    return _.find(permissionGroup, function(permission){
                        return permission == permissionName;
                    });
                });
                deferred.resolve(found !== undefined);
            }, function(err){
                deferred.reject(err);
            });

            return deferred.promise;
        };

    }

})();
