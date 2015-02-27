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
        }

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
        var y2 = myChart.addMeasureAxis("y", "expected hours for period");
        var y3 = myChart.addMeasureAxis("y", "actual hours");
        var y4 = myChart.addMeasureAxis("y", "expected hours to date");

        x.title = xTitle;

        y4.overrideMin = 0;
        y4.overrideMax = maxValue;

        y4.hidden = true;

        y3.overrideMin = 0;
        y3.overrideMax = maxValue;

        y2.overrideMin = 0;
        y2.overrideMax = maxValue;
        //y3.hidden = true;

        // Order the x axis by sales value desc
        x.addOrderRule("label", true);
        // Color the sales bars to be highly transparent
        myChart.assignColor("Expected hours for period", "#96D4F3", "#7FCCF0", 0.5);
        // Add the bars mapped to the second y axis
        var s1 = myChart.addSeries("Expected hours for period", dimple.plot.bar, [x, y2]);

        // Color the sales bars to be highly transparent
        myChart.assignColor("Actual hours", "#0071BC", "#0071BC", 0.7);
        // Add the bars mapped to the third y axis
        var s2 = myChart.addSeries("Actual hours", dimple.plot.bar, [x, y3]);

        var td = myChart.addSeries("Expected hours to date", dimple.plot.bubble, [x, y4]);

        myChart.assignColor("Expected hours to date", "red", "#ED1E79", 0.4);

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
        var filterValues = ["actual hours", "expected hours for period", "expected hours to date"];
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

}]);
