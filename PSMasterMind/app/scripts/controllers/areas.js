'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, and roles.
 */
angular.module('Mastermind').controller('AreasCtrl', ['$scope', '$state', '$rootScope','Resources', 'ProjectsService',
  function ($scope, $state, $rootScope, Resources, ProjectsService) {

	// make these vars accessible in scope methods - especially "showHome"
	var apQuery;
	var apFields;
    //Load my profile for group and role checking
    Resources.refresh('people/me').then(function(me){
      $scope.me = me;

      //If you are a member of the management or exec groups provide access to financial info
      if(me.groups && ((me.groups.indexOf('Management') !== -1) || (me.groups.indexOf('Executives') !== -1))){
        $scope.financeAccess = true;
        $scope.adminAccess = true;
      }

      //console.log('Logged In');
      $scope.authState = true;
    });

    /**
     * Determine the active area of the application for the user.
     *
     * @returns {string}
     */
    function activeArea() {
      // default the value in case none of the states match.
      var area = 'home';

      if ($state.includes('projects')) {
        area = 'projects';
      } else if ($state.includes('people')) {
        area = 'people';
      } else if ($state.includes('staffing')) {
        area = 'staffing';
      } else if ($state.includes('admin')) {
          area = 'admin';
      }

      return area;
    }

    $scope.activeArea = activeArea;

    /*
     * Navigate to the dashboard.
     */
    $scope.showHome = function () {
    	ProjectsService.getMyCurrentProjects($scope.me).then(function(result){
	      	  $scope.myActiveProjects =  result.data;
	  	      if(result.data.length>0){
	  	          $scope.hasActiveProjects = true;
	  	      }
	     });
    	 $state.go('home');
    };

    /*
     * Navigate to the projects index.
     */
    $scope.showProjects = function () {
      $state.go('projects.index');
    };

    /*
     * Navigate to the projects index.
     */
    $scope.showPeople = function () {
      $state.go('people.index');
    };
    
    /*
     * Navigate to the staffing index.
     */
    $scope.showStaffing = function () {
      $state.go('staffing');
    };

    /*
     * Navigate to the projects index.
     */
    $scope.showAdmin = function () {
      $state.go('admin');
    };
    
    /**
     * Returns a label that represents the project's state
     * 
     * You must pass the startDate,endDate,type and committed
     */
    $scope.projectState = function(project){
    	var state = ProjectsService.getProjectState(project);
    	return state;
    };
    
    /**
     * Get the icon classes associated with a project state
     */
    $scope.projectStateIcon = function(project){
    	var state = $scope.projectState(project);
    	var ret = '';
    	if(state == 'Investment'){
    		ret = 'fa fa-flask';
    	}
    	else if(state == 'Pipeline'){
    		ret = 'fa fa-angle-double-left';
    	}
    	else if(state == 'Backlog'){
    		ret = 'fa fa-angle-left';
    	}
    	else if(state == 'Active'){
    		ret = 'fa fa-rocket';
    	}
    	else if(state == 'Done'){
    		ret = 'fa fa-times-circle-o';
    	}
    	else if(state == 'Deal Lost'){
    		ret = 'fa fa-minus-circle';
    	}
    	
    	
    	
    	return ret;
    }
    
    $scope.getModal = function() {
    	return $rootScope.modalDialog;
    }

  }]).directive('backImg', function(){
    return function(scope, element, attrs){
      var url = attrs.backImg;
      element.css({
        'background-image': 'url(' + url +')',
        'background-size' : 'cover'
      });
    };
  });