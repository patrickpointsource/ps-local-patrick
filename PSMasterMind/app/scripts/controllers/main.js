'use strict';

/**
 * The main project controller
 */
angular.module('PSMasterMindApp')
  .controller('MainCtrl', ['$scope', '$location', 'Projects', 'People', 
      function ($scope, $location, Projects, People) {
	  $scope.projects = Projects.get();
	 
	  function projectGirdData(){
		  var girdData = ['foo'];
		  var projects = $scope.projects;
		  
		  var chartStart =  Date.parse('2013-11-1');
		  var chartEnd = Date.parse('2014-4-30');
		  var total = chartEnd - chartStart;
		  
		  for(var i = 0; i < projects.length; i++){
			  var ith = projects[i];
			  var start = Date.parse(ith.startDate);
			  var end = Date.parse(ith.endDate);
			  
			  var pre = 0;
			  if(start > chartStart){
				  var diff = start-chartStart;
				  pre = (diff/total)*100;
			  }
			  var post = 0;
			  if(end < chartEnd){
				  var diff = chartEnd-end;
				  post = (diff/total)*100;
		  	  }
			  
			  var during = 100-(pre+post);
			  
			  var progressMarks = 
				  [{"value":pre,"type":"warning"},{"value":during,"type":"success"},{"value":post,"type":"info"}];
			  
			  var data = {
			     project: ith,
			     progress: progressMarks
			  }
			  girdData.push(data);
		  }
		  return girdData;
	  }
	  
	  $scope.projectGridData = projectGirdData();
	  
	  $scope.clearData = function(){
		//Clear local storage
		localStorage.clear();
		
		$scope.projects = Projects.get();
	  };
	  
	  /**
	   * Navigate to another page
	   */
	  $scope.go = function ( path ) {
		  $location.path( path );
	  };
 }]);


