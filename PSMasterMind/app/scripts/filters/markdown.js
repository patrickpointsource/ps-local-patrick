'use strict';

/*
 * Creates a filter to convert input to HTML by parsing it in Markdown.
 * Because it creates HTML, one will usually want to use this like the following:
 *
 * <span ng-bind-html="input | markdown"></span>
 */
angular.module('Mastermind')
  .filter('markdown', [ '$sce', function ($sce) {
    function toMarkdown(input) {
      // guard against empty input
      if (typeof input === 'undefined' || input === null) {
        return '';
      }

      return $sce.trustAsHtml(marked(input));
    }

    return toMarkdown;
  }]);