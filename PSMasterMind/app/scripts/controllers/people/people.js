'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('PeopleCtrl', ['$scope', '$state', '$filter', '$q', 'Resources', 'People', 'ngTableParams',
    function ($scope, $state, $filter, $q, Resources, People, TableParams) {
      var getTableData = function(people){
        return new TableParams(params, {
          total: $scope.people.length, // length of data
          getData: function ($defer, params) {
            var data = $scope.people;

            var start = (params.page() - 1) * params.count();
            var end = params.page() * params.count();

            for(var i=start; (i<$scope.people.length && i<end);i++){
	        	//Annotate people with additional information
	  	        $scope.people[i].activeHours = $scope.activeHours?$scope.activeHours[$scope.people[i].resource]:'?';
	            if ($scope.people[i].primaryRole && $scope.people[i].primaryRole.resource) {
	          	// add the role to the person so we can display it in the table and sort by it
	            	Resources.resolve($scope.people[i].primaryRole);
	            }
	          }

            // use build-in angular filter
            var orderedData = params.sorting() ?
              $filter('orderBy')(data, params.orderBy()) :
              data;

            var ret = orderedData.slice(start, end);
            $defer.resolve(ret);

          }
        });
      };

      /**
       * Changes list of people on a filter change
       */
      $scope.handlePeopleFilterChanged = function(){
        if($scope.peopleFilter == 'available'){
          People.getActivePeople(function(people){
            $scope.people = people.members;

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
//            console.log('people in role, ' + $scope.peopleFilter + ' query result.members:');
//            console.log(result.members);

            $scope.people = result.members;

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
       * display the month name from a month number (0 - 11)
       */
      $scope.getMonthName = function(monthNum) {
        if (monthNum > 11) {
          monthNum = monthNum - 12;
        }
        return monthNamesShort[monthNum];
      };
      
      /**
       * display the month name from a month number (0 - 11)
       */
      $scope.getShortName = function(date, inc) {
    	var monthNum = date.getMonth() + inc;
    	var year = date.getFullYear();
        if (monthNum > 11) {
          monthNum = monthNum - 12;
          year++;
        }
        
        var ret = monthNamesShort[monthNum] + ' ' + year.toString().substring(2);
        
        return ret;
      };

      /**
       * build table view
       */
      $scope.buildTableView = function() {
        var dd = $scope.startDate.getDate();
        var mm = $scope.startDate.getMonth()+1; //January is 0!
        var yyyy = $scope.startDate.getFullYear();
        if (dd<10){
          dd='0'+dd;
        }
        if (mm<10){
          mm='0'+mm
        }

        var startDateQuery = yyyy+'-'+mm+'-'+dd;

        var sixMontsFromNow = new Date();
        sixMontsFromNow.setMonth($scope.startDate.getMonth() + 6);
        var dd6 = sixMontsFromNow.getDate();
        var mm6 = sixMontsFromNow.getMonth()+1; //January is 0!
        var yyyy6 = sixMontsFromNow.getFullYear();
        if (dd6<10){
          dd6='0'+dd6;
        }
        if (mm6<10){
          mm6='0'+mm6;
        }
        var sixMontsFromNowQuery = yyyy6+'-'+mm6+'-'+dd6;

        var qvProjQuery = {startDate:{$lte:sixMontsFromNowQuery},$or:[{endDate:{$exists:false}},{endDate:{$gt:startDateQuery}}]};
        var qvProjFields = {resource:1,name:1,startDate:1,endDate:1,roles:1};

        Resources.query('projects', qvProjQuery, qvProjFields, function(result){
          $scope.qvProjects = result.data;

          // this is the quick view to show active people in projects for building the graph view
          //Sort By People
          var activePeopleProjects = {};
          var activeProjects = $scope.qvProjects;
          var activePeople = [];
          //Map of active hours by person
          var activeHours = {};

          for(var i = 0; i < activeProjects.length; i++){
            var roles = activeProjects[i].roles;
            if(roles){
              //Arrary to keep track of people already in an accounted role
              var activePeopleProjectsResources = [];

              //Loop through all the roles in the active projects
              for(var j = 0; j < roles.length; j++){
                var activeRole = roles[j];
                var roleIsActive = $scope.isRoleActiveInNextSixMonths(activeRole, mm-1, yyyy);
                if(roleIsActive){
	                //If there is an assignee log it in the active hours
	                if(activeRole.assignee && activeRole.assignee.resource && activeRole.rate){
	                  var hoursPerMonth = 0;
	                  var rate = activeRole.rate;
	                  if(rate.fullyUtilized){
	                    hoursPerMonth = 180;
	                  }
	                  else if(rate.type == 'hourly'){
	                    hoursPerMonth = rate.hours;
	                  }
	                  else if(rate.type == 'weekly'){
	                  // Weekly rate is currently hours per week. There are 5 working days per week
	                      // and 22.5 per month.
	                    var hoursPerMonthNotRounded = parseFloat(rate.hours * 22.5 / 5);
	                    hoursPerMonth = Math.round(hoursPerMonthNotRounded * 100) / 100; // round to 2 decimal places
	                  }
	
	
	                  //If hours are logged from another project increment it
	                  if(activeHours.hasOwnProperty(activeRole.assignee.resource)){
	                    activeHours[activeRole.assignee.resource] += hoursPerMonth;
	                  }
	                  else{
	                    activeHours[activeRole.assignee.resource] = hoursPerMonth;
	                  }
	                }
	
	                if(activeRole.assignee && activeRole.assignee.resource
	                    && !activePeopleProjects.hasOwnProperty(activeRole.assignee.resource)){
	                  //Push the assignnee onto the active list
	                  activePeople.push(Resources.get(activeRole.assignee.resource));
	
	                  //Create a project list
	                  activePeopleProjects[activeRole.assignee.resource] = [activeProjects[i]];
	                  //Accout for person already in role in this project
	                  activePeopleProjectsResources.push(activeRole.assignee.resource);
	                }
	                else if(activeRole.assignee && activeRole.assignee.resource
	                    //And not already in an accounted role
	                    && activePeopleProjectsResources.indexOf(activeRole.assignee.resource) == -1){
	                  //Just add the project to the activePeopleProjects list
	                  activePeopleProjects[activeRole.assignee.resource].push(activeProjects[i]);
	                }
                }
              }
            }
          }

          //Save the active hours map to the scope
          $scope.activeHours = activeHours;

          $q.all(activePeople).then(function(data){
            $scope.qvPeopleProjects = activePeopleProjects;
            $scope.qvPeople = data;

            //Once we have the active people apply the dafult filter
            //Trigger inital filter change
            $scope.handlePeopleFilterChanged();
          });

        });

        // $scope.$apply();
      };

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
      
      /**
       * Calculates whether a role exists within a particular month.
       *
       * @param project
       * @param month
       * @param year
       */
      $scope.isRoleActiveInNextSixMonths = function (role, month, year) {
        var startDay = new Date(year, month, 1),
            monthSixMonthsFromStart = (month + 6) % 12,
            yearSixMonthsFromStart = (month + 6) > 11 ? (year + 1) : year,
            endDay = new Date(yearSixMonthsFromStart, monthSixMonthsFromStart, 0);

        // If the project start day is before the last day of this month
        // and its end date is after the first day of this month.
        var roleStarted =   new Date(role.startDate) <= endDay;
        var roleEnded = role.endDate &&  new Date(role.endDate) <= startDay;
        var returnValue =  roleStarted && !roleEnded;
        return returnValue;
      };
      
      /**
       * Calculates whether a role is active within a particular month.
       *
       * @param project
       * @param month
       * @param year
       */
      $scope.isPersonActiveInMonth = function (project, person, month, year) {
    	  var projectIsActive = $scope.inMonth(project, month, year);
    	  if(!projectIsActive) return false;
    	  
    	  //Look through all the roles
    	  var roles = project.roles;
    	  var personRef = person.about?person.about:person.resource;
    	  var ret = false;
    	  if(personRef){
	    	  for(var i = 0; i < roles.length; i++){
	    		  var role = roles[i];
	    		  //Check if person is assigned to role
	    		  if(role.assignee && personRef == role.assignee.resource){
	    			var nextMonth = month === 11 ? 0 : (month + 1),
	    			       nextYear = month === 11 ? (year + 1) : year,
	    			       startDay = new Date(year, month, 1),
	    			       endDay = new Date(nextYear, nextMonth, 0);

			        // If the role start day is before the last day of this month
			        // and its end date is after the first day of this month.
			        var roleStarted =   new Date(role.startDate) <= endDay;
			        var roleEnded = role.endDate &&  new Date(role.endDate) <= startDay;
			        ret =  roleStarted && !roleEnded;
			        if(ret) break;
	    		  }
	    	  }
    	  }
    	  
    	  return ret;
      };

      $scope.toggleTableView = function() {
        if ($scope.showGraphView) {
          $scope.showTableView = !$scope.showTableView;
          $scope.showGraphView = !$scope.showGraphView;
        }
      };

      $scope.toggleGraphView = function() {
        if ($scope.showTableView) {
          $scope.showGraphView = !$scope.showGraphView;
          $scope.showTableView = !$scope.showTableView;
        }
      };

      /**
       * Move the starting date back 5 months
       */
      $scope.ganttPrev = function() {
        $scope.startDate.setMonth($scope.startDate.getMonth() - 5);
        $scope.buildTableView();
      };

      /**
       * Move the starting date back to today
       */
      $scope.ganttReset = function() {
        $scope.startDate = new Date();
        $scope.buildTableView();
      };

      /**
       * Move the starting date forward 5 months
       */
      $scope.ganttNext = function() {
        $scope.startDate.setMonth($scope.startDate.getMonth() + 5);
        $scope.buildTableView();
      };




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
//        console.log('get roles result.members:');
//        console.log(result.members);
        $scope.rolesFilterOptions = result.members;
      });

      var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      $scope.peopleFilter = $state.params.filter?$state.params.filter:'all';
      $scope.startDate = new Date();
      // $scope.startDate.setMonth($scope.startDate.getMonth() + 1);

      $scope.showTableView = true;
      $scope.showGraphView = false;

      $scope.buildTableView();

    }]);