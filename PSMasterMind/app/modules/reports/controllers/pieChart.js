//'use strict';

/**
 * Controller for people report.
 */

angular.module( 'Mastermind.controllers.reports' ).controller( 'PieChartCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', '$location', 'Resources', 
function( $scope, $q, $state, $stateParams, $filter, $location, Resources) {
  $scope.elemId = null;
 
  $scope.render = function(elId) {
	  var el = $('#' + elId + ' div');
	  
	  el = $('<div class="d3Div" style="height:100%" id="d3Div' + elId + '"><svg style="font-size: 11px;height:100%;" ' + 
		' xmlns="http://www.w3.org/2000/svg"></svg></div>').appendTo(el);
	
	 
	 var axisLabels = ["People", "Count"]
	 
	 var hideLegend = true;

	var preparedData = $scope.chartData;
	var allEmpty = true;
	
	for (var k = 0 ; k < preparedData.length;  k++) {
		allEmpty = allEmpty && preparedData[k].value == 0
	}
	var colors = ['#00BBD6', '#5BC9D1', '#92D7E7', '#D0ECF4', '#97D7D9', '#4EC2C7'];
	
	
	 var colorFn = d3.scale.category10(); 
	 //var colors = []
	
	 //for (var k = 0; k < preparedData.length; k ++)
	//		colors.push(colorFn(k))
	
	 if (!allEmpty)
		 nv.addGraph(function() {
			try {
				var chart = nv.models.pieChart()
	        	.x(function(d) { 
	        		// use hack to analyze who is calling this function and depending on this displays values or labels around the donut
		        	
		        	// when caller function renders tooltip
		        	if (arguments.callee.caller && arguments.callee.caller.toString().toLowerCase().indexOf('tooltip') > -1)
		        		return d.key;
		        	// if it is called for legend labels rendering
				 	if (arguments.callee.arguments.length == 3)
				 		return d.key;
				 	// all other cases when for displaying values around donut
				 	else
				 		return d.value;
        		})
		        .y(function(d) { return d.value })
		        .showLabels(true)
		        .labelThreshold(0.02)
		        .color(colors)
		        //.donut(true)
		        .height(300)
		 		.values(function(d) { return d })

				
				//chart.showLegend(false);
				
				//chart.showControls(false);
				
		 		nv.models.legend().width(320);
	 			
				var pie = chart.pie;
				
				 // override tooltip positioning function to fix top tooltip position
				pie.dispatch.on('elementMouseover.tooltip', function(e) {
					e.pos = [e.pos[0], e.pos[1]];
					chart.dispatch.tooltipShow(e);
				});
				
		 		d3.select('#' + el.attr('id') + ' svg')
	          		.datum(preparedData)
	          		.attr('class', 'chart')
			        .transition().duration(1000)
			        .call(chart);
				 
		 		var legendEl = $('#' + el.attr('id') + ' .nv-legendWrap').get(0);
		 		var legendSize = legendEl && legendEl.getBoundingClientRect ? legendEl.getBoundingClientRect(): {
		 			height: 0,
		 			width: 0
		 		};
		 		
		 		chart.update();
		 		/*
		 		// apply styles which will be only actual when chart is exported
				el.find('g.nv-label > rect').css('fill', 'transparent');
				el.find('g.nv-label > rect').css('stroke', 'transparent');
				el.find('g.nv-label > text').css('stroke', '#000');
				*/
				nv.utils.windowResize(chart.update);
				//$('#' + el.attr('id')).data('chart', chart);
				
				return chart;
			} catch(ex) {
				el.html('Error occured while rendering')
			}
		});
	 else
		 el.html('<br/><br/><br/><b>Empty data loaded</b>');

  };
  
  setTimeout(function() {
	  var id = $scope.$parent.elemId ? $scope.$parent.elemId: $scope.$parent.$parent.elemId;
	  
	  $scope.render(id);
  }, 1 * 1000);

  
} ] );