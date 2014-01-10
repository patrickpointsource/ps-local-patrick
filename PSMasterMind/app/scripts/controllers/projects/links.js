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
	   * Open the edit dialog
	   */
	  $scope.triggerEditLink = function (link) {
	    $scope.editingLink = true;
	    $('#newLinkDialog').collapse('show');
	    $scope.newLink = link;
	  };
	   
	  /**
	 * Update an existing link to the server
	 */
	 $scope.saveLink = function(){
		 Resources.update($scope.newLink).then(function(){ 
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
	 }
	  
	  /**
	  * Add a new Link to the server
	  */
	  $scope.addLink = function(link){
		 if(!link){
			 link = $scope.newLink;
		 }
		  
		 Resources.create($scope.project.about+"/links", link).then(function(){ 
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
				 link = {};
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
		  var files = e.files;
		  for(var i = 0; i < files.length;i++){
			  var link = {};
			  link.url = e.files[i].link;
			  link.label = e.files[i].name;
			  link.icon = e.files[i].icon;
			  
			  $scope.addLink(link);
		  }
	  };
	  
	  // add an event listener to a Chooser button
	  document.getElementById("db-chooser").addEventListener("DbxChooserSuccess",
        $scope.dbFileSelected, false);
  }]);