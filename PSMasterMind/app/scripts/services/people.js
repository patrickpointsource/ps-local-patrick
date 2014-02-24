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
    function query() {
      return Resource.getList();
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
    	console.log("getPerson() called with", personResource);
    	
        var peopleWithResourceQuery = {'resource':personResource};
        var pepInRolesFields = {resource:1,name:1, familyName: 1, givenName: 1, primaryRole:1,thumbnail:1};
        var returnVar =  Resources.query('people',peopleWithResourceQuery,pepInRolesFields);     
    	console.log("getPerson() returning with", returnVar);
        
    	return returnVar;

    };

    /**
     * Query to get the list of people working on
     * active projects.
     */
    function getActivePeople(onSuccess){
      ProjectsService.getActiveProjects(function(result){
        var activeProjects = result.data;
        var activePeople = [];

        //Loop through all the active projects
        for(var i = 0; i < activeProjects.length; i++){
          var roles = activeProjects[i].roles;
          if(roles){
            //Loop through all the roles in the active projects
            for(var j = 0; j < roles.length; j++){
              var activeRole = roles[j];

              if (activeRole.assignee && activeRole.assignee.resource &&
                activePeople.indexOf(activeRole.assignee.resource) === -1){

                //Push the assignnee onto the active list
                var resource = activeRole.assignee.resource;
                //{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
                var oid = {$oid:resource.substring(resource.lastIndexOf('/')+1)};
                activePeople.push(oid);
              }
            }
          }
        }

        var pepInRolesQuery = {_id:{$nin:activePeople},'primaryRole.resource':{$exists:true}};
        var pepInRolesFields = {resource:1,name:1, familyName: 1, givenName: 1, primaryRole:1,thumbnail:1};
        Resources.query('people',pepInRolesQuery,pepInRolesFields,onSuccess);
      });
    }


    return {
      query: query,
      get: get,
      getActivePeople: getActivePeople,
      getPerson: getPerson
    };
  }]);
