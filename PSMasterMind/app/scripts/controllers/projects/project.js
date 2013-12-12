'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('Mastermind')
  .controller('ProjectCtrl', ['$scope', '$state', '$filter', 'ProjectsService', 'Resources', 'People', 'Groups', 'RoleTypes', 'project', 'executives', 'salesRepresentatives','ngTableParams',
    function ($scope, $state, $filter, ProjectsService, Resources, People, Groups, RoleTypes, project, executives, salesRepresentatives, TableParams) {
      var detailsValid = false, rolesValid = false;

      // Set our currently viewed project to the one resolved by the service.
      $scope.project = project;

      $scope.execs = executives;

      $scope.sales = salesRepresentatives;

      $scope.isTransient = ProjectsService.isTransient(project);

      $scope.submitAttempted = false;

      // The title of the page is the project's name or 'New Project' if transient.
      $scope.title = $scope.isTransient ? 'New Project' : project.name;

      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
        	type: 'asc'     // initial sorting
        }
      };

      $scope.summaryRolesTableParams = new TableParams(params, {
        total: $scope.project.roles.length,
        getData: function ($defer, params) {
          var start = (params.page() - 1) * params.count();
          var end = params.page() * params.count();

          var orderedData = params.sorting() ?
                $filter('orderBy')($scope.project.roles, params.orderBy()) :
                $scope.project.roles;

          //use build-in angular filter
          var result = orderedData.slice(start, end);

          var defers = [];
          var ret = [];
          for(var i = 0; i < result.length; i++){
            var ithRole = Resources.deepCopy(result[i]);
            if(ithRole.assignee && ithRole.assignee.resource){
              defers.push(Resources.resolve(ithRole.assignee));
              //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
            }

            if(ithRole.type && ithRole.type.resource){
              defers.push(Resources.resolve(ithRole.type));
              //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
            }

            ret[i] = ithRole;
          }

          $.when.apply(window, defers).done(function(){
            $defer.resolve(ret);
          });
        }
      });


      /**
       * Get All the Role Types
       */
       Resources.get('roles').then(function(result){
    	   var resources = [];
    	   var roleGroups = {};
    	   //Save the list of role types in the scope
    	   $scope.roleTypes = result.members;
    	   //Get list of roles to query members
    	   for(var i = 0; i < result.members.length;i++){
    		   var role = result.members[i];
    		   var resource = role.resource;
    		   roleGroups[resource] = role;
    		   resources.push(resource);
    		   //create a members array for each roles group
    		   role.members = [];
    	   }

    	   //Query all people with a primary role
    	   var roleQuery = {'primaryRole.resource':{$in:resources}};
    	   var fields = {resource:1,name:1,primaryRole:1,thumbnail:1};
    	   Resources.query('people',roleQuery, fields, function(peopleResults){
    		    var people = peopleResults.members;
    		    //Set up lists of people in roles
    		    for(var i = 0; i < people.length; i++){
    		    	var person = people[i];
    		    	var roleResource = person.primaryRole.resource;
    		    	roleGroups[roleResource].members.push(person);
    		    }
    		    //Set a map of role types to members
    		    $scope.roleGroups = roleGroups;
    	   })
       });


      /**
       * Save the loaded project.
       */
      $scope.save = function () {
        $scope.submitAttempted = true;

        ProjectsService.save($scope.project).then(function () {
          $state.go('projects.index');
        }, function (response) {
          var BAD_REQUEST = 400;

          if (response.status === BAD_REQUEST) {
            $scope.messages = response.data.reasons;
          }
        });
      };

      /**
       * Whenever the roles:add event is fired from a child controller,
       * handle it by adding the supplied role to our project.
       */
      $scope.$on('roles:add', function (event, role) {
        $scope.project.addRole(role);
        $scope.summaryRolesTableParams.reload();
      });

      /**
       * Whenever the roles:change event is fired from a child controller,
       * handle it by updating the supplied role in our project.
       */
      $scope.$on('roles:change', function (event, index, role) {
        $scope.project.changeRole(index, role);
        $scope.summaryRolesTableParams.reload();
      });

      /**
       * Whenever the roles:remove event is fired from a child controller,
       * handle it by removing the supplied role from our project.
       */
      $scope.$on('roles:remove', function (event, role) {
        $scope.project.removeRole(role);
        $scope.summaryRolesTableParams.reload();
      });

      /**
       * Whenever the details form's state changes, update the watchers in this view.
       */
      $scope.$on('detailsForm:valid:change', function (event, validity) {
        detailsValid = validity;
      });

      /**
       * Whenever the roles form's state changes, update the watchers in this view.
       */
      $scope.$on('roles:valid:change', function (event, validity) {
        rolesValid = validity;
      });

      /**
       * Must have the details filled out before the user can view the roles tab.
       *
       * @returns {boolean}
       */
      $scope.isRolesTabDisabled = function () {
        return !detailsValid;
      };

      /**
       * Must have the details filled out and at least one role assigned before the user
       * can view the assignments tab.
       *
       * @returns {boolean}
       */
      $scope.isAssignmentsTabDisabled = function () {
        return !detailsValid || !rolesValid;
      };

      /**
       * Must have the details filled out and at least one role assigned before the user
       * can view the summary tab.
       *
       * @returns {boolean}
       */
      $scope.isSummaryTabDisabled = function () {
        return !detailsValid || !rolesValid;
      };
    }]);