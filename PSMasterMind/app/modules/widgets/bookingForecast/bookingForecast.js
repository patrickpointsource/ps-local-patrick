angular.module('Mastermind').controller('BookingForecastCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService',
  function ($scope, $state, $rootScope, Resources, ProjectsService) {

    /**
     * Booking Forecast Data
     */
    ProjectsService.getActiveBacklogAndPipelineProjects(function(result){
      var projects = result.data;
      //console.log("main.js ongoingProjects:", $scope.ongoingProjects);
      $scope.fbProjects = projects;
      $scope.initBookingForecast();
    });

    $scope.bfShowPipeline = false;
    $scope.handleFBShowPipeline = function(checked){
      $scope.bfShowPipeline = checked;
      $scope.initBookingForecast();
    };


    $scope.initBookingForecast = function(){
      var showPipeline = $scope.bfShowPipeline;
      var projects = $scope.fbProjects;
      ProjectsService.getBookingForecastData(projects, showPipeline).then(function(result){
        //If data did not exist set it

        $scope.options = {
          axes: {
            x: {key: 'x', type: 'date', tooltipFormatter: function (d) {return moment(d).fromNow();}},
            y: {type: 'linear'}
          },
          series: [
            {y: 'value', color: '#4baa30', type: 'area', striped: true, label: 'Booked'},
            {y: 'otherValue', color: '#f34d4b', label: 'Bookable People'}
          ],
          lineMode: 'linear',
          tooltipMode: "default"
        };
        $scope.data = result;
        
        $scope.$emit('bookingforecast:loaded');
      });
    };
  }
]);