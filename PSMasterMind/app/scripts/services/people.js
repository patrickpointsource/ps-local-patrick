'use strict';

/**
 * People Service
 */
angular.module('Mastermind')
  .factory('People', ['$q','Restangular', 'Resources', function ($q, Restangular, Resources) {

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
      if (dd<10){
        dd='0'+dd;
      }
      if (mm<10){
        mm='0'+mm;
      }
      today = yyyy+'-'+mm+'-'+dd;

      var apQuery = {startDate:{$lte:today},$or:[{endDate:{$exists:false}},{endDate:{$gt:today}}]};
      var apFields = {resource:1,name:1,'roles.assignee':1};

      return Resources.query('projects', apQuery, apFields, onSuccess);
    }

    function getActivePeople(onSuccess){
      getActiveProjects(function(result){
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
      getActivePeople: getActivePeople
    };
  }]);
