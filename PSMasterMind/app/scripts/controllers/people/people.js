'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('PeopleCtrl', ['$scope', '$filter', 'People', 'ngTableParams', 'result',
    function ($scope, $filter, People, TableParams, result) {
      $scope.result = result;
      var data = result.people;

      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
          familyName: 'asc'     // initial sorting
        }
      };
      $scope.tableParams = new TableParams(params, {
        total: result.count, // length of data
        getData: function ($defer, params) {
          var start = (params.page() - 1) * params.count();
          var end = params.page() * params.count();

          // use build-in angular filter
          var orderedData = params.sorting() ?
            $filter('orderBy')(data, params.orderBy()) :
            data;

          var ret = orderedData.slice(start, end);
          $defer.resolve(ret);
        }
      });
    }]);