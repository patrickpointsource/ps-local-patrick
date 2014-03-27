'use strict';

/*
 * Handles application state in regards to the currently accessed Projects.
 */
angular.module('Mastermind.services.projects')
  .service('LinksService', ['$q', 'Resources', function ($q, Resources) {
	  
	  /**
	   * Get the Jazz Hub Link if one exists
	   */
	  this.getJazzHubProjects = function (projectURL) {
		  var deferred = $q.defer();
		  
		  /**
		   * Fetch the list of links
		   */
		   Resources.refresh(projectURL + '/links').then(function(result){
		     var ret = null;
			 if(result.members){
		    	 for(var i = 0; i < result.members.length; i++){
		        	 var link = result.members[i];
		        	 if(link.type && link.type == 'jazzHub'){
		        		 ret = link;
		        		 break;
		        	 }
		         }
		      }
			 
			  deferred.resolve(ret);
		   });
		  
		   return deferred.promise;
	  };
	  
	  /**
	   * Create a new JAZZ Hub Link
	   */
	  this.linkWithJazzHubProject = function (projectURL, jazzHubProject) {
		  return Resources.create(projectURL + '/links', jazzHubProject);
	  };
	  
	 /**
	  * Delete a project link
	  */
	 this.deleteLink = function(projectURL, link){
		 var resource = projectURL + '/links/' + link.id;
		 return Resources.remove(resource);
	 };
}]);