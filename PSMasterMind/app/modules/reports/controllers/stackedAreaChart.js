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
	  
	  el = $('<div class="d3Div stackedArea" style="height:100%" id="d3Div' + elId + '"><svg style="font-size: 11px;height:100%;width:100%;" ' + 
		' xmlns="http://www.w3.org/2000/svg"></svg></div>').appendTo(el);
	
	  //el = $('<div id="' + elId + 'chartContainer" ></div>').appendTo(el);
		
		 
	  //var svg = dimple.newSvg("#" + elId + "chartContainer", 580, 400);
	  
	  var data = $scope.chartData;
	  
	  /*
      var myChart = new dimple.chart(svg, data);
      myChart.setBounds(60, 30, 505, 305);
      var x = myChart.addCategoryAxis("x", "month");
      
      x.addOrderRule("Date");
      
      myChart.addMeasureAxis("y", "hours");
      
      var s = myChart.addSeries("hours type", dimple.plot.area);
      myChart.addLegend(60, 10, 500, 20, "right");
      myChart.draw();
      */
	  var d;
	  
	  for (var i = 0; i < data.length; i ++) {
		  
		  for (var j = 0; j < data[i].values.length; j ++) {
			  //d = new Date(data[i].values[j][0]);
			  //data[i].values[j][0] = d.getTime();
			  d = new Date(data[i].values[j].x);
			  data[i].values[j].x = d.getTime();
		  }
	  }
	  
	  var colors = ['#ed1e79', '#8cc63f', '#1b1464', '#ff0000'];
	  
	  nv.addGraph(function() {
		/*var chart = nv.models.stackedAreaChart()
			              .margin({right: 50})
			              .x(function(d) { return d[0] })   //We can modify the data accessor functions...
		  .y(function(d) { return d[1] })   //...in case your data is formatted differently.
		  .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
		  .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
		  .transitionDuration(500)
		  .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
		  .clipEdge(true)
			.width(620)
			.height(400)
		*/
		  /*
		  var testdata = stream_layers(3,10+Math.random()*100,.1).map(function(data, i) {
			  return {
			    key: 'Stream' + i,
			    values: data.map(function(a){a.y = a.y * (i <= 1 ? -1 : 1); return a})
			  };
			});
			testdata[0].type = "area"
			testdata[0].yAxis = 1
			testdata[1].type = "area"
			testdata[1].yAxis = 1
			testdata[2].type = "line"
			testdata[2].yAxis = 1
			*/
		  var chart = nv.models.multiChart()
	        .margin({top: 30, right: 60, bottom: 50, left: 70})
	        .color(colors);
	  // chart.xAxis
	  //      .tickFormat(d3.format(',f'));
	    chart.yAxis1
	        .tickFormat(d3.format(',.1f'));
	    //chart.yAxis2
	    //    .tickFormat(d3.format(',.1f'));
	    
		//Format x-axis labels with custom function.
		chart.xAxis
		    .tickFormat(function(d) { 
		      return d3.time.format('%x')(new Date(d)) 
		});
		
		/*chart.yAxis
		    .tickFormat(d3.format(',.2f'));
		*/
	    console.log('stacked:area:data:' + JSON.stringify(data))
		
	    d3.select('#' + el.attr('id') + ' svg')
			  .datum(data)
			  .call(chart);
			
			nv.utils.windowResize(chart.update);
			
			return chart;
	});
      
	 
	 

  };

  
  setTimeout(function() {
	  var id = $scope.$parent.elemId ? $scope.$parent.elemId: $scope.$parent.$parent.elemId;
	  
	  $scope.render(id);
  }, 1 * 1000);

  
} ] );