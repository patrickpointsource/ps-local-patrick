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
	
	  var data = $scope.chartData;
	  var keyChartTypeMapping = $scope.keyChartTypeMapping ? $scope.keyChartTypeMapping: {};
	  
	  for (var i = 0; i < data.length; i ++) {
		  
		  if (!keyChartTypeMapping[data[i].key])
			  data[i].type = "area";
		  else
			  data[i].type = keyChartTypeMapping[data[i].key];
		  
		  data[i].yAxis = 1;
	  }
	  
	  var d;
	  var allValuesLengthSame = true;
	  var prevLength = data[0] ? data[0].values.length: 0;
	  
	  for (var i = 0; i < data.length; i ++) {
		  
		  for (var j = 0; j < data[i].values.length; j ++) {
			  //d = new Date(data[i].values[j][0]);
			  //data[i].values[j][0] = d.getTime();
			  d = new Date(data[i].values[j].x);
			  data[i].values[j].x = d.getTime();
		  }
		  
		  if (i > 0) {
			  allValuesLengthSame = allValuesLengthSame && prevLength == data[i].values.length;
			  
			  
		  }
		  
		  data[i].values.sort(function(v1, v2){
			  if (v1.x > v2.x)
				  return 1;
			  else
				  return -1;
			  
		  });
	  }
	  
	  
	// remove entries which has similar values for all keys - optimize graph
	  if (allValuesLengthSame && data[0]){
		  var j = data[0].values.length - 2;
		  var distance = Math.round(data[0].values.length / 10);
		  var k = 0;
		  
		  var allValuesSame = true;
		  
		  while(j > 1 && distance > 3) {
			  
			  allValuesSame = true;
			  
			  for (var i = 0; i < data.length; i ++)
				  allValuesSame = allValuesSame && data[i].values[j].y == data[i].values[j - 1].y;
			  
			  if (allValuesSame && k < distance) {
				  k ++;
				  for (var i = 0; i < data.length; i ++)
					  data[i].values.splice(j, 1);
				  
			  } else if (k >= distance)
				  k = 0;
			  j --;
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