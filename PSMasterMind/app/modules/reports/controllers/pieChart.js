"use strict";

/**
 * Controller for people report.
 */

angular.module("Mastermind.controllers.reports").controller("PieChartCtrl", ["$scope", function ($scope)
{
    $scope.output = {};
    $scope.el = null;
    $scope.elemId = null;

    $scope.render = function (elId)
    {
        var height = $scope.height || 250;
        var el = $("<div id=\"" + elId + "chartContainer\"></div>").height(height).appendTo("#" + elId + " div");
        var chartData = $scope.chartData;
        var isEmpty = true;

        if (chartData)
            isEmpty = !_.find(chartData, function (item) { return item.value !== 0; });

        if (isEmpty)
            return;

        var filterValues = dimple.getUniqueValues(chartData, "key");
        var rebindData = false;

        var gap = 10;
        var padding = 5;
        var strokeWidth = 1;
        var width = el.width();
        var legendBoxWidth = width / 2 - gap - strokeWidth;
        var legendBoxHeight = 50 + filterValues.length * 14;

        var svg = dimple.newSvg("#" + el.attr("id"), width, height);
        var chart = new dimple.chart(svg, chartData);
        var legend = chart.addLegend(width / 2 + gap + 10, (height - legendBoxHeight) / 2 + 30, legendBoxWidth - 10, legendBoxHeight - 30, "left");

        chart.addMeasureAxis("p", "value");
        chart.addSeries("key", dimple.plot.pie).getTooltipText = function (e)
        {
            return [
                e.aggField[0] + ": " + e.p + " (" + Math.round(e.piePct * 100) + "%)"
            ];
        };
        chart.setBounds(padding, padding, legendBoxWidth - padding, height - padding * 2);
        chart.draw();

        var g = svg.insert("g", ":first-child")
            .attr("transform", "translate(" + (width / 2 + gap) + ", " + ((height - legendBoxHeight) / 2) + ")");

        g.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("stroke", "#CCCCCC")
            .attr("stroke-width", strokeWidth)
            .attr("fill-opacity", 0);

        g.append("text")
            .attr("x", 7)
            .attr("y", 15)
            .attr("height", 22)
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text("Key");

        g.append("text")
            .attr("x", 7)
            .attr("y", legendBoxHeight - 10)
            .attr("height", 14)
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
            .style("font-weight", "normal")
            .text("Click legend to show/hide hours.");

        var onLegendItemClick = function (e)
        {
            // This indicates whether the item is already visible or not
            var hide = false;
            var newFilters = [];
            // If the filters contain the clicked shape hide it
            filterValues.forEach(function(f)
            {
                if (f === e.aggField.slice(-1)[0])
                    hide = true;
                else
                    newFilters.push(f);
            });

            rebindData = hide;

            // Hide the shape or show it
            if (hide)
                d3.select(this).style("opacity", 0.2);
            else
            {
                newFilters.push(e.aggField.slice(-1)[0]);
                d3.select(this).style("opacity", 0.8);
            }
            // Update the filters
            filterValues = newFilters;
            // Filter the data
            chart.data = dimple.filterData(chartData, "key", filterValues);
            // Passing a duration parameter makes the chart animate.
            chart.draw(300);
        };
        var updateLegendBoxLayout = function ()
        {
            g.attr("transform", "translate(" + (width / 2 + gap) + ", " + (height - legendBoxHeight) / 2 + ")");

            g.select("rect")
                .attr("width", legendBoxWidth)
                .attr("height", legendBoxHeight);

            g.selectAll("text")
                .attr("width", legendBoxWidth - 7);

            chart.legends.length = 0;

            legend.shapes.selectAll("rect").on("click", onLegendItemClick);
        };

        updateLegendBoxLayout();

        $(window).resize(function ()
        {
            width = el.width();
            legendBoxWidth = width / 2 - gap - strokeWidth;

            legend.x = width / 2 + gap + 10;
            legend.y = (height - legendBoxHeight) / 2 + 30;

            chart.legends.push(legend);

            // Re-bind the data if any legend item is hidden.
            if (rebindData)
                chart.data = chartData;

            chart.setBounds(padding, padding, legendBoxWidth - padding, height - padding * 2);
            chart.draw(0, !rebindData);

            // Discard possible changes made with the legend.
            rebindData = false;
            filterValues = dimple.getUniqueValues(chartData, "key");

            updateLegendBoxLayout();
        });
    };

    setTimeout(function ()
    {
        var id = $scope.$parent.elemId ? $scope.$parent.elemId : $scope.$parent.$parent.elemId;

        $scope.render(id);
    }, 1 * 1000);
}]);
