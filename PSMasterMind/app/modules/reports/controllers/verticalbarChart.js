"use strict";

/**
 * Controller for people report.
 */

angular.module("Mastermind.controllers.reports").controller("VerticalbarChartCtrl", ["$scope", function ($scope)
{
    $scope.output = {};
    $scope.el = null;
    $scope.elemId = null;

    $scope.render = function (elId)
    {
        var height = $scope.height || 300;
        var el = $("<div id=\"" + elId + "chartContainer\"></div>").height(height).appendTo("#" + elId + " div");

        var width = el.width();
        var gap = 10;
        var legendBoxHeight = 100;
        var strokeWidth = 1;

        var chartData = [];
        var dataMap = $scope.chartData;
        var maxValues = {};

        var xTitle = $scope.xAxisTitle || "role";
        var yTitle = $scope.yAxisTitle || "hours";
        var yKeys = dataMap ? Object.keys(dataMap) : ["", "", ""];

        var getMaxValue = function (enabledProps)
        {
            var res = 0;

            for (var lbl in maxValues)
                if (maxValues.hasOwnProperty(lbl))
                {
                    var value = maxValues[lbl];

                    for (var prop in value)
                        if (value.hasOwnProperty(prop) && value[prop] > res && (!enabledProps || _.indexOf(enabledProps, prop) > -1))
                            res = value[prop];
                }

            return res;
        };

        for (var prop in dataMap)
            if (dataMap.hasOwnProperty(prop))
            {
                chartData = chartData.concat(dataMap[prop]);

                for (var k = 0, item = dataMap[prop], count = item.length; k < count; k++)
                {
                    if (!maxValues[item[k].label])
                        maxValues[item[k].label] = {};

                    if (!maxValues[item[k].label][prop])
                        maxValues[item[k].label][prop] = 0;

                    item[k][prop] = item[k].value;

                    maxValues[item[k].label][prop] += item[k].value;
                }
            }

        var maxValue = getMaxValue();

        var svg = dimple.newSvg("#" + el.attr("id"), width, height);
        var chart = new dimple.chart(svg, chartData);
        var legend = chart.addLegend(65, height - legendBoxHeight + 30, width - 130, 50, "left");
        var xAxis = chart.addCategoryAxis("x", "label");
        var y1Axis = chart.addMeasureAxis("y", yKeys[2].toLowerCase());
        var y2Axis = chart.addMeasureAxis("y", yKeys[1].toLowerCase());
        var y3Axis = chart.addMeasureAxis("y", yKeys[0].toLowerCase());

        xAxis.title = xTitle;
        xAxis.addOrderRule("label", true);

        y1Axis.overrideMin = 0;
        y1Axis.overrideMax = maxValue;

        y2Axis.overrideMin = 0;
        y2Axis.overrideMax = maxValue;

        y3Axis.overrideMin = 0;
        y3Axis.overrideMax = maxValue;
        y3Axis.hidden = true;

        var filterValues = [y1Axis.measure, y2Axis.measure, y3Axis.measure];
        var rebindData = false;
        var series;

        chart.assignColor(capitalizeString(y3Axis.measure), "#96D4F3", "#7FCCF0", 0.5);
        series = chart.addSeries(capitalizeString(y3Axis.measure), dimple.plot.bar, [xAxis, y3Axis]);
        configBarTooltip(chart, series, xTitle, yTitle);

        chart.assignColor(capitalizeString(y1Axis.measure), "red", "#ED1E79", 0.8);
        series = chart.addSeries(capitalizeString(y1Axis.measure), dimple.plot.bigDash, [xAxis, y1Axis]);
        configBarTooltip(chart, series, xTitle, yTitle);

        chart.assignColor(capitalizeString(y2Axis.measure), "#0071BC", "#0071BC", 0.7);
        series = chart.addSeries(capitalizeString(y2Axis.measure), dimple.plot.bar, [xAxis, y2Axis]);
        configBarTooltip(chart, series, xTitle, yTitle);

        chart.setBounds(50, 15, width - 100, height - legendBoxHeight - gap - 15 - 30);
        chart.draw();

        var g = svg.insert("g", ":first-child")
            .attr("transform", "translate(50, " + (height - legendBoxHeight) + ")");

        g.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", legendBoxHeight - 2 * strokeWidth)
            .attr("stroke", "#CCCCCC")
            .attr("stroke-width", strokeWidth)
            .attr("fill-opacity", 0);

        g.append("text")
            .attr("x", 7)
            .attr("y", 15)
            .attr("height", 20)
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
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
            filterValues.forEach(function (f)
            {
                if (f.toLowerCase() === e.aggField.slice(-1)[0].toLowerCase())
                    hide = true;
                else
                    newFilters.push(f);
            });

            rebindData = hide;

            // Hide the shape or show it
            if (hide)
                d3.select(this).style("opacity", 0.1);
            else
            {
                newFilters.push(e.aggField.slice(-1)[0].toLowerCase());
                d3.select(this).style("opacity", 0.8);
            }
            // Update the filters
            filterValues = newFilters;
            // Filter the data
            chart.data = _.filter(chartData, function (val)
            {
                for (var p1 in val)
                    if (val.hasOwnProperty(p1) && (_.indexOf(filterValues, p1) >= 0 || _.indexOf(filterValues, p1.toLowerCase()) >= 0))
                        return true;

                return false;
            });

            maxValue = getMaxValue(filterValues);

            y1Axis.overrideMax = maxValue;
            y2Axis.overrideMax = maxValue;
            y3Axis.overrideMax = maxValue;

            chart.draw(300);
        };
        var updateLegendBoxLayout = function ()
        {
            g.select("rect")
                .attr("width", width - 100 - 2 * strokeWidth);

            g.selectAll("text")
                .attr("width", width - 7);

            chart.legends.length = 0;

            legend.shapes.selectAll("rect").on("click", onLegendItemClick);
        };

        updateLegendBoxLayout();

        $(window).resize(function ()
        {
            width = el.width();

            legend.width = width - 130;

            chart.legends.push(legend);

            // Re-bind the data if any legend item is hidden.
            if (rebindData)
                chart.data = chartData;

            chart.setBounds(50, 15, width - 100, height - legendBoxHeight - gap - 15 - 30);
            chart.draw(0, !rebindData);

            // Discard possible changes made with the legend.
            rebindData = false;
            filterValues = [y1Axis.measure, y2Axis.measure, y3Axis.measure];

            updateLegendBoxLayout();
        });
    };

    var configBarTooltip = function (chart, bar, xTitle, yTitle)
    {
        var popup;
        var axisLine;
        var yKeys = $scope.chartData ? Object.keys($scope.chartData) : ["", "", ""];
        bar.addEventHandler("mouseover", onBarHover);
        bar.addEventHandler("mouseleave", onBarLeave);

        function onBarHover(e)
        {

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
				x = (cx + 2 * width < chart.svg.attr("width") ? cx + cwidth : cx - width - 10),
        		y = (cy - height < height ? height : cy - height);

            // Create a group for the popup
            popup = chart.svg.append("g");

            // Add a rectangle surrounding the tooltip content
            popup
        		.append("rect")
        		.attr("x", x + 5)
        		.attr("y", y - 5)
        		.attr("width", width)
        		.attr("height", height)
        		.attr("rx", 5)
        		.attr("ry", 5)
        		.style("fill-opacity", 0.7)
        		.style("fill", fill)
        		.style("stroke", stroke)
        		.style("stroke-width", 2);

            // Add custom tooltip content
            popup
        		.append("text")
        		.style("font-family", "sans-serif")
        		.style("font-size", 10)
        		.attr("x", x + 10)
        		.attr("y", y + 5)
        		.append("tspan")
        		.attr("x", x + 10)
        		.attr("y", y + 10)
        		.text(e.seriesValue[0])
        		.append("tspan")
        		.attr("x", x + 10)
        		.attr("y", y + 25)
        		.text(capitalizeString(xTitle) + ": " + e.xValue)
        		.append("tspan")
        		.attr("x", x + 10)
        		.attr("y", y + 40)
        		.text(capitalizeString(yTitle) + ": " + e.yValue);

            //Draw dotted line to the left or right yAxis 
            var cx1 = yKeys.indexOf(e.seriesValue[0].toLowerCase()) != 1 ? cx : cx + cwidth;
            var cx2 = yKeys.indexOf(e.seriesValue[0].toLowerCase()) != 1 ? 50 : chart.svg.attr("width") - 150;
            axisLine = chart.svg.append("line")
             	.attr("class", "d3-dp-line")
             	.attr("x1", cx1)
             	.attr("y1", cy + 1)
             	.attr("x2", cx2)
             	.attr("y2", cy + 1)
             	.style("stroke-dasharray", ("3, 3"))
             	.style("stroke-opacity", 0.7)
             	.style("fill", fill)
             	.style("stroke", stroke)
             	.style("stroke-width", 2);
        };

        function onBarLeave(e)
        {
            if (popup && popup.remove())
            {
                popup.remove();
            }
            if (axisLine && axisLine.remove())
            {
                axisLine.remove();
            }
        };

    };

    setTimeout(function ()
    {
        var id = $scope.$parent.elemId ? $scope.$parent.elemId : $scope.$parent.$parent.elemId;

        $scope.render(id);
    }, 1 * 1000);

    var capitalizeString = function (str)
    {
        if (str && str.length > 1)
        {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else
        {
            return str ? str.charAt(0).toUpperCase() : "";
        }
    };

}]);

// Copyright: 2014 PMSI-AlignAlytics
// License: "https://github.com/PMSI-AlignAlytics/dimple/blob/master/MIT-LICENSE.txt"
// Source: /src/objects/plot/bar.js
dimple.plot.bigDash = {

    // By default the bar series is stacked if there are series categories
    stacked: true,

    // This is not a grouped plot meaning that one point is treated as one series value
    grouped: false,

    // The axes which will affect the bar chart - not z
    supportedAxes: ["x", "y", "c"],

    // Draw the chart
    draw: function (chart, series, duration)
    {

        var chartData = series._positionData,
            theseShapes = null,
            classes = ["dimple-series-" + chart.series.indexOf(series), "dimple-bar"],
            updated,
            removed,
            xFloat = !series._isStacked() && series.x._hasMeasure(),
            yFloat = !series._isStacked() && series.y._hasMeasure(),
            cat = "none",
            weight = 2;

        if (series.x._hasCategories() && series.y._hasCategories())
        {
            cat = "both";
        } else if (series.x._hasCategories())
        {
            cat = "x";
        } else if (series.y._hasCategories())
        {
            cat = "y";
        }

        if (chart._tooltipGroup !== null && chart._tooltipGroup !== undefined)
        {
            chart._tooltipGroup.remove();
        }

        if (series.shapes === null || series.shapes === undefined)
        {
            theseShapes = chart._group.selectAll("." + classes.join(".")).data(chartData);
        } else
        {
            theseShapes = series.shapes.data(chartData, function (d) { return d.key; });
        }

        // Add
        theseShapes
            .enter()
            .append("rect")
            .attr("id", function (d) { return dimple._createClass([d.key]); })
            .attr("class", function (d)
            {
                var c = [];
                c = c.concat(d.aggField);
                c = c.concat(d.xField);
                c = c.concat(d.yField);
                return classes.join(" ") + " " + dimple._createClass(c) + " " + chart.customClassList.barSeries + " " + dimple._helpers.css(d, chart);
            })
            .attr("x", function (d)
            {
                var returnValue = series.x._previousOrigin;
                if (cat === "x")
                {
                    returnValue = dimple._helpers.x(d, chart, series);
                } else if (cat === "both")
                {
                    returnValue = dimple._helpers.cx(d, chart, series);
                }
                return returnValue;
            })
            .attr("y", function (d)
            {
                var returnValue = series.y._previousOrigin;
                if (cat === "y")
                {
                    returnValue = dimple._helpers.y(d, chart, series) - weight;
                } else if (cat === "both")
                {
                    returnValue = dimple._helpers.cy(d, chart, series) - weight;
                }
                return returnValue;
            })
            .attr("width", function (d) { return (cat === "x" ? dimple._helpers.width(d, chart, series) : 0); })
            .attr("height", function (d) { return (cat === "y" ? dimple._helpers.height(d, chart, series) : 0) ? weight : 0; })
            .on("mouseover", function (e) { dimple._showBarTooltip(e, this, chart, series); })
            .on("mouseleave", function (e) { dimple._removeTooltip(e, this, chart, series); })
            .call(function ()
            {
                if (!chart.noFormats)
                {
                    this.attr("opacity", function (d) { return dimple._helpers.opacity(d, chart, series); })
                        .style("fill", function (d) { return dimple._helpers.fill(d, chart, series); })
                        .style("stroke", function (d) { return dimple._helpers.stroke(d, chart, series); });
                }
            });

        // Update
        updated = chart._handleTransition(theseShapes, duration, chart, series)
            .attr("x", function (d) { return xFloat ? dimple._helpers.cx(d, chart, series) - series.x.floatingBarWidth / 2 : dimple._helpers.x(d, chart, series); })
            .attr("y", function (d) { return (yFloat ? dimple._helpers.cy(d, chart, series) - series.y.floatingBarWidth / 2 : dimple._helpers.y(d, chart, series)) - weight; })
            .attr("width", function (d) { return (xFloat ? series.x.floatingBarWidth : dimple._helpers.width(d, chart, series)); })
            .attr("height", function (d) { return (yFloat ? series.y.floatingBarWidth : dimple._helpers.height(d, chart, series)) ? weight : 0; })
            .call(function ()
            {
                if (!chart.noFormats)
                {
                    this.attr("fill", function (d) { return dimple._helpers.fill(d, chart, series); })
                        .attr("stroke", function (d) { return dimple._helpers.stroke(d, chart, series); });
                }
            });

        // Remove
        removed = chart._handleTransition(theseShapes.exit(), duration, chart, series)
            .attr("x", function (d)
            {
                var returnValue = series.x._origin;
                if (cat === "x")
                {
                    returnValue = dimple._helpers.x(d, chart, series);
                } else if (cat === "both")
                {
                    returnValue = dimple._helpers.cx(d, chart, series);
                }
                return returnValue;
            })
            .attr("y", function (d)
            {
                var returnValue = series.y._origin;
                if (cat === "y")
                {
                    returnValue = dimple._helpers.y(d, chart, series) - weight;
                } else if (cat === "both")
                {
                    returnValue = dimple._helpers.cy(d, chart, series) - weight;
                }
                return returnValue;
            })
            .attr("width", function (d) { return (cat === "x" ? dimple._helpers.width(d, chart, series) : 0); })
            .attr("height", function (d) { return (cat === "y" ? dimple._helpers.height(d, chart, series) : 0) ? weight : 0; });

        dimple._postDrawHandling(series, updated, removed, duration);

        // Save the shapes to the series array
        series.shapes = theseShapes;
    }
};




