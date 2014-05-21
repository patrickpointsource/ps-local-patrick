(function () {
    'use strict';

    angular.module('Mastermind.directives')
        .directive('d3reports', ['d3', '$window', '$timeout',
            function (d3, $window, $timeout) {

                return {
                    restrict: 'EA',
                    scope: {
                        data: '=',
                        label: '@',
                        onClick: '&'
                    },
                    link: function (scope, element, attrs) {

                        var margin = attrs.margin || {
                                top: 20,
                                right: 20,
                                bottom: 70,
                                left: 40
                            },
                            barWidth = parseInt(attrs.barWidth) || 20,
                            barPadding = parseInt(attrs.barPadding) || 5,
                            maxWidth = (element[0].parentElement.offsetWidth || 720),
                            maxHeight = (element[0].parentElement.offsetHeight || 540);

                        var x = d3.scale.ordinal().rangeRoundBands([0, (maxWidth - margin.left - margin.right)], 0.05);
                        var y = d3.scale.linear().range([(maxHeight - margin.top - margin.bottom), 0]);
                        var xAxis = d3.svg.axis()
                            .scale(x)
                            .orient('bottom')
                            .tickFormat(d3.time.format('%Y-%m'));
                        var yAxis = d3.svg.axis()
                            .scale(y)
                            .orient('left')
                            .ticks(10);

                        var svg = d3.select('.panel-body')
                            .append('svg')
                            .attr('width', maxWidth)
                            .attr('height', maxHeight)
                            .append('g')
                            .attr('trasform',
                                'translate(' + margin.left + ',' + margin.top + ')');


                        $(window).on('resize.d3Bars', function (event) {
                            scope.$apply();
                        });
                        scope.$on('$destroy', function () {
                            $(window).off('resize.d3Bars');
                        });

                        // on window resize, re-render d3 canvas
                        //window.onresize = function() {
                        //return scope.$apply();
                        //};
                        //scope.$watch(function(){
                        //    return angular.element($window)[0].innerWidth;
                        //  }, function(){
                        //    return scope.render(scope.data);
                        //  }
                        //);

                        // watch for data changes and re-render
                        scope.$watch('data', function (newVals, oldVals) {
                            return scope.render(newVals);
                        }, true);

                        // define render function
                        scope.render = function (data) {
                            // remove all previous items before render
                            svg.selectAll('*').remove();

                            //var arrayMax = Function.prototype.apply.bind(Math.max, null);   

                            // setup variables
                            var width = scope.data.length * (barWidth + barPadding),
                                // calculate the height
                                height = (element[0].parentElement.offsetHeight || 540);
                            //height = d3.select('.panel-body').node().offsetHeight - margin,
                            // Use the category20() scale function for multicolor support
                            //color = var color = d3.scale.quantile().range(d3.range(9));
                            var color = d3.scale.quantile().range(d3.colorbrewer.Combined[30]);

                            x.domain(data.map(function (d) {
                                return d.date;
                            }))
                                .range(d3.colorbrewer.Combined[30]);
                            y.domain([0, d3.max(data, function (d) {
                                return d.value;
                            })]);

                            // our yScale
                            //	yScale = d3.scale.linear()
                            //      .domain([0, d3.max(data, function(d) { return d.value; })])
                            //      .range([0, height]);

                            // set the height based on the calculations above
                            //svg.attr('height', height)

                            svg.append('g')
                                .attr('class', 'x axis')
                                .attr('transform', 'translate(0,' + height + ')')
                                .call(xAxis)
                                .selectAll('text')
                                .style('text-anchor', 'end')
                                .attr('dx', '-.8em')
                                .attr('dy', '-.55em')
                                .attr('transform', 'rotate(-90)');

                            svg.append('g')
                                .attr('class', 'y axis')
                                .call(yAxis)
                                .append('text')
                                .attr('transform', 'rotate(-90)')
                                .attr('y', 6)
                                .attr('dy', '.71em')
                                .style('text-anchor', 'end')
                                .text('Value ($)');

                            //create the rectangles for the bar chart
                            svg.selectAll('rect')
                                .data(data)
                                .enter()
                                .append('rect')
                                .on('click', function (d, i) {
                                    return scope.onClick({
                                        item: d.value
                                    });
                                })
                                .attr('x', function (d) {
                                    return x(d.date);
                                })
                                .attr('width', x.rangeBand())
                                .attr('y', function (d) {
                                    return y(d.value);
                                })
                                .attr('height', function (d) {
                                    return height - y(d.value);
                                })
                                .attr('fill', function (d) {
                                    return color(d.value);
                                });
                            //.transition()
                            //	.duration(1000)
                            //	.attr('height', function(d) {
                            //		return yScale(d.value);
                            //	});


                        };
                    }
                };
    }]);

}());