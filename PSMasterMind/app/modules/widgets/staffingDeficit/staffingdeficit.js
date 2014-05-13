angular.module('Mastermind').controller('StaffingDeficitWidgetCtrl',
  function ($scope, $state, $rootScope, Resources, AssignmentService) {


    AssignmentService.getActiveProjectStaffingDeficits().then(function(assignments){
      var count = assignments.length;
      $scope.activeProjectDeficitCount = count;
    });

  }
);
