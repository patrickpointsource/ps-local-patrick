/* global marked: false */
'use strict';

/*
 * Creates a filter to convert input to HTML by parsing it in Markdown.
 * Because it creates HTML, one will usually want to use this like the following:
 *
 * <span ng-bind-html="input | markdown"></span>
 */
angular.module('Mastermind')
    .filter('markdown', ['$sce', function ($sce) {
        function toMarkdown(input) {
            // guard against empty input
            if (typeof input === 'undefined' || input === null) {
                return '';
            }

            return $sce.trustAsHtml(marked(input));
        }

        return toMarkdown;
    }])
    .filter('tel', function () {
        return function (tel) {
            if (!tel) {
                return '';
            }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country === 1) {
                country = '';
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            var phoneNum = (country + ' (' + city + ') ' + number).trim();

            return phoneNum;
        };
    });
