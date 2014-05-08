'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('PeopleCtrl', ['$scope', '$state', '$location', '$filter', '$q', 'Resources', 'People', 'ProjectsService', 'ngTableParams',
    function ($scope, $state, $location, $filter, $q, Resources, People, ProjectsService, TableParams) {
      var getTableData = function(){
        return new TableParams(params, {
          total: $scope.people.length, // length of data
          getData: function ($defer, params) {
            var data = $scope.people;

            var start = (params.page() - 1) * params.count();
            var end = params.page() * params.count();

            for(var i=start; (i<$scope.people.length && i<end);i++){
              //Annotate people with additional information
              $scope.people[i].activeHours = $scope.activeHours?$scope.activeHours[$scope.people[i].resource]:'?';
              
              $scope.people[i].activePercentage = $scope.activePercentages?
            	  ($scope.activePercentages[$scope.people[i].resource]?$scope.activePercentages[$scope.people[i].resource]:0):'?';
              
              if ($scope.people[i].primaryRole && $scope.people[i].primaryRole.resource) {
                // add the role to the person so we can display it in the table and sort by it
                $scope.people[i].primaryRole = $scope.roleGroups[$scope.people[i].primaryRole.resource];
              }
            }
            // use build-in angular filter
            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;

            var ret = orderedData.slice(start, end);
            $defer.resolve(ret);
          }
        });
      };

      /**
       * Changes list of people on a filter change
       */
      $scope.handlePeopleFilterChanged = function(){
        //Check if the filter is a valid role
        if($scope.roleGroups && $scope.roleGroups[$scope.peopleFilter]){
          var peopleInRoleQuery = {'primaryRole.resource':$scope.peopleFilter};
          var peopleInRoleFields = {resource:1, name:1, familyName:1, givenName: 1, primaryRole:1, thumbnail:1};

          Resources.query('people', peopleInRoleQuery, peopleInRoleFields, function(result){
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
        else if($scope.peopleFilter == 'my'){
        	$scope.peopleFilter = 'my';
        	
        	People.getMyPeople($scope.me).then(function(people){
        		$scope.people = people;
	       		 //Reload the table
	       		 if (!$scope.tableParams){
	       			 $scope.tableParams = getTableData();
	       		 }
	       		 else{
	       			 $scope.tableParams.total($scope.people.length);
	       			 $scope.tableParams.reload();
	       		 }
        	});
        } else if($scope.peopleFilter && $scope.peopleFilter != 'all' && ($scope.peopleFilter.indexOf(':') > -1 || $scope.peopleFilter.indexOf(',') > -1 || !$scope.roleGroups[$scope.peopleFilter])){
        	var peopleQuery = {$or: []};
        	var tmp = $scope.peopleFilter.split(':');
        	
        	tmp = tmp[tmp.length - 1];
        	
        	tmp = tmp.split(',')
        	
        	tmp = $scope.mapPeopleGroupToRoles(tmp);
        	
        	if (tmp.length > 0)
	        	for (var i = 0; i < tmp.length; i ++) {
	        		peopleQuery.$or.push({'primaryRole.resource': tmp[i]})
	        	}
        	else
        		peopleQuery.$or.push({'primaryRole.resource': 'null'})
        	
            //var peopleInRoleQuery = {'primaryRole.resource': peopleQuery};
            
            var peopleInRoleFields = {resource:1, name:1, familyName:1, givenName: 1, primaryRole:1, thumbnail:1};

           
            Resources.query('people', peopleQuery, peopleInRoleFields, function(result){
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
        //Otherwise just show all
        else {
        	$scope.peopleFilter = 'all';
        	var fields = {resource:1,name:1, familyName: 1, givenName: 1, primaryRole:1,thumbnail:1};
        	//var fieldsEncoded = encodeURIComponent(JSON.stringify(fields));
        	//var url = 'people?fields='+fieldsEncoded;
        	Resources.get('people', {'fields':fields}).then(function(result){
        		 $scope.people = result.members;
        		 //Reload the table
        		 if (!$scope.tableParams){
        			 $scope.tableParams = getTableData();
        		 }
        		 else{
        			 $scope.tableParams.total($scope.people.length);
        			 $scope.tableParams.reload();
        		 }
        	});
        }
        
        
        
        //Replace the URL in history with the filter
        if($scope.peopleFilter != $state.params.filter){
	        var view = false;
	        if($scope.showGraphView){
	        	view = 'graph';
	        }
	        else{
	        	view = 'table';
	        }
	        var updatedUrl = $state.href('people.index', { 'filter': $scope.peopleFilter, 'view':view}).replace('#', '');
	        $location.url(updatedUrl).replace();
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
    	  var HOURS_PER_WEEK = 45;

    	  //Actual Table View Data
    	  if($scope.showTableView){
	    	  People.getPeopleCurrentAssignments().then(function(activeAssignments){
	    		  //Sum the percentages for all of the active assignments
	    		  var activePercentages = {};
	    		  for(var person in activeAssignments){
	    			  var cnt = 0;
	    			  var assignments = activeAssignments[person];
	    			  for(var i = 0; i < assignments.length; i++){
	    				  var assignment = assignments[i];
	    				  cnt += assignment.hoursPerWeek;
	    			  }
	    			  activePercentages[person] = Math.round(100*cnt/HOURS_PER_WEEK);
	    		  }
	    		  
	    		  $scope.activePercentages = activePercentages;
	    		  
	    		  
	    		  
	    		  
	    		  //Once we have the active people apply the default filter
		          //Trigger initial filter change
	    		  $scope.handlePeopleFilterChanged();
	    	  });
    	  }
    	  
    	  //Graph View Data
    	  else if($scope.showGraphView){
    		  //Clone start date
    		  var startDate = new Date($scope.startDate);
    		  People.getPeoleAssignments(startDate).then(function(peopleAssignments){
    			  $scope.qvPeopleAssignments = peopleAssignments;
    			  
    			  //Trigger initial filter change
	    		  $scope.handlePeopleFilterChanged();
//    			  
//	    		  var peopleIds = [];
//    			  for(var resource in peopleAssignments){
//    				//{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
//  	                var oid = {$oid:resource.substring(resource.lastIndexOf('/')+1)};
//  	                peopleIds.push(oid);
//	    		  }
//    			  
//    			  //Look up all people with relevant assignments
//    			  var pepQuery = {_id:{$in:peopleIds}};
//			      var pepFields = {resource:1,name:1,familyName:1,givenName:1,primaryRole:1,thumbnail:1};
//			      People.query(pepQuery,pepFields).then(function(data){
//			    	  $scope.qvPeople = data.members;
// 
//		    		   
//			      });
	    	  });
      	 }
      };

      /**
       * Calculates whether a role is active within a particular month.
       *
       * @param project
       * @param month
       * @param year
       */
      $scope.isPersonActiveInMonth = function (assignment, person, month, year) {
        var nextMonth = month === 11 ? 0 : (month + 1),
        nextYear = month === 11 ? (year + 1) : year,
        startDay = new Date(year, month, 1),
        endDay = new Date(nextYear, nextMonth, 0);

        // If the role start day is before the last day of this month
        // and its end date is after the first day of this month.
        var assignmentStarted =  new Date(assignment.startDate) <= endDay;
        var assignmentEnded = assignment.endDate &&  new Date(assignment.endDate) <= startDay;
        var ret = assignmentStarted && !assignmentEnded;

        return ret;
      };

      $scope.toggleTableView = function() {
        if ($scope.showGraphView) {
          $scope.showTableView = !$scope.showTableView;
          $scope.showGraphView = !$scope.showGraphView;
        }
        $scope.buildTableView();
      };

      $scope.toggleGraphView = function() {
        if ($scope.showTableView) {
          $scope.showGraphView = !$scope.showGraphView;
          $scope.showTableView = !$scope.showTableView;
        }
        $scope.buildTableView();
      };
      
      $scope.mapPeopleGroupToRoles = function(peopleGroups) {
    	  var result = [];
    	  var mapRoles = {};
    	  var rolePeopleGroupMap = {
    			 "development": ['SE', 'SSE', 'SSA', 'SSEO', 'ST','SI'],
    	         "administration": ['ADMIN'],
    	         "clientexpierencemgmt": ['SBA', 'BA', 'PM', 'CxD'],
    	         "digitalexperience":["UXD","SUXD", 'DxM', 'DMDE', 'MKT',],
    	         "executivemgmt":["EXEC", 'DD', 'CxD', 'CD', 'DMDE'],
    	         "sales":["SALES"]
    	  }
    	  var map = _.map($scope.roleGroups, function(val, key){
    		  mapRoles[val.abbreviation] = key;
    	  })
    	  
    	  var abbrs = [];
    	  
    	  for (var i = 0; i < peopleGroups.length; i ++){
    		  abbrs = rolePeopleGroupMap[ peopleGroups[i] ];
    		  
    		  for (var j = 0; abbrs && j < abbrs.length; j ++)
    			  if (mapRoles[abbrs[j]])
    				  result.push( mapRoles[abbrs[j]] )
    	  }
    	  
    	  return result;
      }

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

      var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      $scope.peopleFilter = $state.params.filter?$state.params.filter:'all';
      $scope.startDate = new Date();
      //$scope.startDate.setMonth($scope.startDate.getMonth() + 1);

      $scope.showTableView = $state.params.view?$state.params.view=='table':true;
      $scope.showGraphView = $state.params.view?$state.params.view=='graph':false;

      /**
       * Get All the Role Types
       */
      Resources.get('roles').then(function(result){
        var roleGroups = {};
        //Save the list of role types in the scope
        $scope.rolesFilterOptions = result.members;
        //Get list of roles to query members
        for(var i = 0; i < result.members.length;i++){
          var role = result.members[i];
          var resource = role.resource;
          roleGroups[resource] = role;
        }
        $scope.roleGroups = roleGroups;

        //Kick off fetch all the people
        $scope.buildTableView();
      });

    }]);