'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'StackedAreaChartCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', '$location', 'Resources', 
function( $scope, $q, $state, $stateParams, $filter, $location, Resources) {
  
  $scope.output = {};
  $scope.el = null;
  $scope.elemId = null;
  
  $scope.render = function(elId) {
	  var el = $('#' + elId + ' div');
	  
	  el = $('<div id="' + elId + 'chartContainer" ></div>').appendTo(el);
	
	  //el = $('<div id="' + elId + 'chartContainer" ></div>').appendTo(el);
		
		 
	  var svg = dimple.newSvg("#" + elId + "chartContainer", 580, 400);
	  
	  var data = $scope.chartData;
	  
	 // d3.tsv("example_data.tsv", function (data) {
	      //data = dimple.filterData(data, "Owner", ["Aperture", "Black Mesa"])
	      var myChart = new dimple.chart(svg, data);
	      myChart.setBounds(60, 30, 505, 305);
	      var x = myChart.addCategoryAxis("x", "month");
	      x.addOrderRule("Date");
	      myChart.addMeasureAxis("y", "hours");
	      var s = myChart.addSeries("hours type", dimple.plot.area);
	      myChart.addLegend(60, 10, 500, 20, "right");
	      myChart.draw();
	   // });
	 

  };

  
  setTimeout(function() {
	  var id = $scope.$parent.elemId ? $scope.$parent.elemId: $scope.$parent.$parent.elemId;
	  
	  $scope.render(id);
  }, 1 * 1000);

  
} ] );