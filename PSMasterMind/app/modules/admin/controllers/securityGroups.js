/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind')
  .controller('SecurityGroupsCtrl',['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'TasksService', '$location', 'ngTableParams',
  function ($scope, $rootScope, $filter, Resources, $state, $stateParams, TasksService, $location, TableParams) {
    
    $scope.selectGroup = function(group, index) {
      $scope.selectedGroup = group;
      $scope.selectedGroupIndex = index;
      $scope.updateSelectedGroupMembers();
    };
    
    $scope.getGroups = function() {
      Resources.query('securityroles', {}, {}, function(result) {
        $scope.securityGroups = result.members;
        
        if($scope.securityGroups.length > 0) {
          $scope.selectedGroup = $scope.securityGroups[0];
        }
        
        Resources.query('userroles', {}, {}, function(userRoles) {
          $scope.userRoles = userRoles.members;
          
          Resources.query('people', {}, {}, function(people) {
            $scope.people = people.members;
            
            $scope.updateSelectedGroupMembers();
          });
        });
      });
    };
    
    $scope.updateSelectedGroupMembers = function() {
      if($scope.selectedGroup) {
        $scope.selectedGroupMembers = [];
        for(var i = 0; i < $scope.userRoles.length; i++) {
          var userRole = $scope.userRoles[i];
          if(userRole.roles.indexOf($scope.selectedGroup.name) > -1) {
            var person = _.findWhere($scope.people, { googleId: userRole.userId });
            
            $scope.selectedGroupMembers.push(person);
          }
        }
      }
    };
    
    $scope.getGroups();
    
    $scope.mapPermission = function(key) {
      if($scope.permissionDisplayMap[key]) {
        return $scope.permissionDisplayMap[key];
      } else {
        return key;
      }
    }
    
    $scope.permissionDisplayMap = {
      viewTasks: "View Tasks",
      editTasks: "Edit Tasks",
      viewAssignments: "View assignments",
      editAssignments: "Edit assignments",
      viewConfiguration: "View Configuration",
      editConfiguration: "Edit Configuration",
      viewHours: "View Hours",
      editHours: "Edit Hours",
      deleteMyHours: "Delete My Hours",
      editMyHours: "Edit personal hours",
      viewHoursReportsAndCSV: "Hours Reports and CSV",
      viewPeople: "View people",
      viewProfile: "View profile",
      editProfile: "Edit other's profiles",
      viewMyProfile: "View personal profile",
      editMyProfile: "Edit personal profile",
      viewPersonnelData: "View personnel data",
      editPersonnelData: "Edit personnel data",
      viewGroups: "View groups",
      editGroups: "Edit groups",
      viewProjects: "View projects",
      editProjects: "Edit projects",
      viewProjectLinks: "View project links",
      editProjectLinks: "Edit project links",
      viewRoles: "View project roles",
      editRoles: "Edit project roles",
      viewVacations: "View Out of Office",
      viewMyVacations: "View personal Out of Office",
      editVacations: "Approve / Deny requests",
      editMyVacations: "Edit personal requests",
      viewNotifications: "View notifications",
      editNotifications: "Edit notifications",
      deleteNotifications: "Delete notifications",
      executeUpgrade: "Execute upgrade",
      viewSecurityRoles: "View permissions",
      editSecurityRoles: "Edit permissions"
    }
    
    $scope.permissionChecked = function(collection, permission) {
      if($scope.selectedGroup) {
        var selectedCollection = _.findWhere($scope.selectedGroup.resources, { name: collection } );
        if(selectedCollection) {
          if(selectedCollection.permissions.indexOf(permission) > -1) {
            return true;
          }
        }
      }
      
      return false;
    }
    
    $scope.setPermission = function(collection, permission) {
      if($scope.selectedGroup) {
        var selectedCollection = _.findWhere($scope.selectedGroup.resources, { name: collection } );
        if(selectedCollection) {
          var index = selectedCollection.permissions.indexOf(permission);
          if(index > -1) {
            selectedCollection.permissions.splice(index, 1);
          } else {
            selectedCollection.permissions.push(permission);
          }
        }
      }
    }
    
    $scope.fullResourcesMap = [
    {
      "name": "tasks",
      "permissions": [
        "viewTasks",
        "editTasks"
      ]
    },
    {
      "name": "assignments",
      "permissions": [
        "viewAssignments",
        "editAssignments"
      ]
    },
    {
      "name": "configuration",
      "permissions": [
        "viewConfiguration",
        "editConfiguration"
      ]
    },
    {
      "name": "hours",
      "permissions": [
        "viewHours",
        "editHours",
        "deleteMyHours",
        "editMyHours",
        "viewHoursReportsAndCSV"
      ]
    },
    {
      "name": "people",
      "permissions": [
        "viewPeople",
        "viewProfile",
        "editProfile",
        "viewMyProfile",
        "editMyProfile",
        "viewPersonnelData",
        "editPersonnelData",
        "viewGroups",
        "editGroups"
      ]
    },
    {
      "name": "projects",
      "permissions": [
        "viewProjects",
        "editProjects",
        "viewProjectLinks",
        "editProjectLinks",
        "viewRoles",
        "editRoles"
      ]
    },
    {
      "name": "vacations",
      "permissions": [
        "viewVacations",
        "viewMyVacations",
        "editVacations",
        "editMyVacations"
      ]
    },
    {
      "name": "notifications",
      "permissions": [
        "viewNotifications",
        "editNotifications",
        "deleteNotifications"
      ]
    },
    {
      "name": "upgrade",
      "permissions": [
        "executeUpgrade"
      ]
    },
    {
      "name": "securityRoles",
      "permissions": [
        "viewSecurityRoles",
        "editSecurityRoles"
      ]
    }
  ];
  
  $scope.$on("admin:edit", function() {
    $scope.membersToDelete = [];
    $scope.membersToAdd = [];
  });
  
  $scope.$on("admin:save", function() {
    $scope.messages = [];
    if($scope.creatingGroup) {
      Resources.create('securityroles', $scope.selectedGroup).then(function(result) {
        $scope.checkForDeletedMembers();
        $scope.checkForAddedMembers();
        $scope.messages.push("Your changes have been saved successfully.");
      });
    } else {
      $scope.checkForDeletedMembers();
      $scope.checkForAddedMembers();
      Resources.update($scope.selectedGroup).then(function(result){
        $scope.messages.push("Your changes have been saved successfully.");
      });
    }
  });
  
  $scope.$on("admin:cancel", function() {
    $scope.creatingGroup = false;
  });
  
  $scope.removeMember = function(person, index) {
    $scope.membersToDelete.push(person);
    
    $scope.selectedGroupMembers.splice(index, 1);
  };
  
  $scope.checkForDeletedMembers = function() {
    for(var i = 0; i < $scope.membersToDelete.length; i++) {
      var member = $scope.membersToDelete[i];
      
      var userRoleEntry = _.findWhere($scope.userRoles, { userId: member.googleId });
      
      if(userRoleEntry) {
        var indexOfRole = userRoleEntry.roles.indexOf($scope.selectedGroup.name);
        
        if(indexOfRole > -1) {
          userRoleEntry.roles.splice(indexOfRole, 1);
          
          Resources.update(userRoleEntry);
        }
      }
    }
  };
  
  $scope.checkForAddedMembers = function() {
    for(var i = 0; i < $scope.membersToAdd.length; i++) {
      var member = $scope.membersToAdd[i];
      
      var userRoleEntry = _.findWhere($scope.userRoles, { userId: member.googleId });
      
      if(userRoleEntry) {
        var indexOfRole = userRoleEntry.roles.indexOf($scope.selectedGroup.name);
        
        if(indexOfRole == -1) {
          userRoleEntry.roles.push($scope.selectedGroup.name);
          
          Resources.update(userRoleEntry);
        }
      } else {
        var userRole = {
          userId: member.googleId,
          roles: [ $scope.selectedGroup.name ]
        };
        
        Resources.create('userroles', userRole).then(function(result) {
          console.log("UserRoles entry for " + member.name + " created.");
        });
      }
    }
  };
  
  $scope.memberToAddSelected = function(item, model, label) {
    $scope.membersToAdd.push(model);
    
    $scope.selectedGroupMembers.push(model);
    
    this.memberToAdd = null;
  };
  
  $scope.creatingGroup = false;
  
  $scope.createGroup = function() {
    $scope.creatingGroup = true;
    $scope.$emit("securitygroups:create");
    
    $scope.membersToDelete = [];
    $scope.membersToAdd = [];
    $scope.selectedGroupMembers = [];
    
    $scope.securityGroups.push({resources: []});
    $scope.selectedGroup = $scope.securityGroups[$scope.securityGroups.length - 1];
    $.extend(true, $scope.selectedGroup.resources, $scope.fullResourcesMap);
  };
  
  $scope.deleteGroup = function() {
    Resources.remove($scope.selectedGroup.resource).then(function(result) {
      $scope.securityGroups.splice($scope.selectedGroupIndex, 1);
      $scope.$emit("securitygroups:delete");
      if($scope.securityGroups.length > 0) {
        $scope.selectGroup($scope.securityGroups[0], 0);
      }
    });
  }
    
  }]);