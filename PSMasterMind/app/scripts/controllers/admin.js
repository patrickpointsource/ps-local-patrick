'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, and roles.
 */
angular.module('Mastermind').controller('AdminCtrl', ['$scope', '$state','$filter', '$q', 'Resources','ngTableParams',
  function ($scope, $state, $filter, $q, Resources, TableParams) {
	 // Table Parameters
    var params = {
      page: 1,            // show first page
      count: 100,           // count per page
      sorting: {
        title: 'asc'     // initial sorting
      }
    };
	
	/**
	 * Fetch the list of skills
	 */
	Resources.refresh('skills').then(function(result){
		$scope.skills = result.members;
		$scope.skillsTableParams = new TableParams(params, {
          total: $scope.skills.length, // length of data
          getData: function ($defer, params) {
            var data = $scope.skills;

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
	});
	
	$scope.newSkill = {};
	/**
	 * Add a new Skill to the server
	 */
	 $scope.addSkill = function(){
		 Resources.create('skills', $scope.newSkill).then(function(){
			 Resources.refresh('skills').then(function(result){
				 $scope.skills = result.members;
				 $scope.skillsTableParams.total($scope.skills.length);
				 $scope.skillsTableParams.reload();
			 });
		 });
	 }
	 
	 /**
	  * Delete a skill 
	  */
	 $scope.deleteSkill = function (skillURL) {
        Resources.remove(skillURL).then(function(){
			 Resources.refresh('skills').then(function(result){
				 $scope.skills = result.members;
				 $scope.skillsTableParams.total($scope.skills.length);
				 $scope.skillsTableParams.reload();
			 });
		 });
      };
}]);