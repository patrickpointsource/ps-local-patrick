(function () {
    'use strict';

    angular.module('Mastermind.directives')
        .directive('d3Bars', ['$window', '$timeout', 'd3Service',
            function ($window, $timeout, d3Service) {
                return {
                    restrict: 'A',
                    scope: {
                        data: '=',
                        label: '@',
                        onClick: '&'
                    },
                    link: function (scope, ele, attrs) {
                        d3Service.d3().then(function (d3) {

                            //console.log(d3);
                            var renderTimeout;
                            var margin = parseInt(attrs.margin) || 20,
                                barHeight = parseInt(attrs.barHeight) || 20,
                                barPadding = parseInt(attrs.barPadding) || 5;

                            var svg = d3.select(ele[0])
                                .append('svg')
                                .attr('width', 500)
                                .attr('height', 500)
                                .style('width', '100%')
                                .append("g");
                                //.attr("transform", "translate('20')");

                            $window.onresize = function () {
                                scope.$apply();
                            };

                            scope.$watch(function () {
                                return angular.element($window)[0].innerWidth;
                            }, function () {
                                scope.render(scope.data);
                            });

                            scope.$watch('data', function (newData) {
                                scope.render(newData);
                            }, true);

                            scope.render = function (data) {
                                svg.selectAll('*').remove();

                                if (!data) { return; }
                                if (data.length == 0) return;
                                if (renderTimeout) { clearTimeout(renderTimeout);}

                                renderTimeout = $timeout(function () {

                                    var dates = Object.keys(data);

                                    var maxValues = [];
                                    var tasks = [];
                                    var people = [];
                                    dates.forEach(function(d) {
                                        var date = data[d];
                                        for (var i = 0; i < date.length; i++) {
                                            maxValues.push(date[i].value);
                                            tasks.push(date[i].task);
                                            people.push(date[i].person.resource)
                                        }
                                    });
                                    people = _.union(people);
                                    tasks = _.union(tasks);


                                    var width = d3.select(ele[0])[0][0].offsetWidth - margin,
                                        height = dates.length * (barHeight + barPadding),
                                        x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1),
                                        x1 = d3.scale.ordinal(),
                                        y = d3.scale.linear().range([height, 0]),
                                        color = d3.scale.category20(),
                                        xAxis = d3.svg.axis().scale(x0).orient("bottom"),
                                        yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));
                                        /*
                                        xScale = d3.scale.linear()
	                                        .domain([0, d3.max(data, function (d) {
	                                        	return d3.max(d.items, function(e) {
	                                        		return e.value;
	                                        	});
	                                        })])
	                                        .range([0, width]);
	                                    */

                                    //var taskNames = d3.keys(data[0]).filter(function(key) { return key !== "dates"; });


                                    x0.domain(d3.max(d3.values(maxValues)));
                                    x1.domain(dates).rangeRoundBands([0, x0.rangeBand()]);
                                    y.domain([0, d3.max(d3.values(maxValues))]);


                                    svg.append("g")
	                                    .attr("class", "x axis")
	                                    .attr("transform", "translate(0," + height + ")")
	                                    .call(xAxis);
	
	                                svg.append("g")
	                                    .attr("class", "y axis")
	                                    .call(yAxis)
	                                  .append("text")
	                                    .attr("transform", "rotate(-90)")
	                                    .attr("y", 6)
	                                    .attr("dy", ".71em")
	                                    .style("text-anchor", "end")
	                                    .text("Hours");
	
	                                var name = svg.selectAll(".name")
	                                    .data(data)
	                                    .enter().append("g")
	                                    .attr("class", "g")
	                                    .attr("transform", function(d) { return "translate(" + x0(d[0].date) + ",0)"; });
	
	                                name.selectAll("rect")
	                                    .data(function(d) { return d.date; })
	                                  .enter().append("rect")
	                                    .attr("width", x1.rangeBand())
	                                    .attr("x", function(d) { return x1(d.date); })
	                                    .attr("y", function(d) { return y(d.value); })
	                                    .attr("height", function(d) { return height - y(d.value); })
	                                    .style("fill", function(d) { return color(d.task); });
	
	                                var legend = svg.selectAll(".legend")
	                                    .data(tasks.slice().reverse())
	                                  .enter().append("g")
	                                    .attr("class", "legend")
	                                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
	
	                                legend.append("rect")
	                                    .attr("x", width - 18)
	                                    .attr("width", 18)
	                                    .attr("height", 18)
	                                    .style("fill", color);
	
	                                legend.append("text")
	                                    .attr("x", width - 24)
	                                    .attr("y", 9)
	                                    .attr("dy", ".35em")
	                                    .style("text-anchor", "end")
	                                    .text(function(d) { return d; });

                                }, 200);
                            };
                        });
                    }
                }
  }]);
}());