'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'VerticalbarChartCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', '$location', 'Resources', 
function( $scope, $q, $state, $stateParams, $filter, $location, Resources) {
  
  $scope.output = {};
  $scope.el = null;
  $scope.elemId = null;
  
  $scope.render = function(elId) {
	  var el = $('#' + elId + ' div');
	  
	  el = $('<div class="d3Div" id="d3Div' + elId + '"><svg style="font-size: 11px;height:100%;" ' + 
		' xmlns="http://www.w3.org/2000/svg"></svg></div>').appendTo(el);
	
	 var dataMap = {
		"developers" : [{
			label: "count",
			value: 33
		}],
		"architects" : [{
			label: "count",
			value: 5
		}],
		"sales" : [{
			label: "count",
			value: 4
		}],
		"marketing" : [{
			label: "count",
			value: 7
		}],
		"managers" : [{
			label: "count",
			value: 15
		}]
	 };
	 var axisLabels = ["People", "Count"]
	 var chartData = [];
	 var hideLegend = true;
	
	 for (var prop in dataMap){
		chartData.push({
			key: prop != '_key'? prop: 'TYPE OF',
			values: dataMap[prop]
		})
		
		if (prop != '_key')
			hideLegend = false;
	 }
	
	 var count = chartData.length;
	 var colorFn = d3.scale.category10(); 
	 var colors = []
	
	 for (var k = 0; k < count; k ++)
			colors.push(colorFn(k))
	
	 nv.addGraph(function() {
			try {
				var chart = nv.models.multiBarChart()
					.x(function(d) { 
						return d.label 
					})
				 	.y(function(d) { 
				 		return d.value 
			 		})
				 	.tooltips(true)
				 	.color(colors)
				 	.reduceXTicks(false)
				 	.height(300)
				 	//.staggerLabels(true);
				
				//chart.showLegend(false);
				
				chart.showControls(false);
				
				var xAxisLbl = axisLabels && axisLabels[0] ? axisLabels[0] : "X-axis";
				var yAxisLbl = axisLabels && axisLabels[1] ? axisLabels[1] : "Y-axis";
					
				chart.xAxis.axisLabel(xAxisLbl);
				chart.yAxis.axisLabel(yAxisLbl);
			
				
			    chart.xAxis.rotateLabels(-60);
			  
			    var leg = nv.models.legend();
			    leg.width(280);
			    
			    d3.select('#' + el.attr('id') + ' svg')
			    	.attr('class', 'chart')
		        	.datum(chartData)
		        	.transition().duration(500).call(chart);
			    
			    var legendEl = $('#' + el.attr('id') + ' .nv-legendWrap').get(0);
			    var legendSize = legendEl && legendEl.getBoundingClientRect ? legendEl.getBoundingClientRect(): {
		 			height: 0,
		 			width: 0
		 		};
		 		
		 		//if not data available for this chart
		 		if ($('#' + el.attr('id') + ' .nv-x').size() == 0 ) {
		 			chart.update();
					nv.utils.windowResize(chart.update);
					return;
		 		}
		 		
		 		var chartSize = $('#' + el.attr('id') + ' .nv-x').get(0).getBoundingClientRect();
		 		
		 		// 20 - padding top,
		 		$('#' + el.attr('id')).height(chartSize.height + (legendSize.height > 0 ? legendSize.height : 20) + 20);
		 		
		 		chart.update();
				nv.utils.windowResize(chart.update);
				
				// fix postion of axis labels
				$('#' + el.attr('id') + ' .nv-y.nv-axis .nv-axislabel').attr('dy', 28);
				$('#' + el.attr('id') + ' .nv-x.nv-axis .nv-axislabel').attr('dy', -40);
				
				return chart;
			} catch(ex) {
				el.html('Error occured while rendering')
			}
		});

  };
  
  setTimeout(function() {
	  var id = $scope.$parent.elemId ? $scope.$parent.elemId: $scope.$parent.$parent.elemId;
	  
	  $scope.render(id);
  }, 1 * 1000);

  
} ] );