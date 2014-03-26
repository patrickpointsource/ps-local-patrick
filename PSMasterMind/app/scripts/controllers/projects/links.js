/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind.controllers.projects')
  .controller('LinksCtrl',['$scope', '$filter', 'Resources', 'JazzHubService', 'ngTableParams',
  function ($scope, $filter, Resources, JazzHubService, TableParams) {
    $scope.editLink = {};
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
          var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;

          var ret = orderedData.slice(start, end);
          $defer.resolve(ret);
        }
      });
    };

    /**
     * Fetch the list of links
     */
    Resources.get($scope.project.about + '/links').then(function(result){
      if(result.members){
        $scope.links = result.members;
        $scope.initLinksTable();
      }
    });

    /**
     * Cancel add Link
     */
    $scope.cancelAddLink = function () {
      if($('#newLinkDialog').hasClass('in')){
        $('#newLinkDialog').collapse('hide');
      }

      if ($scope.editLinkIndex === null) {
        //Reset New Link Object and clear out form
        $scope.newLink.url = null;
        $scope.newLink.label = null;
      }
      $scope.editingLink = false;
      $scope.editLinkIndex = null;
      $scope.addLinkForm.$setPristine();
    };

    /**
     * Cancel editing an existing link
     */
    $scope.cancelEditLink = function () {
      Resources.refresh($scope.project.about + '/links').then(function(result){
        $scope.links = result.members;
        $scope.editingLink = false;
        $scope.editLinkIndex = null;
        $scope.linksTableParams.reload();
      });
    };

    /**
     * When the new link button is clicked
     */
    $scope.toggleNewLink = function(){
      //Cancel edit of new role
      if($scope.editLinkIndex === null && $scope.editingLink){
        $scope.cancelAddLink();
      }
      else{
        $scope.editLinkIndex = null;
        $scope.editingLink = true;
        $scope.newLink = {};
      }
    };

    /**
     * Open the edit dialog
     */
    $scope.triggerEditLink = function (link, index) {
      //Close the new role dialog instance
      if($('#newLinkDialog').hasClass('in')){
        $('#newLinkDialog').collapse('hide');
      }

      if ($scope.editingLink === true){
        $scope.cancelAddLink();
      }

      $scope.editingLink = true;
      $scope.editLinkIndex = index;

      $scope.editLink = link;
    };


    /**
     * Update an existing link to the server
     */
    $scope.saveEditLink = function(){
      Resources.update($scope.editLink).then(function(){
        Resources.refresh($scope.project.about + '/links').then(function(result){
          $scope.links = result.members;

          if($scope.linksTableParams){
            $scope.linksTableParams.total($scope.links.length);
            $scope.linksTableParams.reload();
          }
          else{
            $scope.initLinksTable();
          }

          //Reset New Role Object
          $scope.editLink.url = null;
          $scope.editLink.label = null;

          $scope.editingLink = false;
          $scope.editLinkIndex = null;
        });
      });
    };

    /**
    * Add a new Link to the server
    */
    $scope.addLink = function(link){
      if(link === null){
        link = $scope.newLink;
      }

      Resources.create($scope.project.about + '/links', link).then(function(){
        Resources.refresh($scope.project.about + '/links').then(function(result){
          $scope.links = result.members;

          if($scope.linksTableParams){
            $scope.linksTableParams.total($scope.links.length);
            $scope.linksTableParams.reload();
          }
          else{
            $scope.initLinksTable();
          }

          //Reset New Link Object and clear out form
          link = {};
          $scope.newLink = {};
          $scope.editingLink = false;
          $scope.editLinkIndex = null;
          $scope.addLinkForm.$setPristine();
        });
      });
    };

    /**
    * Delete a link
    */
    $scope.deleteLink = function (link) {
      var resource = $scope.project.about + '/links/' + link.id;
      Resources.remove(resource).then(function(){
        Resources.refresh($scope.project.about + '/links').then(function(result){
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
     * Launch the dropbox chooser dialog
     */
    $scope.launchDropboxChooser = function(){
      var options = {
        // Required. Called when a user selects an item in the Chooser.
        success: function(files) {
          //alert("Here's the file link:" + files[0].link)
          for(var i = 0; i < files.length;i++){
            var file = files[i];
            var link = {};
            link.url = file.link;
            link.label = file.name;
            link.icon = file.icon;

            $scope.addLink(link);
          }
        },

        // Optional. Called when the user closes the dialog without selecting a file
        // and does not include any parameters.
        cancel: function() {
          //NOOP
        },

        // Optional. "preview" (default) is a preview link to the document for sharing,
        // "direct" is an expiring link to download the contents of the file. For more
        // information about link types, see Link types below.
        linkType: 'preview', // or 'direct'

        // Optional. A value of false (default) limits selection to a single file, while
        // true enables multiple file selection.
        multiselect: true, // or false

        // Optional. This is a list of file extensions. If specified, the user will
        // only be able to select files with these extensions. You may also specify
        // file types, such as "video" or "images" in the list. For more information,
        // see File types below. By default, all extensions are allowed.
        //extensions: ['.pdf', '.doc', '.docx'],
      };
      Dropbox.choose(options);
    };
    
    /**
     * Jazz Hub Integration
     */
    //Flag the project is not yet linked with Jazz Hub
    $scope.notJHLinked = true;
    //Flag to indicate we have not loaded jazz hub yet
    $scope.JHProjectsLoaded = false;
    
    /**
     * Load the set of Jazz Hub projects and display them in a list
     */
    $scope.handleLinkProjectRequest = function(){
    	$scope.notJHLinked = false;
    	$scope.linkWithJazzHub = true;
    	JazzHubService.getJazzHubProjects().then(function(result){
        	$scope.jazzHubProjects = result.members;
        	$scope.JHProjectsLoaded = true;
        });
    };
    
    /**
     * Render the information about Jazz Hub
     */
    $scope.handleLinkProjectWithJazzHub = function(resource){
    	//Find the project entry
    	var jhProject = null;
    	for(var i = 0; i < $scope.jazzHubProjects.length;i++){
    		var ithJHProject = $scope.jazzHubProjects[i];
    		var jhResource = ithJHProject.resource;
    		
    		if(jhResource == resource){
    			jhProject = ithJHProject;
    			break;
    		}
    	}
    	
    	if(jhProject){
	    	$scope.jazzHubProject = Resources.deepCopy(jhProject);
	    	
	    	$scope.linkWithJazzHub = false;
	    	$scope.linkedWithJazzHub = true;
    	}
    };
   

  }]);