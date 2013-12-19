'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('PeopleCtrl', ['$scope', '$state', '$filter', '$q', 'Resources', 'People', 'ngTableParams',
    function ($scope, $state, $filter, $q, Resources, People, TableParams) {
      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 100,           // count per page
        sorting: {
          familyName: 'asc'     // initial sorting
        }
      };

      // get all roles so we can build the filter
      var rolesQuery = {};
      var rolesFields = {title:1, resource:1}
      Resources.query('roles', rolesQuery, rolesFields, function(result){
        console.log('get roles result.members:');
        console.log(result.members);
        $scope.rolesFilterOptions = result.members;

        $scope.rolesMap = {};

        // build a map so we can get the resource title and abbrv
        for (var i=0; i<result.members.length; i++) {
          $scope.rolesMap[result.members[i].resource] = {
            title: result.members[i].title,
            abbreviation: result.members[i].abbreviation
          }
        }

        console.log('$scope.rolesMap:');
        console.log($scope.rolesMap);
      });

      var getTableData = function(people){
        return new TableParams(params, {
          total: $scope.people.length, // length of data
          getData: function ($defer, params) {
            var data = $scope.people;

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
      }

      /**
       * Changes list of people on a filter change
       */
      $scope.handlePeopleFilterChanged = function(){
        if($scope.peopleFilter == 'available'){
          People.getActivePeople(function(people){
            $scope.people = people.members;

            // add the role to the person so we can display it in the table and sort by it
            for(var i=0; i<$scope.people.length;i++){
              if ($scope.people[i].primaryRole && $scope.people[i].primaryRole.resource) {
                $scope.people[i].primaryRole.title = $scope.rolesMap[$scope.people[i].primaryRole.resource].title;
                $scope.people[i].primaryRole.abbreviation = $scope.rolesMap[$scope.people[i].primaryRole.resource].abbreviation;
              }
            }

            //Reload the table
            if (!$scope.tableParams){
              $scope.tableParams = getTableData();
            }
            else {
              $scope.tableParams.total($scope.people.length);
              $scope.tableParams.reload();
            }
          });
        }
        else if($scope.peopleFilter == 'all'){

          Resources.query('people', {}, {}, function(result){
            $scope.people = result.members;

            // add the role to the person so we can display it in the table and sort by it
            for(var i=0; i<$scope.people.length;i++){
              if ($scope.people[i].primaryRole && $scope.people[i].primaryRole.resource) {
                $scope.people[i].primaryRole.title = $scope.rolesMap[$scope.people[i].primaryRole.resource].title;
                $scope.people[i].primaryRole.abbreviation = $scope.rolesMap[$scope.people[i].primaryRole.resource].abbreviation;
              }
            }

            //Reload the table
            if (!$scope.tableParams){
              $scope.tableParams = getTableData();
            }
            else{
              $scope.tableParams.total($scope.people.length);
              $scope.tableParams.reload();
            }
          })
        }
        else {
          var peopleInRoleQuery = {'primaryRole.resource':$scope.peopleFilter};
          var peopleInRoleFields = {resource:1, name:1, familyName:1, givenName: 1, primaryRole:1, thumbnail:1};

          Resources.query('people', peopleInRoleQuery, peopleInRoleFields, function(result){
            console.log('people in role, ' + $scope.peopleFilter + ' query result.members:');
            console.log(result.members);

            $scope.people = result.members;

            // add the role to the person so we can display it in the table and sort by it
            for(var i=0; i<$scope.people.length;i++){
              if ($scope.people[i].primaryRole && $scope.people[i].primaryRole.resource) {
                $scope.people[i].primaryRole.title = $scope.rolesMap[$scope.people[i].primaryRole.resource].title;
                $scope.people[i].primaryRole.abbreviation = $scope.rolesMap[$scope.people[i].primaryRole.resource].abbreviation;
              }
            }

            //Reload the table
            if (!$scope.tableParams){
              $scope.tableParams = getTableData();
            }
            else {
              $scope.tableParams.total($scope.people.length);
              $scope.tableParams.reload();
            }
          });
        }
      };

      /**
       * Get Filter Param
       */
      $scope.peopleFilter = $state.params.filter?$state.params.filter:'all';
      //Trigger inital filter change
      $scope.handlePeopleFilterChanged();

      // build table view
      //Get todays date formatted as yyyy-MM-dd
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = yyyy+'-'+mm+'-'+dd;

      var sixMontsFromNow = new Date();
      sixMontsFromNow.setMonth(sixMontsFromNow.getMonth() + 6);
      var dd6 = sixMontsFromNow.getDate();
      var mm6 = sixMontsFromNow.getMonth()+1; //January is 0!
      var yyyy6 = sixMontsFromNow.getFullYear();
      if(dd6<10){dd6='0'+dd6} if(mm6<10){mm6='0'+mm6} sixMontsFromNow = yyyy6+'-'+mm6+'-'+dd6;

      var qvProjQuery = {startDate:{$lte:sixMontsFromNow},$or:[{endDate:{$exists:false}},{endDate:{$gt:today}}]};
      var qvProjFields = {resource:1,name:1,startDate:1,endDate:1,"roles.assignee":1};

      Resources.query('projects', qvProjQuery, qvProjFields, function(result){
        $scope.qvProjects = result.data;

        // this is the quick view to show active people in projects for building the graph view
        //Sort By People
        var activePeoplePojects = {};
        var activeProjects = $scope.qvProjects;
        var activePeople = [];
        for(var i = 0; i < activeProjects.length; i++){
          var roles = activeProjects[i].roles;
          if(roles){
          //Arrary to keep track of people already in an accounted role
            var activePeoplePojectsResources = [];

            //Loop through all the roles in the active projects
            for(var j = 0; j < roles.length; j++){
              var activeRole = roles[j];

              if(activeRole.assignee && activeRole.assignee.resource
                  && !activePeoplePojects.hasOwnProperty(activeRole.assignee.resource)){
                //Push the assignnee onto the active list
                activePeople.push(Resources.get(activeRole.assignee.resource));

                //Create a project list
                activePeoplePojects[activeRole.assignee.resource] = [activeProjects[i]];
                //Accout for person already in role in this project
                activePeoplePojectsResources.push(activeRole.assignee.resource);
              }
              else if(activeRole.assignee && activeRole.assignee.resource
                  //And not already in an accounted role
                  && activePeoplePojectsResources.indexOf(activeRole.assignee.resource) == -1){
                //Just add the project to the activePeopleProjects list
                activePeoplePojects[activeRole.assignee.resource].push(activeProjects[i]);
              }
            }
          }
        }

        $q.all(activePeople).then(function(data){
          $scope.qvPeopleProjects = activePeoplePojects;
          $scope.qvPeople = data;
        });

      });

      /**
       * Calculates whether the project exists within a particular month.
       *
       * @param project
       * @param month
       * @param year
       */
      $scope.inMonth = function (project, month, year) {
        var nextMonth = month === 11 ? 0 : (month + 1),
          nextYear = month === 11 ? (year + 1) : year,
          startDay = new Date(year, month, 1),
          endDay = new Date(nextYear, nextMonth, 0);

        // If the project start day is before the last day of this month
        // and its end date is after the first day of this month.
        var projectStarted =   new Date(project.startDate) <= endDay;
        var projectEnded = project.endDate &&  new Date(project.endDate) <= startDay;
        var returnValue =  projectStarted && !projectEnded;
        return returnValue;
      };


      $scope.showTableView = true;
      $scope.showGraphView = false;

      $scope.toggleTableView = function() {
        if ($scope.showGraphView) {
          $scope.showTableView = !$scope.showTableView;
          $scope.showGraphView = !$scope.showGraphView;
        }
      }

      $scope.toggleGraphView = function() {
        if ($scope.showTableView) {
          $scope.showGraphView = !$scope.showGraphView;
          $scope.showTableView = !$scope.showTableView;
        }
      }

    }]);