'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.projects')
  .controller('RolesCtrl', ['$scope', '$filter', '$q', 'RolesService', 'AssignmentService', 'RoleTypes', 'Rates', 'RateFactory', 'ngTableParams',
  function ($scope, $filter, $q, RolesService, AssignmentService, RoleTypes, Rates, RateFactory, TableParams) {

    $scope.editingRole = false;
    $scope.newRole = RolesService.create();

    // Table Parameters
    var params = {
      page: 1,            // show first page
      count: 10,           // count per page
      sorting: {
        type: 'asc'     // initial sorting
      }
    };


    $scope.roleTableParams = new TableParams(params, {
      counts: [], // hide page counts control
      total: $scope.project.roles.length, // length of data
      getData: function ($defer, params) {
        var data = $scope.project.roles;
        var ret = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
        $defer.resolve(ret);
      }
    });

    /**
     * Role rate type has changed in the UI (ripple)
     */
    $scope.handleRoleTypeChanged = function(){
      var type = $scope.newRole.type.resource;
      var roleType = $scope.roleGroups[type];

      var rateType = $scope.newRole.rate.type;
      if(rateType === Rates.MONTHLY){
        $scope.newRole.rate.amount =  roleType.monthlyAdvertisedRate;
      }
      else{
        $scope.newRole.rate.amount =  roleType.hourlyAdvertisedRate;
      }
    };

    /**
     * Change the rate type on the new role to the specified new rate type
     *
     * @param newRateType
     */
    function changeRateType(newRateType) {
      $scope.newRole.changeType(newRateType);
      $scope.handleRoleTypeChanged();
    }

    $scope.changeToHourlyRate = function () {
      changeRateType(Rates.HOURLY);
    };

    $scope.changeToWeeklyRate = function () {
      changeRateType(Rates.WEEKLY);
    };

    $scope.changeToMonthlyRate = function () {
      changeRateType(Rates.MONTHLY);
    };

    $scope.validateNewRole = function(){
      return RolesService.validateNewRole($scope.project, $scope.newRole);
    };

    $scope.validateAssignments = function(assignments){
        return AssignmentService.validateAssignments($scope.project, $scope.newRole, assignments);
      };


    $scope.cancelAdd = function () {
      //Close the new role dialog instance
      if($('#newRoleDialog').hasClass('in')){
        $('#newRoleDialog').collapse('hide');
      }

      $scope.editingRole = false;
      $scope.editRoleIndex = null;
    };

    /**
     * When the new role button is clicked
     */
    $scope.triggerAddRole = function () {
      if($scope.editRoleIndex === null && $scope.editingRole){
        $scope.cancelAdd();
      }
      else{
        $scope.editRoleIndex = null;
        $scope.editingRole = true;

        $scope.newRole = RolesService.create();
        $scope.newRole.startDate = $scope.project.startDate;
        $scope.newRole.endDate = $scope.project.endDate;
      }
    };

    /**
     *
     */
    $scope.triggerEditRole = function (role, index) {
      if($scope.editRoleIndex === index && $scope.editingRole){
        $scope.cancelAdd();
      }
      else{
        //Close the new role dialog instance
        if($('#newRoleDialog').hasClass('in')){
          $('#newRoleDialog').collapse('hide');
        }

        $scope.editingRole = true;
        $scope.editRoleIndex = index;

        $scope.newRole = role;
      }
    };

    /**
     * Update an existing role deinition
     */
    $scope.save = function () {
      //Validate new role
      var errors = $scope.validateNewRole();
      if (errors.length > 0){
        $scope.addRoleMessages = errors;
      }
      else {
        // Bubble an event up to add this role.
        $scope.$emit('roles:change', $scope.editRoleIndex, $scope.newRole);

        //Update the tables
        $scope.roleTableParams.total($scope.project.roles.length);
        $scope.roleTableParams.reload();

        // Create the new Role with the previously selected rate type.
        $scope.newRole = RolesService.create({
          startDate:$scope.project.startDate,
          endDate:$scope.project.endDate,
          rate: RateFactory.build($scope.newRole.rate.type)
        });

        $scope.editingRole = false;
        $scope.editRoleIndex = null;

        //Clear any messages
        $scope.addRoleMessages = [];

        // Reset the form to being pristine.
        $scope.rolesForm.$setPristine();
      }
    };

    /**
     * Add a new role to the project
     */
    $scope.add = function () {
      //Validate new role
      var errors = $scope.validateNewRole();
      if(errors.length > 0){
        $scope.addRoleMessages = errors;
      }
      else{
        // Bubble an event up to add this role.
        $scope.$emit('roles:add', $scope.newRole);

        //Update the tables
        $scope.roleTableParams.total($scope.project.roles.length);
        $scope.roleTableParams.reload();

        // Create the new Role with the previously selected rate type.
        $scope.newRole = RolesService.create(
          {
            startDate:$scope.project.startDate,
            endDate:$scope.project.endDate,
            rate: RateFactory.build($scope.newRole.rate.type)
          }
        );

        $scope.editingRole = false;
        $scope.editRoleIndex = null;

        //Clear any messages
        $scope.addRoleMessages = [];

        // Reset the form to being pristine.
        $scope.rolesForm.$setPristine();
        //Close the new role dialog instance
        if($('#newRoleDialog').hasClass('in')){
          $('#newRoleDialog').collapse('hide');
        }
      }
    };

    /**
     * Remove a role from the project
     */
    $scope.remove = function (role) {
      // Bubble up an event to handle removing a role elsewhere
      $scope.$emit('roles:remove', role);

      //Update the tables
      $scope.roleTableParams.total($scope.project.roles.length);
      $scope.roleTableParams.reload();
    };

    /**
     * Opens assign people panel
     */
    $scope.triggerAssignPeople = function (role, index) {
		if($scope.assignToRoleIndex === index && $scope.assigningPeople){
		    $scope.cancelAssignment();
		} else {
			/*
			  //Close the new role dialog instance
			  if($('#newRoleDialog').hasClass('in')){
				  $('#newRoleDialog').collapse('hide');
			  }
		*/
			if (!role.assignees || role.assignees.length == 0) {
				role.assignees = [];
				
				var props = {
		          startDate:$scope.project.startDate,
		          endDate:$scope.project.endDate,
		          rate: RateFactory.build($scope.newRole.rate.type)
		        };
				
				if (role.assignee && role.assignee.resource)
					_.extend(props, role.assignee);
				
				var newAssignee = AssignmentService.create(props)
				
				role.assignees.push(newAssignee)
			}
			  $scope.assigningPeople = true;
			  $scope.assignToRoleIndex = index;
			  $scope.assignmentsErrorMessages = [];
		
			  $scope.currentAssignedRole = role;
			  $scope.originalAssignees = [];
			  
			  for (var i = 0; role.assignees && role.assignees.length && i < role.assignees.length; i ++) {
				  $scope.originalAssignees.push(AssignmentService.create(role.assignees[i]))
			  }
		  }
	};
	
	$scope.showAssignmentDetails = function (index, currentAssignee) {
		$scope.selectedAssignee = currentAssignee; 
		currentAssignee.showDetails = currentAssignee.showDetails ? false: true;
		
		for (var i = 0; i < $scope.currentAssignedRole.assignees.length; i ++) {
			if ($scope.currentAssignedRole.assignees[i] != currentAssignee)
				$scope.currentAssignedRole.assignees[i].showDetails = false;
		}
	}
	
	$scope.addNewAssignmentToRole =  function (index) {
		
		$scope.currentAssignedRole.assignees.push(AssignmentService.create({
	          startDate:$scope.project.startDate,
	          endDate:$scope.project.endDate,
	          percentage: 0
	        }))
	}
	
	$scope.removeAssignmentToRole = function(index) {
		if ($scope.currentAssignedRole.assignees.length > 1)
			$scope.currentAssignedRole.assignees.splice(index, 1);
		
	}
	
	$scope.cancelAssignment = function () {
		/*
		//Close the new role dialog instance
		if($('#newRoleDialog').hasClass('in')){
			$('#newRoleDialog').collapse('hide');
		}
		*/
		$scope.assigningPeople = false;
		$scope.assignToRoleIndex = null;
		$scope.assignmentsErrorMessages = [];
		$scope.currentAssignedRole.assignees = $scope.originalAssignees;
	};
	
	/**
     * Update an existing role deinition
     */
    $scope.saveAssignment = function () {
      //Validate new role
      var errors = $scope.validateAssignments($scope.currentAssignedRole.assignees);
      
      if (errors.length > 0){
        $scope.assignmentsErrorMessages = errors;
      }
      else {
    	  /*
        // Bubble an event up to add this role.
        $scope.$emit('roles:change', $scope.editRoleIndex, $scope.newRole);

        //Update the tables
        $scope.roleTableParams.total($scope.project.roles.length);
        $scope.roleTableParams.reload();
        */
    	  
    	  // for backward compatibility set for role assignee in project entity properties props of first assignee
    	  if ( $scope.currentAssignedRole.assignees &&  $scope.currentAssignedRole.assignees.length > 0) {
    		  if ( !$scope.currentAssignedRole.assignee )
    			  $scope.currentAssignedRole.assignee = {};
    		  
	    	  $scope.currentAssignedRole.assignee.resource = $scope.currentAssignedRole.assignees[0].resource;
	    	  $scope.currentAssignedRole.assignee.startDate = $scope.currentAssignedRole.assignees[0].startDate;
	    	  $scope.currentAssignedRole.assignee.endDate = $scope.currentAssignedRole.assignees[0].endDate;
	    	  $scope.currentAssignedRole.assignee.percentage = $scope.currentAssignedRole.assignees[0].percentage;
    	  }
    		  
		  $scope.assigningPeople = false;
          $scope.assignToRoleIndex = null;

          //Clear any messages
          $scope.assignmentsMessages = [];
          
        // Create the new Assignments with setled properties
        //AssignmentService.save($scope.project.startDate, $scope.project.endDate, $scope.currentAssignedRole.assignees);

       

        // Reset the form to being pristine.
        for (var i = 0; i < 10 && $scope["newPersonToRoleForm" + i]; i ++ )
        	$scope["newPersonToRoleForm" + i].$setPristine();
      }
    };
	
    $scope.$watch(function () {
      return $scope.project.roles.length;
    }, function (newLength) {
      $scope.$emit('roles:valid:change', newLength > 0);
    });

    $scope.assigneeChanged = function() {
      $scope.$emit('roles:change');
    };

    $('.datepicker').on('hide', function(){
      $scope.$apply();
    });

    $scope.isFieldInError = function (fieldName) {
      var rolesFormField = $scope.rolesForm[fieldName];
      return (rolesFormField.$dirty || ($scope.submitAttempted && rolesFormField.$pristine)) &&
        rolesFormField.$invalid;
    };

  }]);