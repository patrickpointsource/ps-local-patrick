angular.module('Mastermind').controller('MyProjectsCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService',
  function ($scope, $state, $rootScope, Resources, ProjectsService) {

    /**
     * Get the list of projects kicking off
     */
    /**
     * Set up the projects to be added to the hours entry drop down
     */
    ProjectsService.getOngoingProjects(function(result){

      $scope.ongoingProjects = result.data;

      ProjectsService.getMyCurrentProjects($scope.me).then(function(myCurrentProjects) {
        $scope.myProjects = myCurrentProjects.data;
        if($scope.myProjects.length>0){
          $scope.hasActiveProjects = true;
        }

        var myProjects = [];
        for (var m=0; m< $scope.myProjects.length; m++) {
          var myProj = $scope.myProjects[m];
          var found = undefined;
          myProj.title = myProj.customerName+': '+myProj.name;
          myProjects.push(myProj);

          //Check if you have an assignment to flag that you have an assignment on the project
          //and not that you are an exec or sales sponsor
          if(myProj && myProj.status && myProj.status.hasAssignment){
            $scope.hasAssignment = true;
          }

          for (var n=0;n< $scope.ongoingProjects.length; n++) {
            var proj = $scope.ongoingProjects[n];
            if(proj.resource == myProj.resource) {
              $scope.ongoingProjects.splice(n,1);
              break;
            }
          }
        }

        myProjects.sort(function(item1,item2){
          if ( item1.title < item2.title )
            return -1;
          if ( item1.title > item2.title )
            return 1;
          return 0;
        });

        var otherProjects = [];
        while($scope.ongoingProjects.length >0) {
          var myProj = $scope.ongoingProjects.pop();
          myProj.title = myProj.customerName+': '+myProj.name;
          otherProjects.push(myProj);
        }

        otherProjects.sort(function(item1,item2){
          if ( item1.title < item2.title )
            return -1;
          if ( item1.title > item2.title )
            return 1;
          return 0;
        });

        $scope.hoursProjects = myProjects.concat(otherProjects);

      });
    });


  }
]);