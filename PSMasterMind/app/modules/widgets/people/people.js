angular.module('Mastermind').controller('PeopleWidgetCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'RolesService', 'People',
  function ($scope, $state, $rootScope, Resources, ProjectsService, RolesService, People) {


    var rolesPromise = RolesService.getRolesMapByResource();


    var aProjectsPromise = ProjectsService.getActiveClientProjects(function (result) {
      $scope.activeProjects = result;
      //console.log("main.js activeProjects:", $scope.activeProjects);


      /*
       * With the result, first find the list of active People for Widget 1.
       */
      findNineAvailablePeople();
      //console.log("main.js availablePeople:", $scope.availablePeople);

      /*
       * Next, with the list of active projects, find the resource deficit on these projects.
       *
       */
      ProjectsService.getQickViewProjects().then(function (result) {
        $scope.qvProjects = result.data;

        /*
         * Next, run through the list of projects and set the active projects and people.
         *
         */

        var activeProjects = $scope.qvProjects;
      });
    });


    /**
     * Return a persons name from an array of People objects.
     */
    var getPersonName = function (people, assignee) {
      var peopleData = people.members;
      for (var i = 0; i < peopleData.length; i++) {
        var person = peopleData[i];
        if (person.resource == assignee) {
          return person.name;
        }
      }
    }


    /**
     * Get the set of roles to display in the filter options drop down
     */
    /**
     * Get All the Role Types
     */
    Resources.get('roles').then(function (result) {
      var roleGroups = {};
      //Save the list of role types in the scope
      $scope.rolesFilterOptions = result.members;
      //Get list of roles to query members
      for (var i = 0; i < result.members.length; i++) {
        var role = result.members[i];
        var resource = role.resource;
        roleGroups[resource] = role;
      }
      $scope.roleGroups = roleGroups;

      //Kick off fetch all the people
      // $scope.buildTableView();
    });

    /**
     * Go to the people page filter by selected role
     */
    $scope.handleShowPeopleClick = function () {
      $state.go('people.index', {filter: $scope.peopleFilter});
    };

    /**
     * Randomize the people result
     */
    var randomizePeople = function (people) {
      if (people.length > 12) {
        //Seed the randomness per day
        var today = new Date();
        var seed = Math.ceil((today.getDay() + 1) * (today.getMonth() + 1) * today.getFullYear());
        var randomResult = [];

        //Shuffle people
        for (var i = 0; i < 12; i++) {
          var j = ((seed + i) % (people.length));
          randomResult[i] = people[j];
        }
        $scope.availablePeople = randomResult;
      }

      else {
        $scope.availablePeople = people;
      }
    }

    /**
     * Find available people given the active projects
     */
    var findNineAvailablePeople = function () {
      if ($scope.peopleFilter) {
        var peopleFilter = $scope.peopleFilter;
        var fields = {resource: 1, name: 1, primaryRole: 1, thumbnail: 1};
        People.getPeoplePerRole(peopleFilter, fields).then(function (peopleResult) {
          var people = peopleResult.members;
          randomizePeople(people);
        });
      }
      else {
        People.getMyPeople($scope.me).then(function (peopleResult) {
          randomizePeople(peopleResult);
        });
      }
    };

    /**
     * Handle a change to the role selector on the people view
     */
    $scope.handlePeopleFilterChanged = function () {
      // Somehow peopleFilter goes to the separate scope.
      $scope.peopleFilter = this.peopleFilter;
      findNineAvailablePeople();
    };

	$scope.getPersonName = function(person, isSimply, isFirst) {
		return Util.getPersonName(person, isSimply, isFirst);
	};

  }
]);