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
                                .style('width', '100%');

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

                                if (!data) return;
                                if (renderTimeout) clearTimeout(renderTimeout);

                                renderTimeout = $timeout(function () {

                                    var width = d3.select(ele[0])[0][0].offsetWidth - margin,
                                        height = scope.data.length * (barHeight + barPadding),
                                        color = d3.scale.category20(),
                                        xScale = d3.scale.linear()
                                        .domain([0, d3.max(data, function (d) {
                                            return d.value;
                                        })])
                                        .range([0, width]);


                                    // set the height based on the calculations above
                                    svg.attr('height', height);

                                    //create the rectangles for the bar chart
                                    svg.selectAll('rect')
                                        .data(data)
                                        .enter()
                                        .append('rect')
                                        .on('click', function (d, i) {
                                            return scope.onClick({
                                                item: d
                                            });
                                        })
                                        .attr('height', barHeight)
                                        .attr('width', 140)
                                        .attr('x', Math.round(margin / 2))
                                        .attr('y', function (d, i) {
                                            return i * (barHeight + barPadding);
                                        })
                                        .attr('fill', function (d) {
                                            return color(d.value);
                                        })
                                        .transition()
                                        .duration(1000)
                                        .attr('width', function (d) {
                                            return xScale(d.value);
                                        });
                                    svg.selectAll('text')
                                        .data(data)
                                        .enter()
                                        .append('text')
                                        .attr('fill', '#fff')
                                        .attr('y', function (d, i) {
                                            return i * (barHeight + barPadding) + 15;
                                        })
                                        .attr('x', 15)
                                        .text(function (d) {
                                            return d.date + " (total: " + d.value + ")";
                                        });
                                }, 200);
                            };
                        });
                    }
                }
  }]);
}());