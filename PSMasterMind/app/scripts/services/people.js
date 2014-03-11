'use strict';

/**
 * People Service
 */
angular.module('Mastermind')
  .factory('People', ['$q','Restangular', 'Resources', 'ProjectsService', function ($q, Restangular, Resources, ProjectsService) {

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
    function query(query,fields) {
    	var deferred = $q.defer();
    	
    	Resources.query('people',query,fields,function(result){
    		deferred.resolve(result);
    	});
      
    	return deferred.promise;
    }

    function get(id) {
      return Resource.get(id);
    }

    /**
     * Function declaration getPerson(personResource)
     * Returns a role abbreviation corresponding to a resource reference
     *
     * @param project
     * @param newRole
     */
    function getPerson(personResource){
    	
    	var peoplePromise;
    	//console.log("getPerson() called with", personResource);
    	
        var peopleWithResourceQuery = {'resource':personResource};
        var pepInRolesFields = {resource:1,name:1, familyName: 1, givenName: 1, primaryRole:1,thumbnail:1};
        var returnVar =  Resources.query('people',peopleWithResourceQuery,pepInRolesFields);     
    	//console.log("getPerson() returning with", returnVar);
        
    	return returnVar;

    };
    
    var getToday = function(){
    	 //Get todays date formatted as yyyy-MM-dd
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if (dd<10){
          dd='0'+dd;
        }
        if (mm<10){
          mm='0'+mm;
        }
        today = yyyy+'-'+mm+'-'+dd;
        return today;
    }

    /**
     * Query to get the list of people working on
     * active projects.
     */
    function getActivePeople(){
    	var deferred = $q.defer();
    	var today = getToday();
    	var assignmentsQuery =
    		{
    			members:{
    				$elemMatch:{
    					startDate:{
    						$lte:today
    					},
    					$or:
    						[
    						 {
    							 endDate:{$exists:false}
    						 },
                             {
    							 endDate:{$gt:today}
    						 }
                            ]	
    				}
    			}
    		};
    	
    	//Fetch all the active assignments
    	Resources.query('assignments', assignmentsQuery, {}, function(result){
    		var projectAssignments = result.data;
    		var activePeople = [];
    		//For each project find the active assignments and add it to the people 
    		for(var i = 0; i < projectAssignments.length; i++){
    			var projectAssignment = projectAssignments[i];
    			
    			//Loop over the assignments for a project
    			for(var j = 0; j < projectAssignment.members.length;j++){
    				var assignment = projectAssignment.members[j];
    				if (assignment.person && assignment.person.resource &&
    		                activePeople.indexOf(assignment.person.resource) === -1){
    					 //Push the assignee onto the active list
    	                var resource = assignment.person.resource;
    	                //{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
    	                var oid = {$oid:resource.substring(resource.lastIndexOf('/')+1)};
    	                activePeople.push(oid);
    				}
    			}
    		}
    		
    		var pepInRolesQuery = {_id:{$nin:activePeople},'primaryRole.resource':{$exists:true}};
	        var pepInRolesFields = {resource:1,name:1,familyName:1,givenName:1,primaryRole:1,thumbnail:1};
	        Resources.query('people',pepInRolesQuery,pepInRolesFields,function(result){
	        	deferred.resolve(result);
	        });
    	});
    	
    	return deferred.promise;
    }
    
    
    /**
     * Returns a list of people per role for display 
     * 
     * role: is the URI for a role i.e. 'roles/{roleid}'
     * fields: if the mongo filter to limit the fields returned for each person
     */
    function getPeoplePerRole(role, fields){
    	var deferred = $q.defer();
    	
    	var pepInRolesQuery = {};
    	if(role){
    		pepInRolesQuery = {'primaryRole.resource':role};
    	}
    	else{
    		pepInRolesQuery = {'primaryRole.resource':{$exists:true}};
    	}
    	
    	Resources.query('people',pepInRolesQuery,fields,function(result){
    		deferred.resolve(result);
    	});
    	
    	return deferred.promise;
    }
    

    return {
      query: query,
      get: get,
      getActivePeople: getActivePeople,
      getPeoplePerRole: getPeoplePerRole,
      getPerson: getPerson
    };
  }]);
