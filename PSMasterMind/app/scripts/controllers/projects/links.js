'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects')
  .controller('LinksCtrl',['$scope', '$filter', 'Resources', 'ngTableParams', function ($scope, $filter, Resources, TableParams) {
	  $scope.newLink = {};
	  
	  // Table Parameters
	  var params = {
		  page: 1,            // show first page
		  count: 100,           // count per page
		  sorting: {
	        label: 'asc'     // initial sorting
	      }
	  };
	  
	  /**
	   * Method to initalize the links table data
	   */
	  $scope.initLinksTable = function(){
		  $scope.linksTableParams = new TableParams(params, {
	          total: $scope.links.length, // length of data
	          getData: function ($defer, params) {
	            var data = $scope.links;
	
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
	  };
	  
	  /**
	   * Fetch the list of links
	   */
	   Resources.get($scope.project.about+"/links").then(function(result){
		    if(result.members){
				$scope.links = result.members;
				$scope.initLinksTable();
		    }
	  });
	   
	  /**
	   * Cancel add Link
	   */
	   $scope.cancelLink = function () {
		    $('#newLinkDialog').collapse('hide');
		    $scope.newLink = {};
		    $scope.editingLink = false;
	  };
	   
	  /**
	  * Add a new Link to the server
	  */
	  $scope.addLink = function(){
		 Resources.create($scope.project.about+"/links", $scope.newLink).then(function(){ 
			 Resources.refresh($scope.project.about+"/links").then(function(result){
				 $scope.links = result.members;
				 
				 if($scope.linksTableParams){
					 $scope.linksTableParams.total($scope.links.length);
					 $scope.linksTableParams.reload();
				 }
				 else{
					 $scope.initLinksTable();
				 }
				 
				 //Reset New Role Object
				 $scope.newLink = {};
			 });
		 });
	  };
	  
	  /**
 	  * Delete a link 
 	  */
 	 $scope.deleteLink = function (link) {
 		 var resource = $scope.project.about+'/links/'+link.id;
         Resources.remove(resource).then(function(){
        	 Resources.refresh($scope.project.about+"/links").then(function(result){
				 $scope.links = result.members;
				 
				 if($scope.linksTableParams){
					 $scope.linksTableParams.total($scope.links.length);
					 $scope.linksTableParams.reload();
				 }
				 else{
					 $scope.initLinksTable();
				 }
			 });
 		 });
       };
	  
	  /**
	   * A drop box link was selected
	   */
	  $scope.dbFileSelected = function(e){
		  $scope.newLink.url = e.files[0].link;
		  $scope.newLink.label = e.files[0].name;
		  $scope.newLink.icon = e.files[0].icon;
		  $scope.$apply();
	  };
	  
	  // add an event listener to a Chooser button
	  document.getElementById("db-chooser").addEventListener("DbxChooserSuccess",
        $scope.dbFileSelected, false);
  }]);