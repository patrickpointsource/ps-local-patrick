angular.module('Mastermind').controller('StaffingDeficitWidgetCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'AssignmentService',
  function ($scope, $state, $rootScope, Resources, AssignmentService) {


    AssignmentService.getActiveProjectStaffingDeficits().then(function(assignments){
      var count = assignments.length;
      $scope.activeProjectDeficitCount = count;
    });

  }
]);
