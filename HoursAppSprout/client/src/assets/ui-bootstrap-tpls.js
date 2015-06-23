/* jshint ignore:start */
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.11.0 - 2014-05-01
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.carousel", "ui.bootstrap.dateparser", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.modal"]);
angular.module("ui.bootstrap.tpls", ["template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/day.html", "template/datepicker/month.html", "template/datepicker/popup.html", "template/datepicker/year.html", "template/modal/backdrop.html", "template/modal/window.html"]);
angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope',
    function($q, $timeout, $rootScope) {

        var $transition = function(element, trigger, options) {
            options = options || {};
            var deferred = $q.defer();
            var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

            var transitionEndHandler = function(event) {
                $rootScope.$apply(function() {
                    element.unbind(endEventName, transitionEndHandler);
                    deferred.resolve(element);
                });
            };

            if (endEventName) {
                element.bind(endEventName, transitionEndHandler);
            }

            // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
            $timeout(function() {
                if (angular.isString(trigger)) {
                    element.addClass(trigger);
                } else if (angular.isFunction(trigger)) {
                    trigger(element);
                } else if (angular.isObject(trigger)) {
                    element.css(trigger);
                }
                //If browser does not support transitions, instantly resolve
                if (!endEventName) {
                    deferred.resolve(element);
                }
            });

            // Add our custom cancel function to the promise that is returned
            // We can call this if we are about to run a new transition, 
            //which we know will prevent this transition from ending,
            // i.e. it will therefore never raise a transitionEnd event for that transition
            deferred.promise.cancel = function() {
                if (endEventName) {
                    element.unbind(endEventName, transitionEndHandler);
                }
                deferred.reject('Transition cancelled');
            };

            return deferred.promise;
        };

        // Work out the name of the transitionEnd event
        var transElement = document.createElement('trans');
        var transitionEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'transition': 'transitionend'
        };
        var animationEndEventNames = {
            'WebkitTransition': 'webkitAnimationEnd',
            'MozTransition': 'animationend',
            'OTransition': 'oAnimationEnd',
            'transition': 'animationend'
        };

        function findEndEventName(endEventNames) {
            for (var name in endEventNames) {
                if (transElement.style[name] !== undefined) {
                    return endEventNames[name];
                }
            }
        }
        $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
        $transition.animationEndEventName = findEndEventName(animationEndEventNames);
        return $transition;
    }
]);

/**
 * @ngdoc overview
 * @name ui.bootstrap.carousel
 *
 * @description
 * AngularJS version of an image carousel.
 *
 */
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition', 'hoursApp.factories'])
    .controller('CarouselController', ['$scope', '$q', '$rootScope', '$timeout', '$transition', 'hoursFactory',
        function($scope, $q, $rootScope, $timeout, $transition, hoursFactory) {
            var self = this,
                slides = self.slides = $scope.slides = [],
                currentIndex = 6,
                currentTimeout;
            self.currentSlide = null;

            var destroyed = false;
            /* direction: "prev" or "next" */
            self.select = $scope.select = function(nextSlide, direction) {
                var nextIndex = slides.indexOf(nextSlide);
                //Decide direction if it's not given
                if (direction === undefined) {
                    direction = nextIndex > currentIndex ? 'next' : 'prev';
                }
                if (nextSlide && nextSlide !== self.currentSlide) {
                    if ($scope.$currentTransition) {
                        $scope.$currentTransition.cancel();
                        //Timeout so ng-class in template has time to fix classes for finished slide
                        $timeout(goNext);
                    } else {
                        goNext();
                    }
                }

                function goNext() {
                    // Scope has been destroyed, stop here.
                    if (destroyed) {
                        return;
                    }
                    //If we have a slide to transition from and we have a transition type and we're allowed, go
                    if (self.currentSlide && angular.isString(direction) &&
                     !$scope.noTransition && nextSlide.$element) {
                        //We shouldn't do class manip in here, but it's the same 
                        //weird thing bootstrap does. need to fix sometime
                        nextSlide.$element.addClass(direction);
                        var reflow = nextSlide.$element[0].offsetWidth; //force reflow

                        //Set all other slides to stop doing their stuff for the new transition
                        angular.forEach(slides, function(slide) {
                            angular.extend(slide, {
                                direction: '',
                                entering: false,
                                leaving: false,
                                active: false
                            });
                        });
                        angular.extend(nextSlide, {
                            direction: direction,
                            active: true,
                            entering: true
                        });
                        angular.extend(self.currentSlide || {}, {
                            direction: direction,
                            leaving: true
                        });

                        $scope.$currentTransition = $transition(nextSlide.$element, {});
                        //We have to create new pointers inside a closure since next & current will change
                        (function(next, current) {
                            $scope.$currentTransition.then(
                                function() {
                                    transitionDone(next, current);
                                },
                                function() {
                                    transitionDone(next, current);
                                }
                            );
                        }(nextSlide, self.currentSlide));
                    } else {
                        transitionDone(nextSlide, self.currentSlide);
                    }
                    self.currentSlide = nextSlide;
                    currentIndex = nextIndex;
                }

                function transitionDone(next, current) {
                    angular.extend(next, {
                        direction: '',
                        active: true,
                        leaving: false,
                        entering: false
                    });
                    angular.extend(current || {}, {
                        direction: '',
                        active: false,
                        leaving: false,
                        entering: false
                    });
                    $scope.$currentTransition = null;
                }
            };

            $scope.$on('$destroy', function() {
                destroyed = true;
            });

            /* Allow outside people to call indexOf on slides array */
            self.indexOfSlide = function(slide) {
                return slides.indexOf(slide);
            };

            $rootScope.endLoad = function() {
                $timeout(function() {
                    $rootScope.user.loading = false;
                }, 500);
            };

            $rootScope.next = function() {
                if (!$rootScope.user.holdPage && !$scope.$currentTransition) {
                    $rootScope.user.pushSplice = false;
                    if ($rootScope.user.slideIndex === $rootScope.user.maxIndex) {
                        $rootScope.user.loading = true;
                        if (slides.length < 18) {
                            //mini buffer data ahead
                            var startDate = $rootScope.user.slides[$rootScope.user.slideIndex].clone().addDays(2);
                            var endDate = $rootScope.user.slides[$rootScope.user.slideIndex].clone().addDays(7);
                            hoursFactory.get(6, startDate, endDate, $rootScope.user.me.about).then(function(d) {
                                $rootScope.user.buffered.Day = d.Day.concat($rootScope.user.buffered.Day);
                                $rootScope.user.maxIndex += 6;
                                $rootScope.user.slideIndex++;
                            });
                        } else {
                            var startDate = $rootScope.user.slides[$rootScope.user.slideIndex].clone().addDays(-5);
                            var endDate = $rootScope.user.slides[$rootScope.user.slideIndex].clone().addDays(6);
                            init = true;
                            hoursFactory.get(12, startDate, endDate, $rootScope.user.me.about).then(function(d) {
                                $rootScope.user.buffered = d;
                                $rootScope.user.slides = [];
                                $rootScope.user.slideIndex = 6;
                                $rootScope.user.maxIndex = 10;
                                $rootScope.user.minIndex = 1;
                            });
                        }
                    } else {
                        $rootScope.user.slideIndex++;
                    }
                    var newIndex = (currentIndex + 1) % slides.length;

                    //Prevent this user-triggered transition from occurring if there is already one in progress
                    return self.select(slides[newIndex], 'next');
                }
            };

            $rootScope.prev = function() {
                if (!$rootScope.user.holdPage && !$scope.$currentTransition) {
                    $rootScope.user.pushSplice = true;
                    if ($rootScope.user.slideIndex === $rootScope.user.minIndex) {
                        $rootScope.user.loading = true;
                        //mini buffer data behind
                        if (slides.length < 18) {
                            var startDate = $rootScope.user.slides[$rootScope.user.slideIndex].clone().addDays(-7);
                            var endDate = $rootScope.user.slides[$rootScope.user.slideIndex].clone().addDays(-2);
                            hoursFactory.get(6, startDate, endDate, $rootScope.user.me.about).then(function(d) {
                                $rootScope.user.slideIndex = 6;
                                $rootScope.user.buffered.Day = d.Day.concat($rootScope.user.buffered.Day);
                                $rootScope.user.maxIndex += 6;
                                splicePoint = 0;
                            });
                        } else {
                            var startDate = $rootScope.user.slides[$rootScope.user.slideIndex].clone().addDays(-7);
                            var endDate = $rootScope.user.slides[$rootScope.user.slideIndex].clone().addDays(4);
                            init = true;
                            hoursFactory.get(12, startDate, endDate, $rootScope.user.me.about).then(function(d) {
                                $rootScope.user.buffered = d;
                                $rootScope.user.slides = [];
                                $rootScope.user.slideIndex = 6;
                                $rootScope.user.maxIndex = 10;
                                $rootScope.user.minIndex = 1;
                            });
                        }
                    } else {
                        $rootScope.user.slideIndex--;
                    }
                    var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

                    //Prevent this user-triggered transition from occurring if there is already one in progress
                    return self.select(slides[newIndex], 'prev');
                }
            };

            $scope.isActive = function(slide) {
                return self.currentSlide === slide;
            };

            self.addSlide = function(slide, element) {
                slide.$element = element;
                slides.push(slide);
                //if this is the first slide or the slide is set to active, select it
                if (slides.length === 7 || slide.active) {
                    self.select(slides[slides.length - 1]);
                } else {
                    slide.active = false;
                }

                if (slides.length % 6 === 0 && slides.length > 6) {
                    $rootScope.endLoad();
                }
            };

            self.removeSlide = function(slide) {
                //get the index of the slide inside the carousel
                var index = slides.indexOf(slide);
                slides.splice(index, 1);
                if (slides.length > 0 && slide.active) {
                    if (index >= slides.length) {
                        self.select(slides[index - 1]);
                    } else {
                        self.select(slides[index]);
                    }
                } else if (currentIndex > index) {
                    currentIndex--;
                }
            };
        }
    ])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:carousel
 * @restrict EA
 *
 * @description
 * Carousel is the outer container for a set of image 'slides' to showcase.
 *
 * @param {number=} interval The time, in milliseconds, that it will take the carousel to go to the next slide.
 * @param {boolean=} noTransition Whether to disable transitions on the carousel.
 * @param {boolean=} noPause Whether to disable pausing on the carousel (by default, the carousel interval pauses on hover).
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <carousel>
      <slide>
        <img src="http://placekitten.com/150/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>Beautiful!</p>
        </div>
      </slide>
      <slide>
        <img src="http://placekitten.com/100/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>D'aww!</p>
        </div>
      </slide>
    </carousel>
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
 */
.directive('carousel', [

    function() {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            controller: 'CarouselController',
            require: 'carousel',
            templateUrl: 'template/carousel/carousel.html',
            scope: {
                interval: '=',
                noTransition: '=',
                noPause: '='
            }
        };
    }
])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:slide
 * @restrict EA
 *
 * @description
 * Creates a slide inside a {@link ui.bootstrap.carousel.directive:carousel carousel}.  Must be placed as a child of a carousel element.
 *
 * @param {boolean=} active Model binding, whether or not this slide is currently active.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
<div ng-controller="CarouselDemoCtrl">
  <carousel>
    <slide ng-repeat="slide in slides" active="slide.active">
      <img ng-src="{{slide.image}}" style="margin:auto;">
      <div class="carousel-caption">
        <h4>Slide {{$index}}</h4>
        <p>{{slide.text}}</p>
      </div>
    </slide>
  </carousel>
  Interval, in milliseconds: <input type="number" ng-model="myInterval">
  <br />Enter a negative number to stop the interval.
</div>
  </file>
  <file name="script.js">
function CarouselDemoCtrl($scope) {
  $scope.myInterval = 5000;
}
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
*/

.directive('slide', function() {
    return {
        require: '^carousel',
        restrict: 'EA',
        transclude: true,
        replace: true,
        templateUrl: 'template/carousel/slide.html',
        scope: {
            active: '=?'
        },
        link: function(scope, element, attrs, carouselCtrl) {
            carouselCtrl.addSlide(scope, element);
            //when the scope is destroyed then remove the slide from the current slides array
            scope.$on('$destroy', function() {
                carouselCtrl.removeSlide(scope);
            });

            scope.$watch('active', function(active) {
                if (active) {
                    carouselCtrl.select(scope);
                }
            });
        }
    };
});

angular.module("template/carousel/carousel.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/carousel/carousel.html",
            "<div class=\"carousel\">\n" +
            "    <div class=\"carousel-inner\" ng-transclude></div>\n" +
            "    <a class=\"left carousel-control\" ng-click=\"$root.prev()\" ng-show=\"slides.length > 1\"><i class=\"fa fa-angle-left\"></i></a>\n" +
            "    <a class=\"right carousel-control\" ng-click=\"$root.next()\" ng-show=\"slides.length > 1\"><i class=\"fa fa-angle-right\"></i></a>\n" +
            "</div>\n" +
            "");
    }
]);

angular.module("template/carousel/slide.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/carousel/slide.html",
            "<div ng-class=\"{\n" +
            "    'active': leaving || (active && !entering),\n" +
            "    'prev': (next || active) && direction=='prev',\n" +
            "    'next': (next || active) && direction=='next',\n" +
            "    'right': direction=='prev',\n" +
            "    'left': direction=='next'\n" +
            "  }\" class=\"item text-center\" ng-transclude></div>\n" +
            "");
    }
]);

angular.module('ui.bootstrap.dateparser', [])

.service('dateParser', ['$locale', 'orderByFilter',
    function($locale, orderByFilter) {

        this.parsers = {};

        var formatCodeToRegex = {
            'yyyy': {
                regex: '\\d{4}',
                apply: function(value) {
                    this.year = +value;
                }
            },
            'yy': {
                regex: '\\d{2}',
                apply: function(value) {
                    this.year = +value + 2000;
                }
            },
            'y': {
                regex: '\\d{1,4}',
                apply: function(value) {
                    this.year = +value;
                }
            },
            'MMMM': {
                regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
                apply: function(value) {
                    this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value);
                }
            },
            'MMM': {
                regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
                apply: function(value) {
                    this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value);
                }
            },
            'MM': {
                regex: '0[1-9]|1[0-2]',
                apply: function(value) {
                    this.month = value - 1;
                }
            },
            'M': {
                regex: '[1-9]|1[0-2]',
                apply: function(value) {
                    this.month = value - 1;
                }
            },
            'dd': {
                regex: '[0-2][0-9]{1}|3[0-1]{1}',
                apply: function(value) {
                    this.date = +value;
                }
            },
            'd': {
                regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
                apply: function(value) {
                    this.date = +value;
                }
            },
            'EEEE': {
                regex: $locale.DATETIME_FORMATS.DAY.join('|')
            },
            'EEE': {
                regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|')
            }
        };

        this.createParser = function(format) {
            var map = [],
                regex = format.split('');

            angular.forEach(formatCodeToRegex, function(data, code) {
                var index = format.indexOf(code);

                if (index > -1) {
                    format = format.split('');

                    regex[index] = '(' + data.regex + ')';
                    format[index] = '$'; // Custom symbol to define consumed part of format
                    for (var i = index + 1, n = index + code.length; i < n; i++) {
                        regex[i] = '';
                        format[i] = '$';
                    }
                    format = format.join('');

                    map.push({
                        index: index,
                        apply: data.apply
                    });
                }
            });

            return {
                regex: new RegExp('^' + regex.join('') + '$'),
                map: orderByFilter(map, 'index')
            };
        };

        this.parse = function(input, format) {
            if (!angular.isString(input)) {
                return input;
            }

            format = $locale.DATETIME_FORMATS[format] || format;

            if (!this.parsers[format]) {
                this.parsers[format] = this.createParser(format);
            }

            var parser = this.parsers[format],
                regex = parser.regex,
                map = parser.map,
                results = input.match(regex);

            if (results && results.length) {
                var fields = {
                        year: 1900,
                        month: 0,
                        date: 1,
                        hours: 0
                    },
                    dt;

                for (var i = 1, n = results.length; i < n; i++) {
                    var mapper = map[i - 1];
                    if (mapper.apply) {
                        mapper.apply.call(fields, results[i]);
                    }
                }

                if (isValid(fields.year, fields.month, fields.date)) {
                    dt = new Date(fields.year, fields.month, fields.date, fields.hours);
                }

                return dt;
            }
        };

        // Check if date is valid for specific month (and year for February).
        // Month: 0 = Jan, 1 = Feb, etc

        function isValid(year, month, date) {
            if (month === 1 && date > 28) {
                return date === 29 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
            }

            if (month === 3 || month === 5 || month === 8 || month === 10) {
                return date < 31;
            }

            return true;
        }
    }
]);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
.factory('$position', ['$document', '$window',
    function($document, $window) {

        function getStyle(el, cssprop) {
            if (el.currentStyle) { //IE
                return el.currentStyle[cssprop];
            } else if ($window.getComputedStyle) {
                return $window.getComputedStyle(el)[cssprop];
            }
            // finally try and get inline style
            return el.style[cssprop];
        }

        /**
         * Checks if a given element is statically positioned
         * @param element - raw DOM element
         */

        function isStaticPositioned(element) {
            return (getStyle(element, 'position') || 'static') === 'static';
        }

        /**
         * returns the closest, non-statically positioned parentOffset of a given element
         * @param element
         */
        var parentOffsetEl = function(element) {
            var docDomEl = $document[0];
            var offsetParent = element.offsetParent || docDomEl;
            while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docDomEl;
        };

        return {
            /**
             * Provides read-only equivalent of jQuery's position function:
             * http://api.jquery.com/position/
             */
            position: function(element) {
                var elBCR = this.offset(element);
                var offsetParentBCR = {
                    top: 0,
                    left: 0
                };
                var offsetParentEl = parentOffsetEl(element[0]);
                if (offsetParentEl != $document[0]) {
                    offsetParentBCR = this.offset(angular.element(offsetParentEl));
                    offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                    offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
                }

                var boundingClientRect = element[0].getBoundingClientRect();
                return {
                    width: boundingClientRect.width || element.prop('offsetWidth'),
                    height: boundingClientRect.height || element.prop('offsetHeight'),
                    top: elBCR.top - offsetParentBCR.top,
                    left: elBCR.left - offsetParentBCR.left
                };
            },

            /**
             * Provides read-only equivalent of jQuery's offset function:
             * http://api.jquery.com/offset/
             */
            offset: function(element) {
                var boundingClientRect = element[0].getBoundingClientRect();
                return {
                    width: boundingClientRect.width || element.prop('offsetWidth'),
                    height: boundingClientRect.height || element.prop('offsetHeight'),
                    top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                    left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
                };
            },

            /**
             * Provides coordinates for the targetEl in relation to hostEl
             */
            positionElements: function(hostEl, targetEl, positionStr, appendToBody) {

                var positionStrParts = positionStr.split('-');
                var pos0 = positionStrParts[0],
                    pos1 = positionStrParts[1] || 'center';

                var hostElPos,
                    targetElWidth,
                    targetElHeight,
                    targetElPos;

                hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

                targetElWidth = targetEl.prop('offsetWidth');
                targetElHeight = targetEl.prop('offsetHeight');

                var shiftWidth = {
                    center: function() {
                        return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
                    },
                    left: function() {
                        return hostElPos.left;
                    },
                    right: function() {
                        return hostElPos.left + hostElPos.width;
                    }
                };

                var shiftHeight = {
                    center: function() {
                        return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
                    },
                    top: function() {
                        return hostElPos.top;
                    },
                    bottom: function() {
                        return hostElPos.top + hostElPos.height;
                    }
                };

                switch (pos0) {
                    case 'right':
                        targetElPos = {
                            top: shiftHeight[pos1](),
                            left: shiftWidth[pos0]()
                        };
                        break;
                    case 'left':
                        targetElPos = {
                            top: shiftHeight[pos1](),
                            left: hostElPos.left - targetElWidth
                        };
                        break;
                    case 'bottom':
                        targetElPos = {
                            top: shiftHeight[pos0](),
                            left: shiftWidth[pos1]()
                        };
                        break;
                    default:
                        targetElPos = {
                            top: hostElPos.top - targetElHeight,
                            left: shiftWidth[pos1]()
                        };
                        break;
                }

                return targetElPos;
            }
        };
    }
]);

angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])

.constant('datepickerConfig', {
    formatDay: 'dd',
    formatMonth: 'MMMM',
    formatYear: 'yyyy',
    formatDayHeader: 'EEE',
    formatDayTitle: 'MMMM yyyy',
    formatMonthTitle: 'yyyy',
    datepickerMode: 'day',
    minMode: 'day',
    maxMode: 'year',
    showWeeks: true,
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
})

.controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig',
    function($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
        var self = this,
            ngModelCtrl = {
                $setViewValue: angular.noop
            }; // nullModelCtrl;

        // Modes chain
        this.modes = ['day', 'month', 'year'];

        // Configuration attributes
        angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
            'minMode', 'maxMode', 'showWeeks', 'startingDay', 'yearRange'
        ], function(key, index) {
            self[key] = angular.isDefined($attrs[key]) ? (index < 8 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
        });

        // Watchable attributes
        angular.forEach(['minDate', 'maxDate'], function(key) {
            if ($attrs[key]) {
                $scope.$parent.$watch($parse($attrs[key]), function(value) {
                    self[key] = value ? new Date(value) : null;
                    self.refreshView();
                });
            } else {
                self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
            }
        });

        $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
        $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
        this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date();

        $scope.isActive = function(dateObject) {
            if (self.compare(dateObject.date, self.activeDate) === 0) {
                $scope.activeDateId = dateObject.uid;
                return true;
            }
            return false;
        };

        this.init = function(ngModelCtrl_) {
            ngModelCtrl = ngModelCtrl_;

            ngModelCtrl.$render = function() {
                self.render();
            };
        };

        this.render = function() {
            if (ngModelCtrl.$modelValue) {
                var date = new Date(ngModelCtrl.$modelValue),
                    isValid = !isNaN(date);

                if (isValid) {
                    this.activeDate = date;
                } else {
                    $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                }
                ngModelCtrl.$setValidity('date', isValid);
            }
            this.refreshView();
        };

        this.refreshView = function() {
            if (this.element) {
                this._refreshView();

                var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
                ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
            }
        };

        this.createDateObject = function(date, format) {
            var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
            return {
                date: date,
                label: dateFilter(date, format),
                selected: model && this.compare(date, model) === 0,
                disabled: this.isDisabled(date),
                current: this.compare(date, new Date()) === 0
            };
        };

        this.isDisabled = function(date) {
            return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({
                date: date,
                mode: $scope.datepickerMode
            })));
        };

        // Split array into smaller arrays
        this.split = function(arr, size) {
            var arrays = [];
            while (arr.length > 0) {
                arrays.push(arr.splice(0, size));
            }
            return arrays;
        };

        $scope.select = function(date) {
            if ($scope.datepickerMode === self.minMode) {
                var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
                dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                ngModelCtrl.$setViewValue(dt);
                ngModelCtrl.$render();
            } else {
                self.activeDate = date;
                $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) - 1];
            }
        };

        $scope.move = function(direction) {
            var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
                month = self.activeDate.getMonth() + direction * (self.step.months || 0);
            self.activeDate.setFullYear(year, month, 1);
            self.refreshView();
        };

        $scope.toggleMode = function(direction) {
            direction = direction || 1;

            if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
                return;
            }

            $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) + direction];
        };

        // Key event mapper
        $scope.keys = {
            13: 'enter',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        var focusElement = function() {
            $timeout(function() {
                self.element[0].focus();
            }, 0, false);
        };

        // Listen for focus requests from popup directive
        $scope.$on('datepicker.focus', focusElement);

        $scope.keydown = function(evt) {
            var key = $scope.keys[evt.which];

            if (!key || evt.shiftKey || evt.altKey) {
                return;
            }

            evt.preventDefault();
            evt.stopPropagation();

            if (key === 'enter' || key === 'space') {
                if (self.isDisabled(self.activeDate)) {
                    return; // do nothing
                }
                $scope.select(self.activeDate);
                focusElement();
            } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
                $scope.toggleMode(key === 'up' ? 1 : -1);
                focusElement();
            } else {
                self.handleKeyDown(key, evt);
                self.refreshView();
            }
        };
    }
])

.directive('datepicker', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/datepicker/datepicker.html',
        scope: {
            datepickerMode: '=?',
            dateDisabled: '&'
        },
        require: ['datepicker', '?^ngModel'],
        controller: 'DatepickerController',
        link: function(scope, element, attrs, ctrls) {
            var datepickerCtrl = ctrls[0],
                ngModelCtrl = ctrls[1];

            if (ngModelCtrl) {
                datepickerCtrl.init(ngModelCtrl);
            }
        }
    };
})

.directive('daypicker', ['dateFilter',
    function(dateFilter) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/datepicker/day.html',
            require: '^datepicker',
            link: function(scope, element, attrs, ctrl) {
                scope.showWeeks = ctrl.showWeeks;

                ctrl.step = {
                    months: 1
                };
                ctrl.element = element;

                var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                function getDaysInMonth(year, month) {
                    return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
                }

                function getDates(startDate, n) {
                    var dates = new Array(n),
                        current = new Date(startDate),
                        i = 0;
                    current.setHours(12); // Prevent repeated dates because of timezone bug
                    while (i < n) {
                        dates[i++] = new Date(current);
                        current.setDate(current.getDate() + 1);
                    }
                    return dates;
                }

                ctrl._refreshView = function() {
                    var year = ctrl.activeDate.getFullYear(),
                        month = ctrl.activeDate.getMonth(),
                        firstDayOfMonth = new Date(year, month, 1),
                        difference = ctrl.startingDay - firstDayOfMonth.getDay(),
                        numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
                        firstDate = new Date(firstDayOfMonth);

                    if (numDisplayedFromPreviousMonth > 0) {
                        firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
                    }

                    // 42 is the number of days on a six-month calendar
                    var days = getDates(firstDate, 42);
                    for (var i = 0; i < 42; i++) {
                        days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
                            secondary: days[i].getMonth() !== month,
                            uid: scope.uniqueId + '-' + i
                        });
                    }

                    scope.labels = new Array(7);
                    for (var j = 0; j < 7; j++) {
                        scope.labels[j] = {
                            abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
                            full: dateFilter(days[j].date, 'EEEE')
                        };
                    }

                    scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
                    scope.rows = ctrl.split(days, 7);

                    if (scope.showWeeks) {
                        scope.weekNumbers = [];
                        var weekNumber = getISO8601WeekNumber(scope.rows[0][0].date),
                            numWeeks = scope.rows.length;
                        while (scope.weekNumbers.push(weekNumber++) < numWeeks) {}
                    }
                };

                ctrl.compare = function(date1, date2) {
                    return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
                };

                function getISO8601WeekNumber(date) {
                    var checkDate = new Date(date);
                    checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
                    var time = checkDate.getTime();
                    checkDate.setMonth(0); // Compare with Jan 1
                    checkDate.setDate(1);
                    return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
                }

                ctrl.handleKeyDown = function(key, evt) {
                    var date = ctrl.activeDate.getDate();

                    if (key === 'left') {
                        date = date - 1; // up
                    } else if (key === 'up') {
                        date = date - 7; // down
                    } else if (key === 'right') {
                        date = date + 1; // down
                    } else if (key === 'down') {
                        date = date + 7;
                    } else if (key === 'pageup' || key === 'pagedown') {
                        var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
                        ctrl.activeDate.setMonth(month, 1);
                        date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
                    } else if (key === 'home') {
                        date = 1;
                    } else if (key === 'end') {
                        date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
                    }
                    ctrl.activeDate.setDate(date);
                };

                ctrl.refreshView();
            }
        };
    }
])

.directive('monthpicker', ['dateFilter',
    function(dateFilter) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/datepicker/month.html',
            require: '^datepicker',
            link: function(scope, element, attrs, ctrl) {
                ctrl.step = {
                    years: 1
                };
                ctrl.element = element;

                ctrl._refreshView = function() {
                    var months = new Array(12),
                        year = ctrl.activeDate.getFullYear();

                    for (var i = 0; i < 12; i++) {
                        months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
                            uid: scope.uniqueId + '-' + i
                        });
                    }

                    scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
                    scope.rows = ctrl.split(months, 3);
                };

                ctrl.compare = function(date1, date2) {
                    return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
                };

                ctrl.handleKeyDown = function(key, evt) {
                    var date = ctrl.activeDate.getMonth();

                    if (key === 'left') {
                        date = date - 1; // up
                    } else if (key === 'up') {
                        date = date - 3; // down
                    } else if (key === 'right') {
                        date = date + 1; // down
                    } else if (key === 'down') {
                        date = date + 3;
                    } else if (key === 'pageup' || key === 'pagedown') {
                        var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
                        ctrl.activeDate.setFullYear(year);
                    } else if (key === 'home') {
                        date = 0;
                    } else if (key === 'end') {
                        date = 11;
                    }
                    ctrl.activeDate.setMonth(date);
                };

                ctrl.refreshView();
            }
        };
    }
])

.directive('yearpicker', ['dateFilter',
    function(dateFilter) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/datepicker/year.html',
            require: '^datepicker',
            link: function(scope, element, attrs, ctrl) {
                var range = ctrl.yearRange;

                ctrl.step = {
                    years: range
                };
                ctrl.element = element;

                function getStartingYear(year) {
                    return parseInt((year - 1) / range, 10) * range + 1;
                }

                ctrl._refreshView = function() {
                    var years = new Array(range);

                    for (var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); i < range; i++) {
                        years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
                            uid: scope.uniqueId + '-' + i
                        });
                    }

                    scope.title = [years[0].label, years[range - 1].label].join(' - ');
                    scope.rows = ctrl.split(years, 5);
                };

                ctrl.compare = function(date1, date2) {
                    return date1.getFullYear() - date2.getFullYear();
                };

                ctrl.handleKeyDown = function(key, evt) {
                    var date = ctrl.activeDate.getFullYear();

                    if (key === 'left') {
                        date = date - 1; // up
                    } else if (key === 'up') {
                        date = date - 5; // down
                    } else if (key === 'right') {
                        date = date + 1; // down
                    } else if (key === 'down') {
                        date = date + 5;
                    } else if (key === 'pageup' || key === 'pagedown') {
                        date += (key === 'pageup' ? -1 : 1) * ctrl.step.years;
                    } else if (key === 'home') {
                        date = getStartingYear(ctrl.activeDate.getFullYear());
                    } else if (key === 'end') {
                        date = getStartingYear(ctrl.activeDate.getFullYear()) + range - 1;
                    }
                    ctrl.activeDate.setFullYear(date);
                };

                ctrl.refreshView();
            }
        };
    }
])

.constant('datepickerPopupConfig', {
    datepickerPopup: 'yyyy-MM-dd',
    currentText: 'Today',
    clearText: 'Clear',
    closeText: 'Done',
    closeOnDateSelection: true,
    appendToBody: false,
    showButtonBar: true
})

.directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig',
    function($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
        return {
            restrict: 'EA',
            require: 'ngModel',
            scope: {
                isOpen: '=?',
                currentText: '@',
                clearText: '@',
                closeText: '@',
                dateDisabled: '&'
            },
            link: function(scope, element, attrs, ngModel) {
                var dateFormat,
                    closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
                    appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

                scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

                scope.getText = function(key) {
                    return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
                };

                attrs.$observe('datepickerPopup', function(value) {
                    dateFormat = value || datepickerPopupConfig.datepickerPopup;
                    ngModel.$render();
                });

                // popup element used to display calendar
                var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
                popupEl.attr({
                    'ng-model': 'date',
                    'ng-change': 'dateSelection()'
                });

                function cameltoDash(string) {
                    return string.replace(/([A-Z])/g, function($1) {
                        return '-' + $1.toLowerCase();
                    });
                }

                // datepicker element
                var datepickerEl = angular.element(popupEl.children()[0]);
                if (attrs.datepickerOptions) {
                    angular.forEach(scope.$parent.$eval(attrs.datepickerOptions), function(value, option) {
                        datepickerEl.attr(cameltoDash(option), value);
                    });
                }

                angular.forEach(['minDate', 'maxDate'], function(key) {
                    if (attrs[key]) {
                        scope.$parent.$watch($parse(attrs[key]), function(value) {
                            scope[key] = value;
                        });
                        datepickerEl.attr(cameltoDash(key), key);
                    }
                });
                if (attrs.dateDisabled) {
                    datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
                }

                function parseDate(viewValue) {
                    if (!viewValue) {
                        ngModel.$setValidity('date', true);
                        return null;
                    } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                        ngModel.$setValidity('date', true);
                        return viewValue;
                    } else if (angular.isString(viewValue)) {
                        var date = dateParser.parse(viewValue, dateFormat) || new Date(viewValue);
                        if (isNaN(date)) {
                            ngModel.$setValidity('date', false);
                            return undefined;
                        } else {
                            ngModel.$setValidity('date', true);
                            return date;
                        }
                    } else {
                        ngModel.$setValidity('date', false);
                        return undefined;
                    }
                }
                ngModel.$parsers.unshift(parseDate);

                // Inner change
                scope.dateSelection = function(dt) {
                    if (angular.isDefined(dt)) {
                        scope.date = dt;
                    }
                    ngModel.$setViewValue(scope.date);
                    ngModel.$render();

                    if (closeOnDateSelection) {
                        scope.isOpen = false;
                        element[0].focus();
                    }
                };

                element.bind('input change keyup', function() {
                    scope.$apply(function() {
                        scope.date = ngModel.$modelValue;
                    });
                });

                // Outter change
                ngModel.$render = function() {
                    var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
                    element.val(date);
                    scope.date = parseDate(ngModel.$modelValue);
                };

                var documentClickBind = function(event) {
                    if (scope.isOpen && event.target !== element[0]) {
                        scope.$apply(function() {
                            scope.isOpen = false;
                        });
                    }
                };

                var keydown = function(evt, noApply) {
                    scope.keydown(evt);
                };
                element.bind('keydown', keydown);

                scope.keydown = function(evt) {
                    if (evt.which === 27) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        scope.close();
                    } else if (evt.which === 40 && !scope.isOpen) {
                        scope.isOpen = true;
                    }
                };

                scope.$watch('isOpen', function(value) {
                    if (value) {
                        scope.$broadcast('datepicker.focus');
                        scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                        scope.position.top = scope.position.top + element.prop('offsetHeight');

                        $document.bind('click', documentClickBind);
                    } else {
                        $document.unbind('click', documentClickBind);
                    }
                });

                scope.select = function(date) {
                    if (date === 'today') {
                        var today = new Date();
                        if (angular.isDate(ngModel.$modelValue)) {
                            date = new Date(ngModel.$modelValue);
                            date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
                        } else {
                            date = new Date(today.setHours(0, 0, 0, 0));
                        }
                    }
                    scope.dateSelection(date);
                };

                scope.close = function() {
                    scope.isOpen = false;
                    element[0].focus();
                };

                var $popup = $compile(popupEl)(scope);
                if (appendToBody) {
                    $document.find('body').append($popup);
                } else {
                    element.after($popup);
                }

                scope.$on('$destroy', function() {
                    $popup.remove();
                    element.unbind('keydown', keydown);
                    $document.unbind('click', documentClickBind);
                });
            }
        };
    }
])

.directive('datepickerPopupWrap', function() {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        templateUrl: 'template/datepicker/popup.html',
        link: function(scope, element, attrs) {
            element.bind('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
            });
        }
    };
});

angular.module("template/datepicker/datepicker.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/datepicker/datepicker.html",
            "<div ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\" style=\"text-align:center\">\n" +
            "  <daypicker ng-switch-when=\"day\" tabindex=\"0\"></daypicker>\n" +
            "  <monthpicker ng-switch-when=\"month\" tabindex=\"0\"></monthpicker>\n" +
            "  <yearpicker ng-switch-when=\"year\" tabindex=\"0\"></yearpicker>\n" +
            "  <div style=\"height:5px;width:100%\"></div>\n" +
            "</div>");
    }
]);

angular.module("template/datepicker/day.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/datepicker/day.html",
            "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button></th>\n" +
            "      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "    <tr>\n" +
            "      <th ng-show=\"showWeeks\" class=\"text-center\"></th>\n" +
            "      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
            "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
            "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
    }
]);

angular.module("template/datepicker/month.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/datepicker/month.html",
            "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button></th>\n" +
            "      <th><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
            "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
    }
]);

angular.module("template/datepicker/popup.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/datepicker/popup.html",
            "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\">\n" +
            " <li ng-transclude></li>\n" +
            " <li ng-if=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
            "   <span class=\"btn-group\">\n" +
            "     <button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"select('today')\">{{ getText('current') }}</button>\n" +
            "     <button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"select(null)\">{{ getText('clear') }}</button>\n" +
            "   </span>\n" +
            "   <button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"close()\">{{ getText('close') }}</button>\n" +
            " </li>\n" +
            "</ul>\n" +
            "");
    }
]);

angular.module("template/datepicker/year.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/datepicker/year.html",
            "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
            "  <thead>\n" +
            "    <tr>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button></th>\n" +
            "      <th colspan=\"3\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
            "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button></th>\n" +
            "    </tr>\n" +
            "  </thead>\n" +
            "  <tbody>\n" +
            "    <tr ng-repeat=\"row in rows track by $index\">\n" +
            "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
            "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
            "      </td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n" +
            "");
    }
]);

angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition'])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
.factory('$$stackedMap', function() {
    return {
        createNew: function() {
            var stack = [];

            return {
                add: function(key, value) {
                    stack.push({
                        key: key,
                        value: value
                    });
                },
                get: function(key) {
                    for (var i = 0; i < stack.length; i++) {
                        if (key == stack[i].key) {
                            return stack[i];
                        }
                    }
                },
                keys: function() {
                    var keys = [];
                    for (var i = 0; i < stack.length; i++) {
                        keys.push(stack[i].key);
                    }
                    return keys;
                },
                top: function() {
                    return stack[stack.length - 1];
                },
                remove: function(key) {
                    var idx = -1;
                    for (var i = 0; i < stack.length; i++) {
                        if (key == stack[i].key) {
                            idx = i;
                            break;
                        }
                    }
                    return stack.splice(idx, 1)[0];
                },
                removeTop: function() {
                    return stack.splice(stack.length - 1, 1)[0];
                },
                length: function() {
                    return stack.length;
                }
            };
        }
    };
})

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
.directive('modalBackdrop', ['$timeout',
    function($timeout) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/modal/backdrop.html',
            link: function(scope) {

                scope.animate = false;

                //trigger CSS transitions
                $timeout(function() {
                    scope.animate = true;
                });
            }
        };
    }
])

.directive('modalWindow', ['$modalStack', '$timeout',
    function($modalStack, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                index: '@',
                animate: '='
            },
            replace: true,
            transclude: true,
            templateUrl: function(tElement, tAttrs) {
                return tAttrs.templateUrl || 'template/modal/window.html';
            },
            link: function(scope, element, attrs) {
                element.addClass(attrs.windowClass || '');
                scope.size = attrs.size;

                $timeout(function() {
                    // trigger CSS transitions
                    scope.animate = true;
                    // focus a freshly-opened modal
                    element[0].focus();
                });

                scope.close = function(evt) {
                    var modal = $modalStack.getTop();
                    if (modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        $modalStack.dismiss(modal.key, 'backdrop click');
                    }
                };
            }
        };
    }
])

.factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
    function($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {

        var OPENED_MODAL_CLASS = 'modal-open';

        var backdropDomEl, backdropScope;
        var openedWindows = $$stackedMap.createNew();
        var $modalStack = {};

        function backdropIndex() {
            var topBackdropIndex = -1;
            var opened = openedWindows.keys();
            for (var i = 0; i < opened.length; i++) {
                if (openedWindows.get(opened[i]).value.backdrop) {
                    topBackdropIndex = i;
                }
            }
            return topBackdropIndex;
        }

        $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
            if (backdropScope) {
                backdropScope.index = newBackdropIndex;
            }
        });

        function removeModalWindow(modalInstance) {

            var body = $document.find('body').eq(0);
            var modalWindow = openedWindows.get(modalInstance).value;

            //clean up the stack
            openedWindows.remove(modalInstance);

            //remove window DOM element
            removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function() {
                modalWindow.modalScope.$destroy();
                body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
                checkRemoveBackdrop();
            });
        }

        function checkRemoveBackdrop() {
            //remove backdrop if no longer needed
            if (backdropDomEl && backdropIndex() == -1) {
                var backdropScopeRef = backdropScope;
                removeAfterAnimate(backdropDomEl, backdropScope, 150, function() {
                    backdropScopeRef.$destroy();
                    backdropScopeRef = null;
                });
                backdropDomEl = undefined;
                backdropScope = undefined;
            }
        }

        function removeAfterAnimate(domEl, scope, emulateTime, done) {
            // Closing animation
            scope.animate = false;

            var transitionEndEventName = $transition.transitionEndEventName;
            if (transitionEndEventName) {
                // transition out
                var timeout = $timeout(afterAnimating, emulateTime);

                domEl.bind(transitionEndEventName, function() {
                    $timeout.cancel(timeout);
                    afterAnimating();
                    scope.$apply();
                });
            } else {
                // Ensure this call is async
                $timeout(afterAnimating, 0);
            }

            function afterAnimating() {
                if (afterAnimating.done) {
                    return;
                }
                afterAnimating.done = true;

                domEl.remove();
                if (done) {
                    done();
                }
            }
        }

        $document.bind('keydown', function(evt) {
            var modal;

            if (evt.which === 27) {
                modal = openedWindows.top();
                if (modal && modal.value.keyboard) {
                    evt.preventDefault();
                    $rootScope.$apply(function() {
                        $modalStack.dismiss(modal.key, 'escape key press');
                    });
                }
            }
        });

        $modalStack.open = function(modalInstance, modal) {

            openedWindows.add(modalInstance, {
                deferred: modal.deferred,
                modalScope: modal.scope,
                backdrop: modal.backdrop,
                keyboard: modal.keyboard
            });

            var body = $document.find('body').eq(0),
                currBackdropIndex = backdropIndex();

            if (currBackdropIndex >= 0 && !backdropDomEl) {
                backdropScope = $rootScope.$new(true);
                backdropScope.index = currBackdropIndex;
                backdropDomEl = $compile('<div modal-backdrop></div>')(backdropScope);
                body.append(backdropDomEl);
            }

            var angularDomEl = angular.element('<div modal-window></div>');
            angularDomEl.attr({
                'template-url': modal.windowTemplateUrl,
                'window-class': modal.windowClass,
                'size': modal.size,
                'index': openedWindows.length() - 1,
                'animate': 'animate'
            }).html(modal.content);

            var modalDomEl = $compile(angularDomEl)(modal.scope);
            openedWindows.top().value.modalDomEl = modalDomEl;
            body.append(modalDomEl);
            body.addClass(OPENED_MODAL_CLASS);
        };

        $modalStack.close = function(modalInstance, result) {
            var modalWindow = openedWindows.get(modalInstance).value;
            if (modalWindow) {
                modalWindow.deferred.resolve(result);
                removeModalWindow(modalInstance);
            }
        };

        $modalStack.dismiss = function(modalInstance, reason) {
            var modalWindow = openedWindows.get(modalInstance).value;
            if (modalWindow) {
                modalWindow.deferred.reject(reason);
                removeModalWindow(modalInstance);
            }
        };

        $modalStack.dismissAll = function(reason) {
            var topModal = this.getTop();
            while (topModal) {
                this.dismiss(topModal.key, reason);
                topModal = this.getTop();
            }
        };

        $modalStack.getTop = function() {
            return openedWindows.top();
        };

        return $modalStack;
    }
])

.provider('$modal', function() {

    var $modalProvider = {
        options: {
            backdrop: true, //can be also false or 'static'
            keyboard: true
        },
        $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
            function($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

                var $modal = {};

                function getTemplatePromise(options) {
                    return options.template ? $q.when(options.template) :
                        $http.get(options.templateUrl, {
                            cache: $templateCache
                        }).then(function(result) {
                            return result.data;
                        });
                }

                function getResolvePromises(resolves) {
                    var promisesArr = [];
                    angular.forEach(resolves, function(value, key) {
                        if (angular.isFunction(value) || angular.isArray(value)) {
                            promisesArr.push($q.when($injector.invoke(value)));
                        }
                    });
                    return promisesArr;
                }

                $modal.open = function(modalOptions) {

                    var modalResultDeferred = $q.defer();
                    var modalOpenedDeferred = $q.defer();

                    //prepare an instance of a modal to be injected into controllers and returned to a caller
                    var modalInstance = {
                        result: modalResultDeferred.promise,
                        opened: modalOpenedDeferred.promise,
                        close: function(result) {
                            $modalStack.close(modalInstance, result);
                        },
                        dismiss: function(reason) {
                            $modalStack.dismiss(modalInstance, reason);
                        }
                    };

                    //merge and clean up options
                    modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                    modalOptions.resolve = modalOptions.resolve || {};

                    //verify options
                    if (!modalOptions.template && !modalOptions.templateUrl) {
                        throw new Error('One of template or templateUrl options is required.');
                    }

                    var templateAndResolvePromise =
                        $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


                    templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

                        var modalScope = (modalOptions.scope || $rootScope).$new();
                        modalScope.$close = modalInstance.close;
                        modalScope.$dismiss = modalInstance.dismiss;

                        var ctrlInstance, ctrlLocals = {};
                        var resolveIter = 1;

                        //controllers
                        if (modalOptions.controller) {
                            ctrlLocals.$scope = modalScope;
                            ctrlLocals.$modalInstance = modalInstance;
                            angular.forEach(modalOptions.resolve, function(value, key) {
                                ctrlLocals[key] = tplAndVars[resolveIter++];
                            });

                            ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                        }

                        $modalStack.open(modalInstance, {
                            scope: modalScope,
                            deferred: modalResultDeferred,
                            content: tplAndVars[0],
                            backdrop: modalOptions.backdrop,
                            keyboard: modalOptions.keyboard,
                            windowClass: modalOptions.windowClass,
                            windowTemplateUrl: modalOptions.windowTemplateUrl,
                            size: modalOptions.size
                        });

                    }, function resolveError(reason) {
                        modalResultDeferred.reject(reason);
                    });

                    templateAndResolvePromise.then(function() {
                        modalOpenedDeferred.resolve(true);
                    }, function() {
                        modalOpenedDeferred.reject(false);
                    });

                    return modalInstance;
                };

                return $modal;
            }
        ]
    };

    return $modalProvider;
});

angular.module("template/modal/backdrop.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/modal/backdrop.html",
            "<div class=\"modal-backdrop fade\"\n" +
            "     ng-class=\"{in: animate}\"\n" +
            "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"\n" +
            "></div>\n" +
            "");
    }
]);

angular.module("template/modal/window.html", []).run(["$templateCache",
    function($templateCache) {
        $templateCache.put("template/modal/window.html",
            "<div tabindex=\"-1\" role=\"dialog\" class=\"modal fade\" style=\"height:100%\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
            "    <div class=\"modal-dialog\" ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\"><div class=\"modal-content\" ng-transclude></div></div>\n" +
            "</div>");
    }
]);
/* jshint ignore:end */