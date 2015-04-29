'use strict';

/*
 * Controller for crud operation for Job Titles
 */
angular.module('Mastermind').controller('JobTitlesCtrl', ['$scope', '$state', '$filter', '$q', 'Resources',
    function ($scope, $state, $filter, $q, Resources) {

        $scope.refreshPage = function () {
            $scope.blockUI = true;
            Resources.get('jobTitles').then(function (result) {
                $scope.jobTitles = _.sortBy(result.members, function (j) {
                    return j.abbreviation.toLowerCase();
                });
                $scope.blockUI = false;
                $scope.cancel();
            });
        }

        $scope.creating = false;

        $scope.new = function () {
            $scope.creating = !$scope.creating;
            $scope.selectedJobTitleIndex = -1;
            $scope.selectedJobTitle = {title: "", abbreviation: ""};
        };

        $scope.edit = function (title, index) {
            $scope.selectedJobTitleIndex = index;
            $scope.selectedJobTitle = angular.copy(title);
        };

        $scope.cancel = function () {
            $scope.creating = false;
            $scope.blockUI = false;
            $scope.selectedJobTitle = null;
            $scope.selectedJobTitleIndex = -1;
        };

        $scope.message = "";

        $scope.save = function () {
            $scope.blockUI = true;
            if ($scope.creating || !$scope.selectedJobTitle._id) {
                Resources.create("jobTitles", $scope.selectedJobTitle).then(function (result) {
                    $scope.refreshPage();
                    $scope.message = "New job title created!";
                });
            } else {
                Resources.update($scope.selectedJobTitle).then(function (result) {
                    $scope.jobTitles[$scope.selectedJobTitleIndex] = result;
                    $scope.cancel();
                    $scope.message = "Saved!";
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                }).then(function (err) {
                    $scope.error = err;
                    $scope.blockUI = false;
                });
            }
        };

        $scope.deleteConfirm = false;

        $scope.delete = function (index) {
            var title = $scope.jobTitles[index];
            $scope.blockUI = true;
            $scope.jobTitles.splice(index, 1);
            Resources.remove(title.resource).then(function (result) {
                $scope.message = "Deleted";
                $scope.blockUI = false;
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            });
            /*.then(function(err) {
             $scope.error = "Error in deleting job title.";
             document.body.scrollTop = document.documentElement.scrollTop = 0;
             $scope.refreshPage();
             });*/
        };

        $scope.refreshPage();
    }]);
