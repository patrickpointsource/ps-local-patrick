'use strict';

/**
 * Controller for people report.
 */

angular.module('Mastermind.controllers.reports').controller('VerticalbarChartCtrl', ['$scope', '$q', '$state', '$stateParams', '$filter', '$location', 'Resources',
function ($scope, $q, $state, $stateParams, $filter, $location, Resources) {

    $scope.output = {};
    $scope.el = null;
    $scope.elemId = null;

    $scope.render = function (elId) {
        var width = $scope.width || 0;
        var height = $scope.height || 300;

        var el = $('#' + elId + ' div');

        el = $('<div id="' + elId + 'chartContainer" ></div>').appendTo(el).css({ height: height });

        var dataMap = $scope.chartData;
        var xTitle = $scope.xAxisTitle || 'role';
        var yTitle = $scope.yAxisTitle || 'hours';
        var yKeys = dataMap ? Object.keys(dataMap) : ['', '', ''];
        var svg = dimple.newSvg("#" + elId + "chartContainer", width, height);

        width = el.width();

        var chartData = [];
        var maxValues = {};
        var maxValue = 0;
        var gap = 10;
        var strokeWidth = 1;
        var legendBoxHeight = 100;

        var g = svg.append("g")
            .attr("x", 50)
            .attr("y", height - legendBoxHeight)
            .attr("width", width - 100)
            .attr("height", legendBoxHeight)
            .attr("transform", "translate(50, " + (height - legendBoxHeight) + ")");

        g.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width - 100 - 2 * strokeWidth)
            .attr("height", legendBoxHeight - 2 * strokeWidth)
            .attr("stroke", "#CCCCCC")
            .attr("stroke-width", strokeWidth)
            .attr("fill-opacity", 0);

        g.append("text")
            .attr("x", 7)
            .attr("y", 15)
            .attr("width", 100)
            .attr("height", 20)
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
            .style("font-weight", "bold")
            .text("Key");

        g.append("text")
            .attr("x", 7)
            .attr("y", legendBoxHeight - 10)
            .attr("width", width - 7)
            .attr("height", 14)
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
            .style("font-weight", "normal")
            .text("Click legend to show/hide hours.");

        for (var prop in dataMap) {
            chartData = chartData.concat(dataMap[prop]);

            for (var k = 0; k < dataMap[prop].length; k++) {
                if (!maxValues[dataMap[prop][k].label])
                    maxValues[dataMap[prop][k].label] = {};

                if (!maxValues[dataMap[prop][k].label][prop])
                    maxValues[dataMap[prop][k].label][prop] = 0;

                dataMap[prop][k][prop] = dataMap[prop][k].value;

                maxValues[dataMap[prop][k].label][prop] += dataMap[prop][k].value;
            }

            //chartData[prop] = dataMap[prop].value;
        }

        var getMaxValue = function (enabledProps) {
            var res = 0;

            for (var lbl in maxValues) {
                for (var prop in maxValues[lbl])
                    if (maxValues[lbl][prop] > res && (!enabledProps || _.indexOf(enabledProps, prop) > -1)) {
                        res = maxValues[lbl][prop];
                    }
            }

            return res;
        };

        maxValue = getMaxValue();

        //if (maxValue / secondMaxValue > 2 )
        //	 maxValue = secondMaxValue;

        var count = chartData.length;

        // Create the chart
        var myChart = new dimple.chart(svg, chartData);
        myChart.setBounds(50, 15, width - 100, height - legendBoxHeight - gap - 15 - 30);
        // Add an x and 3 y-axes.  When using multiple axes it's
        // important to assign them to variables to pass to the series
        var x = myChart.addCategoryAxis("x", "label");
        var y2 = myChart.addMeasureAxis("y", yKeys[2].toLowerCase());
        var y3 = myChart.addMeasureAxis("y", yKeys[1].toLowerCase());
        var y4 = myChart.addMeasureAxis("y", yKeys[0].toLowerCase());

        x.title = xTitle;
        // Order the x axis by sales value desc
        x.addOrderRule("label", true);

        y4.overrideMin = 0;
        y4.overrideMax = maxValue;
        y4.hidden = true;

        y3.overrideMin = 0;
        y3.overrideMax = maxValue;

        y2.overrideMin = 0;
        y2.overrideMax = maxValue;
        //y2.hidden = true;

        // Color the sales bars to be highly transparent
        myChart.assignColor(capitalizeString(y4.measure), "#96D4F3", "#7FCCF0", 0.5);
        // Add the bars mapped to the second y axis
        var bar = myChart.addSeries(capitalizeString(y4.measure), dimple.plot.bar, [x, y4]);
        configBarTooltip(myChart, bar, xTitle, yTitle);

        // Color the sales bars to be highly transparent
        myChart.assignColor(capitalizeString(y3.measure), "#0071BC", "#0071BC", 0.7);
        // Add the bars mapped to the third y axis
        bar = myChart.addSeries(capitalizeString(y3.measure), dimple.plot.bar, [x, y3]);
        configBarTooltip(myChart, bar, xTitle, yTitle);

        myChart.assignColor(capitalizeString(y2.measure), "red", "#ED1E79", 0.8);
        bar = myChart.addSeries(capitalizeString(y2.measure), dimple.plot.bigDash, [x, y2]);
        configBarTooltip(myChart, bar, xTitle, yTitle);

        myChart.draw();

        var myLegend = myChart.addLegend(65, height - legendBoxHeight + 30, width - 130, 20, "left");

        myChart.draw();

        myChart.legends = [];

        // Get a unique list of Owner values to use when filtering
        var filterValues = [y2.measure, y3.measure, y4.measure];
        // Get all the rectangles from our now orphaned legend
        myLegend.shapes.selectAll("rect")
            // Add a click event to each rectangle
            .on("click", function (e) {
                // This indicates whether the item is already visible or not
                var hide = false;
                var newFilters = [];
                // If the filters contain the clicked shape hide it
                filterValues.forEach(function (f) {
                    if (f.toLowerCase() === e.aggField.slice(-1)[0].toLowerCase()) {
                        hide = true;
                    } else {
                        newFilters.push(f);
                    }
                });
                // Hide the shape or show it
                if (hide) {
                    d3.select(this).style("opacity", 0.1);
                } else {
                    newFilters.push(e.aggField.slice(-1)[0].toLowerCase());
                    d3.select(this).style("opacity", 0.8);
                }
                // Update the filters
                filterValues = newFilters;
                // Filter the data
                //myChart.data = dimple.filterData(data, "type", filterValues);
                myChart.data = _.filter(chartData, function (val) {
                    var cond = false;

                    for (var p1 in val) {
                        if (_.indexOf(filterValues, p1) >= 0 || _.indexOf(filterValues, p1.toLowerCase()) >= 0)
                            cond = true;
                    }
                    return cond;
                });

                maxValue = getMaxValue(filterValues);

                y2.overrideMax = maxValue;
                y3.overrideMax = maxValue;
                y4.overrideMax = maxValue;
                // Passing a duration parameter makes the chart animate. Without
                // it there is no transition
                myChart.draw(300);
            });
    };

    var configBarTooltip = function (chart, bar, xTitle, yTitle) {
        var popup;
        var axisLine;
        var yKeys = $scope.chartData ? Object.keys($scope.chartData) : ['', '', ''];
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

            //Draw dotted line to the left or right yAxis 
            var cx1 = yKeys.indexOf(e.seriesValue[0].toLowerCase()) != 1 ? cx : cx + cwidth;
            var cx2 = yKeys.indexOf(e.seriesValue[0].toLowerCase()) != 1 ? 50 : chart.svg.attr("width") - 150;
            axisLine = chart.svg.append("line")
             	.attr("class", 'd3-dp-line')
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

        function onBarLeave(e) {
            if (popup && popup.remove()) {
                popup.remove();
            }
            if (axisLine && axisLine.remove()) {
                axisLine.remove();
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
    draw: function (chart, series, duration) {

        var chartData = series._positionData,
            theseShapes = null,
            classes = ["dimple-series-" + chart.series.indexOf(series), "dimple-bar"],
            updated,
            removed,
            xFloat = !series._isStacked() && series.x._hasMeasure(),
            yFloat = !series._isStacked() && series.y._hasMeasure(),
            cat = "none",
            weight = 2;

        if (series.x._hasCategories() && series.y._hasCategories()) {
            cat = "both";
        } else if (series.x._hasCategories()) {
            cat = "x";
        } else if (series.y._hasCategories()) {
            cat = "y";
        }

        if (chart._tooltipGroup !== null && chart._tooltipGroup !== undefined) {
            chart._tooltipGroup.remove();
        }

        if (series.shapes === null || series.shapes === undefined) {
            theseShapes = chart._group.selectAll("." + classes.join(".")).data(chartData);
        } else {
            theseShapes = series.shapes.data(chartData, function (d) { return d.key; });
        }

        // Add
        theseShapes
            .enter()
            .append("rect")
            .attr("id", function (d) { return dimple._createClass([d.key]); })
            .attr("class", function (d) {
                var c = [];
                c = c.concat(d.aggField);
                c = c.concat(d.xField);
                c = c.concat(d.yField);
                return classes.join(" ") + " " + dimple._createClass(c) + " " + chart.customClassList.barSeries + " " + dimple._helpers.css(d, chart);
            })
            .attr("x", function (d) {
                var returnValue = series.x._previousOrigin;
                if (cat === "x") {
                    returnValue = dimple._helpers.x(d, chart, series);
                } else if (cat === "both") {
                    returnValue = dimple._helpers.cx(d, chart, series);
                }
                return returnValue;
            })
            .attr("y", function (d) {
                var returnValue = series.y._previousOrigin;
                if (cat === "y") {
                    returnValue = dimple._helpers.y(d, chart, series) - weight;
                } else if (cat === "both") {
                    returnValue = dimple._helpers.cy(d, chart, series) - weight;
                }
                return returnValue;
            })
            .attr("width", function (d) { return (cat === "x" ? dimple._helpers.width(d, chart, series) : 0); })
            .attr("height", function (d) { return (cat === "y" ? dimple._helpers.height(d, chart, series) : 0) ? weight : 0; })
            .on("mouseover", function (e) { dimple._showBarTooltip(e, this, chart, series); })
            .on("mouseleave", function (e) { dimple._removeTooltip(e, this, chart, series); })
            .call(function () {
                if (!chart.noFormats) {
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
            .call(function () {
                if (!chart.noFormats) {
                    this.attr("fill", function (d) { return dimple._helpers.fill(d, chart, series); })
                        .attr("stroke", function (d) { return dimple._helpers.stroke(d, chart, series); });
                }
            });

        // Remove
        removed = chart._handleTransition(theseShapes.exit(), duration, chart, series)
            .attr("x", function (d) {
                var returnValue = series.x._origin;
                if (cat === "x") {
                    returnValue = dimple._helpers.x(d, chart, series);
                } else if (cat === "both") {
                    returnValue = dimple._helpers.cx(d, chart, series);
                }
                return returnValue;
            })
            .attr("y", function (d) {
                var returnValue = series.y._origin;
                if (cat === "y") {
                    returnValue = dimple._helpers.y(d, chart, series) - weight;
                } else if (cat === "both") {
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




