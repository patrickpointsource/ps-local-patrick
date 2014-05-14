'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, groups and roles.
 */
angular.module('Mastermind').controller('AdminCtrl', ['$scope', '$state','$filter', '$q', 
                                                      'Resources','ngTableParams','ngTableParams',
  function ($scope, $state, $filter, $q, Resources, TableParams, ngTableParams) {
	
	$scope.navType = 'pills';
	  
    // Table Parameters
    var params = {
      page: 1,            // show first page
      count: 100,           // count per page
      sorting: {
        title: 'asc'     // initial sorting
      }
    };

    /**
     * When the new role button is clicked
     */
    $scope.toggleNewRole = function(){
      //Cancel edit of new role
      if($scope.editRoleIndex === null && $scope.editingRole){
        $scope.cancelRole();
      }
      else{
        $scope.editRoleIndex = null;
        $scope.editingRole = true;
        $scope.newRole = {};
      }
    };

    /**
     * Run when an edit on a row is clicked
     */
    $scope.triggerEditRole = function (role, index) {
      if($scope.editRoleIndex === index){
        $scope.cancelRole();
      }
      else{
        $scope.editingRole = true;
        $scope.editRoleIndex = index;
        //Close the new role dialog instance
        if($('#newRoleDialog').hasClass('in')){
          $('#newRoleDialog').collapse('hide');
        }
        $scope.newRole = role;
      }
    };

    /**
     * Fetch the list of roles
     */
    Resources.refresh('roles').then(function(result){
      $scope.roles = result.members;
      $scope.rolesTableParams = new TableParams(params, {
        total: $scope.roles.length, // length of data
        getData: function ($defer, params) {
          var data = $scope.roles;

          var start = (params.page() - 1) * params.count();
          var end = params.page() * params.count();

          // use build-in angular filter
          var orderedData = params.sorting() ?
            $filter('orderBy')(data, params.orderBy()) : data;

          var ret = orderedData.slice(start, end);
          $defer.resolve(ret);
        }
      });
    });


    $scope.newRole = {};

    $scope.cancelRole = function () {
      if($('#newRoleDialog').hasClass('in')){
        $('#newRoleDialog').collapse('hide');
      }
      $scope.newRole = {};
      $scope.editingRole = false;
      $scope.editRoleIndex = null;

      //Clear New Role Form
      $scope.newRoleForm.$setPristine();
    };

    /**
     * Add a new Role to the server
     */
    $scope.addRole = function(){
      Resources.create('roles', $scope.newRole).then(function(){
        Resources.refresh('roles').then(function(result){
          $scope.roles = result.members;
          $scope.rolesTableParams.total($scope.roles.length);
          $scope.rolesTableParams.reload();

          //Reset New Role Object
          $scope.newRole = {};

          $scope.editingRole = false;
          $scope.editRoleIndex = null;

          //Clear New Role Form
          $scope.newRoleForm.$setPristine();
        });
      });
    };

    /**
     * Update a new Role to the server
     */
    $scope.saveRole = function(){
      Resources.update($scope.newRole).then(function(){
        Resources.refresh('roles').then(function(result){
          $scope.roles = result.members;
          $scope.rolesTableParams.total($scope.roles.length);
          $scope.rolesTableParams.reload();

          //Reset New Role Object
          $scope.newRole = {};

          $scope.editingRole = false;
          $scope.editRoleIndex = null;

          //Clear New Role Form
          $scope.newRoleForm.$setPristine();
        });
      });
    };

    /**
     * Delete a role
     */
    $scope.deleteRole = function (roleURL) {
      Resources.remove(roleURL).then(function(){
        Resources.refresh('roles').then(function(result){
          $scope.roles = result.members;
          $scope.rolesTableParams.total($scope.roles.length);
          $scope.rolesTableParams.reload();
        });
      });
    };
    
    
    //////////////////////////////////////////////////////////////
    // Groups //
    //////////////////////////////////////////////////////////////   
    
    /**
     * Get the list of people
     * if person belongs in group, inject them into the group object
     * 
     * Currently Hard coded as {'Executives', 'Management', 'Project Management', 'Sales'}
     */
    
    Resources.refresh('people').then(function(result){
        $scope.members = result.members;
        $scope.memberCount = result.count;
        $scope.groups = [{label: 'Executives', members: []}, 
    	                 {label: 'Management', members: []}, 
    	                 {label: 'Project Management', members: []}, 
    	                 {label: 'Sales', members: []}];
        //Map the labels of the groups so I can match faster
        var groupsMap = {};
        $scope.groups.forEach(function(entry) {
        	groupsMap[entry.label] = entry;
        });
        
        // Count the number of entries into groups
        var rowCount = 0;

        for ( var i = 0 ; i < $scope.memberCount ; i++ ) {
            var member = $scope.members[ i ];
            if(member.groups) {
            	for (var group in member.groups) {
            		// Match the group label
            		var groupLabel = member.groups[ group ];
            		// push the member into the group
            		groupsMap[ groupLabel ].members.push(member);
            		rowCount++;
            	}
            }
        }
        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10          // count per page
        }, {
            groupBy: 'groups',
            total: rowCount,
            getData: function($defer, params) {
              var orderedData = params.sorting() ?
                      $filter('orderBy')($scope.groups, $scope.tableParams.orderBy()) :
                    	  $scope.groups;

              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), 
            		  		 params.page() * params.count()));
            }
        });
    });

}]);

// Minimizes the Management group - added in case they want all collapsed at start
angular.module('Mastermind').controller('groupCtrl', function($scope) {
	  console.log($scope.groups);
	  if ($scope.group.label != 'Management')
	    $scope.groups.$hideRows = true;
	  console.log($scope.groups);
	});