'use strict';

/**
 * Controller for people report.
 */

angular.module('Mastermind.controllers.reports').controller('PieChartCtrl', ['$scope', '$q', '$state', '$stateParams', '$filter', '$location', 'Resources',
function ($scope, $q, $state, $stateParams, $filter, $location, Resources) {

    $scope.output = {};
    $scope.el = null;
    $scope.elemId = null;

    $scope.render = function (elId) {
        var width = $scope.width || 0;
        var height = $scope.height || 250;

        var el = $('#' + elId + ' div');

        el = $('<div id="' + elId + 'chartContainer" ></div>').appendTo(el).height(height);

        var chartData = $scope.chartData;
        var isEmpty = true;

        if (chartData)
            isEmpty = !_.find(chartData, function (item) { return item.value !== 0; });

        if (isEmpty)
            return;

        width = el.width();

        var filterValues = dimple.getUniqueValues(chartData, "key");
        var svg = dimple.newSvg("#" + elId + "chartContainer", width, height);
        var legendBoxHeight = 50 + filterValues.length * 14;
        var padding = 5;
        var gap = 10;
        var strokeWidth = 1;
        var legendBoxWidth = width / 2 - gap - strokeWidth;

        var drawLegendBox = function (width, height, gap, legendBoxWidth, strokeWidth)
        {
            var g = svg.append("g")
            .attr("class", "mm-legend-box")
            .attr("x", width / 2 + gap)
            .attr("y", (height - legendBoxHeight) / 2)
            .attr("width", legendBoxWidth)
            .attr("height", legendBoxHeight)
            .attr("transform", "translate(" + (width / 2 + gap) + ", " + ((height - legendBoxHeight) / 2) + ")");

            g.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", legendBoxWidth)
                .attr("height", legendBoxHeight)
                .attr("stroke", "#CCCCCC")
                .attr("stroke-width", strokeWidth)
                .attr("fill-opacity", 0);

            g.append("text")
                .attr("x", 7)
                .attr("y", 15)
                .attr("width", legendBoxWidth - 7)
                .attr("height", 22)
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .text("Key");

            g.append("text")
                .attr("x", 7)
                .attr("y", legendBoxHeight - 10)
                .attr("width", legendBoxWidth - 7)
                .attr("height", 14)
                .style("font-size", "10px")
                .style("font-family", "sans-serif")
                .style("font-weight", "normal")
                .text("Click legend to show/hide hours.");
        };

        drawLegendBox(width, height, gap, legendBoxWidth, strokeWidth);

        // Create the chart
        var myChart = new dimple.chart(svg, chartData);
        myChart.setBounds(padding, padding, legendBoxWidth - padding, height - padding * 2);
        // Add an x and 3 y-axes.  When using multiple axes it's
        // important to assign them to variables to pass to the series
        myChart.addMeasureAxis("p", "value");

        // Add the bars mapped to the second y axis
        myChart.addSeries("key", dimple.plot.pie);
        //configBarTooltip(svg, bar, xTitle, yTitle);

        myChart.draw();

        var myLegend = myChart.addLegend(width / 2 + gap + 10, (height - legendBoxHeight) / 2 + 30, legendBoxWidth - 10, legendBoxHeight - 30, "left");

        myChart.draw();

        myChart.legends = [];

        // Get a unique list of Owner values to use when filtering

        // Get all the rectangles from our now orphaned legend
        myLegend.shapes.selectAll("rect")
          // Add a click event to each rectangle
          .on("click", function (e) {
              // This indicates whether the item is already visible or not
              var hide = false;
              var newFilters = [];
              // If the filters contain the clicked shape hide it
              filterValues.forEach(function (f) {
                  if (f === e.aggField.slice(-1)[0]) {
                      hide = true;
                  } else {
                      newFilters.push(f);
                  }
              });
              // Hide the shape or show it
              if (hide) {
                  d3.select(this).style("opacity", 0.2);
              } else {
                  newFilters.push(e.aggField.slice(-1)[0]);
                  d3.select(this).style("opacity", 0.8);
              }
              // Update the filters
              filterValues = newFilters;
              // Filter the data
              myChart.data = dimple.filterData(chartData, "key", filterValues);
              // Passing a duration parameter makes the chart animate. Without
              // it there is no transition
              myChart.draw(800);
          });

        $(window).resize(function()
        {
            var width = el.width();
            var legendBoxWidth = width / 2 - gap - strokeWidth;

            myChart.setBounds(padding, padding, legendBoxWidth - padding, height - padding * 2);
            myChart.legends = [];
            myChart.draw(0, true);

            el.find("g.dimple-legend").remove();

            myChart.addLegend(width / 2 + gap + 10, (height - legendBoxHeight) / 2 + 30, legendBoxWidth - 10, legendBoxHeight - 30, "left");
            myChart.draw(0, true);

            el.find("g.mm-legend-box").remove();

            drawLegendBox(width, height, gap, legendBoxWidth, strokeWidth);
        });
    };

    var configBarTooltip = function (svg, bar, xTitle, yTitle) {
        var popup;
        bar.addEventHandler("mouseover", onBarHover);
        bar.addEventHandler("mouseleave", onBarLeave);

        function onBarHover(e) {

            if (!e.yValue || e.yValue == 0)
                return;

            // Get the properties of the selected shape
            var cx = parseFloat(e.selectedShape.attr("x")),
        		cy = parseFloat(e.selectedShape.attr("y")),
        		cwidth = parseFloat(e.selectedShape.attr("width")),
        		cheight = parseFloat(e.selectedShape.attr("height"));
            var fill = e.selectedShape.attr("fill");
            var stroke = e.selectedShape.attr("stroke");

            // Set the size and position of the popup
            var width = 150,
				height = 55,
				x = (cx + 2 * width < svg.attr("width") ? cx + cwidth : cx - width - 10),
        		y = (cy - height < height ? height : cy - height);

            // Create a group for the popup
            popup = svg.append("g");

            // Add a rectangle surrounding the tooltip content
            popup
        		.append("rect")
        		.attr("x", x + 5)
        		.attr("y", y - 5)
        		.attr("width", width)
        		.attr("height", height)
        		.attr("rx", 5)
        		.attr("ry", 5)
        		.attr("fill-opacity", 0.7)
        		.style("fill", fill)
        		.style("stroke", stroke)
        		.style("stroke-width", 2);

            // Add custom tooltip content
            popup
        		.append('text')
        		.style("font-family", "sans-serif")
        		.style("font-size", 10)
        		.attr('x', x + 10)
        		.attr('y', y + 5)
        		.append('tspan')
        		.attr('x', x + 10)
        		.attr('y', y + 10)
        		.text(e.seriesValue[0])
        		.append('tspan')
        		.attr('x', x + 10)
        		.attr('y', y + 25)
        		.text(capitalizeString(xTitle) + ": " + e.xValue)
        		.append('tspan')
        		.attr('x', x + 10)
        		.attr('y', y + 40)
        		.text(capitalizeString(yTitle) + ": " + e.yValue);
        };

        function onBarLeave(e) {
            if (popup && popup.remove()) {
                popup.remove();
            }
        };

    };

    setTimeout(function () {
        var id = $scope.$parent.elemId ? $scope.$parent.elemId : $scope.$parent.$parent.elemId;

        $scope.render(id);
    }, 1 * 1000);

    var capitalizeString = function (str) {
        if (str && str.length > 1) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return str ? str.charAt(0).toUpperCase() : '';
        }
    };
}]);
