"use strict";

/**
 * Controller for people report.
 */

angular.module("Mastermind.controllers.reports").controller("StackedAreaChartCtrl", ["$scope", function ($scope)
{
    $scope.output = {};
    $scope.el = null;
    $scope.elemId = null;

    $scope.render = function (elId)
    {
        var height = $scope.height || 400;
        var el = $("<div class=\"d3Div stackedArea\" style=\"height:100%\" id=\"d3Div" + elId + "\"></div>").height(height).appendTo("#" + elId + " div");
        var width = el.width();
        var gap = 10;
        var legendBoxHeight = 100;
        var strokeWidth = 1;

        var ceilKey = $scope.ceilKey || "Capacity Ceilling as of todays date";
        var data = $scope.chartData;
        var chartData = [];

        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Original logic left intact
        var keyChartTypeMapping = $scope.keyChartTypeMapping ? $scope.keyChartTypeMapping : {};

        for (var i = 0; i < data.length; i++)
        {
            if (!keyChartTypeMapping[data[i].key])
                data[i].type = "area";
            else
                data[i].type = keyChartTypeMapping[data[i].key];

            data[i].yAxis = 1;
        }

        var d;
        var allValuesLengthSame = true;
        var prevLength = data[0] ? data[0].values.length : 0;

        for (var i = 0; i < data.length; i++)
        {
            for (var j = 0; j < data[i].values.length; j++)
            {
                //d = new Date(data[i].values[j][0]);
                //data[i].values[j][0] = d.getTime();
                d = new Date(data[i].values[j].x);
                data[i].values[j].x = d.getTime();
            }

            if (i > 0)
                allValuesLengthSame = allValuesLengthSame && prevLength == data[i].values.length;

            //data[i].values.sort(function (v1, v2)
            //{
            //    if (v1.x > v2.x)
            //        return 1;
            //    else
            //        return -1;
            //});
        }

        // remove entries which has similar values for all keys - optimize graph
        if (allValuesLengthSame && data[0])
        {
            var j = data[0].values.length - 2;
            var distance = Math.round(data[0].values.length / 10);
            var k = 0;
            var allValuesSame = true;

            while (j > 1 && distance > 3)
            {
                allValuesSame = true;

                for (var i = 0; i < data.length; i++)
                    allValuesSame = allValuesSame && data[i].values[j].y == data[i].values[j - 1].y;

                if (allValuesSame && k < distance)
                {
                    k++;
                    for (var i = 0; i < data.length; i++)
                        data[i].values.splice(j, 1);

                } else if (k >= distance)
                    k = 0;
                j--;
            }
        }
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        for (var i = 0, count = data.length; i < count; i++)
        {
            var item = data[i];
            var key = item.key;

            for (var j = 0, count2 = item.values.length; j < count2; j++)
            {
                var newItem = {
                    x: new Date(item.values[j].x)
                };

                if (key == ceilKey)
                {
                    newItem.key2 = key;
                    newItem.y2 = item.values[j].y;
                }
                else
                {
                    newItem.key = key;
                    newItem.y = item.values[j].y;
                }

                chartData.push(newItem);
            }
        }

        var calcMax = function ()
        {
            var ceil = 0;
            var max = 0;
            var maxValues = {};

            for (var i = 0, count = chart.data.length; i < count; i++)
            {
                var item = chart.data[i];

                if (item.hasOwnProperty("key") && (!maxValues[item.key] || item.y > maxValues[item.key]))
                    maxValues[item.key] = item.y;
                else if (item.hasOwnProperty("key2"))
                    ceil = item.y2;
            }

            for (var p in maxValues)
                if (maxValues.hasOwnProperty(p))
                    max += maxValues[p];

            return Math.max(max, ceil);
        };

        var svg = dimple.newSvg("#" + el.attr("id"), width, height);
        var chart = new dimple.chart(svg, chartData);
        var legend = chart.addLegend(65, height - legendBoxHeight + 30, width - 130, 50, "left");
        var xAxis = chart.addTimeAxis("x", "x", null, "%b %_d");
        var y1Axis = chart.addMeasureAxis("y", "y");
        var y2Axis = chart.addMeasureAxis("y", "y2");

        y2Axis.overrideMax = y1Axis.overrideMax = calcMax() * 1.1;
        y2Axis.overrideMin = y1Axis.overrideMin = 0;
        y2Axis.hidden = true;

        xAxis.title = "Months";
        y1Axis.title = "Hours";

        var areaSeries = chart.addSeries("key", dimple.plot.area, [xAxis, y1Axis]);
        var lineSeries = chart.addSeries("key2", dimple.plot.line, [xAxis, y2Axis]);

        areaSeries.getTooltipText = function(e)
        {
            return [e.aggField[0], , "\xA0", e.y + " hours", "\xA0", d3.time.format("%B %_d, %Y")(e.x)];
        };

        lineSeries.getTooltipText = function (e)
        {
            return [e.aggField[0], "\xA0", e.y + " hours"];
        };

        legend.series = [areaSeries];

        chart.defaultColors = [
            new dimple.color("#8CC63F"),
            new dimple.color("#1B1464"),
            new dimple.color("#ED1E79"),
            new dimple.color("#FF0000"),
            new dimple.color("#FF0000"),
            new dimple.color("#FF0000")
        ];

        chart.setBounds(50, 15, width - 100, height - legendBoxHeight - gap - 15 - 30);
        chart.draw();

        _.each(svg.selectAll("circle")[0], function (shape)
        {
            if (shape.id.indexOf("key") == 0)
                shape.remove();
        });

        _.each(svg.selectAll("path")[0], function (shape)
        {
            if (shape.id.indexOf("key") == 0)
                shape.remove();
        });

        var filterValues = dimple.getUniqueValues(chartData, "key");
        var rebindData = false;

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
            if (e.aggField == "key")
                return;

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
            chart.data = _.filter(chartData, function (item)
            {
                return !item.key || item.key && (_.indexOf(filterValues, item.key) != -1 || _.indexOf(filterValues, item.key.toLowerCase()) != -1);
            });

            y2Axis.overrideMax = y1Axis.overrideMax = calcMax() * 1.1;

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
            legend.shapes.select("text.dimple-key").text(ceilKey);
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
            filterValues = dimple.getUniqueValues(chartData, "key");

            updateLegendBoxLayout();
        });
    };

    setTimeout(function ()
    {
        $scope.render($scope.$parent.elemId || $scope.$parent.$parent.elemId);
    }, 1 * 1000);
}]);
