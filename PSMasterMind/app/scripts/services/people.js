'use strict';

/**
 * People Service
 */
angular.module('Mastermind')
  .factory('People', ['Restangular', 'Resources', function (Restangular, Resources) {

    /*
     * Create a reference to a server side resource for People.
     *
     * The query method returns an object with a property 'data' containing
     * the list of projects.
     */
    var Resource = Restangular.all('people');

    /**
     * Service function for retrieving all people.
     *
     * @returns {*}
     */
    function query() {
      return Resource.getList();
    }

    function get(id) {
      return Resource.get(id);
    }
    
 
    
    /**
     * Query to get the list of active projects
     */
    function getActiveProjects(onSuccess){
        //Get todays date formatted as yyyy-MM-dd
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = yyyy+'-'+mm+'-'+dd;
        
        var apQuery = {startDate:{$lte:today},$or:[{endDate:{$exists:false}},{endDate:{$gt:today}}]};
        var apFields = {resource:1,name:1,"roles.assignee":1};
        
        return Resources.query('projects', apQuery, apFields, onSuccess);
    }
    
    /**
     * Set of gets for all the assignable roles
     */
    function getAssignableRoles(){
    	var allRoles = [];
  	  	allRoles.push(Resources.get('roles/SSA'));
  	  	allRoles.push(Resources.get('roles/PM'));
  	  	allRoles.push(Resources.get('roles/BA'));
  	  	allRoles.push(Resources.get('roles/SSE'));
  	  	allRoles.push(Resources.get('roles/SUXD'));
  	  	allRoles.push(Resources.get('roles/SE'));
  	  	allRoles.push(Resources.get('roles/UXD'));
  	  	return allRoles;
    }
    
    
    
    function getActivePeople(onSuccess){
    	var allRoles = getAssignableRoles();
    	getActiveProjects(function(result){
    		var activeProjects = result.data;
    		$.when.apply(window, allRoles).done(function(){
    	  		  var activePeople = [];
    	  		  var people = [];
    	  		  //Loop through all the active projects
    	  		  for(var i = 0; i < activeProjects.length; i++){
    	  			  var roles = activeProjects[i].roles;
    	  			  if(roles){
    	  				  //Loop through all the roles in the active projects
    	  				  for(var j = 0; j < roles.length; j++){
    	  					  var activeRole = roles[j];
    	  					  if(activeRole.assignee && activeRole.assignee.resource && activePeople.indexOf(activeRole.assignee.resource) == -1){
    	  						  //Push the assignnee onto the active list
    	  						  activePeople.push(activeRole.assignee.resource);
    	  					  }
    	  				  }
    	  			  }
    	  		  }
    	  		  //Loop through the role groups
    	  		  for(var i = 0; i < allRoles.length; i++){
    	  			  var members = allRoles[i].members;
    	  			  if(members){
    	  				  //Loop through all the roles in the active projects
    	  				  for(var j = 0; j < members.length; j++){
    	  					  var member = members[j];
    	  					  if(member.resource && people.indexOf(member.resource) == -1){
    	  						  //Push the assignnee onto the active list
    	  						  people.push(member.resource);
    	  					  }
    	  				  }
    	  			  }
    	  		  }
    	  		  var inactivePeople = [];
    	  		  var cnt = 0;
    	  		  for(var i = 0; i < people.length; i++){
    	  			  var preson = people[i];
    	  			  if(activePeople.indexOf(preson) == -1){
    	  				  inactivePeople[cnt++] = Resources.resolve({resource: preson});
    	  			  }
    	  		  }
    	  		  
    	  		  $.when.apply(window, inactivePeople).done(function(){
    	  			  onSuccess(inactivePeople);
    	  		  });
    		});
    	});
    	
    }


    return {
        query: query,
        get: get,
        getActivePeople: getActivePeople
      };
  }]);
 