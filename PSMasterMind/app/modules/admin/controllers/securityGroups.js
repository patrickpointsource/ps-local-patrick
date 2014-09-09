/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind')
  .controller('SecurityGroupsCtrl',['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'TasksService', '$location', 'ngTableParams',
  function ($scope, $rootScope, $filter, Resources, $state, $stateParams, TasksService, $location, TableParams) {
    
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
    
    $scope.filterPeople = function() {
      if($scope.selectedGroupMembers && $scope.selectedGroupMembers.length > 0) {
        $scope.filteredPeople = _.filter($scope.people, function(person) {
          for(var i = 0; i < $scope.selectedGroupMembers.length; i++) {
            if($scope.selectedGroupMembers[i].resource == person.resource) {
              return false;
            }
          }
          
          return true;
        });
      }
    }
    
    $scope.updateSelectedGroupMembers = function() {
      if($scope.selectedGroup) {
        $scope.selectedGroupMembers = [];
        $scope.selectedGroupGroups = [];
        for(var i = 0; i < $scope.userRoles.length; i++) {
          var userRole = $scope.userRoles[i];
          if(userRole.userId) {
            if(_.findWhere(userRole.roles, { resource: $scope.selectedGroup.resource })) {
              var person = _.findWhere($scope.people, { googleId: userRole.userId });
            
              $scope.selectedGroupMembers.push(person);
            }
          }
          
          if(userRole.groupId) {
            if(_.findWhere(userRole.roles, { resource: $scope.selectedGroup.resource })) {
              var group = _.findWhere($scope.securityGroups, { resource: userRole.groupId });
            
              $scope.selectedGroupGroups.push(group);
            }
          }
          
        }
        
        $scope.filterPeople();
      }
    };
    
    $scope.getGroups();
    
    $scope.mapPermission = function(key) {
      if($scope.permissionDisplayMap[key]) {
        return $scope.permissionDisplayMap[key];
      } else {
        return key;
      }
    };
    
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
    };
    
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
    };
    
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
    };
    
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
    $scope.groupsToAdd = [];
    $scope.groupsToDelete = [];
    $scope.filterGroups();
  });
  
  $scope.$on("admin:save", function() {
    $scope.messages = [];
    if($scope.creatingGroup) {
      Resources.create('securityroles', $scope.selectedGroup).then(function(result) {
        $scope.checkForDeletedMembers();
        $scope.checkForAddedMembers();
        $scope.messages.push("Your changes have been saved successfully.");
        $scope.refreshGroups();
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
  
  $scope.removeGroup = function(group, index) {
    $scope.groupsToDelete.push(group);
    
    $scope.selectedGroupGroups.splice(index, 1);
  };
  
  $scope.checkForDeletedMembers = function() {
    // deleted people as members
    for(var i = 0; i < $scope.membersToDelete.length; i++) {
      var member = $scope.membersToDelete[i];
      
      var userRoleEntry = _.findWhere($scope.userRoles, { userId: member.googleId });
      
      if(userRoleEntry) {
        for(var j = 0; j < userRoleEntry.roles.length; j++) {
          var role = userRoleEntry.roles[j];
          if(role.resource && role.resource == $scope.selectedGroup.resource) {
            userRoleEntry.roles.splice(j, 1);
          
            Resources.update(userRoleEntry);
            
            break;
          }
        }
      }
    }
    
    // deleted groups as members
    for(var i = 0; i < $scope.groupsToDelete.length; i++) {
      var group = $scope.groupsToDelete[i];
      
      var userRoleEntry = _.findWhere($scope.userRoles, { groupId: group.resource });
      
      if(userRoleEntry) {
        for(var j = 0; j < userRoleEntry.roles.length; j++) {
          var role = userRoleEntry.roles[j];
          if(role.resource && role.resource == $scope.selectedGroup.resource) {
            userRoleEntry.roles.splice(j, 1);
          
            Resources.update(userRoleEntry);
            
            break;
          }
        }
      }
    }
  };
  
  $scope.checkForAddedMembers = function() {
    //added people as members
    for(var i = 0; i < $scope.membersToAdd.length; i++) {
      var member = $scope.membersToAdd[i];
      
      var userRoleEntry = _.findWhere($scope.userRoles, { userId: member.googleId });
      
      if(userRoleEntry) {
        if(!_.findWhere(userRoleEntry.roles, { resource: $scope.selectedGroup.resource })) {
          userRoleEntry.roles.push({ name: $scope.selectedGroup.name, resource: $scope.selectedGroup.resource });
          
          Resources.update(userRoleEntry);
        }
      } else {
        var userRole = {
          userId: member.googleId,
          roles: [ { name: $scope.selectedGroup.name, resource: $scope.selectedGroup.resource } ]
        };
        
        Resources.create('userroles', userRole).then(function(result) {
          console.log("UserRoles person entry for " + member.name + " created.");
        });
      }
    }
    
    //added groups as members
    for(var i = 0; i < $scope.groupsToAdd.length; i++) {
      var group = $scope.groupsToAdd[i];
      
      var userRoleEntry = _.findWhere($scope.userRoles, { groupId: group.resource });
      
      if(userRoleEntry) {
        if(!_.findWhere(userRoleEntry.roles, { resource: $scope.selectedGroup.resource })) {
          userRoleEntry.roles.push({ name: $scope.selectedGroup.name, resource: $scope.selectedGroup.resource });
          
          Resources.update(userRoleEntry);
        }
      } else {
        var userRole = {
          groupId: group.resource,
          roles: [ { name: $scope.selectedGroup.name, resource: $scope.selectedGroup.resource } ]
        };
        
        Resources.create('userroles', userRole).then(function(result) {
          console.log("UserRoles group entry for " + group.name + " created.");
        });
      }
    }
  };
  
  $scope.memberToAddSelected = function(item, model, label) {
    $scope.membersToAdd.push(model);
    
    $scope.selectedGroupMembers.push(model);
    
    this.memberToAdd = null;
    
    $scope.filterPeople();
  };
  
  $scope.groupToAddSelected = function(item, model, label) {
    $scope.groupsToAdd.push(model);
    
    $scope.selectedGroupGroups.push(model);
    
    this.groupToAdd = null;
    
    $scope.filterGroups();
  };
  
  $scope.filterGroups = function() {
    $scope.filteredGroups = _.filter($scope.securityGroups, function(group) {
      if(group.resource == $scope.selectedGroup.resource) {
        return false;
      }
      if($scope.groupsToAdd && $scope.groupsToAdd.length > 0) {
        for(var i = 0; i < $scope.groupsToAdd.length; i++) {
          if($scope.groupsToAdd[i].resource == group.resource) {
            return false;
          }
        }
        
        return true;
      }
      
      for(var i = 0; i < $scope.selectedGroupGroups.length; i++) {
        if($scope.selectedGroupGroups[i].resource == group.resource) {
          return false;
        }
      }
      
      return true;
    });
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
    for(var i = 0; i < $scope.userRoles.length; i++) {
      var userRole = $scope.userRoles[i];
      var index = userRole.roles.indexOf($scope.selectedGroup.name);
      if(index > -1) {
        userRole.roles.splice(index, 1);
        
        Resources.update(userRole);
      }
    }
    
    Resources.remove($scope.selectedGroup.resource).then(function(result) {
      $scope.$emit("securitygroups:delete");
      $scope.refreshGroups();
    });
  };
  
  $scope.refreshGroups = function() {
    Resources.query('securityroles', {}, {}, function(result) {
      $scope.securityGroups = result.members;
        
      if($scope.securityGroups.length > 0) {
        $scope.selectedGroup = $scope.securityGroups[0];
      }
    });
  };
    
  }]);