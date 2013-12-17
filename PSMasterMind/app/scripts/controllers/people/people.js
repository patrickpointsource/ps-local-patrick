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

		    	  //Reload the table
		    	  if(!$scope.tableParams)$scope.tableParams = getTableData();
		    	  else{
		    		  $scope.tableParams.total($scope.people.length);
		    		  $scope.tableParams.reload();
		    	  }
		      });
      	  }
	      else{
	    	  $scope.peopleFilter = 'all';

	    	  Resources.query('people', {}, {}, function(result){
	    		  $scope.people = result.members;
		    	  //Reload the table
		    	  if(!$scope.tableParams)$scope.tableParams = getTableData();
		    	  else{
		    		  $scope.tableParams.total($scope.people.length);
		    		  $scope.tableParams.reload();
		    	  }
	    	  })
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