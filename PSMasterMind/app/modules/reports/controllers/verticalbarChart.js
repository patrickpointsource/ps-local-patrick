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
        var el = $('#' + elId + ' div');

        el = $('<div id="' + elId + 'chartContainer" ></div>').appendTo(el);

        var dataMap = $scope.chartData;
        var width = $scope.width ? $scope.width : 620;
        var height = $scope.height ? $scope.height : 300;
        var xTitle = $scope.xAxisTitle ? $scope.xAxisTitle : 'role';

        //var svg = dimple.newSvg("#" + elId + "chartContainer", 580, 210);
        var svg = dimple.newSvg("#" + elId + "chartContainer", width, height + 50);

        var axisLabels = ["Role", "Number of hours"];
        var chartData = [];
        var hideLegend = true;
        var maxValues = {};
        var maxValue = 0;
        var secondMaxValue = 0;

        var g = svg.append("g")
            .attr("x", 35)
            .attr("y", height - 90)
            .attr("width", 450)
            .attr("height", 100)
            .attr("transform", "translate(35, " + (height - 90) + ")");

        g.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 450)
            .attr("height", 80)
            .attr("stroke", "#666666")
            .attr("stroke-width", .1)
            .attr("fill-opacity", 0);

        g.append("text")
            .attr("x", 7)
            .attr("y", 15)
            .attr("width", 100)
            .attr("height", 22)
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text("Key");

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
        myChart.setBounds(50, 15, width - 200, height - 150);
        // Add an x and 3 y-axes.  When using multiple axes it's
        // important to assign them to variables to pass to the series
        var x = myChart.addCategoryAxis("x", "label");
        var yKeys = Object.keys(dataMap);
        var y2 = myChart.addMeasureAxis("y", yKeys[2].toLowerCase());
        var y3 = myChart.addMeasureAxis("y", yKeys[1].toLowerCase());
        var y4 = myChart.addMeasureAxis("y", yKeys[0].toLowerCase());

        x.title = xTitle;

        y4.overrideMin = 0;
        y4.overrideMax = maxValue;
        y4.hidden = true;

        y3.overrideMin = 0;
        y3.overrideMax = maxValue;

        y2.overrideMin = 0;
        y2.overrideMax = maxValue;
        //y2.hidden = true;

        // Order the x axis by sales value desc
        x.addOrderRule("label", true);

        // Color the sales bars to be highly transparent
        myChart.assignColor(capitalizeString(y4.measure), "#96D4F3", "#7FCCF0", 0.5);
        // Add the bars mapped to the second y axis
        myChart.addSeries(capitalizeString(y4.measure), dimple.plot.bar, [x, y4]);

        // Color the sales bars to be highly transparent
        myChart.assignColor(capitalizeString(y3.measure), "#0071BC", "#0071BC", 0.7);
        // Add the bars mapped to the third y axis
        myChart.addSeries(capitalizeString(y3.measure), dimple.plot.bar, [x, y3]);

        myChart.assignColor(capitalizeString(y2.measure), "red", "#ED1E79", 0.8);
        myChart.addSeries(capitalizeString(y2.measure), dimple.plot.bigDash, [x, y2]);

        myChart.draw();

        var myLegend = myChart.addLegend(50, height - 55, width - 80, 20, "left");
        myChart.draw();

        myChart.legends = [];

        // This block simply adds the legend title. I put it into a d3 data
        // object to split it onto 2 lines.  This technique works with any
        // number of lines, it isn't dimple specific.
        svg.selectAll("title_text")
            .data(["Click legend to show/hide hours."])
            .enter()
            .append("text")
            .attr("x", 42)
            .attr("y", function (d, i) { return height - 17 + i * 14; })
            .style("font-family", "sans-serif")
            .style("font-size", "10px")
            .text(function (d) { return d; });

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
                    d3.select(this).style("opacity", 0.4);
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
            .attr("height", function (d) { return weight; })
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
            .attr("height", function (d) { return weight; })
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
            .attr("height", function (d) { return weight; });

        dimple._postDrawHandling(series, updated, removed, duration);

        // Save the shapes to the series array
        series.shapes = theseShapes;
    }
};




